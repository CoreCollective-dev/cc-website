import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Property-based tests for cookie consent banner readability (bug condition exploration).
 *
 * Feature: cookie-consent-readability
 *
 * These tests verify the bug conditions exist in the UNFIXED code.
 * They are EXPECTED TO FAIL — failure confirms the bug exists.
 */

// --- Contrast Ratio Utility ---

/**
 * Linearize an sRGB channel value (0-255) per WCAG 2.1.
 */
function linearize(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.04045
    ? srgb / 12.92
    : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

/**
 * Compute relative luminance per WCAG 2.1.
 * L = 0.2126*R + 0.7152*G + 0.0722*B
 */
function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Compute WCAG 2.1 contrast ratio between two colors.
 * contrastRatio = (L1 + 0.05) / (L2 + 0.05) where L1 >= L2
 */
function contrastRatio(
  fg: [number, number, number],
  bg: [number, number, number]
): number {
  const l1 = relativeLuminance(...fg);
  const l2 = relativeLuminance(...bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Composite an RGBA color over an opaque RGB background using alpha blending.
 * result_channel = fg_channel * alpha + bg_channel * (1 - alpha)
 */
function compositeOver(
  fg: [number, number, number],
  alpha: number,
  bg: [number, number, number]
): [number, number, number] {
  return [
    Math.round(fg[0] * alpha + bg[0] * (1 - alpha)),
    Math.round(fg[1] * alpha + bg[1] * (1 - alpha)),
    Math.round(fg[2] * alpha + bg[2] * (1 - alpha)),
  ];
}

// --- CSS Parsing Utilities ---

/**
 * Parse the cookies.css file and extract CSS custom property values.
 */
function parseCookiesCss(): Record<string, string> {
  const cssPath = resolve(__dirname, "../../styles/cookies.css");
  const cssContent = readFileSync(cssPath, "utf-8");
  const properties: Record<string, string> = {};

  const propertyRegex = /--([\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = propertyRegex.exec(cssContent)) !== null) {
    properties[`--${match[1]}`] = match[2].trim();
  }

  return properties;
}

/**
 * Parse a hex color string to RGB tuple.
 */
function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ];
}

/**
 * Parse an rgba() color string to RGB tuple and alpha.
 */
function parseRgba(rgba: string): { rgb: [number, number, number]; alpha: number } {
  const match = rgba.match(
    /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/
  );
  if (!match) throw new Error(`Cannot parse rgba: ${rgba}`);
  return {
    rgb: [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])],
    alpha: parseFloat(match[4]),
  };
}

// --- Read unfixed CSS values ---

const cssProperties = parseCookiesCss();
const bannerBg = parseHex(cssProperties["--cc-bg"]); // #080225

describe("Feature: cookie-consent-readability, Property 1: Bug Condition - Secondary button contrast", () => {
  /**
   * **Validates: Requirements 1.2**
   *
   * For `--cc-btn-secondary-bg` value `rgba(255,255,255,0.1)` composited over
   * `--cc-bg` (`#080225`), the effective background MUST have a contrast ratio
   * >= 3:1 against the banner background.
   *
   * This test is EXPECTED TO FAIL on unfixed code (actual ~1.1:1).
   */
  it("secondary button effective background has >= 3:1 contrast against banner background", () => {
    const secondaryBgValue = cssProperties["--cc-btn-secondary-bg"];
    const { rgb: fgRgb, alpha } = parseRgba(secondaryBgValue);

    fc.assert(
      fc.property(fc.constant(null), () => {
        // Composite the semi-transparent button bg over the banner bg
        const effectiveBg = compositeOver(fgRgb, alpha, bannerBg);
        const ratio = contrastRatio(effectiveBg, bannerBg);

        // WCAG requires at least 3:1 for UI components
        expect(ratio).toBeGreaterThanOrEqual(3.0);
      }),
      { numRuns: 1 }
    );
  });
});

describe("Feature: cookie-consent-readability, Property 1: Bug Condition - Title text contrast", () => {
  /**
   * **Validates: Requirements 1.1**
   *
   * The effective title color against `--cc-bg` (`#080225`) MUST have a
   * contrast ratio >= 4.5:1 per WCAG AA for normal text.
   *
   * On unfixed code, there is no .cm__title color override, so the title
   * falls back to the library default (#7233F7) which only achieves ~3.6:1.
   * This test is EXPECTED TO FAIL on unfixed code.
   */
  it("title text has >= 4.5:1 contrast against banner background", () => {
    const cssPath = resolve(__dirname, "../../styles/cookies.css");
    const cssContent = readFileSync(cssPath, "utf-8");

    fc.assert(
      fc.property(fc.constant(null), () => {
        // Check if there's an explicit .cm__title color override in the CSS
        const titleColorMatch = cssContent.match(/\.cm__title[\s\S]*?color\s*:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})/);
        
        // Determine effective title color: use override if present, otherwise library default
        const effectiveTitleColor: [number, number, number] = titleColorMatch
          ? parseHex(titleColorMatch[1])
          : [0x72, 0x33, 0xf7]; // Library default: #7233F7

        const ratio = contrastRatio(effectiveTitleColor, bannerBg);

        // WCAG AA requires at least 4.5:1 for normal text
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }),
      { numRuns: 1 }
    );
  });
});

describe("Feature: cookie-consent-readability, Property 1: Bug Condition - Description text readability", () => {
  /**
   * **Validates: Requirements 1.3**
   *
   * The cookies.css file MUST define explicit `opacity: 1` and
   * `font-weight: >= 400` overrides for description text to prevent
   * the library defaults from reducing readability.
   *
   * This test is EXPECTED TO FAIL on unfixed code (no override exists).
   */
  it("description text has explicit opacity and font-weight overrides defined", () => {
    const cssPath = resolve(__dirname, "../../styles/cookies.css");
    const cssContent = readFileSync(cssPath, "utf-8");

    fc.assert(
      fc.property(fc.constant(null), () => {
        // Check that an opacity: 1 rule exists for description text
        const hasOpacityOverride = /opacity\s*:\s*1/.test(cssContent);
        // Check that a font-weight >= 400 rule exists for description text
        const hasFontWeightOverride = /font-weight\s*:\s*([4-9]\d{2}|[1-9]\d{3})/.test(cssContent);

        expect(hasOpacityOverride).toBe(true);
        expect(hasFontWeightOverride).toBe(true);
      }),
      { numRuns: 1 }
    );
  });
});


// --- Preservation Property Tests ---

describe("Feature: cookie-consent-readability, Property 2: Preservation - Unaffected Styling Remains Identical", () => {
  /**
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
   *
   * For any CSS custom property within the cookie consent banner where the bug
   * condition does NOT hold (i.e., not --cc-btn-secondary-bg or
   * --cc-btn-secondary-hover-bg), the CSS SHALL produce exactly the observed
   * values, preserving all existing styling.
   */

  /** Observed values on UNFIXED code for all preserved properties */
  const preservedProperties: Array<{ property: string; expectedValue: string }> = [
    { property: "--cc-btn-primary-bg", expectedValue: "#7233F7" },
    { property: "--cc-btn-primary-text", expectedValue: "#ffffff" },
    { property: "--cc-bg", expectedValue: "#080225" },
    { property: "--cc-btn-primary-hover-bg", expectedValue: "#5b28c6" },
    { property: "--cc-btn-primary-hover-text", expectedValue: "#ffffff" },
    { property: "--cc-toggle-bg-off", expectedValue: "rgba(255, 255, 255, 0.3)" },
    { property: "--cc-toggle-bg-on", expectedValue: "#7233F7" },
    { property: "--cc-cookie-category-block-bg", expectedValue: "rgba(255, 255, 255, 0.05)" },
    { property: "--cc-font-family", expectedValue: '"Figtree Variable", "Figtree", ui-sans-serif, system-ui, sans-serif' },
    { property: "--cc-border-radius", expectedValue: "0.375rem" },
  ];

  /** Arbitrary that selects a random preserved property from the set */
  const arbPreservedProperty = fc.integer({ min: 0, max: preservedProperties.length - 1 }).map(
    (index) => preservedProperties[index]
  );

  it("all preserved CSS custom properties match their observed values", () => {
    fc.assert(
      fc.property(arbPreservedProperty, ({ property, expectedValue }) => {
        const actualValue = cssProperties[property];

        // The property must exist in the CSS file
        expect(actualValue).toBeDefined();

        // For --cc-font-family, check containment of "Figtree Variable"
        if (property === "--cc-font-family") {
          expect(actualValue).toContain("Figtree Variable");
        } else {
          // For all other properties, exact match
          expect(actualValue).toBe(expectedValue);
        }
      }),
      { numRuns: 200 }
    );
  });

  it("random subsets of preserved properties all match expected values", () => {
    /** Generate random non-empty subsets of preserved property indices */
    const arbPropertySubset = fc
      .uniqueArray(fc.integer({ min: 0, max: preservedProperties.length - 1 }), {
        minLength: 1,
        maxLength: preservedProperties.length,
      })
      .map((indices) => indices.map((i) => preservedProperties[i]));

    fc.assert(
      fc.property(arbPropertySubset, (subset) => {
        for (const { property, expectedValue } of subset) {
          const actualValue = cssProperties[property];
          expect(actualValue).toBeDefined();

          if (property === "--cc-font-family") {
            expect(actualValue).toContain("Figtree Variable");
          } else {
            expect(actualValue).toBe(expectedValue);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it("preserved properties do not include bug condition properties", () => {
    // Verify our preservation set is disjoint from the bug condition set
    const bugConditionProperties = ["--cc-btn-secondary-bg", "--cc-btn-secondary-hover-bg"];
    const preservedPropertyNames = preservedProperties.map((p) => p.property);

    for (const bugProp of bugConditionProperties) {
      expect(preservedPropertyNames).not.toContain(bugProp);
    }
  });
});
