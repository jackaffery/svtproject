import { useState } from "react";
import {
  MAP_H,
  MAP_W,
  countryNames,
  countryShapes,
  graticulePath,
  mapLabels,
  spherePath,
} from "@/lib/world-map-data";

/**
 * The earth, drawn as one labelled country per shape. Every country in the
 * dataset gets its name printed on the map; the trading partners passed in are
 * picked out in gold.
 */
export function WorldMap({ partners }: { partners: readonly string[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const partnerSet = new Set(partners);

  return (
    <div className="mt-10">
      <div className="overflow-x-auto rounded-xl border border-primary-foreground/15 bg-primary p-3 sm:p-5">
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          role="img"
          aria-label={`World map naming all ${countryNames.length} countries`}
          className="h-auto w-full min-w-[820px]"
        >
          <path d={spherePath} className="fill-primary-deep" />
          <path
            d={graticulePath}
            className="fill-none stroke-primary-foreground/10"
            strokeWidth={0.5}
          />

          {countryShapes.map((c) => {
            const isPartner = partnerSet.has(c.name);
            const isHovered = hovered === c.name;
            return (
              <path
                key={c.name}
                d={c.d}
                strokeWidth={0.5}
                onMouseEnter={() => setHovered(c.name)}
                onMouseLeave={() => setHovered(null)}
                className={
                  isHovered
                    ? "cursor-pointer fill-gold stroke-primary-deep"
                    : isPartner
                      ? "cursor-pointer fill-gold/75 stroke-primary-deep"
                      : "cursor-pointer fill-primary stroke-primary-foreground/15"
                }
              >
                <title>{c.name}</title>
              </path>
            );
          })}

          <g className="pointer-events-none">
            {mapLabels.map((l) => {
              const isPartner = partnerSet.has(l.name);
              const isHovered = hovered === l.name;
              return (
                <g key={l.name}>
                  {l.leader && (
                    <line
                      x1={l.cx}
                      y1={l.cy}
                      x2={l.x}
                      y2={l.y}
                      className="stroke-primary-foreground/30"
                      strokeWidth={0.4}
                    />
                  )}
                  {l.leader && <circle cx={l.cx} cy={l.cy} r={0.9} className="fill-gold" />}
                  <text
                    x={l.x}
                    y={l.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={l.size}
                    className={
                      isHovered
                        ? "fill-primary-foreground font-bold"
                        : isPartner
                          ? "fill-gold font-semibold"
                          : "fill-primary-foreground/70"
                    }
                  >
                    {l.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <p className="mt-3 min-h-5 text-sm text-primary-foreground/70">
        {hovered ? (
          <span className="font-semibold text-gold">{hovered}</span>
        ) : (
          "Point at any country to read its name. Gold countries are the twelve we trade with."
        )}
      </p>

      <div className="mt-6 rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-5">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary-foreground/60">
          All {countryNames.length} countries named on the map
        </p>
        <ul className="mt-4 columns-2 gap-x-8 gap-y-1 text-[0.72rem] leading-relaxed sm:columns-3 lg:columns-5">
          {countryNames.map((n) => (
            <li
              key={n}
              className={`break-inside-avoid ${partnerSet.has(n) ? "font-semibold text-gold" : "text-primary-foreground/75"}`}
            >
              {n}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
