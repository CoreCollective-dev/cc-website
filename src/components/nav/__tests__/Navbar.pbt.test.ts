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

describe("Feature: consent-banner-datalayer, Property 2: Navigation click event structure", () => {
  /**
   * **Validates: navigation_click event taxonomy**
   *
   * For any anchor element containing arbitrary text content (including
   * leading/trailing whitespace) or an image with an alt attribute,
   * trackNavClick SHALL produce a navigation_click event with:
   * - navigation.item: the trimmed visible text (or img alt fallback)
   * - navigation.breadcrumb: "parentLabel > item" if parentLabel provided, else just item
   * - navigation.type: always "Header"
   */

  beforeEach(() => {
    mockedPushEvent.mockClear();
  });

  it("extracts trimmed textContent as item and builds correct breadcrumb without parent", () => {
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
          const expectedItem = (leadingWs + text + trailingWs).trim();
          expect(call).toEqual({
            event: "navigation_click",
            navigation: {
              item: expectedItem,
              breadcrumb: expectedItem,
              type: "Header",
            },
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it("builds parent > item breadcrumb when parentLabel is provided", () => {
    const arbVisibleText = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);
    const arbParent = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);
    const arbHref = fc.string();

    fc.assert(
      fc.property(
        arbVisibleText,
        arbParent,
        arbHref,
        (text, parentLabel, href) => {
          mockedPushEvent.mockClear();

          const anchor = document.createElement("a");
          anchor.setAttribute("href", href);
          anchor.textContent = text;

          trackNavClick(createMockEvent(anchor), parentLabel);

          expect(mockedPushEvent).toHaveBeenCalledTimes(1);
          const call = mockedPushEvent.mock.calls[0][0];
          const expectedItem = text.trim();
          expect(call).toEqual({
            event: "navigation_click",
            navigation: {
              item: expectedItem,
              breadcrumb: `${parentLabel} > ${expectedItem}`,
              type: "Header",
            },
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
          if (whitespace.length > 0) {
            anchor.appendChild(document.createTextNode(whitespace));
          }
          const img = document.createElement("img");
          img.alt = alt;
          anchor.appendChild(img);

          trackNavClick(createMockEvent(anchor));

          expect(mockedPushEvent).toHaveBeenCalledTimes(1);
          const call = mockedPushEvent.mock.calls[0][0];

          // textContent includes alt text from img in some DOM implementations
          const anchorTextContent = anchor.textContent?.trim() || "";
          const expectedItem = anchorTextContent || img.alt || "";

          expect(call).toEqual({
            event: "navigation_click",
            navigation: {
              item: expectedItem,
              breadcrumb: expectedItem,
              type: "Header",
            },
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
