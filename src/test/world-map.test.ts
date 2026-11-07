import { describe, expect, it } from "vitest";

import { countries, countryNames, mapLabels } from "@/lib/world-map-data";

const tradePartners = [
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
];

describe("World map country names", () => {
  it("prints a name for every country in the dataset", () => {
    expect(mapLabels).toHaveLength(countries.length);
    expect(mapLabels).toHaveLength(177);
  });

  it("names each of the twelve trading partners on the map", () => {
    const onMap = new Set(mapLabels.map((l) => l.name));
    for (const partner of tradePartners) {
      expect(onMap.has(partner)).toBe(true);
    }
  });

  it("lists every country name once, in alphabetical order", () => {
    expect(countryNames).toHaveLength(countries.length);
    expect(new Set(countryNames).size).toBe(countries.length);
    expect(countryNames[0]).toBe("Afghanistan");
    expect(countryNames[countryNames.length - 1]).toBe("Zimbabwe");
    expect(countryNames).toContain("eSwatini");
  });
});
