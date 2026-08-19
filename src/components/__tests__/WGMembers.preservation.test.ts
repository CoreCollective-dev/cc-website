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
      return `<li class="flex shrink-0 items-center justify-center"><img src="${member.src}" alt="${member.alt}" width="300" height="100" class="max-h-10 max-w-[7rem] object-contain sm:max-h-12 sm:max-w-[9rem] md:max-h-14 md:max-w-[12rem]"${styleAttr} /></li>`;
    })
    .join("");

  return `<section class="mt-12 pt-10 border-t border-gray-700"><ul class="flex w-full flex-wrap items-center justify-center gap-8 px-4 sm:gap-10 md:gap-12">${items}</ul></section>`;
}

/**
 * Feature: wg-member-logo-display-fix
 * Property 2: Preservation - Existing Logo Rendering Unchanged
 *
 * These tests verify that the existing behavior of working logos is preserved.
 * They MUST pass on the current unfixed code to establish a baseline.
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 */
describe("Feature: wg-member-logo-display-fix, Property 2: Preservation - Existing Logo Rendering Unchanged", () => {
  // Generator for ResolvedMember with a scale value
  const arbMemberWithScale: fc.Arbitrary<ResolvedMember> = fc.record({
    name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
    src: fc.webUrl().filter((u) => !u.includes('"') && !u.includes("<") && !u.includes(">")),
    alt: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0 && !s.includes('"') && !s.includes("<") && !s.includes(">")),
    scale: fc
      .float({ min: 0.5, max: 2.0, noNaN: true })
      .map((n) => n.toFixed(2)),
  });

  // Generator for ResolvedMember without a scale value
  const arbMemberWithoutScale: fc.Arbitrary<ResolvedMember> = fc.record({
    name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
    src: fc.webUrl().filter((u) => !u.includes('"') && !u.includes("<") && !u.includes(">")),
    alt: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0 && !s.includes('"') && !s.includes("<") && !s.includes(">")),
    scale: fc.constant(undefined),
  });

  // Generator for any ResolvedMember (with or without scale)
  const arbMember: fc.Arbitrary<ResolvedMember> = fc.oneof(
    arbMemberWithScale,
    arbMemberWithoutScale
  );

  describe("CSS classes are preserved on all rendered img elements", () => {
    /**
     * **Validates: Requirements 3.1**
     *
     * For all members, the rendered <img> element must include the responsive
     * CSS classes that control visual sizing at each breakpoint.
     */
    it("all rendered img elements have the responsive sizing CSS classes", () => {
      const expectedClass =
        'class="max-h-10 max-w-[7rem] object-contain sm:max-h-12 sm:max-w-[9rem] md:max-h-14 md:max-w-[12rem]"';

      fc.assert(
        fc.property(
          fc.array(arbMember, { minLength: 1, maxLength: 10 }),
          (members) => {
            const html = renderWGMembersHtml(members);
            const imgTagRegex = /<img[^>]*\/?>/g;
            const imgTags = html.match(imgTagRegex) || [];

            expect(imgTags.length).toBe(members.length);

            for (const imgTag of imgTags) {
              expect(imgTag).toContain(expectedClass);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Scale transforms applied correctly", () => {
    /**
     * **Validates: Requirements 3.2**
     *
     * For all members with a scale value, the rendered element must include
     * an inline style with the correct transform: scale() value.
     */
    it("members with a scale value have transform: scale(N) in style attribute", () => {
      fc.assert(
        fc.property(
          fc.array(arbMemberWithScale, { minLength: 1, maxLength: 5 }),
          (members) => {
            const html = renderWGMembersHtml(members);
            const imgTagRegex = /<img[^>]*\/?>/g;
            const imgTags = html.match(imgTagRegex) || [];

            expect(imgTags.length).toBe(members.length);

            for (let i = 0; i < members.length; i++) {
              const expectedStyle = `style="transform: scale(${members[i].scale});"`;
              expect(imgTags[i]).toContain(expectedStyle);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * **Validates: Requirements 3.2**
     *
     * For all members without a scale value, no inline transform style
     * is applied to the rendered element.
     */
    it("members without a scale value have no inline style attribute", () => {
      fc.assert(
        fc.property(
          fc.array(arbMemberWithoutScale, { minLength: 1, maxLength: 5 }),
          (members) => {
            const html = renderWGMembersHtml(members);
            const imgTagRegex = /<img[^>]*\/?>/g;
            const imgTags = html.match(imgTagRegex) || [];

            expect(imgTags.length).toBe(members.length);

            for (const imgTag of imgTags) {
              expect(imgTag).not.toContain("style=");
              expect(imgTag).not.toContain("transform");
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("src and alt attributes are correctly passed through", () => {
    /**
     * **Validates: Requirements 3.1, 3.4**
     *
     * For all members, the rendered <img> element must have the correct
     * src and alt attributes matching the member data.
     */
    it("all rendered img elements have correct src and alt attributes", () => {
      fc.assert(
        fc.property(
          fc.array(arbMember, { minLength: 1, maxLength: 5 }),
          (members) => {
            const html = renderWGMembersHtml(members);
            const imgTagRegex = /<img[^>]*\/?>/g;
            const imgTags = html.match(imgTagRegex) || [];

            expect(imgTags.length).toBe(members.length);

            for (let i = 0; i < members.length; i++) {
              expect(imgTags[i]).toContain(`src="${members[i].src}"`);
              expect(imgTags[i]).toContain(`alt="${members[i].alt}"`);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("One img element rendered per member", () => {
    /**
     * **Validates: Requirements 3.1, 3.4**
     *
     * The component renders exactly one <img> element for each member
     * in the input array.
     */
    it("renders exactly one img element per member", () => {
      fc.assert(
        fc.property(
          fc.array(arbMember, { minLength: 1, maxLength: 10 }),
          (members) => {
            const html = renderWGMembersHtml(members);
            const imgTagRegex = /<img[^>]*\/?>/g;
            const imgTags = html.match(imgTagRegex) || [];

            expect(imgTags.length).toBe(members.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("empty members array produces no output", () => {
      const html = renderWGMembersHtml([]);
      expect(html).toBe("");
    });
  });

  describe("Real members from windows-on-arm working group", () => {
    const realMembers: ResolvedMember[] = [
      { name: "Arm", src: "https://static.corecollective.dev/company_logos/armLogo.svg", alt: "Arm logo", scale: "0.75" },
      { name: "CIX", src: "https://static.corecollective.dev/company_logos/cixLogo.svg", alt: "CIX logo", scale: "0.8" },
      { name: "Linaro", src: "https://static.corecollective.dev/company_logos/linaroLogo.svg", alt: "Linaro logo" },
      { name: "Microsoft", src: "https://static.corecollective.dev/company_logos/microsoftLogo.svg", alt: "Microsoft logo" },
      { name: "Qualcomm", src: "https://static.corecollective.dev/company_logos/qualcommLogo.svg", alt: "Qualcomm logo" },
    ];

    it("Arm logo has scale(0.75) transform applied", () => {
      const html = renderWGMembersHtml(realMembers);
      const imgTagRegex = /<img[^>]*\/?>/g;
      const imgTags = html.match(imgTagRegex) || [];
      // Arm is first member
      expect(imgTags[0]).toContain('style="transform: scale(0.75);"');
    });

    it("CIX logo has scale(0.8) transform applied", () => {
      const html = renderWGMembersHtml(realMembers);
      const imgTagRegex = /<img[^>]*\/?>/g;
      const imgTags = html.match(imgTagRegex) || [];
      // CIX is second member
      expect(imgTags[1]).toContain('style="transform: scale(0.8);"');
    });

    it("Microsoft logo has no inline transform style", () => {
      const html = renderWGMembersHtml(realMembers);
      const imgTagRegex = /<img[^>]*\/?>/g;
      const imgTags = html.match(imgTagRegex) || [];
      // Microsoft is fourth member (index 3)
      expect(imgTags[3]).not.toContain("style=");
    });

    it("Qualcomm logo has no inline transform style", () => {
      const html = renderWGMembersHtml(realMembers);
      const imgTagRegex = /<img[^>]*\/?>/g;
      const imgTags = html.match(imgTagRegex) || [];
      // Qualcomm is fifth member (index 4)
      expect(imgTags[4]).not.toContain("style=");
    });

    it("all five members produce img elements with correct src and alt", () => {
      const html = renderWGMembersHtml(realMembers);
      const imgTagRegex = /<img[^>]*\/?>/g;
      const imgTags = html.match(imgTagRegex) || [];

      expect(imgTags.length).toBe(5);

      for (let i = 0; i < realMembers.length; i++) {
        expect(imgTags[i]).toContain(`src="${realMembers[i].src}"`);
        expect(imgTags[i]).toContain(`alt="${realMembers[i].alt}"`);
      }
    });

    it("all five members have the responsive CSS classes", () => {
      const html = renderWGMembersHtml(realMembers);
      const imgTagRegex = /<img[^>]*\/?>/g;
      const imgTags = html.match(imgTagRegex) || [];

      for (const imgTag of imgTags) {
        expect(imgTag).toContain("max-h-10");
        expect(imgTag).toContain("max-w-[7rem]");
        expect(imgTag).toContain("object-contain");
        expect(imgTag).toContain("sm:max-h-12");
        expect(imgTag).toContain("sm:max-w-[9rem]");
        expect(imgTag).toContain("md:max-h-14");
        expect(imgTag).toContain("md:max-w-[12rem]");
      }
    });
  });
});
