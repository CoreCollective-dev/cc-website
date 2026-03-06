## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

```bash
npx sst deploy --stage production
```

## Keeping branches in sync

Whenever you finish a feature and merge it into main, your staging branch will technically be "behind." To sync it back up so staging always matches production before you start the next task:

```bash
git checkout staging
git pull origin main
git push origin staging
```

## Updating Member logos

Logo images can be added to the CoreCollective S3 bucket: static-core-collective/company_logos.
Copy the asset url and update the base url to "https://static.corecollective.dev"
Add the url in alphabetical order to the `src/content/logos/company.yaml` list with an `alt` field.

### Adjusting logo sizing in the carousel

The carousel displays all logos in a fixed bounding box (12rem x 3.5rem on desktop). Logos with
different SVG viewBox dimensions will appear at different visual sizes. The optional `scale` field
applies a CSS `transform: scale()` to adjust a logo's visual weight within its bounding box.

**When to use `scale`:**
- If a new logo appears too large compared to others, add `scale: "0.8"` (or lower) to shrink it
- If a logo appears too small (e.g. the SVG has lots of internal whitespace), add a scale above 1.0
- Check the logo at both desktop and mobile widths after adjusting

**How to determine the right value:**
1. Run `npm run dev` and compare the new logo visually against its neighbours in the carousel
2. Start with small adjustments (e.g. 0.8 or 1.2) and refine from there
3. SVGs with a tall aspect ratio (close to square) tend to appear large and need scale < 1.0
4. SVGs with excessive internal padding/whitespace need scale > 1.0

**Current scale values for reference:**
| Logo | Scale | Reason |
|------|-------|--------|
| AMD | 0.8 | SVG fills height aggressively |
| Arm | 0.75 | Large viewBox, appears oversized at 1.0 |
| CIX | 0.8 | Wide logo that dominates visually |
| Google | 0.8 | Fills height aggressively |
| Huawei | 2.8 | SVG has significant internal whitespace |

**Ideal solution:** For best results, ask your web developer to normalise the SVG file itself
(trim whitespace from the viewBox, ensure artwork fills a consistent proportion of the canvas).
This reduces the need for per-logo scale overrides.

## Updating FAQ content

FAQ entries are stored in `src/content/faq/faq.yaml`. Each entry has a `question` and an `answer` field.

### Simple answers

For short, plain-text answers:

```yaml
- question: "What is CoreCollective?"
  answer: "CoreCollective provides a neutral platform for collaboration in the Arm ecosystem."
```

### Rich answers with HTML

For answers that need bullet lists, links, email addresses, or multiple paragraphs, use the YAML `>` folded block scalar and write HTML:

```yaml
- question: "What is the process for requesting a new Working Group?"
  answer: >
    <p>CoreCollective is always open to proposals. The process involves:</p>
    <ul>
      <li>Submit a proposal to the TAC</li>
      <li>Present to the TAC for approval</li>
    </ul>
    <p>Contact <a href="mailto:info@corecollective.dev">info@corecollective.dev</a> for details.</p>
```

**Supported HTML tags:** `<p>`, `<ul>`, `<ol>`, `<li>`, `<a href="...">`, `<strong>`, `<em>`

**Tips:**
- Always wrap paragraphs in `<p>` tags when using multiple paragraphs
- Use `<a href="mailto:...">` for email addresses
- Links are automatically styled in cyan; lists and paragraphs are styled via Tailwind Typography
- Preview changes locally with `npm run dev` before deploying

## Updating blogs

New blogs should be added as `.mdx` files to `src/content/blogs` folder.
The current schema requires a `title`, `date`, `image` and `author`, along with the content.

## Deployment

Merges into the `staging` branch will automatically be deployed to Cloudfront with a default url.
Merges into the `main` branch will automatically be deployed into the `production` stage and the "corecollective.dev" url.
