/** Supported DataLayer event types */
export type NavigationClickEvent = {
  event: "navigation_click";
  navigation: {
    item: string;
    breadcrumb: string;
    type: string;
  };
};

export type DataLayerEvent =
  | { event: "form_submission"; formName: string }
  | NavigationClickEvent;

/**
 * Push a structured event to the GTM DataLayer.
 * Initialises window.dataLayer if it does not already exist.
 */
export function pushEvent(event: DataLayerEvent): void {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

/**
 * Validates that a formName follows kebab-case convention.
 * Pattern: ^[a-z][a-z0-9]*(-[a-z0-9]+)*$
 */
export function isValidFormName(name: string): boolean {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name);
}

/** Type augmentation for window.dataLayer */
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}
