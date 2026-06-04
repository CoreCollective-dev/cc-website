import { describe, it, expect, vi, beforeEach } from "vitest";
import fc from "fast-check";
import { trackNavClick } from "../Navbar";

vi.mock("../../../lib/dataLayer", () => ({
  pushEvent: vi.fn(),
}));

import { pushEvent } from "../../../lib/dataLayer";

const mockedPushEvent = vi.mocked(pushEvent);

function createMockEvent(
  anchor: HTMLAnchorElement
): React.MouseEvent<HTMLAnchorElement> {
  return {
    currentTarget: anchor,
    preventDefault: vi.fn(),
  } as unknown as React.MouseEvent<HTMLAnchorElement>;
}

describe("Feature: consent-banner-datalayer, Property 2: Navigation link text extraction", () => {
  /**
   * **Validates: Requirements 8.2, 8.3, 8.4**
   *
   * For any anchor element containing arbitrary text content (including
   * leading/trailing whitespace) or an image with an alt attribute, the
   * trackNavClick extraction logic SHALL produce a linkText equal to the
   * trimmed textContent of the anchor (or the alt attribute of the contained
   * img if textContent is empty), and a linkUrl equal to the exact href
   * attribute value.
   */

  beforeEach(() => {
    mockedPushEvent.mockClear();
  });

  it("extracts trimmed textContent as linkText and preserves href exactly", () => {
    const arbWhitespace = fc.stringOf(fc.constantFrom(" ", "\t", "\n", "\r"));
    const arbVisibleText = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);
    const arbHref = fc.string();

    fc.assert(
      fc.property(
        arbWhitespace,
        arbVisibleText,
        arbWhitespace,
        arbHref,
        (leadingWs, text, trailingWs, href) => {
          mockedPushEvent.mockClear();

          const anchor = document.createElement("a");
          anchor.setAttribute("href", href);
          anchor.textContent = leadingWs + text + trailingWs;

          trackNavClick(createMockEvent(anchor));

          expect(mockedPushEvent).toHaveBeenCalledTimes(1);
          const call = mockedPushEvent.mock.calls[0][0];
          expect(call).toEqual({
            event: "nav_click",
            linkText: (leadingWs + text + trailingWs).trim(),
            linkUrl: href,
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("falls back to img alt when textContent is empty or whitespace-only", () => {
    const arbWhitespaceOnly = fc.stringOf(fc.constantFrom(" ", "\t", "\n", "\r"));
    const arbAlt = fc.string({ minLength: 1 });
    const arbHref = fc.string();

    fc.assert(
      fc.property(
        arbWhitespaceOnly,
        arbAlt,
        arbHref,
        (whitespace, alt, href) => {
          mockedPushEvent.mockClear();

          const anchor = document.createElement("a");
          anchor.setAttribute("href", href);
          // Add whitespace-only text node (if any) so textContent.trim() is empty
          if (whitespace.length > 0) {
            anchor.appendChild(document.createTextNode(whitespace));
          }
          const img = document.createElement("img");
          img.alt = alt;
          anchor.appendChild(img);

          trackNavClick(createMockEvent(anchor));

          expect(mockedPushEvent).toHaveBeenCalledTimes(1);
          const call = mockedPushEvent.mock.calls[0][0];

          // textContent includes alt text from img element in jsdom
          // The actual behavior: anchor.textContent includes the img alt text
          // in the DOM (img elements don't have textContent visible),
          // but whitespace + alt scenario depends on the DOM behavior.
          // The logic is: textContent?.trim() || img?.alt || ""
          const anchorTextContent = anchor.textContent?.trim() || "";
          const expectedLinkText = anchorTextContent || img.alt || "";

          expect(call).toEqual({
            event: "nav_click",
            linkText: expectedLinkText,
            linkUrl: href,
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("preserves href attribute value exactly", () => {
    // Generate various href patterns including special characters
    const arbHref = fc.oneof(
      fc.webUrl(),
      fc.string(),
      fc.constant("/"),
      fc.constant("#"),
      fc.constantFrom("/about/", "/contact?q=hello#top", "https://example.com/path")
    );
    const arbText = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(arbHref, arbText, (href, text) => {
        mockedPushEvent.mockClear();

        const anchor = document.createElement("a");
        anchor.setAttribute("href", href);
        anchor.textContent = text;

        trackNavClick(createMockEvent(anchor));

        expect(mockedPushEvent).toHaveBeenCalledTimes(1);
        const call = mockedPushEvent.mock.calls[0][0];
        expect((call as any).linkUrl).toBe(href);
      }),
      { numRuns: 100 }
    );
  });
});
