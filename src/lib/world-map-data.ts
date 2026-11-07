import { geoNaturalEarth1, geoPath, geoGraticule10 } from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import countriesTopo from "world-atlas/countries-110m.json";

export const MAP_W = 1000;
export const MAP_H = 500;

export type CountryFeature = {
  type: "Feature";
  properties: { name: string };
  geometry: unknown;
};

const topo = countriesTopo as unknown as { objects: { countries: unknown } };

export const countries: CountryFeature[] = (
  feature(topo as never, topo.objects.countries as never) as unknown as {
    features: CountryFeature[];
  }
).features;

const projection = geoNaturalEarth1().fitExtent(
  [
    [10, 10],
    [MAP_W - 10, MAP_H - 10],
  ],
  { type: "Sphere" },
);

const path = geoPath(projection);

export const spherePath = path({ type: "Sphere" } as GeoPermissibleObjects) ?? "";
export const graticulePath = path(geoGraticule10() as GeoPermissibleObjects) ?? "";

export type MapLabel = {
  name: string;
  x: number;
  y: number;
  size: number;
  cx: number;
  cy: number;
  leader: boolean;
};

const ANGLES = Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2);
const RINGS = [0, 11, 20, 30, 42, 56, 72, 90, 112, 136];

type Box = { x0: number; y0: number; x1: number; y1: number };

function overlaps(a: Box, b: Box) {
  return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
}

function labelSize(area: number) {
  if (area > 9000) return 10;
  if (area > 2500) return 8.5;
  if (area > 600) return 7;
  if (area > 120) return 6;
  return 5.2;
}

/**
 * Places one name per country. Big landmasses are placed first so they keep
 * their own space; small countries search outwards from their centre until they
 * find a gap that does not collide with a name already on the map.
 */
export function computeLabels(): MapLabel[] {
  const placed: Box[] = [];
  const labels: MapLabel[] = [];

  const items = countries
    .map((f) => {
      const g = f as unknown as GeoPermissibleObjects;
      const c = path.centroid(g);
      return {
        name: f.properties.name,
        cx: c[0] ?? 0,
        cy: c[1] ?? 0,
        area: Math.abs(path.area(g)),
      };
    })
    .filter((i) => Number.isFinite(i.cx) && Number.isFinite(i.cy))
    .sort((a, b) => b.area - a.area);

  for (const item of items) {
    const size = labelSize(item.area);
    const w = item.name.length * size * 0.53 + 3;
    const h = size + 2;

    let spot: { x: number; y: number; ring: number } | null = null;

    outer: for (const ring of RINGS) {
      for (const angle of ANGLES) {
        const x = item.cx + Math.cos(angle) * ring;
        const y = item.cy + Math.sin(angle) * ring;
        const box: Box = {
          x0: x - w / 2,
          y0: y - h / 2,
          x1: x + w / 2,
          y1: y + h / 2,
        };
        if (box.x0 < 2 || box.x1 > MAP_W - 2 || box.y0 < 2 || box.y1 > MAP_H - 2) continue;
        if (placed.some((p) => overlaps(box, p))) continue;
        placed.push(box);
        spot = { x, y, ring };
        break outer;
      }
    }

    if (spot) {
      labels.push({
        name: item.name,
        x: spot.x,
        y: spot.y,
        size,
        cx: item.cx,
        cy: item.cy,
        leader: spot.ring > 24,
      });
    }
  }

  return labels;
}

export const mapLabels = computeLabels();

export const countryNames = countries
  .map((c) => c.properties.name)
  .sort((a, b) => a.localeCompare(b));
