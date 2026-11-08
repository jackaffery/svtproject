import { describe, expect, it } from "vitest";
import { getRouter } from "@/router";
import { sitemapStaticPaths, sitemapXML } from "@/lib/sitemap";

describe("Public sitemap", () => {
  it("includes public content and excludes account, authentication and admin pages", () => {
    const paths = sitemapStaticPaths(getRouter());
    expect(paths).toEqual([
      "/", "/about", "/accessibility", "/checking", "/contact", "/privacy",
      "/savings", "/security", "/services", "/sitemap", "/terms",
    ]);
  });

  it("uses the public domain and omits unverified modification dates", () => {
    const xml = sitemapXML("https://strongholdvaulttrustinstitution.online", [{ path: "/about" }]);
    const document = new DOMParser().parseFromString(xml, "application/xml");
    expect(document.querySelector("parsererror")).toBeNull();
    expect(document.querySelector("loc")?.textContent).toBe("https://strongholdvaulttrustinstitution.online/about");
    expect(document.querySelector("lastmod")).toBeNull();
  });

  it("rejects unsafe paths and deduplicates public URLs", () => {
    expect(() => sitemapXML("https://strongholdvaulttrustinstitution.online", [{ path: "//other.example/page" }])).toThrow("Invalid sitemap path");
    const xml = sitemapXML("https://strongholdvaulttrustinstitution.online", [{ path: "/" }, { path: "/" }]);
    expect(new DOMParser().parseFromString(xml, "application/xml").querySelectorAll("loc")).toHaveLength(1);
  });
});