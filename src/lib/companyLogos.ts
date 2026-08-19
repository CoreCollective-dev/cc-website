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
  amd: {
    src: "https://static.corecollective.dev/company_logos/amdLogo.svg",
    alt: "amd logo",
    scale: "0.8",
  },
  ampere: {
    src: "https://static.corecollective.dev/company_logos/ampereLogo.svg",
    alt: "ampere logo",
  },
  arm: {
    src: "https://static.corecollective.dev/company_logos/armLogo.svg",
    alt: "arm logo",
    scale: "0.75",
  },
  canonical: {
    src: "https://static.corecollective.dev/company_logos/canonicalLogo.svg",
    alt: "canonical logo",
    scale: "2",
  },
  cix: {
    src: "https://static.corecollective.dev/company_logos/cixLogo.svg",
    alt: "cix logo",
    scale: "0.8",
  },
  codethink: {
    src: "https://static.corecollective.dev/company_logos/codethinkLogo.png",
    alt: "codethink logo",
  },
  epam: {
    src: "https://static.corecollective.dev/company_logos/epamLogo.png",
    alt: "epam logo",
  },
  fujitsu: {
    src: "https://static.corecollective.dev/company_logos/fujitsuLogo.svg",
    alt: "fujitsu logo",
  },
  google: {
    src: "https://static.corecollective.dev/company_logos/googleLogo.svg",
    alt: "google logo",
    scale: "0.8",
  },
  graphcore: {
    src: "https://static.corecollective.dev/company_logos/graphcoreLogo.svg",
    alt: "graphcore logo",
  },
  gutlaf: {
    src: "https://static.corecollective.dev/company_logos/gutlafLogo.png",
    alt: "gutlaf logo",
  },
  huawei: {
    src: "https://static.corecollective.dev/company_logos/huawei3.svg",
    alt: "huawei logo",
    scale: "2.8",
  },
  lecomputing: {
    src: "https://static.corecollective.dev/company_logos/lecomputingLogo.png",
    alt: "lecomputing logo",
  },
  linaro: {
    src: "https://static.corecollective.dev/company_logos/linaroLogo.svg",
    alt: "linaro logo",
  },
  machineware: {
    src: "https://static.corecollective.dev/company_logos/machinewareLogo.svg",
    alt: "machineware logo",
  },
  microsoft: {
    src: "https://static.corecollective.dev/company_logos/microsoftLogo.svg",
    alt: "microsoft logo",
  },
  nvidia: {
    src: "https://static.corecollective.dev/company_logos/nvidiaLogo.svg",
    alt: "nvidia logo",
    scale: "2.8",
  },
  qualcomm: {
    src: "https://static.corecollective.dev/company_logos/qualcommLogo.svg",
    alt: "qualcomm logo",
  },
  redhat: {
    src: "https://static.corecollective.dev/company_logos/redhatLogo.svg",
    alt: "redhat logo",
  },
  rockylinux: {
    src: "https://static.corecollective.dev/company_logos/rockylinuxLogo.svg",
    alt: "rocky linux logo",
  },
  samsung: {
    src: "https://static.corecollective.dev/company_logos/samsungLogo.svg",
    alt: "samsung logo",
  },
  socionext: {
    src: "https://static.corecollective.dev/company_logos/socionextLogo.png",
    alt: "socionext logo",
  },
  stackable: {
    src: "https://static.corecollective.dev/company_logos/stackableLogo.svg",
    alt: "stackable logo",
  },
  suse: {
    src: "https://static.corecollective.dev/company_logos/suseLogo.svg",
    alt: "suse logo",
  },
  vivo: {
    src: "https://static.corecollective.dev/company_logos/vivoLogo.png",
    alt: "vivo logo",
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
