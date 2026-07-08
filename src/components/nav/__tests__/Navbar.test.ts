import { describe, it, expect, vi, beforeEach } from "vitest";
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

describe("trackNavClick", () => {
  beforeEach(() => {
    mockedPushEvent.mockClear();
  });

  it("pushes navigation_click with item and breadcrumb for top-level link", () => {
    const anchor = document.createElement("a");
    anchor.href = "/working-groups/";
    anchor.textContent = "Working Groups";

    trackNavClick(createMockEvent(anchor));

    expect(mockedPushEvent).toHaveBeenCalledWith({
      event: "navigation_click",
      navigation: {
        item: "Working Groups",
        breadcrumb: "Working Groups",
        type: "Header",
      },
    });
  });

  it("builds breadcrumb from parent label for dropdown items", () => {
    const anchor = document.createElement("a");
    anchor.href = "/faq/";
    anchor.textContent = "FAQ";

    trackNavClick(createMockEvent(anchor), "About");

    expect(mockedPushEvent).toHaveBeenCalledWith({
      event: "navigation_click",
      navigation: {
        item: "FAQ",
        breadcrumb: "About > FAQ",
        type: "Header",
      },
    });
  });

  it("trims whitespace from text content", () => {
    const anchor = document.createElement("a");
    anchor.href = "/contact/";
    anchor.textContent = "  Contact  ";

    trackNavClick(createMockEvent(anchor));

    expect(mockedPushEvent).toHaveBeenCalledWith({
      event: "navigation_click",
      navigation: {
        item: "Contact",
        breadcrumb: "Contact",
        type: "Header",
      },
    });
  });

  it("falls back to img alt when no text content", () => {
    const anchor = document.createElement("a");
    anchor.href = "/";
    const img = document.createElement("img");
    img.alt = "Logo";
    anchor.appendChild(img);

    trackNavClick(createMockEvent(anchor));

    expect(mockedPushEvent).toHaveBeenCalledWith({
      event: "navigation_click",
      navigation: {
        item: "Logo",
        breadcrumb: "Logo",
        type: "Header",
      },
    });
  });

  it("returns empty string when neither text nor img alt exists", () => {
    const anchor = document.createElement("a");
    anchor.href = "/unknown/";
    const img = document.createElement("img");
    anchor.appendChild(img);

    trackNavClick(createMockEvent(anchor));

    expect(mockedPushEvent).toHaveBeenCalledWith({
      event: "navigation_click",
      navigation: {
        item: "",
        breadcrumb: "",
        type: "Header",
      },
    });
  });

  it("does not call preventDefault", () => {
    const anchor = document.createElement("a");
    anchor.href = "/join/";
    anchor.textContent = "Join";

    const event = createMockEvent(anchor);
    trackNavClick(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
