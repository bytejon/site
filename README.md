# Jon's website

Astro + Starlight, deployed at https://jonbyte.com/ from the private `bytejon/site` repository. The website is public.

## Run and verify

Use Node.js 24 and npm: `npm ci`, `npm run dev`. Check a production build with `npm run check`, `npm run build`, `npm run verify`.

Development includes drafts. Production excludes draft routes, lists, RSS, sitemap, and search content. Never set `INCLUDE_DRAFTS` in deployment.

## Writing: Markdown first

Add `src/content/writing/my-entry.md` to create `/writing/my-entry/`:

```md
---
title: Your title
description: A short summary.
type: article
date: 2026-10-01
tags: [luau, programming]
draft: true
toc: false
---

Your writing starts here.
```

`type` is `article` or `tutorial`; it is separate from topic `tags` and does not select a different layout. Roots require a date. Writing filters by type and topic with shareable URL parameters. Dates display in UTC; roots sort newest first. Set `draft: false` to publish; omitted `draft` defaults to true. RSS includes published roots only. `toc: true` adds an on-this-page outline.

### Optional child pages for either type

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

Copy examples from `examples/writing/` to try single Articles/Tutorials and nested entries of either type. These clearly marked authoring demos stay outside published content. `authoring-example.mdx` remains a draft demonstration, not Jon's writing.

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

Writing and Starlight projects share Expressive Code's theme-aware syntax colors, copy buttons, and keyboard-accessible overflowing code blocks. `vendor/luau/` contains the pinned MIT-licensed dedicated `source.luau` grammar from JohnnyMorganz/Luau.tmLanguage. Luau is not aliased to Lua; verification checks Luau-specific token scopes.

## Projects

Project docs remain in `src/content/docs/projects/`, with Starlight nested navigation, search, and on-this-page navigation. Copy `examples/projects/example-project/` there and replace its text. `sidebar: { order: 1 }` sets order. Keep unpublished docs outside `src/content/docs`; sidebar hiding is not privacy.

## Navigation and appearance

Navigation is Writing, Projects, About. Home/About are editable in `src/pages/`. About contains the six requested accounts; Discord is text. The supplied transparent vector logo is in `public/logo.svg` and `public/favicon.svg`.

Theme and Writing filters use the shared `ChoicePicker.astro` popover with selected checkmarks, arrow-key navigation, visible focus, Escape, Tab, and outside-click dismissal. Theme remains icon-only with Auto, Dark, Light in that order. Auto follows the OS by default; explicit preferences persist across all layouts/reloads via `starlight-theme`. The provider runs before CSS. Shared tokens supply warm light, subtle cool dark, and blue accents. Mobile menus support keyboard and Escape. Headers use one fixed, centered 896px maximum width and consistent responsive gutters on every page. The Projects landing page uses the same layout as Writing and About, rendering the existing `src/content/docs/projects/index.md`; project entries link into nested Starlight documentation. Chapter/project content keeps its wider grids. Header height, background, typography, border, navigation and theme positions are shared; nested project search lives in the sidebar and retains its keyboard shortcut. Semibold navigation uses a blue active rectangle with white text and visible focus. Hover transitions respect reduced motion. Shared 4/8/12/16/20/24px spacing tokens set component interiors; controls and sidebar links have at least 44px hit areas. Lists and profile rows have 16px horizontal padding, filters 12px, and callouts/code 16px vertical and 20px horizontal padding.

`/blog/` redirects to `/writing/`; existing blog entry/tag routes redirect to Writing; `/tutorials/` redirects to Writing filtered to Tutorials. GitHub Pages uses static HTML refresh redirects with destination links, not HTTP 301s. There were no published articles or individual tutorials to migrate. The retired neutral Tutorials starter is preserved in `examples/tutorials/index.md`. RSS, canonicals, Pagefind search, and `/sitemap.xml` use Writing routes.

## Browser checks

Install Chromium with `npx playwright install chromium`, start `npm run preview`, then `npm run test:browser`. `BROWSER_BASE_URL` selects preview/live URL. Tests cover desktop/mobile navigation, filters, themes, About, and redirects. For local authoring verification temporarily copy examples into content, build with `INCLUDE_DRAFTS=true`, and test with `TEST_AUTHORING=true`. Remove fixtures and rebuild normally before publishing.

## Deploy

Commit and push to `main` in `bytejon/site`. `.github/workflows/deploy.yml` installs the locked dependencies, checks types, builds, verifies the output, and deploys the `dist/` artifact through GitHub Pages. Repository Settings â†’ Pages â†’ Source must be **GitHub Actions**. Each push replaces the public build. GitHub Actions logs show deployment status. To roll back, revert the commit and push.

Do not set `INCLUDE_DRAFTS` in the deployment workflow. For a temporary local verification build only, `INCLUDE_DRAFTS=true npm run build` enables the draft routes; `npm run verify` rejects them under normal production settings.

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
