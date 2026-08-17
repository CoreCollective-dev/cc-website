# Contributing to the CoreCollective Website

This guide covers the working group page components — how they work, and how to add or update content for any working group.

## Architecture Overview

Each working group page (`/working-groups/<slug>`) is built from three sources:

1. **MDX content** (`src/content/working-groups/<slug>.mdx`) — the evergreen page body (projects, mailing list, resources)
2. **Members data** (`src/content/wg-members/<slug>.yaml`) — structured member list rendered as a logo grid
3. **News data** (`src/content/wg-news/<slug>.yaml`) — time-sensitive announcements shown above the page content

The page template at `src/pages/working-groups/[slug].astro` loads all three and renders them together. Members and news are both optional — if a YAML file doesn't exist for a given slug, that section simply won't render.

---

## WG News Feed (`WGNews` component)

The news panel appears at the top of a working group page, above the evergreen MDX content. It shows the most recent announcements (up to 3 by default, sorted by date descending).

### Adding news items

Create or edit `src/content/wg-news/<slug>.yaml`:

```yaml
heading: Latest News   # optional, defaults to "Latest News"
items:
  - headline: FFmpeg ARM64EC binaries now available
    body: Prebuilt FFmpeg binaries for Windows on Arm are published for download.
    date: 2026-07-01
    links:
      - { label: FFmpeg ARM64EC release page, href: https://github.com/Multicorewareinc/FFmpeg/releases }

  - headline: Python 3.13 native wheels shipping
    body: Pure-Python and compiled wheels now build natively on WoA CI runners.
    date: 2026-06-15
```

### Field constraints

| Field | Required | Constraints |
|-------|----------|-------------|
| `headline` | Yes | 1–120 characters |
| `body` | Yes | 1–300 characters |
| `date` | Yes | Valid date (YAML date or ISO string) |
| `links` | No | Array of `{ label, href }` where `href` is a valid URL |

The build will fail if any constraint is violated — this is intentional so broken content doesn't ship.

### Behaviour

- Items are sorted by date (newest first), with deterministic tie-breaking on headline
- At most 3 items are shown (configurable in code via `selectLatestNews`)
- If no news file exists or items is empty, the news section doesn't render at all
- The "More below" chevron at the bottom is a passive visual indicator (not clickable)

---

## WG Members List (`WGMembers` component)

The members section renders below the MDX content as a responsive logo grid.

### Adding members

Create or edit `src/content/wg-members/<slug>.yaml`:

```yaml
heading: Working Group Members   # optional
members:
  - { name: Arm, logo: arm }
  - { name: CIX, logo: cix }
  - { name: Linaro, logo: linaro }
  - { name: Microsoft, logo: microsoft }
  - { name: Qualcomm, logo: qualcomm }
```

### Using the logo registry

The `logo` field references a key in `src/lib/companyLogos.ts`. Available keys:

| Key | Company | Notes |
|-----|---------|-------|
| `arm` | Arm | Scaled to 0.75 |
| `cix` | CIX | Scaled to 0.8 |
| `linaro` | Linaro | |
| `microsoft` | Microsoft | |
| `qualcomm` | Qualcomm | |

To add a new company to the registry, add an entry to the `companyLogos` map in `src/lib/companyLogos.ts`:

```ts
newcompany: {
  src: "https://static.corecollective.dev/company_logos/newcompanyLogo.svg",
  alt: "NewCompany logo",
  scale: "0.9",  // optional — adjusts visual size relative to peers
},
```

### Inline logos (no registry)

If a member's logo isn't in the registry, you can provide `src` and `alt` directly:

```yaml
members:
  - name: NewStartup
    src: https://example.com/logo.svg
    alt: NewStartup logo
    scale: "0.85"   # optional
```

When using inline `src`, the `alt` field is required (the build will fail without it).

### Field constraints

| Field | Required | Constraints |
|-------|----------|-------------|
| `name` | Yes | 1–200 characters |
| `logo` | No* | Must match a key in the registry |
| `src` | No* | Valid URL |
| `alt` | Only with `src` | 1–300 characters |
| `scale` | No | String like `"0.75"` — applied as CSS transform |

*Each member must have either `logo` or `src` (or both, where inline values override the registry).

### Behaviour

- Members render in the order listed in YAML — this is the display order on the page
- Maximum of 50 members per working group
- If no members file exists or the array is empty, the section doesn't render
- Logos are constrained to fit uniformly with `object-contain` and responsive max dimensions

---

## Working Group MDX Content

The MDX file at `src/content/working-groups/<slug>.mdx` contains the main page body. It supports standard Markdown plus Astro components:

```mdx
---
title: Windows on Arm Working Group
description: Targeting application layer support for Windows.
---

import Note from '../../components/Note.astro';

## Section heading

Content here...

<Note>
  Important callout rendered in a styled box.
</Note>
```

Don't put member lists in the MDX — use the YAML data file instead so they render as logos.

---

## Adding a New Working Group

1. Create `src/content/working-groups/<slug>.mdx` with `title` and `description` frontmatter
2. Optionally create `src/content/wg-members/<slug>.yaml` with the member entries
3. Optionally create `src/content/wg-news/<slug>.yaml` with news items
4. The page will be available at `/working-groups/<slug>/` on next build

The slug must match across all three files.

---

## Validation

All content files are validated at build time with Zod schemas. If something is wrong, the build will fail with a descriptive error message pointing to the offending field. Run `npm run build` locally to catch issues before pushing.
