import { describe, expect, it } from "vitest";
import { categoryArt, categoryAccentStyle } from "@/lib/category-art";

describe("categoryArt", () => {
  it("maps known types to local SVG art", () => {
    expect(categoryArt("Christian").src).toContain("/categories/christian.svg");
    expect(categoryArt("Meetup").src).toContain("/categories/meetup.svg");
  });

  it("falls back safely for unknown types", () => {
    expect(categoryArt("Other").src).toContain("/categories/");
  });
});

describe("categoryAccentStyle", () => {
  it("sets soft wash variables from a hex colour", () => {
    const style = categoryAccentStyle("#34c759");
    expect(style["--cat" as keyof typeof style]).toBe("#34c759");
    expect(String(style["--cat-soft" as keyof typeof style])).toContain("color-mix");
  });
});
