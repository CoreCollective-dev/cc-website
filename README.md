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
