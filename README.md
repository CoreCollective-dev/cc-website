## Contributing

The instructions for contributing to the website depend on whether or not you have write access to the main repository.

### Prerequisites 

Before you begin, ensure you have Node.js and npm (Node Package Manager) installed in your local environment.

#### Check Installation
Run the following commands in your terminal:

```
node -v
npm -v
```
If a version number (e.g., v18.17.0) appears, you are ready. If not, follow the installation steps for your OS:

| Operating System | Command / Action |
| macOS | Run brew install node (requires Homebrew) |
| Ubuntu/Linux | sudo apt update && sudo apt install nodejs npm |
| Windows | Download the installer from nodejs.org |

#### Getting the Code

From your local terminal command line, set up a working directory and go to that directory.
The method for downloading the code depends on your access level to the [CoreCollective website repository](https://github.com/CoreCollective-dev/cc-website)

**If you do not have write access...**

Fork the repository to your own namespace first using the Fork button in the GitHub repo UI.
Clone your fork locally (replace YOUR-USERNAME with your GitHub handle)

```
git clone https://github.com/YOUR-USERNAME/cc-website.git
cd cc-website
```

**If you have write access...**

* Clone the main repository directly:

```
git clone https://github.com/CoreCollective-dev/cc-website.git
cd cc-website
```

* Create a new branch from main:

```
git checkout main
git pull  # Ensures your local copy is up to date
git checkout -b <new-branch-name>
```

#### Initialize and Test

Now that the code has been brought into a local repo, you'll need to initialize
if and test to make sure your config is working.

```
npm install
npm run dev
```

Open http://localhost:3000 (or the port shown in your terminal) to preview your changes.

#### Make Changes and Test Locally

Modify the files you need to update in your local working directory

Validate the results using `npm run dev` 

#### Submit Changes

You're now ready to submit the changes back the the github repository!

**If you have direct write access...**

```
git add .
git commit -m "Description of changes"
git push origin main
```

**If using the Fork method...**

```
git add .
git commit -m "Description of changes"
git push origin <your branch name>
```

#### Submit the Pull Request

Regardless of your access level, the final step happens on the GitHub website:
1 Navigate to the original repository: https://github.com/CoreCollective-dev/cc-website.
2 You will see a yellow banner at the top of the page. Click "Compare & pull request."
3 Ensure the base repository is CoreCollective-dev/cc-website and the base branch is main.
4 Click "Create pull request."

**Note:** Opening a PR will automatically trigger a test deployment. Look for a comment from a "bot" in your PR thread providing a cloudfront.net URL to preview your work live.


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
