export interface CompanyLogo {
  src: string;
  alt: string;
  scale?: string;
}

/**
 * Keyed registry of company logos reused across the site.
 * URLs reference assets on static.corecollective.dev.
 */
export const companyLogos: Record<string, CompanyLogo> = {
  arm: {
    src: "https://static.corecollective.dev/company_logos/armLogo.svg",
    alt: "Arm logo",
    scale: "0.75",
  },
  cix: {
    src: "https://static.corecollective.dev/company_logos/cixLogo.svg",
    alt: "CIX logo",
    scale: "0.8",
  },
  linaro: {
    src: "https://static.corecollective.dev/company_logos/linaroLogo.svg",
    alt: "Linaro logo",
  },
  microsoft: {
    src: "https://static.corecollective.dev/company_logos/microsoftLogo.svg",
    alt: "Microsoft logo",
  },
  qualcomm: {
    src: "https://static.corecollective.dev/company_logos/qualcommLogo.svg",
    alt: "Qualcomm logo",
  },
};

export interface ResolvedMember {
  name: string;
  src: string;
  alt: string;
  scale?: string;
}

export interface RawMember {
  name: string;
  logo?: string;
  src?: string;
  alt?: string;
  scale?: string;
}

/**
 * Resolve raw member entries against the logo registry, preserving order.
 * Throws on an unresolved `logo` key so the build fails (Req 2.5).
 *
 * Resolution rules:
 * - If `logo` is set, look it up in the registry. If the key is missing, throw.
 *   Inline `src`/`alt`/`scale` override matching registry fields when both are present.
 * - If only `src`/`alt` are set (no `logo` key), use them directly.
 * - Empty input returns an empty array without error.
 */
export function resolveMembers(
  entries: RawMember[],
  registry: Record<string, CompanyLogo> = companyLogos,
): ResolvedMember[] {
  return entries.map((entry) => {
    if (entry.logo) {
      const registryEntry = registry[entry.logo];
      if (!registryEntry) {
        throw new Error(
          `Unresolved logo key "${entry.logo}" for member "${entry.name}". ` +
            `Available keys: ${Object.keys(registry).join(", ")}`,
        );
      }

      return {
        name: entry.name,
        src: entry.src ?? registryEntry.src,
        alt: entry.alt ?? registryEntry.alt,
        scale: entry.scale ?? registryEntry.scale,
      };
    }

    // Inline-only entry (no registry reference)
    return {
      name: entry.name,
      src: entry.src!,
      alt: entry.alt!,
      scale: entry.scale,
    };
  });
}
