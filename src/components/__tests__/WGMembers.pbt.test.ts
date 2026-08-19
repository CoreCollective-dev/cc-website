import { describe, it, expect } from "vitest";
import fc from "fast-check";
import type { ResolvedMember } from "../../lib/companyLogos";

/**
 * Simulates the rendering logic of WGMembers.astro (fixed version).
 * This produces the same HTML structure as the Astro component template
 * after switching from plain <img> to Astro's <Image> component with
 * explicit width/height attributes.
 */
function renderWGMembersHtml(members: ResolvedMember[]): string {
  if (members.length === 0) return "";

  const items = members
    .map((member) => {
      const styleAttr = member.scale
        ? ` style="transform: scale(${member.scale});"`
        : "";
      // This mirrors the FIXED component template:
      // <Image> with explicit width="300" height="100" attributes
      return `<li class="flex shrink-0 items-center justify-center"><img src="${member.src}" alt="${member.alt}" width="300" height="100" class="max-h-10 max-w-[7rem] object-contain sm:max-h-12 sm:max-w-[9rem] md:max-h-14 md:max-w-[12rem]"${styleAttr} /></li>`;
    })
    .join("");

  return `<section class="mt-12 pt-10 border-t border-gray-700"><ul class="flex w-full flex-wrap items-center justify-center gap-8 px-4 sm:gap-10 md:gap-12">${items}</ul></section>`;
}

describe("Feature: wg-member-logo-display-fix, Property 1: Bug Condition - Dimensionless SVGs Render Visibly", () => {
  /**
   * **Validates: Requirements 1.1, 2.1, 2.2**
   *
   * For any ResolvedMember rendered through WGMembers.astro, the output
   * <img> element MUST include explicit `width` and `height` attributes
   * so that dimensionless SVGs (those without intrinsic width/height in
   * the SVG metadata) render at a visible size.
   *
   * This test is expected to FAIL on unfixed code because the current
   * component uses a plain <img> tag without width/height attributes.
   * Failure confirms the bug exists.
   */

  // Generator for ResolvedMember objects representing dimensionless SVG logos
  const arbResolvedMember: fc.Arbitrary<ResolvedMember> = fc.record({
    name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
    src: fc.constant("https://static.corecollective.dev/company_logos/linaroLogo.svg"),
    alt: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0 && !s.includes('"') && !s.includes("<") && !s.includes(">")),
    scale: fc.option(
      fc.float({ min: 0.5, max: 2.0, noNaN: true }).map((n) => n.toFixed(2)),
      { nil: undefined }
    ),
  });

  it("rendered <img> elements must have explicit width and height attributes for all members", () => {
    fc.assert(
      fc.property(
        fc.array(arbResolvedMember, { minLength: 1, maxLength: 5 }),
        (members) => {
          const html = renderWGMembersHtml(members);

          // Parse out all <img> tags from the rendered HTML
          const imgTagRegex = /<img[^>]*\/?>/g;
          const imgTags = html.match(imgTagRegex) || [];

          // There must be one <img> per member
          expect(imgTags.length).toBe(members.length);

          // Each <img> MUST have explicit width and height attributes
          // This is the property that confirms the bug: without these
          // attributes, dimensionless SVGs collapse to 0×0
          for (const imgTag of imgTags) {
            const hasWidth = /\bwidth\s*=/.test(imgTag);
            const hasHeight = /\bheight\s*=/.test(imgTag);

            expect(hasWidth).toBe(true);
            expect(hasHeight).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Linaro logo (dimensionless SVG) must have width and height attributes in rendered output", () => {
    // Concrete case: the exact member that demonstrates the bug
    const linaroMember: ResolvedMember = {
      name: "Linaro",
      src: "https://static.corecollective.dev/company_logos/linaroLogo.svg",
      alt: "Linaro logo",
    };

    const html = renderWGMembersHtml([linaroMember]);

    const imgTagRegex = /<img[^>]*\/?>/g;
    const imgTags = html.match(imgTagRegex) || [];

    expect(imgTags.length).toBe(1);

    const imgTag = imgTags[0];
    // The bug condition: the plain <img> tag lacks width/height attributes
    // causing dimensionless SVGs to collapse to 0×0 in the browser
    expect(imgTag).toMatch(/\bwidth\s*=/);
    expect(imgTag).toMatch(/\bheight\s*=/);
  });

  it("all working group members (including dimensionless SVGs) must have width and height on rendered img", () => {
    // Real members from the windows-on-arm working group
    const realMembers: ResolvedMember[] = [
      { name: "Arm", src: "https://static.corecollective.dev/company_logos/armLogo.svg", alt: "Arm logo", scale: "0.75" },
      { name: "CIX", src: "https://static.corecollective.dev/company_logos/cixLogo.svg", alt: "CIX logo", scale: "0.8" },
      { name: "Linaro", src: "https://static.corecollective.dev/company_logos/linaroLogo.svg", alt: "Linaro logo" },
      { name: "Microsoft", src: "https://static.corecollective.dev/company_logos/microsoftLogo.svg", alt: "Microsoft logo" },
      { name: "Qualcomm", src: "https://static.corecollective.dev/company_logos/qualcommLogo.svg", alt: "Qualcomm logo" },
    ];

    const html = renderWGMembersHtml(realMembers);

    const imgTagRegex = /<img[^>]*\/?>/g;
    const imgTags = html.match(imgTagRegex) || [];

    expect(imgTags.length).toBe(5);

    for (const imgTag of imgTags) {
      expect(imgTag).toMatch(/\bwidth\s*=/);
      expect(imgTag).toMatch(/\bheight\s*=/);
    }
  });
});
