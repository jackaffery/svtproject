import { useState } from "react";
import {
  MAP_H,
  MAP_W,
  countryShapes,
  graticulePath,
  mapLabels,
  mapMarkers,
  spherePath,
} from "@/lib/world-map-data";

export function WorldMap({ partners }: { partners: readonly string[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const partnerSet = new Set(partners);
  const isPartner = (n: string) => partnerSet.has(n);

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-primary-foreground/12 bg-primary-foreground/[0.04] p-3 md:p-5">
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          role="img"
          aria-label="World map with every country named"
          className="h-auto w-full min-w-[900px]"
        >
          <path d={spherePath} className="fill-primary-deep" />
          <path d={graticulePath} className="fill-none stroke-primary-foreground/10" strokeWidth={0.4} />

          {countryShapes.map((c) => (
            <path
              key={c.name}
              d={c.d}
              onMouseEnter={() => setHovered(c.name)}
              onMouseLeave={() => setHovered(null)}
              className={
                isPartner(c.name)
                  ? "cursor-pointer fill-gold stroke-gold-deep transition-opacity hover:opacity-80"
                  : "cursor-pointer fill-primary stroke-primary-foreground/15 transition-opacity hover:opacity-80"
              }
              strokeWidth={0.5}
            />
          ))}

          {/* Names that had to step aside keep a thin line back to their country. */}
          <g className="pointer-events-none">
            {mapLabels
              .filter((l) => l.leader)
              .map((l) => (
                <line
                  key={`lead-${l.name}`}
                  x1={l.cx}
                  y1={l.cy}
                  x2={l.x}
                  y2={l.y}
                  className="stroke-primary-foreground/45"
                  strokeWidth={0.6}
                />
              ))}
          </g>

          <g className="pointer-events-none select-none">
            {mapLabels.map((l) => (
              <text
                key={l.name}
                x={l.x}
                y={l.y}
                fontSize={l.size}
                textAnchor="middle"
                dominantBaseline="central"
                strokeWidth={2.2}
                strokeLinejoin="round"
                style={{ paintOrder: "stroke" }}
                className={
                  isPartner(l.name)
                    ? "fill-primary-deep stroke-primary-foreground/85 font-bold"
                    : "fill-primary-foreground/90 stroke-primary-deep"
                }
              >
                {l.name}
              </text>
            ))}
          </g>

          {/* Countries too small to hold a name carry a gold dot instead. */}
          {mapMarkers.map((m) => (
            <g key={m.name}>
              <circle cx={m.cx} cy={m.cy} r={2.2} className="fill-gold stroke-primary-deep" strokeWidth={0.7} />
              <circle
                cx={m.cx}
                cy={m.cy}
                r={7}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHovered(m.name)}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          ))}
        </svg>
      </div>

      <p className="mt-3 min-h-5 text-sm text-primary-foreground/70">
        {hovered ? (
          <>
            <span className="font-semibold text-gold">{hovered}</span>
            {isPartner(hovered) ? " — one of our twelve trading partners" : ""}
          </>
        ) : (
          "Point at any country to read its name."
        )}
      </p>

      {mapMarkers.length > 0 && (
        <div className="mt-4 rounded-xl border border-primary-foreground/12 bg-primary-foreground/[0.04] p-5">
          <p className="text-[0.68rem] font-bold tracking-[0.2em] uppercase text-gold">
            Marked with a gold dot
          </p>
          <p className="mt-2 text-xs text-primary-foreground/60">
            These countries are too small to hold their own name at this size. Each one sits on the
            map as a gold dot — point at a dot to read its name.
          </p>
          <ol className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[0.8rem] sm:grid-cols-3 lg:grid-cols-4">
            {mapMarkers.map((m) => (
              <li key={m.name} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <span className="text-primary-foreground/85">{m.name}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
