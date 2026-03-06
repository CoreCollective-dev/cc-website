## Contributing

The instructions for contributing to the website depend on whether or not you have write access to the main repository.

### If you have write access ...

Create a new branch from `main`:

* `git checkout main`
* `git pull` (to ensure your copy is up to date)
* `git checkout -b <new branch name>`

### If you do not have write access ...

Fork the repository to your own namespace

### In both cases ...

When you have made your changes and tested them with `npm run dev`, push them back to GitHub and raise a pull request against the `main` branch. This will trigger the deployment of a test version under a cloudfront.net URL.

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

## Updating blogs

New blogs should be added as `.mdx` files to `src/content/blogs` folder.
The current schema requires a `title`, `date`, `image` and `author`, along with the content.
