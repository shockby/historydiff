'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { EventPerspective } from '@/lib/markdown';
import { translations, Language } from '@/lib/translations';
import {
  eventCoords,
  eventRegions,
  regionViewports,
  RegionId,
  SubRegionId,
} from '@/lib/locationCoords';
import {
  mercatorX,
  mercatorY,
  geoToSvgPath,
  topoToGeoJSON,
  SVG_W,
  SVG_H,
} from '@/lib/mapUtils';

interface MapViewProps {
  events: { id: string; title?: string; perspectives: EventPerspective[]; imageUrl?: string }[];
  lang: string;
}

interface TooltipState {
  title: string;
  x: number;
  y: number;
  eventIds: string[];
}

export default function MapView({ events, lang }: MapViewProps) {
  const [paths, setPaths] = useState<string[]>([]);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<RegionId>('all');
  const [selectedSubRegion, setSelectedSubRegion] = useState<SubRegionId>('all-asia');
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

  // Filter logic
  const matchesFilter = useCallback((eventId: string) => {
    if (selectedRegion === 'all') return true;
    const info = eventRegions[eventId];
    if (!info) return false;
    if (info.region !== selectedRegion) return false;
    if (selectedRegion === 'asia') {
      if (selectedSubRegion === 'all-asia') return true;
      return info.subRegion === selectedSubRegion;
    }
    return true;
  }, [selectedRegion, selectedSubRegion]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => matchesFilter(e.id));
  }, [events, matchesFilter]);

  // Counts by region / sub-region
  const regionCounts = useMemo(() => {
    const counts = {
      all: 0,
      asia: 0,
      'all-asia': 0,
      'east-asia': 0,
      'southeast-asia': 0,
      'south-central-asia': 0,
      'middle-east': 0,
      europe: 0,
      africa: 0,
      'south-america': 0,
      'north-america': 0,
    };
    for (const e of events) {
      if (!eventCoords[e.id]) continue;
      counts.all++;
      const info = eventRegions[e.id];
      if (!info) continue;
      if (info.region in counts) {
        counts[info.region as keyof typeof counts]++;
      }
      if (info.region === 'asia') {
        counts['all-asia']++;
        if (info.subRegion && info.subRegion in counts) {
          counts[info.subRegion as keyof typeof counts]++;
        }
      }
    }
    return counts;
  }, [events]);

  const handleSelectRegion = (region: RegionId) => {
    setSelectedRegion(region);
    if (region === 'asia') {
      setSelectedSubRegion('all-asia');
      const vp = regionViewports['asia'];
      if (vp) setTransform(vp);
    } else {
      const vp = regionViewports[region];
      if (vp) setTransform(vp);
    }
  };

  const handleSelectSubRegion = (sub: SubRegionId) => {
    setSelectedSubRegion(sub);
    const vp = regionViewports[`asia:${sub}`] || regionViewports['asia'];
    if (vp) setTransform(vp);
  };

  // Group filtered events by coordinate cluster
  const markerGroups: Record<string, MapViewProps['events']> = {};
  for (const event of filteredEvents) {
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

  const currentRegionLabel = useMemo(() => {
    if (selectedRegion === 'all') return t.regionAll;
    if (selectedRegion === 'europe') return t.regionEurope;
    if (selectedRegion === 'africa') return t.regionAfrica;
    if (selectedRegion === 'south-america') return t.regionSouthAmerica;
    if (selectedRegion === 'north-america') return t.regionNorthAmerica;
    if (selectedRegion === 'asia') {
      if (selectedSubRegion === 'all-asia') return `${t.regionAsia} (${t.regionAllAsia})`;
      if (selectedSubRegion === 'east-asia') return `${t.regionAsia} / ${t.regionEastAsia}`;
      if (selectedSubRegion === 'middle-east') return `${t.regionAsia} / ${t.regionMiddleEast}`;
      if (selectedSubRegion === 'southeast-asia') return `${t.regionAsia} / ${t.regionSoutheastAsia}`;
      if (selectedSubRegion === 'south-central-asia') return `${t.regionAsia} / ${t.regionSouthCentralAsia}`;
    }
    return t.regionAll;
  }, [selectedRegion, selectedSubRegion, t]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Region Selector Bar */}
      <div style={{ marginBottom: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {/* Main regions */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '0.2rem' }}>
            🌍 {t.regionFilterLabel}:
          </span>
          {[
            { id: 'all' as RegionId, label: t.regionAll, count: regionCounts.all },
            { id: 'asia' as RegionId, label: t.regionAsia, count: regionCounts.asia },
            { id: 'europe' as RegionId, label: t.regionEurope, count: regionCounts.europe },
            { id: 'africa' as RegionId, label: t.regionAfrica, count: regionCounts.africa },
            { id: 'south-america' as RegionId, label: t.regionSouthAmerica, count: regionCounts['south-america'] },
            { id: 'north-america' as RegionId, label: t.regionNorthAmerica, count: regionCounts['north-america'] },
          ].map((r) => {
            const isSelected = selectedRegion === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelectRegion(r.id)}
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: '20px',
                  border: isSelected ? '1px solid var(--accent)' : '1px solid var(--card-border)',
                  background: isSelected ? 'var(--accent)' : '#ffffff',
                  color: isSelected ? '#ffffff' : 'var(--foreground)',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 8px rgba(220,38,38,0.25)' : '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.18s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span>{r.label}</span>
                <span style={{
                  fontSize: '0.68rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: 600,
                }}>
                  {r.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sub-region pills (Shown when Asia is selected) */}
        {selectedRegion === 'asia' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap',
            padding: '0.6rem 0.9rem', borderRadius: '12px',
            background: '#f8fafc', border: '1px solid var(--card-border)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
          }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '0.2rem' }}>
              ↳ {t.subRegionFilterLabel}:
            </span>
            {[
              { id: 'all-asia' as SubRegionId, label: t.regionAllAsia, count: regionCounts['all-asia'] },
              { id: 'east-asia' as SubRegionId, label: t.regionEastAsia, count: regionCounts['east-asia'] },
              { id: 'middle-east' as SubRegionId, label: t.regionMiddleEast, count: regionCounts['middle-east'] },
              { id: 'southeast-asia' as SubRegionId, label: t.regionSoutheastAsia, count: regionCounts['southeast-asia'] },
              { id: 'south-central-asia' as SubRegionId, label: t.regionSouthCentralAsia, count: regionCounts['south-central-asia'] },
            ].map((sub) => {
              const isSubSelected = selectedSubRegion === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleSelectSubRegion(sub.id)}
                  style={{
                    padding: '0.3rem 0.7rem',
                    borderRadius: '16px',
                    border: isSubSelected ? '1px solid var(--accent)' : '1px solid var(--card-border)',
                    background: isSubSelected ? 'var(--accent-light)' : '#ffffff',
                    color: isSubSelected ? 'var(--accent)' : 'var(--foreground)',
                    fontSize: '0.74rem',
                    fontWeight: isSubSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: isSubSelected ? '0 1px 4px rgba(220,38,38,0.15)' : '0 1px 2px rgba(0,0,0,0.02)',
                  }}
                >
                  <span>{sub.label}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '1px 5px',
                    borderRadius: '10px',
                    background: isSubSelected ? 'rgba(220,38,38,0.18)' : '#f1f5f9',
                    color: isSubSelected ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: 600,
                  }}>
                    {sub.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* SVG Map Container */}
      <div style={{
        borderRadius: '16px', overflow: 'hidden',
        border: '1px solid var(--card-border)',
        background: '#edf2f7',
        height: '520px', position: 'relative', cursor: isDragging ? 'grabbing' : 'grab',
      }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { handleMouseUp(); setTooltip(null); }}
      >
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
              background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)',
              color: 'var(--foreground)', fontSize: '1.1rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--accent)';
              (e.currentTarget as HTMLElement).style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.95)';
              (e.currentTarget as HTMLElement).style.color = 'var(--foreground)';
            }}
            >{label}</button>
          ))}
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div style={{
            position: 'absolute', left: tooltip.x + 14, top: tooltip.y - 10, zIndex: 20,
            background: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(12px)',
            border: '1px solid var(--card-border)', borderRadius: '10px',
            padding: '0.6rem 1rem', fontSize: '0.8rem',
            color: 'var(--foreground)', pointerEvents: 'none',
            maxWidth: '260px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            lineHeight: 1.5,
          }}>
            {tooltip.eventIds.length === 1 ? (
              <span style={{ fontWeight: 600 }}>{tooltip.title}</span>
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
          background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)',
          border: '1px solid var(--card-border)', borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
          padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--foreground)',
          pointerEvents: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="var(--accent)" opacity="0.9" /></svg>
            <span style={{ fontWeight: 600 }}>
              {selectedRegion === 'all'
                ? `${filteredEvents.filter(e => eventCoords[e.id]).length} events`
                : `${currentRegionLabel}: ${filteredEvents.filter(e => eventCoords[e.id]).length} events`}
            </span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            {lang === 'ja' ? 'クリック→詳細 / ドラッグ→移動 / スクロール→ズーム' :
             lang === 'zh' ? '点击查看 / 拖动移动 / 滚动缩放' :
             lang === 'ko' ? '클릭→상세 / 드래그→이동 / 스크롤→확대' :
             'Click → detail / Drag → pan / Scroll → zoom'}
          </div>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ width: '100%', height: '100%', display: 'block' }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="markerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
             style={{ transformOrigin: `${SVG_W / 2}px ${SVG_H / 2}px` }}>
            {/* Ocean */}
            <rect x={0} y={0} width={SVG_W} height={SVG_H}
              fill="#e1ebf5" rx={0} />

            {/* Countries */}
            {paths.length > 0 ? (
              paths.map((d, i) => (
                <path key={i} d={d}
                  fill="#ffffff" stroke="#cbd5e1" strokeWidth={0.5} />
              ))
            ) : (
              /* Fallback simple world outline if fetch fails */
              <rect x={40} y={60} width={SVG_W - 80} height={SVG_H - 120}
                fill="#ffffff" stroke="#cbd5e1" strokeWidth={1} rx={4} />
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
                .map(e => (e.title ?? e.perspectives[0]?.title) ?? e.id)
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

      {/* Clickable event list under map */}
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--foreground)' }}>
            📍 {currentRegionLabel} ({filteredEvents.length})
          </span>
          {selectedRegion !== 'all' && (
            <button
              type="button"
              onClick={() => handleSelectRegion('all')}
              style={{
                fontSize: '0.72rem',
                padding: '3px 9px',
                borderRadius: '6px',
                border: '1px solid var(--card-border)',
                background: '#ffffff',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span>✕</span>
              <span>{t.regionAll}</span>
            </button>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid var(--card-border)',
            fontSize: '0.82rem',
          }}>
            {t.noResults}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {filteredEvents.map((event) => {
              const first = event.perspectives[0];
              if (!first) return null;
              const hasCoords = !!eventCoords[event.id];
              return (
                <Link key={event.id} href={eventLink(event.id)}>
                  <span style={{
                    fontSize: '0.73rem', padding: '5px 11px', borderRadius: '6px',
                    border: `1px solid ${hasCoords ? 'var(--card-border)' : '#e2e8f0'}`,
                    background: hasCoords ? '#ffffff' : '#f8fafc',
                    color: hasCoords ? 'var(--foreground)' : 'var(--text-muted)',
                    boxShadow: hasCoords ? '0 1px 2px rgba(0, 0, 0, 0.03)' : 'none',
                    cursor: 'pointer', transition: 'all 0.2s ease', display: 'inline-block',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
                    (e.currentTarget as HTMLElement).style.background = 'var(--accent-light)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = hasCoords ? 'var(--card-border)' : '#e2e8f0';
                    (e.currentTarget as HTMLElement).style.color = hasCoords ? 'var(--foreground)' : 'var(--text-muted)';
                    (e.currentTarget as HTMLElement).style.background = hasCoords ? '#ffffff' : '#f8fafc';
                  }}
                  >
                    {hasCoords ? '📍' : '·'} {first.location} — {(event.title ?? first.title)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
