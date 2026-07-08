import { describe, it, expect, beforeEach } from "vitest";
import { pushEvent, isValidFormName } from "../dataLayer";

describe("pushEvent", () => {
  beforeEach(() => {
    // Reset window.dataLayer before each test
    (window as any).dataLayer = undefined;
  });

  it("pushes correct structure for form_submission event", () => {
    pushEvent({ event: "form_submission", formName: "contact" });

    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer[0]).toEqual({
      event: "form_submission",
      formName: "contact",
    });
  });

  it("pushes correct structure for navigation_click event", () => {
    pushEvent({
      event: "navigation_click",
      navigation: { item: "About", breadcrumb: "About", type: "Header" },
    });

    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer[0]).toEqual({
      event: "navigation_click",
      navigation: { item: "About", breadcrumb: "About", type: "Header" },
    });
  });

  it("initialises window.dataLayer when missing", () => {
    expect(window.dataLayer).toBeUndefined();

    pushEvent({ event: "form_submission", formName: "newsletter-signup" });

    expect(Array.isArray(window.dataLayer)).toBe(true);
    expect(window.dataLayer).toHaveLength(1);
  });

  it("appends without clobbering existing entries", () => {
    window.dataLayer = [{ event: "gtm.js" } as any];

    pushEvent({
      event: "navigation_click",
      navigation: { item: "Home", breadcrumb: "Home", type: "Header" },
    });

    expect(window.dataLayer).toHaveLength(2);
    expect(window.dataLayer[0]).toEqual({ event: "gtm.js" });
    expect(window.dataLayer[1]).toEqual({
      event: "navigation_click",
      navigation: { item: "Home", breadcrumb: "Home", type: "Header" },
    });
  });
});

describe("isValidFormName", () => {
  it.each(["contact", "newsletter-signup", "working-group-form"])(
    'accepts valid kebab-case: "%s"',
    (name) => {
      expect(isValidFormName(name)).toBe(true);
    }
  );

  it.each([
    ["empty string", ""],
    ["uppercase start", "Contact"],
    ["underscore separator", "contact_form"],
    ["leading dash", "-leading"],
    ["trailing dash", "trailing-"],
    ["double dash", "double--dash"],
  ])("rejects invalid: %s (%s)", (_label, name) => {
    expect(isValidFormName(name)).toBe(false);
  });
});
