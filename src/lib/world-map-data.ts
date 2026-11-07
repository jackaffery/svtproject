import { geoNaturalEarth1, geoPath, geoGraticule10 } from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import countriesTopo from "world-atlas/countries-110m.json";

export const TRADE_PARTNERS = [
  "Canada",
  "Mexico",
  "China",
  "Japan",
  "United Kingdom",
  "Germany",
  "South Korea",
  "India",
  "France",
  "Italy",
  "Brazil",
  "Netherlands",
] as const;

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

export type MapMarker = {
  name: string;
  cx: number;
  cy: number;
};

export type Box = { x0: number; y0: number; x1: number; y1: number };

/**
 * The rectangle a rendered name occupies. The per-character factor is measured
 * against the real widths the browser draws, so two names whose boxes do not
 * touch never collide on screen either.
 */
export function labelBox(l: { name: string; x: number; y: number; size: number }): Box {
  const w = l.name.length * l.size * 0.7 + 6;
  const h = l.size + 4;
  return { x0: l.x - w / 2, y0: l.y - h / 2, x1: l.x + w / 2, y1: l.y + h / 2 };
}

export function boxesOverlap(a: Box, b: Box) {
  return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
}

const ANGLES = Array.from({ length: 20 }, (_, i) => (i / 20) * Math.PI * 2);
const RINGS = [0, 9, 17, 26, 36, 48, 62, 78, 96, 116, 138, 162, 188, 216, 246];

/** How far a name may drift from its own country before it is numbered instead. */
const ON_MAP_MAX_RING = 40;

const sizeForRank = (rank: number) =>
  rank < 10 ? 11 : rank < 32 ? 9.5 : rank < 70 ? 8 : rank < 120 ? 6.8 : 6;

function fits(box: Box, placed: Box[]) {
  if (box.x0 < 3 || box.x1 > MAP_W - 3 || box.y0 < 3 || box.y1 > MAP_H - 3) return false;
  return !placed.some((p) => boxesOverlap(box, p));
}

/**
 * Puts a name on every country that has room for one. Big landmasses are placed
 * first so they keep their own space; the rest search outwards from their
 * centre, but only as far as ON_MAP_MAX_RING, so a name never wanders off to
 * the other side of the map. Countries left without room come back numbered.
 */
export function computeLayout(): { labels: MapLabel[]; markers: MapMarker[] } {
  const placed: Box[] = [];
  const labels: MapLabel[] = [];
  const cramped: { name: string; cx: number; cy: number }[] = [];
  const rings = RINGS.filter((r) => r <= ON_MAP_MAX_RING);

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
    // The named trading partners get first pick of space; everyone else follows,
    // biggest landmasses first.
    .sort((a, b) => {
      const pa = TRADE_PARTNERS.includes(a.name as (typeof TRADE_PARTNERS)[number]) ? 0 : 1;
      const pb = TRADE_PARTNERS.includes(b.name as (typeof TRADE_PARTNERS)[number]) ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return b.area - a.area;
    });

  items.forEach((item, rank) => {
    const size = sizeForRank(rank);
    let spot: { x: number; y: number; ring: number } | null = null;

    outer: for (const ring of rings) {
      for (const angle of ANGLES) {
        const x = item.cx + Math.cos(angle) * ring;
        const y = item.cy + Math.sin(angle) * ring;
        const box = labelBox({ name: item.name, x, y, size });
        if (!fits(box, placed)) continue;
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
        leader: spot.ring > 12,
      });
    } else {
      cramped.push({ name: item.name, cx: item.cx, cy: item.cy });
    }
  });

  const markers = cramped
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({ name: c.name, cx: c.cx, cy: c.cy }));

  return { labels, markers };
}

const layout = computeLayout();

export const mapLabels = layout.labels;
export const mapMarkers = layout.markers;

export const countryNames = countries
  .map((c) => c.properties.name)
  .sort((a, b) => a.localeCompare(b));
