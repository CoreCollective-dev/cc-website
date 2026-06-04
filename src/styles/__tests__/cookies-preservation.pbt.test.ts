import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Property-based tests for cookie settings modal readability fix — preservation tests.
 *
 * Feature: cookie-settings-modal-readability
 *
 * These tests verify that existing correct behavior is preserved.
 * They MUST PASS on the current UNFIXED code — they lock in values
 * that should NOT change when the fix is applied.
 */

// --- CSS Parsing Utilities ---

/**
 * Parse the cookies.css file and extract CSS custom property values.
 */
function parseCookiesCss(): { properties: Record<string, string>; content: string } {
  const cssPath = resolve(__dirname, "../../styles/cookies.css");
  const content = readFileSync(cssPath, "utf-8");
  const properties: Record<string, string> = {};

  const propertyRegex = /--([\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = propertyRegex.exec(content)) !== null) {
    properties[`--${match[1]}`] = match[2].trim();
  }

  return { properties, content };
}

const { properties: cssProperties, content: cssContent } = parseCookiesCss();

// --- Preserved CSS Custom Property Values (observed on UNFIXED code) ---

const preservedCustomProperties: Array<{ property: string; expectedValue: string }> = [
  { property: "--cc-bg", expectedValue: "#080225" },
  { property: "--cc-btn-primary-bg", expectedValue: "#7233F7" },
  { property: "--cc-btn-primary-text", expectedValue: "#ffffff" },
  { property: "--cc-btn-secondary-bg", expectedValue: "rgba(255, 255, 255, 0.35)" },
  { property: "--cc-btn-secondary-text", expectedValue: "#ffffff" },
  { property: "--cc-toggle-bg-on", expectedValue: "#7233F7" },
  { property: "--cc-toggle-bg-off", expectedValue: "rgba(255, 255, 255, 0.3)" },
  { property: "--cc-cookie-table-border", expectedValue: "rgba(255, 255, 255, 0.1)" },
];

// --- Preserved Element-Level Rules ---

const preservedElementRules = [
  {
    selector: "#cc-main .cm__title",
    declarations: [{ prop: "color", value: "#ffffff" }],
  },
  {
    selector: "#cc-main .cm__desc",
    declarations: [
      { prop: "opacity", value: "1" },
      { prop: "font-weight", value: "400" },
    ],
  },
];

// --- Tests ---

describe("Feature: cookie-settings-modal-readability, Property 3: Preservation - CSS Custom Properties", () => {
  /**
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
   *
   * For any subset of preserved CSS custom properties, the CSS file SHALL
   * produce exactly the observed values. These properties must remain unchanged
   * to avoid regressions in consent banner, buttons, toggles, and background.
   */

  const arbPropertyIndex = fc.integer({
    min: 0,
    max: preservedCustomProperties.length - 1,
  });

  it("individual preserved custom properties match their observed values", () => {
    fc.assert(
      fc.property(arbPropertyIndex, (index) => {
        const { property, expectedValue } = preservedCustomProperties[index];
        const actualValue = cssProperties[property];

        expect(actualValue).toBeDefined();
        expect(actualValue).toBe(expectedValue);
      }),
      { numRuns: 200 }
    );
  });

  it("random subsets of preserved custom properties all match expected values", () => {
    const arbPropertySubset = fc
      .uniqueArray(
        fc.integer({ min: 0, max: preservedCustomProperties.length - 1 }),
        { minLength: 1, maxLength: preservedCustomProperties.length }
      )
      .map((indices) => indices.map((i) => preservedCustomProperties[i]));

    fc.assert(
      fc.property(arbPropertySubset, (subset) => {
        for (const { property, expectedValue } of subset) {
          const actualValue = cssProperties[property];
          expect(actualValue).toBeDefined();
          expect(actualValue).toBe(expectedValue);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("--cc-font-family includes Figtree Variable", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const fontFamily = cssProperties["--cc-font-family"];
        expect(fontFamily).toBeDefined();
        expect(fontFamily).toContain("Figtree Variable");
      }),
      { numRuns: 1 }
    );
  });
});

describe("Feature: cookie-settings-modal-readability, Property 3: Preservation - Element-Level Rules", () => {
  /**
   * **Validates: Requirements 3.1, 3.6**
   *
   * The consent banner element-level CSS rules (#cc-main .cm__title and
   * #cc-main .cm__desc) SHALL remain present with their exact declarations.
   * These rules ensure the consent banner text remains readable and must
   * not be removed or modified by the preferences modal fix.
   */

  it("#cc-main .cm__title rule sets color: #ffffff", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        // Match the rule block for #cc-main .cm__title
        const ruleMatch = cssContent.match(
          /#cc-main\s+\.cm__title\s*\{([^}]*)\}/
        );
        expect(ruleMatch).not.toBeNull();

        const ruleBody = ruleMatch![1];
        expect(ruleBody).toMatch(/color\s*:\s*#ffffff/);
      }),
      { numRuns: 1 }
    );
  });

  it("#cc-main .cm__desc rule sets opacity: 1 and font-weight: 400", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        // Match the rule block for #cc-main .cm__desc
        const ruleMatch = cssContent.match(
          /#cc-main\s+\.cm__desc\s*\{([^}]*)\}/
        );
        expect(ruleMatch).not.toBeNull();

        const ruleBody = ruleMatch![1];
        expect(ruleBody).toMatch(/opacity\s*:\s*1/);
        expect(ruleBody).toMatch(/font-weight\s*:\s*400/);
      }),
      { numRuns: 1 }
    );
  });

  it("preserved element rules verified through random selection", () => {
    const arbRuleIndex = fc.integer({
      min: 0,
      max: preservedElementRules.length - 1,
    });

    fc.assert(
      fc.property(arbRuleIndex, (index) => {
        const rule = preservedElementRules[index];
        const selectorEscaped = rule.selector
          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          .replace(/\s+/g, "\\s+");
        const ruleRegex = new RegExp(
          `${selectorEscaped}\\s*\\{([^}]*)\\}`
        );
        const ruleMatch = cssContent.match(ruleRegex);

        expect(ruleMatch).not.toBeNull();

        const ruleBody = ruleMatch![1];
        for (const decl of rule.declarations) {
          const declRegex = new RegExp(
            `${decl.prop}\\s*:\\s*${decl.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`
          );
          expect(ruleBody).toMatch(declRegex);
        }
      }),
      { numRuns: 50 }
    );
  });
});
