'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { EventPerspective } from '@/lib/markdown';
import { translations, Language } from '@/lib/translations';
import { eventCoords } from '@/lib/locationCoords';

interface MapViewProps {
  events: { id: string; perspectives: EventPerspective[]; imageUrl?: string }[];
  lang: string;
}

interface TooltipState {
  title: string;
  x: number;
  y: number;
  eventIds: string[];
}

// Mercator projection helpers
function mercatorX(lng: number, width: number, minLng = -180, maxLng = 180): number {
  return ((lng - minLng) / (maxLng - minLng)) * width;
}

function mercatorY(lat: number, height: number, minLat = -60, maxLat = 85): number {
  // Use Web Mercator-style projection
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const maxLatRad = (maxLat * Math.PI) / 180;
  const minLatRad = (minLat * Math.PI) / 180;
  const mercMax = Math.log(Math.tan(Math.PI / 4 + maxLatRad / 2));
  const mercMin = Math.log(Math.tan(Math.PI / 4 + minLatRad / 2));
  return ((mercMax - mercN) / (mercMax - mercMin)) * height;
}

const SVG_W = 960;
const SVG_H = 540;

export default function MapView({ events, lang }: MapViewProps) {
  const [paths, setPaths] = useState<string[]>([]);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const activeLang = lang as Language;
  const t = translations[activeLang] || translations.en;
  const eventLink = (id: string) =>
    activeLang === 'en' ? `/events/${id}` : `/${activeLang}/events/${id}`;

  // Load world map GeoJSON from CDN
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((r) => r.json())
      .then((topo) => {
        // Convert TopoJSON to SVG paths using built-in browser API
        // We do this by using a canvas-based approach via path2D
        const feature = topoToGeoJSON(topo, topo.objects.countries);
        const newPaths: string[] = [];
        for (const f of feature.features) {
          const d = geoToSvgPath(f.geometry);
          if (d) newPaths.push(d);
        }
        setPaths(newPaths);
      })
      .catch(() => {
        // Fallback: simple world outline rectangle
        setPaths([]);
      });
  }, []);

  // Group events by coordinate cluster
  const markerGroups: Record<string, { id: string; perspectives: EventPerspective[]; imageUrl?: string }[]> = {};
  for (const event of events) {
    const coords = eventCoords[event.id];
    if (!coords) continue;
    const key = `${coords.lat.toFixed(1)},${coords.lng.toFixed(1)}`;
    if (!markerGroups[key]) markerGroups[key] = [];
    markerGroups[key].push(event);
  }

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.85 : 1.18;
    setTransform((prev) => {
      const newScale = Math.max(0.8, Math.min(8, prev.scale * delta));
      return { ...prev, scale: newScale };
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
  }, [transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setTransform((prev) => ({ ...prev, x: dragStart.current!.tx + dx, y: dragStart.current!.ty + dy }));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      {/* Zoom controls */}
      <div style={{
        position: 'absolute', top: '1rem', right: '1rem', zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: '0.25rem',
      }}>
        {[
          { label: '+', fn: () => setTransform((p) => ({ ...p, scale: Math.min(p.scale * 1.4, 8) })) },
          { label: '−', fn: () => setTransform((p) => ({ ...p, scale: Math.max(p.scale / 1.4, 0.8) })) },
          { label: '⊙', fn: () => setTransform({ x: 0, y: 0, scale: 1 }) },
        ].map(({ label, fn }) => (
          <button key={label} onClick={fn} style={{
            width: '36px', height: '36px', borderRadius: '8px',
            border: '1px solid var(--card-border)',
            background: 'rgba(18,18,22,0.85)', backdropFilter: 'blur(8px)',
            color: 'var(--text-primary)', fontSize: '1.1rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--accent)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(18,18,22,0.85)')}
          >{label}</button>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute', left: tooltip.x + 14, top: tooltip.y - 10, zIndex: 20,
          background: 'rgba(12,12,18,0.96)', backdropFilter: 'blur(12px)',
          border: '1px solid var(--accent)', borderRadius: '10px',
          padding: '0.6rem 1rem', fontSize: '0.8rem',
          color: 'var(--text-primary)', pointerEvents: 'none',
          maxWidth: '260px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          lineHeight: 1.5,
        }}>
          {tooltip.eventIds.length === 1 ? (
            <span>{tooltip.title}</span>
          ) : (
            <ul style={{ margin: 0, padding: '0 0 0 1rem', listStyle: 'disc' }}>
              {tooltip.title.split('\n').map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: '1rem', left: '1rem', zIndex: 10,
        background: 'rgba(18,18,22,0.85)', backdropFilter: 'blur(8px)',
        border: '1px solid var(--card-border)', borderRadius: '10px',
        padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-secondary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="var(--accent)" opacity="0.9" /></svg>
          <span>{events.filter(e => eventCoords[e.id]).length} events</span>
        </div>
        <div style={{ fontSize: '0.7rem', color: '#666' }}>
          {lang === 'ja' ? 'クリック→詳細 / ドラッグ→移動 / スクロール→ズーム' :
           lang === 'zh' ? '点击查看 / 拖动移动 / 滚动缩放' :
           lang === 'ko' ? '클릭→상세 / 드래그→이동 / 스크롤→확대' :
           'Click → detail / Drag → pan / Scroll → zoom'}
        </div>
      </div>

      {/* SVG Map */}
      <div style={{
        borderRadius: '16px', overflow: 'hidden',
        border: '1px solid var(--card-border)',
        background: 'linear-gradient(135deg, #0d1117 0%, #0a0f1e 100%)',
        height: '520px', position: 'relative', cursor: isDragging ? 'grabbing' : 'grab',
      }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { handleMouseUp(); setTooltip(null); }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ width: '100%', height: '100%', display: 'block' }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="markerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
             style={{ transformOrigin: `${SVG_W / 2}px ${SVG_H / 2}px` }}>
            {/* Ocean */}
            <rect x={0} y={0} width={SVG_W} height={SVG_H}
              fill="#0e1623" rx={0} />

            {/* Countries */}
            {paths.length > 0 ? (
              paths.map((d, i) => (
                <path key={i} d={d}
                  fill="#1a2540" stroke="#2d3a5a" strokeWidth={0.4} />
              ))
            ) : (
              /* Fallback simple world outline if fetch fails */
              <rect x={40} y={60} width={SVG_W - 80} height={SVG_H - 120}
                fill="#1a2540" stroke="#2d3a5a" strokeWidth={1} rx={4} />
            )}

            {/* Markers */}
            {Object.entries(markerGroups).map(([key, groupEvents]) => {
              const [latStr, lngStr] = key.split(',');
              const lat = parseFloat(latStr);
              const lng = parseFloat(lngStr);
              const px = mercatorX(lng, SVG_W);
              const py = mercatorY(lat, SVG_H);
              const count = groupEvents.length;
              const r = count > 1 ? 7 + count * 1.5 : 6;
              const first = groupEvents[0]?.perspectives[0];
              const titles = groupEvents
                .map(e => e.perspectives[0]?.title ?? e.id)
                .join('\n');

              return (
                <g key={key}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (count === 1) {
                      window.location.href = eventLink(groupEvents[0].id);
                    }
                  }}
                  onMouseEnter={(e) => {
                    const svgEl = svgRef.current;
                    if (!svgEl) return;
                    const rect = svgEl.getBoundingClientRect();
                    setTooltip({
                      title: titles,
                      eventIds: groupEvents.map(ev => ev.id),
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {/* Glow halo */}
                  <circle cx={px} cy={py} r={r + 8} fill="url(#markerGlow)" />
                  {/* Pulse ring */}
                  <circle cx={px} cy={py} r={r + 4}
                    fill="var(--accent)" opacity={0.18}
                    style={{ animation: 'pulse 2.4s ease-in-out infinite' }} />
                  {/* Main dot */}
                  <circle cx={px} cy={py} r={r}
                    fill="var(--accent)" stroke="#fff" strokeWidth={1.5} opacity={0.92} />
                  {/* Count badge */}
                  {count > 1 && (
                    <text x={px} y={py} textAnchor="middle" dominantBaseline="central"
                      style={{ fontSize: `${Math.max(7, r - 1)}px`, fill: '#fff', fontWeight: 700, pointerEvents: 'none' }}>
                      {count}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Clickable event list under map (for grouped markers) */}
      <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {events.map((event) => {
          const first = event.perspectives[0];
          if (!first) return null;
          const hasCoords = !!eventCoords[event.id];
          return (
            <Link key={event.id} href={eventLink(event.id)}>
              <span style={{
                fontSize: '0.73rem', padding: '4px 10px', borderRadius: '6px',
                border: `1px solid ${hasCoords ? 'var(--card-border)' : '#333'}`,
                background: 'rgba(255,255,255,0.03)',
                color: hasCoords ? 'var(--text-secondary)' : '#444',
                cursor: 'pointer', transition: 'all 0.2s', display: 'inline-block',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
                (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = hasCoords ? 'var(--card-border)' : '#333';
                (e.currentTarget as HTMLElement).style.color = hasCoords ? 'var(--text-secondary)' : '#444';
              }}
              >
                {hasCoords ? '📍' : '·'} {first.location} — {first.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── Minimal TopoJSON → GeoJSON converter (no external deps) ─────────────────

function topoToGeoJSON(topology: any, object: any) {
  const arcs = topology.arcs as number[][][];
  const transform = topology.transform;
  const scale = transform?.scale ?? [1, 1];
  const translate = transform?.translate ?? [0, 0];

  function decodeArc(arcIdx: number): [number, number][] {
    const reversed = arcIdx < 0;
    const idx = reversed ? ~arcIdx : arcIdx;
    const arc = arcs[idx];
    let x = 0, y = 0;
    const coords: [number, number][] = arc.map(([dx, dy]) => {
      x += dx; y += dy;
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
    });
    return reversed ? coords.reverse() : coords;
  }

  function geometryToFeature(geom: any): any {
    if (!geom) return null;
    if (geom.type === 'Polygon') {
      const coords = geom.arcs.map((ring: number[]) =>
        ring.flatMap((a: number) => decodeArc(a))
      );
      return { type: 'Feature', geometry: { type: 'Polygon', coordinates: coords }, properties: geom.properties ?? {} };
    }
    if (geom.type === 'MultiPolygon') {
      const coords = geom.arcs.map((poly: number[][]) =>
        poly.map((ring: number[]) => ring.flatMap((a: number) => decodeArc(a)))
      );
      return { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: coords }, properties: geom.properties ?? {} };
    }
    if (geom.type === 'GeometryCollection') {
      return { type: 'FeatureCollection', features: geom.geometries.map(geometryToFeature).filter(Boolean) };
    }
    return null;
  }

  const features: any[] = [];
  if (object.type === 'GeometryCollection') {
    for (const g of object.geometries) {
      const f = geometryToFeature(g);
      if (f) {
        if (f.type === 'FeatureCollection') features.push(...f.features);
        else features.push(f);
      }
    }
  }
  return { type: 'FeatureCollection', features };
}

// ── GeoJSON geometry → SVG path string ──────────────────────────────────────

function geoToSvgPath(geometry: any): string {
  if (!geometry) return '';
  const rings: [number, number][][] = [];

  if (geometry.type === 'Polygon') rings.push(...geometry.coordinates);
  else if (geometry.type === 'MultiPolygon') {
    for (const poly of geometry.coordinates) rings.push(...poly);
  } else return '';

  return rings.map((ring) => {
    const pts = ring
      .map(([lng, lat]: [number, number]) => {
        const x = mercatorX(lng, SVG_W);
        const y = mercatorY(lat, SVG_H);
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      });
    return `M${pts.join('L')}Z`;
  }).join(' ');
}
