import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Bug condition exploration property-based tests for cookie settings modal readability.
 *
 * Feature: cookie-settings-modal-readability
 *
 * These tests verify the bug conditions exist in the UNFIXED code.
 * They are EXPECTED TO FAIL — failure confirms the bug exists.
 * DO NOT fix the CSS or modify these tests to make them pass.
 */

// --- CSS Parsing Utilities ---

/**
 * Parse the cookies.css file and extract CSS custom property values.
 */
function parseCookiesCss(): { properties: Record<string, string>; content: string } {
  const cssPath = resolve(__dirname, "../cookies.css");
  const cssContent = readFileSync(cssPath, "utf-8");
  const properties: Record<string, string> = {};

  const propertyRegex = /--([\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = propertyRegex.exec(cssContent)) !== null) {
    properties[`--${match[1]}`] = match[2].trim();
  }

  return { properties, content: cssContent };
}

/**
 * Parse an rgba() color string and extract the alpha (opacity) value.
 */
function parseRgbaAlpha(rgba: string): number {
  const match = rgba.match(
    /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/
  );
  if (!match) throw new Error(`Cannot parse rgba: ${rgba}`);
  return parseFloat(match[4]);
}

/**
 * Check if a CSS rule block exists for a given selector in the CSS content.
 */
function findRuleBlock(cssContent: string, selector: string): string | null {
  // Escape special regex characters in the selector
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, "s");
  const match = cssContent.match(regex);
  return match ? match[1] : null;
}

// --- Parse CSS ---

const { properties: cssProperties, content: cssContent } = parseCookiesCss();

// --- Bug Condition Tests ---

describe("Feature: cookie-settings-modal-readability, Bug Condition - Category block background opacity", () => {
  /**
   * **Validates: Requirements 1.5**
   *
   * `--cc-cookie-category-block-bg` MUST have opacity >= 0.08 to provide
   * visible distinction from the modal background.
   *
   * Current value is `rgba(255,255,255,0.05)` — will FAIL.
   */
  it("--cc-cookie-category-block-bg has opacity >= 0.08", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const value = cssProperties["--cc-cookie-category-block-bg"];
        expect(value).toBeDefined();
        const alpha = parseRgbaAlpha(value);
        expect(alpha).toBeGreaterThanOrEqual(0.08);
      }),
      { numRuns: 1 }
    );
  });
});

describe("Feature: cookie-settings-modal-readability, Bug Condition - Section border opacity", () => {
  /**
   * **Validates: Requirements 1.4**
   *
   * `--cc-section-border` MUST have opacity >= 0.25 to provide clear
   * visual separation between cookie categories.
   *
   * Current value is `rgba(255,255,255,0.1)` — will FAIL.
   */
  it("--cc-section-border has opacity >= 0.25", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const value = cssProperties["--cc-section-border"];
        expect(value).toBeDefined();
        const alpha = parseRgbaAlpha(value);
        expect(alpha).toBeGreaterThanOrEqual(0.25);
      }),
      { numRuns: 1 }
    );
  });
});

describe("Feature: cookie-settings-modal-readability, Bug Condition - Readonly toggle opacity", () => {
  /**
   * **Validates: Requirements 1.6**
   *
   * `--cc-toggle-bg-readonly` MUST have opacity >= 0.3 to clearly indicate
   * a disabled/locked state.
   *
   * Current value is `rgba(255,255,255,0.15)` — will FAIL.
   */
  it("--cc-toggle-bg-readonly has opacity >= 0.3", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const value = cssProperties["--cc-toggle-bg-readonly"];
        expect(value).toBeDefined();
        const alpha = parseRgbaAlpha(value);
        expect(alpha).toBeGreaterThanOrEqual(0.3);
      }),
      { numRuns: 1 }
    );
  });
});

describe("Feature: cookie-settings-modal-readability, Bug Condition - Preferences modal title override", () => {
  /**
   * **Validates: Requirements 1.1**
   *
   * An `#cc-main .pm__title` rule MUST exist with `color: #ffffff` to ensure
   * the preferences modal title renders in white.
   *
   * No such override exists in unfixed code — will FAIL.
   */
  it("#cc-main .pm__title rule exists with color: #ffffff", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const ruleBlock = findRuleBlock(cssContent, "#cc-main .pm__title");
        expect(ruleBlock).not.toBeNull();
        expect(ruleBlock).toMatch(/color\s*:\s*#ffffff/i);
      }),
      { numRuns: 1 }
    );
  });
});

describe("Feature: cookie-settings-modal-readability, Bug Condition - Section title override", () => {
  /**
   * **Validates: Requirements 1.2**
   *
   * An `#cc-main .pm__section-title` rule MUST exist with a high-contrast
   * color (white or near-white) for section headings.
   *
   * No such override exists in unfixed code — will FAIL.
   */
  it("#cc-main .pm__section-title rule exists with high-contrast color", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const ruleBlock = findRuleBlock(cssContent, "#cc-main .pm__section-title");
        expect(ruleBlock).not.toBeNull();
        // Must have a color declaration with a high-contrast value (white or near-white)
        expect(ruleBlock).toMatch(/color\s*:\s*#fff(fff)?/i);
      }),
      { numRuns: 1 }
    );
  });
});

describe("Feature: cookie-settings-modal-readability, Bug Condition - Section description override", () => {
  /**
   * **Validates: Requirements 1.3**
   *
   * An `#cc-main .pm__section-desc` rule MUST exist with `opacity: 1`
   * and `font-weight: 400` to ensure descriptions are fully readable.
   *
   * No such override exists in unfixed code — will FAIL.
   */
  it("#cc-main .pm__section-desc rule exists with opacity: 1 and font-weight: 400", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const ruleBlock = findRuleBlock(cssContent, "#cc-main .pm__section-desc");
        expect(ruleBlock).not.toBeNull();
        expect(ruleBlock).toMatch(/opacity\s*:\s*1/);
        expect(ruleBlock).toMatch(/font-weight\s*:\s*400/);
      }),
      { numRuns: 1 }
    );
  });
});
