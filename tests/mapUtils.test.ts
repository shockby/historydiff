import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  mercatorX,
  mercatorY,
  splitRingAtAntimeridian,
  geoToSvgPath,
  topoToGeoJSON,
  SVG_W,
  SVG_H,
} from '../src/lib/mapUtils.ts';

describe('mapUtils', () => {
  describe('mercatorX', () => {
    it('projects longitudes correctly onto SVG width', () => {
      assert.strictEqual(mercatorX(-180, 960), 0);
      assert.strictEqual(mercatorX(0, 960), 480);
      assert.strictEqual(mercatorX(180, 960), 960);
    });
  });

  describe('mercatorY', () => {
    it('projects equator to a valid coordinate', () => {
      const y = mercatorY(0, 540);
      assert.ok(y > 200 && y < 400);
      assert.ok(!isNaN(y));
    });

    it('clamps extreme latitudes without NaN or Infinity', () => {
      const yNorth = mercatorY(90, 540);
      const ySouth = mercatorY(-90, 540);
      assert.ok(!isNaN(yNorth));
      assert.ok(!isNaN(ySouth));
      assert.ok(isFinite(yNorth));
      assert.ok(isFinite(ySouth));
      assert.strictEqual(yNorth, mercatorY(85, 540));
      assert.strictEqual(ySouth, mercatorY(-60, 540));
    });
  });

  describe('splitRingAtAntimeridian', () => {
    it('returns original ring if no antimeridian crossing', () => {
      const ring: [number, number][] = [
        [10, 20],
        [15, 20],
        [15, 25],
        [10, 25],
        [10, 20],
      ];
      const result = splitRingAtAntimeridian(ring);
      assert.strictEqual(result.length, 1);
      assert.deepStrictEqual(result[0], ring);
    });

    it('splits a ring that crosses the 180° meridian into two non-jumping rings', () => {
      // Ring crossing from East (+178°) to West (-178°) and back
      const crossingRing: [number, number][] = [
        [130, 42],
        [178, 69],
        [-180, 68],
        [-170, 66],
        [-180, 64],
        [179, 64],
        [150, 45],
        [130, 42],
      ];
      const result = splitRingAtAntimeridian(crossingRing);
      assert.strictEqual(result.length, 2);

      // Verify neither ring has any jumps > 180°
      for (const r of result) {
        for (let i = 0; i < r.length; i++) {
          const nextI = (i + 1) % r.length;
          const dLng = Math.abs(r[nextI][0] - r[i][0]);
          assert.ok(dLng <= 180, `Jump of ${dLng}° detected between ${r[i][0]} and ${r[nextI][0]}`);
        }
      }
    });
  });

  describe('geoToSvgPath', () => {
    it('generates valid SVG path without NaN', () => {
      const geometry = {
        type: 'Polygon',
        coordinates: [
          [
            [10, 20],
            [15, 20],
            [15, 25],
            [10, 25],
            [10, 20],
          ],
        ],
      };
      const path = geoToSvgPath(geometry, SVG_W, SVG_H);
      assert.ok(path.startsWith('M'));
      assert.ok(path.endsWith('Z'));
      assert.ok(!path.includes('NaN'));
    });
  });
});
