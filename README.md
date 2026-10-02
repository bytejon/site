# Jon's website

Astro + Starlight, deployed at https://jonbyte.com/ from the private `bytejon/site` repository. The website is public.

## Run and verify

Use Node.js 24 and npm: `npm ci`, `npm run dev`. Check a production build with `npm run check`, `npm run build`, `npm run verify`.

Development includes drafts. Production excludes draft routes, lists, RSS, sitemap, and search content. Never set `INCLUDE_DRAFTS` in deployment.

## Articles: Markdown first

Articles live at `/articles/`. Existing `/writing/` listing and nested entry links redirect to the matching Articles route, preserving filters and anchors in JavaScript-enabled browsers. Content files stay in `src/content/writing/`; the collection name does not change.

Add `src/content/writing/my-entry.md` to create `/articles/my-entry/`:

```md
---
title: Your title
description: A short summary.
date: 2026-10-01
tags: [article, luau, programming]
draft: true
toc: false
---

Your writing starts here.
```

Use `tags` for everything, for example `[article, luau]` or `[tutorial, tools]`; no separate type is required. Article and Tutorial display first when present. Tags are trimmed, lowercased, and deduplicated. Existing `type: article` or `type: tutorial` is accepted and normalized into the same tags array. Optional subpages depend on `parent` and `order`, independently of tags.

A quiet Filters button reveals multi-select tag chips. Entries match any selected tag. Active tags can be removed individually; All tags and Clear all clear the selection. Links use repeated parameters such as `?tag=luau&tag=math`. Older `type`/`topic` URL values are accepted as tags with the same match-any semantics; changing filters writes the unified URL. Reload and browser Back/Forward preserve selection. Roots require a date and sort newest first; dates display in UTC. Set `draft: false` to publish; omitted draft defaults to true. RSS includes published roots only. Level-two and level-three headings automatically create an on-this-page outline; the older `toc` field remains accepted.

### Updated dates and related articles

For a material revision, optionally add `updated: 2026-10-02` alongside the original `date`. The site shows Updated separately only when it is later than publication. Builds never create or change these dates. Chapter pages may supply their own updated date; otherwise they use the root's date.

Article tags are clickable links to the matching filter. Related articles show up to three published roots ranked by shared tags, ignoring Article/Tutorial as matching signals; self, drafts, and child chapters are excluded. Nothing appears without a useful shared tag. Labeled demo candidates are allowed only in the explicitly enabled local demo build; production excludes them.

Returning from an article through Back to articles or its Articles breadcrumb restores the list URL and scroll position from that navigation. Browser Back/Forward keeps filters. A small session-only snapshot expires after 30 minutes; direct tag links, intentional list navigation, and anchors take precedence. Storage is optional; links still work if it is unavailable.

### Optional child pages for any entry

Add `src/content/writing/my-entry/first-chapter.md`:

```md
---
title: First chapter
description: A short summary.
parent: my-entry
order: 1
draft: true
---

Chapter content.
```

Use the parent's collection ID (filename without extension); folders alone do not imply hierarchy. Nested children can use `parent: my-entry/first-chapter`. Visible descendants add a chapter sidebar and previous/next links in depth-first order. Single pages retain the clean reading view, regardless of type. Children inherit root type, topics, and date in the interface. Publish each page explicitly; draft ancestors keep descendants out of production. Missing parents or cycles fail the build. Only roots appear in lists/RSS; children are searchable and appear in sitemap.

Copy examples from `examples/writing/` to try single entries and nested entries, with any tags. These clearly marked authoring demos stay outside published content. `authoring-example.mdx` remains a draft demonstration, not Jon's writing.

### MDX components and Luau

Use `.mdx` and import a component (for a file directly in `src/content/writing`):

```mdx
import Note from '../../components/Note.astro';

<Note title="A useful detail">Component content goes here.</Note>
```

Nested files need another `../` per directory. Add reusable components in `src/components/`.

````md
```luau title="example.luau"
export type Point = { x: number }
local point: Point = { x = 1 }
print(`Point: {point.x}`)
```
````

Articles and Starlight projects share Expressive Code's theme-aware syntax colors, copy buttons, and keyboard-accessible overflowing code blocks. `vendor/luau/` contains the pinned MIT-licensed dedicated `source.luau` grammar from JohnnyMorganz/Luau.tmLanguage. Luau is not aliased to Lua; verification checks Luau-specific token scopes.

## Projects

Project docs remain in `src/content/docs/projects/`, with Starlight nested navigation, search, and on-this-page navigation. Copy `examples/projects/example-project/` there and replace its text. `sidebar: { order: 1 }` sets order. Project root frontmatter can optionally include `tags: [luau, tools]` and `date: 2026-10-02`; omit them when they do not apply. Article and project entries show a full-width wrapping title, followed by tags, description, and the date at the bottom. Article and Tutorial tags appear first; repeated tags are omitted from display without changing frontmatter or filters. Keep unpublished docs outside `src/content/docs`; sidebar hiding is not privacy.

Project roots may optionally set `overview` frontmatter. Its `summary` explains what the project does (otherwise the existing description is used); `installation` is your actual command, `source` is your real HTTP(S) repository URL, and `docs` is an existing site path or HTTP(S) URL. Every field is optional, and no overview appears without author-provided metadata. Source and external docs links open in a new tab. Installation commands are displayed for copying, never executed.

```yaml
overview:
  summary: A short explanation of your project.
  # installation: your actual installation command
  # source: your actual repository URL
  # docs: an existing documentation URL or /site/path/
```

## Navigation and appearance

Navigation is Articles, Projects, About. Home/About are editable in `src/pages/`. About contains the six requested accounts; Discord is text. The supplied transparent vector logo is in `public/logo.svg` and `public/favicon.svg`.

Theme uses the shared `ChoicePicker.astro` popover with selected checkmarks, arrow-key navigation, visible focus, Escape, Tab, and outside-click dismissal. Theme remains icon-only with Auto, Dark, Light in that order. Auto follows the OS by default; explicit preferences persist across all layouts/reloads via `starlight-theme`. The provider runs before CSS. Shared tokens supply warm light, subtle cool dark, and blue accents. Mobile menus support keyboard and Escape. Headers use one fixed, centered 896px maximum width and consistent responsive gutters on every page. The Projects landing page uses the same layout as Articles and About, rendering the existing `src/content/docs/projects/index.md`; project entries link into nested Starlight documentation. Chapter/project content keeps its wider grids. Header height, background, typography, border, navigation and theme positions are shared; nested project search lives in the sidebar and retains its keyboard shortcut. Semibold navigation uses a blue active rectangle with white text and visible focus. Hover transitions respect reduced motion. Shared 4/8/12/16/20/24px spacing tokens set component interiors; controls and sidebar links have at least 44px hit areas. Lists and profile rows have 16px horizontal padding, filters 12px, and callouts/code 16px vertical and 20px horizontal padding.

`/blog/` redirects to `/articles/`; existing blog entry/tag routes redirect to Articles; `/tutorials/` redirects to Writing filtered to Tutorials. GitHub Pages uses static HTML refresh redirects with destination links, not HTTP 301s. There were no published articles or individual tutorials to migrate. The retired neutral Tutorials starter is preserved in `examples/tutorials/index.md`. RSS, canonicals, Pagefind search, and `/sitemap.xml` use Articles routes.

## Browser checks

### Local feature demonstrations (not published)

The `demo-*` article files and `src/content/docs/projects/demo-project/` are clearly labeled test material, not Jon's articles or a real released project. Five root entries cover a single-page article, single-page MDX tutorial, chapter-based article and tutorial, and multi-file code tabs with Luau scope folding. Five project pages cover nested docs, Markdown callouts, MDX/custom components, Starlight tabs, API tables, and math. Three draft sentinels check direct drafts and a child of a draft parent. Demo filenames and directories use the reserved `demo-` prefix and are ignored by Git. The content loaders exclude them from every default build, including development. Set `INCLUDE_DEMOS=true` explicitly for local inspection. GitHub Actions never sets this flag and runs `verify:production` to reject leaked demo routes/content in HTML, assets, RSS, or sitemaps.

Build and start the local preview from this repository:

```powershell
$env:INCLUDE_DEMOS='true'
node node_modules/astro/bin/astro.mjs build
node node_modules/astro/bin/astro.mjs preview --host 127.0.0.1 --port 4321
```

Open `http://127.0.0.1:4321/articles/` or `http://127.0.0.1:4321/projects/demo-project/`. Preview serves the latest build; rebuild after editing files. For edits with live refresh, `node node_modules/astro/bin/astro.mjs dev --host 127.0.0.1 --port 4321` can be used instead, but dev deliberately includes drafts and does not represent production search/RSS/draft exclusions.

Math works in both `.md` and `.mdx`, in Articles and project docs. Write `$a^2+b^2=c^2$` for inline math, or put `$$` on separate lines around a display equation:

```text
$$
\frac{1}{n}\sum_{i=1}^{n}x_i = \bar{x}
$$
```

Matrices use `\begin{bmatrix}1 & 2 \\ 3 & 4\end{bmatrix}`. KaTeX renders HTML and accessible MathML with the original TeX annotation at build time; it is not a complete LaTeX document compiler. The math demo shows fractions, matrices, aligned equations, integrals, sums and a deliberately wide equation. Math inherits the current text color, and wide display equations scroll inside their own container. Literal currency dollar signs can be escaped as `\$`. Raw TeX HTML/trusted commands are disabled.

Run `node scripts/verify.mjs` and `node scripts/verify-demos.mjs` after an `INCLUDE_DEMOS=true` build. With the preview running, set `$env:TEST_DEMOS='true'` and run `node node_modules/@playwright/test/cli.js test tests/demos.spec.ts --workers 2`. These checks cover math/MathML, both themes, responsive overflow, actual clipboard copying, outlines/anchors, tables/tasks/footnotes, chapter ordering and previous/next, composed filters/reload, dates/RSS, project tabs/search, and draft exclusion. Do not enable `INCLUDE_DRAFTS` for these production-policy checks.

To remove all new test content, delete only the `demo-*` files/directories in `src/content/writing/` and the `src/content/docs/projects/demo-project/` directory, then rebuild. Keep `src/content/docs/projects/index.md`, your own content, and the existing optional `authoring-example.mdx`. The math configuration and packages can remain available for real content. Remove or disable the demo-only checks after deleting their source content.

Install Chromium with `npx playwright install chromium`, start `npm run preview`, then `npm run test:browser`. `BROWSER_BASE_URL` selects preview/live URL. Tests cover desktop/mobile navigation, filters, themes, About, and redirects. For local authoring verification temporarily copy examples into content, build with `INCLUDE_DRAFTS=true`, and test with `TEST_AUTHORING=true`. Remove fixtures and rebuild normally before publishing.

## Deploy

Commit and push to `main` in `bytejon/site`. `.github/workflows/deploy.yml` installs the locked dependencies, checks types, builds, verifies the output, and deploys the `dist/` artifact through GitHub Pages. Repository Settings â†’ Pages â†’ Source must be **GitHub Actions**. Each push replaces the public build. GitHub Actions logs show deployment status. To roll back, revert the commit and push.

Do not set `INCLUDE_DRAFTS` or `INCLUDE_DEMOS` in the deployment workflow. Clear both flags before building production locally. Run `npm run verify:production` as well as `npm run verify`. For a temporary local verification build only, `INCLUDE_DRAFTS=true npm run build` enables the draft routes; `npm run verify` rejects them under normal production settings.

### Custom-domain setup

As inspected before migration on 2026-10-01, `bytejon/website` owned `www.jonbyte.com`. Its source must remain intact. The new build is configured for `https://jonbyte.com` with root base `/`. GitHub Pages settings and DNS must agree with this configuration.

1. Preserve the old repository. During the coordinated switch, transfer its Pages custom-domain binding to the new repository; disable its `Deploy VitePress site to Pages` workflow and unpublish only the old Pages deployment. Do not delete its source.
2. Configure `jonbyte.com` in `bytejon/site` Settings â†’ Pages. GitHub Actions deployment requires the Pages setting; a CNAME file alone is insufficient. If GitHub requires a separate domain-ownership verification, obtain the account owner's confirmation before adding a verification record.
3. At the DNS provider, update **only** `www` CNAME from `jonbyte2.github.io` to `bytejon.github.io`. The apex A records already match GitHub Pages: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Preserve the existing nameservers, MX, SPF, and all other mail/verification records. No nameserver change is needed. The observed TTL is 14400 seconds (4 hours).
4. Wait for GitHub's DNS check and certificate issuance, enforce HTTPS, and verify both `https://jonbyte.com` and `https://www.jonbyte.com`, redirects, assets, and RSS before considering the migration complete.

Migration performed on 2026-10-01: `jonbyte.com` is associated with `bytejon/site`, the user updated Squarespace's `www` CNAME to `bytejon.github.io`, and GitHub approved a certificate for both domain names. HTTPS enforcement is enabled. The old `bytejon/website` Pages deployment is unpublished and its deployment workflow is disabled; its source is unchanged. Verify both names after any future DNS change. Draft/demo examples are excluded from the public production build.

## Verification

`npm run verify` inspects built pages for broken internal links/assets and draft leaks and verifies Luau-specific grammar scopes. Browser checks use Playwright on desktop and mobile, including the nested templates temporarily copied into content for verification and removed afterward. Install Chromium with `npx playwright install chromium`, run a local preview, and run `npm run test:browser`. Browser tests use the `BROWSER_BASE_URL` environment variable if a different preview/live URL is needed.

Framework references: [Astro Pages deployment](https://docs.astro.build/en/guides/deploy/github/), [Starlight Markdown/MDX authoring](https://starlight.astro.build/guides/authoring-content/), [nested navigation](https://starlight.astro.build/guides/sidebar/).

## Code controls and reading navigation

Code blocks share neutral light and near-black dark surfaces with blue/purple/green tokens and soft orange/pink accents. Original line numbers stay visible after folding. Copy always copies the complete original source, including folded lines; its icon briefly becomes a checkmark, with a polite screen-reader announcement and no toolbar movement. A failed copy announces the error and leaves manual selection available.

Luau folding uses the vendored MIT-licensed Tree-sitter Luau grammar at build time, never keyword guessing. Nested function, conditional, loop, and table scopes retain independent state. Code rows use compact 1.55 line spacing; toolbars retain only filename/language and the fixed-size copy control. Strings and comments do not create folds. Invalid/incomplete code, blocks over 100 KB, and other languages receive no fold controls; highlighting, line numbers, and copy still work. A single opening line has at most one fold control. No parser/WASM or editable code editor is shipped to browsers.

For multi-file examples in MDX, import `Tabs` and `TabItem` from `@astrojs/starlight/components`, put one titled fenced code block in each `TabItem`, and use filenames as labels. The code-only tab set shares one restrained toolbar with a visible in-border active underline; mixed code/prose and nested tab groups keep their own scoped layouts. Examples remain in the local `demo-code-tools.mdx` fixture.

Article entries generate a right-side heading outline for both Articles and Tutorials, with active-heading tracking and fixed-header anchor offsets. On narrow screens it becomes an expandable On this page section. Single-page entries omit the left chapter navigation. Chapter entries may set `navTitle` for a short sidebar/breadcrumb label while keeping the full article title. Project documentation separates breadcrumb ancestry from contextual sibling groups; `sidebar.label` gives a readable page label and `sidebar.order` sets order.
