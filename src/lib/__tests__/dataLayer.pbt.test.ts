import { describe, it, expect, beforeEach } from "vitest";
import fc from "fast-check";
import { pushEvent, isValidFormName, type DataLayerEvent } from "../dataLayer";

/**
 * Property-based tests for the DataLayer utility module.
 *
 * Feature: consent-banner-datalayer
 */

/** Arbitrary for valid form_submission events */
const arbFormSubmissionEvent = fc
  .stringMatching(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/)
  .map(
    (formName): DataLayerEvent => ({
      event: "form_submission",
      formName,
    })
  );

/** Arbitrary for valid navigation_click events */
const arbNavClickEvent = fc
  .record({
    item: fc.string(),
    breadcrumb: fc.string(),
    type: fc.constant("Header"),
  })
  .map(
    (navigation): DataLayerEvent => ({
      event: "navigation_click",
      navigation,
    })
  );

/** Arbitrary for any valid DataLayerEvent */
const arbDataLayerEvent = fc.oneof(arbFormSubmissionEvent, arbNavClickEvent);

describe("Feature: consent-banner-datalayer, Property 1: pushEvent preserves event structure in DataLayer", () => {
  /**
   * **Validates: Requirements 7.1, 7.3, 8.1, 8.6**
   *
   * For any valid DataLayerEvent, calling pushEvent(event) SHALL result in
   * window.dataLayer containing that exact event object as its last element,
   * regardless of whether window.dataLayer existed prior to the call.
   */

  beforeEach(() => {
    (window as any).dataLayer = undefined;
  });

  it("pushEvent preserves event structure when dataLayer does not exist", () => {
    fc.assert(
      fc.property(arbDataLayerEvent, (event) => {
        (window as any).dataLayer = undefined;

        pushEvent(event);

        const lastElement = window.dataLayer[window.dataLayer.length - 1];
        expect(lastElement).toEqual(event);
      }),
      { numRuns: 100 }
    );
  });

  it("pushEvent preserves event structure when dataLayer already has entries", () => {
    fc.assert(
      fc.property(
        arbDataLayerEvent,
        fc.array(fc.record({ event: fc.string() }), { minLength: 0, maxLength: 10 }),
        (event, priorEntries) => {
          (window as any).dataLayer = [...priorEntries];
          const priorLength = priorEntries.length;

          pushEvent(event);

          expect(window.dataLayer).toHaveLength(priorLength + 1);
          const lastElement = window.dataLayer[window.dataLayer.length - 1];
          expect(lastElement).toEqual(event);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Feature: consent-banner-datalayer, Property 3: kebab-case formName validation", () => {
  /**
   * **Validates: Requirements 7.2**
   *
   * For any string, the kebab-case validation function SHALL return true
   * if and only if the string matches the pattern ^[a-z][a-z0-9]*(-[a-z0-9]+)*$
   */

  const kebabCaseRegex = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

  it("isValidFormName returns true iff string matches kebab-case regex", () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const expected = kebabCaseRegex.test(input);
        const actual = isValidFormName(input);
        expect(actual).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });

  it("isValidFormName accepts all valid kebab-case strings", () => {
    /** Generate strings that conform to the kebab-case pattern */
    const arbValidKebab = fc.stringMatching(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/);

    fc.assert(
      fc.property(arbValidKebab, (input) => {
        expect(isValidFormName(input)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
