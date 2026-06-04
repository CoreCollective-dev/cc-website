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

  it("extracts visible text from anchor", () => {
    const anchor = document.createElement("a");
    anchor.href = "/about/";
    anchor.textContent = "About Us";

    trackNavClick(createMockEvent(anchor));

    expect(mockedPushEvent).toHaveBeenCalledWith({
      event: "nav_click",
      linkText: "About Us",
      linkUrl: "/about/",
    });
  });

  it("trims whitespace from text content", () => {
    const anchor = document.createElement("a");
    anchor.href = "/contact/";
    anchor.textContent = "  Contact  ";

    trackNavClick(createMockEvent(anchor));

    expect(mockedPushEvent).toHaveBeenCalledWith({
      event: "nav_click",
      linkText: "Contact",
      linkUrl: "/contact/",
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
      event: "nav_click",
      linkText: "Logo",
      linkUrl: "/",
    });
  });

  it("returns empty string when neither text nor img alt exists", () => {
    const anchor = document.createElement("a");
    anchor.href = "/unknown/";
    const img = document.createElement("img");
    // No alt attribute set
    anchor.appendChild(img);

    trackNavClick(createMockEvent(anchor));

    expect(mockedPushEvent).toHaveBeenCalledWith({
      event: "nav_click",
      linkText: "",
      linkUrl: "/unknown/",
    });
  });

  it("preserves href exactly", () => {
    const anchor = document.createElement("a");
    anchor.setAttribute("href", "/page?foo=bar#section");
    anchor.textContent = "Link";

    trackNavClick(createMockEvent(anchor));

    expect(mockedPushEvent).toHaveBeenCalledWith({
      event: "nav_click",
      linkText: "Link",
      linkUrl: "/page?foo=bar#section",
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
