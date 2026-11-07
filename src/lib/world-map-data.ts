import { geoNaturalEarth1, geoPath, geoGraticule10 } from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import countriesTopo from "world-atlas/countries-110m.json";

export const MAP_W = 1200;
export const MAP_H = 560;

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
    [12, 12],
    [MAP_W - 12, MAP_H - 12],
  ],
  { type: "Sphere" },
);

const path = geoPath(projection);

export const spherePath = path({ type: "Sphere" } as GeoPermissibleObjects) ?? "";
export const graticulePath = path(geoGraticule10() as GeoPermissibleObjects) ?? "";

export type CountryShape = { name: string; d: string };

export const countryShapes: CountryShape[] = countries
  .map((c) => ({
    name: c.properties.name,
    d: path(c as unknown as GeoPermissibleObjects) ?? "",
  }))
  .filter((c) => c.d.length > 0);

export type MapLabel = {
  name: string;
  x: number;
  y: number;
  size: number;
  cx: number;
  cy: number;
  leader: boolean;
};

export type Box = { x0: number; y0: number; x1: number; y1: number };

/**
 * The rectangle a rendered name occupies. The per-character factor is measured
 * against the real widths the browser draws, so two names whose boxes do not
 * touch never collide on screen either.
 */
export function labelBox(l: { name: string; x: number; y: number; size: number }): Box {
  const w = l.name.length * l.size * 0.64 + 6;
  const h = l.size + 4;
  return { x0: l.x - w / 2, y0: l.y - h / 2, x1: l.x + w / 2, y1: l.y + h / 2 };
}

export function boxesOverlap(a: Box, b: Box) {
  return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
}

const ANGLES = Array.from({ length: 20 }, (_, i) => (i / 20) * Math.PI * 2);
const RINGS = [0, 9, 17, 26, 36, 48, 62, 78, 96, 116, 138, 162, 188, 216, 246];

/**
 * Places one name per country. The biggest landmasses are placed first so they
 * keep their own space; every other country searches outwards from its centre
 * until it finds a gap that no name already on the map occupies.
 */
export function computeLabels(maxRing = RINGS[RINGS.length - 1]): MapLabel[] {
  const placed: Box[] = [];
  const labels: MapLabel[] = [];
  const rings = RINGS.filter((r) => r <= maxRing);

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

  const sizeForRank = (rank: number) =>
    rank < 10 ? 11 : rank < 32 ? 9.5 : rank < 70 ? 8 : rank < 120 ? 6.8 : 6;

  items.forEach((item, rank) => {
    const size = sizeForRank(rank);
    let spot: { x: number; y: number; ring: number } | null = null;

    outer: for (const ring of rings) {
      for (const angle of ANGLES) {
        const x = item.cx + Math.cos(angle) * ring;
        const y = item.cy + Math.sin(angle) * ring;
        const box = labelBox({ name: item.name, x, y, size });
        if (box.x0 < 3 || box.x1 > MAP_W - 3 || box.y0 < 3 || box.y1 > MAP_H - 3) continue;
        if (placed.some((p) => boxesOverlap(box, p))) continue;
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
        leader: spot.ring > 20,
      });
    }
  });

  return labels;
}

export const mapLabels = computeLabels();

export const countryNames = countries
  .map((c) => c.properties.name)
  .sort((a, b) => a.localeCompare(b));
