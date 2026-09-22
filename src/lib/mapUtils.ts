// Mercator projection and TopoJSON/GeoJSON SVG path helpers

export const SVG_W = 960;
export const SVG_H = 540;

export function mercatorX(lng: number, width = SVG_W, minLng = -180, maxLng = 180): number {
  return ((lng - minLng) / (maxLng - minLng)) * width;
}

export function mercatorY(lat: number, height = SVG_H, minLat = -60, maxLat = 85): number {
  const clampedLat = Math.max(minLat, Math.min(maxLat, lat));
  const latRad = (clampedLat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const maxLatRad = (maxLat * Math.PI) / 180;
  const minLatRad = (minLat * Math.PI) / 180;
  const mercMax = Math.log(Math.tan(Math.PI / 4 + maxLatRad / 2));
  const mercMin = Math.log(Math.tan(Math.PI / 4 + minLatRad / 2));
  return ((mercMax - mercN) / (mercMax - mercMin)) * height;
}

/**
 * Splits a polygon ring at the 180° / -180° antimeridian if it crosses it.
 * Prevents horizontal stroke/fill artifacts spanning the entire width of the map.
 */
export function splitRingAtAntimeridian(ring: [number, number][]): [number, number][][] {
  const jumps: number[] = [];
  for (let i = 0; i < ring.length; i++) {
    const nextI = (i + 1) % ring.length;
    if (Math.abs(ring[nextI][0] - ring[i][0]) > 180) {
      jumps.push(i);
    }
  }
  if (jumps.length === 0 || jumps.length !== 2) return [ring];

  const [j1, j2] = jumps;
  const p_j1_next = ring[(j1 + 1) % ring.length];
  const p_j2_next = ring[(j2 + 1) % ring.length];

  const lat1 = Math.abs(p_j1_next[0]) >= 179.9 ? p_j1_next[1] : ring[j1][1];
  const lat2 = Math.abs(p_j2_next[0]) >= 179.9 ? p_j2_next[1] : ring[j2][1];

  const segA: [number, number][] = [];
  for (let i = j1 + 1; i <= j2; i++) segA.push(ring[i]);

  const segB: [number, number][] = [];
  for (let i = j2 + 1; i < ring.length; i++) segB.push(ring[i]);
  for (let i = 0; i <= j1; i++) segB.push(ring[i]);

  const isA_East = segA[Math.floor(segA.length / 2)][0] > 0;
  if (isA_East) {
    const ringA: [number, number][] = [[180, lat1], ...segA, [180, lat2]];
    const ringB: [number, number][] = [[-180, lat2], ...segB, [-180, lat1]];
    return [ringA, ringB];
  } else {
    const ringA: [number, number][] = [[-180, lat1], ...segA, [-180, lat2]];
    const ringB: [number, number][] = [[180, lat2], ...segB, [180, lat1]];
    return [ringA, ringB];
  }
}

/**
 * Minimal TopoJSON to GeoJSON converter for world-atlas countries
 */
export function topoToGeoJSON(topology: any, object: any) {
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
    // Exclude Antarctica (ISO code 010) as it is outside the Web Mercator projection bounds
    if (geom.id === '010' || geom.id === '10') return null;

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

/**
 * Converts a GeoJSON geometry into an SVG path string with antimeridian seam handling
 */
export function geoToSvgPath(geometry: any, width = SVG_W, height = SVG_H): string {
  if (!geometry) return '';
  const rings: [number, number][][] = [];

  if (geometry.type === 'Polygon') rings.push(...geometry.coordinates);
  else if (geometry.type === 'MultiPolygon') {
    for (const poly of geometry.coordinates) rings.push(...poly);
  } else return '';

  const splitRings = rings.flatMap(splitRingAtAntimeridian);

  return splitRings.map((ring) => {
    const pts = ring
      .map(([lng, lat]: [number, number]) => {
        const x = mercatorX(lng, width);
        const y = mercatorY(lat, height);
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      });
    return `M${pts.join('L')}Z`;
  }).join(' ');
}
