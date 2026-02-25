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
Add the url in alphabetical order to the company.yaml list with a `alt` field also.
If the logo appears larger or small add a `scale` field also to adjust accordingly.

## Updating blogs

New blogs should be added as `.mdx` files to `src/content/blogs` folder.
The current schema requires a `title`, `date`, `image` and `author`, along with the content.

## Deployment

Merges into the `staging` branch will automatically be deployed to Cloudfront with a default url.
Merges into the `main` branch will automatically be deployed into the `production` stage and the "corecollective.dev" url.
