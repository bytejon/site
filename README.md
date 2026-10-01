# Jon's website

Astro + Starlight. The source repository is private; the deployed website is public.

Canonical site: https://jonbyte.com/

Initial deployment was verified at https://bytejon.github.io/site/ before the custom-domain migration. Once the domain is associated, GitHub redirects that URL to the custom domain.

## Run locally

Install Node.js 24 and npm, then:

```sh
npm ci
npm run dev
```

Open the URL printed by Astro (normally `http://localhost:4321/`). Draft blog posts appear only in development. A production build excludes them from routes, home/blog lists, tags, and RSS.

```sh
npm run check
npm run build
npm run verify
```

## Write a blog post

Add `src/content/blog/my-post.md`. Its filename becomes `/blog/my-post/`.

```md
---
title: Your title
description: A short summary.
date: 2026-10-01
tags: [luau, programming]
draft: true
---

Your writing starts here.
```

Use `draft: false` when ready to publish. Missing `draft` defaults to **true**. Dates are displayed in UTC and posts are sorted newest first. Prefer lowercase, URL-friendly tags. Published tags get index pages automatically. RSS is at `/rss.xml` and always excludes drafts.

The included `authoring-example.mdx` is an unpublished feature demonstration, not an article attributed to Jon. Keep it as a reference or delete it.

### Custom components with MDX

Use `.mdx` instead of `.md`, then import an Astro component. For a file directly under `src/content/blog/`:

```mdx
import Note from '../../components/Note.astro';

<Note title="A useful detail">
  Component content goes here.
</Note>
```

Add reusable components under `src/components/`. Imports are relative to the content file; nested files need another `../` for each folder. Ordinary Markdown needs no imports or JavaScript.

### Luau code blocks

Use a fenced block with language **luau**:

````md
```luau title="example.luau"
export type Point = { x: number, y: number }
local point: Point = { x = 1, y = 2 }
print(`Point: {point.x}, {point.y}`)
```
````

Blog, MDX, and Starlight docs all share Expressive Code: syntax colors, copy buttons, keyboard-accessible horizontal scrolling, filenames, and line markers. A dedicated pinned `source.luau` TextMate grammar from JohnnyMorganz/Luau.tmLanguage is included under `vendor/luau/` with its MIT license. Luau is **not** mapped to Lua. `npm run verify` checks Luau-specific token scopes as well as links and draft exclusion.

## Tutorials and project documentation

Published docs live under `src/content/docs/`. Starlight automatically creates nested sidebar groups from the folders:

```text
src/content/docs/
  tutorials/
    index.md
    my-guide/
      index.md
      first-chapter.md
      second-chapter.md
  projects/
    index.md
    my-project/
      index.md
      reference/
        api.md
```

Each file needs at least `title` in its frontmatter. Add `description` for search results and `sidebar: { order: 1 }` to set chapter order. Use `.mdx` for custom components here too. Nested links should be relative, e.g. `./first-chapter/` from a guide's index. The custom-domain deployment uses base `/`; internal absolute links can start with `/blog/`, `/tutorials/`, or `/projects/`.

Copy the starter folders from `examples/tutorials/` or `examples/projects/` into the corresponding published content folder, then replace their text before committing. Examples stay outside published content by default. For unpublished docs, keep them in `examples/` or another directory outside `src/content/docs/`; hiding a sidebar entry does not make a page private. Starlight also ignores filenames beginning with `_` (rename them to publish).

Edit the home page in `src/pages/index.astro` and your bio in `src/pages/about.astro`. Styling is in `src/styles/site.css`. No invented articles or project descriptions are published in this starter.

## Shared appearance and navigation

Every section uses the same Light/Dark/Auto preference in `starlight-theme` local storage. Auto follows the operating system. The theme provider runs before page styling, preventing a light-theme flash on reload. Warm tan light colors and near-black dark colors with a subtle cool undertone, readable type, borders, focus states, code, and callouts share the tokens in `src/styles/site.css`. Expressive Code follows `data-theme`, including explicit preferences that differ from the OS.

`src/components/ThemeSelect.astro` serves both layout families. Narrow screens use native popover hamburger menus with keyboard/Escape support and synchronized `aria-expanded`; docs retain nested sidebar navigation. Topbars and mobile menus contain no GitHub link. Footer and relevant project source links remain available. Tabler's official `@tabler/icons-astro` package supplies the inline SVG icons, with `currentColor` styling and decorative accessibility attributes.

The supplied three-color logo was recreated as a clean vector in `public/logo.svg` and reused as `public/favicon.svg`. Its background is transparent. The original input remains unchanged in Library; the website publishes only the selected vector artwork.

## Deploy

Commit and push to `main` in `bytejon/site`. `.github/workflows/deploy.yml` installs the locked dependencies, checks types, builds, verifies the output, and deploys the `dist/` artifact through GitHub Pages. Repository Settings → Pages → Source must be **GitHub Actions**. Each push replaces the public build. GitHub Actions logs show deployment status. To roll back, revert the commit and push.

Do not set `INCLUDE_DRAFTS` in the deployment workflow. For a temporary local verification build only, `INCLUDE_DRAFTS=true npm run build` enables the draft routes; `npm run verify` rejects them under normal production settings.

### Custom-domain setup

As inspected before migration on 2026-10-01, `bytejon/website` owned `www.jonbyte.com`. Its source must remain intact. The new build is configured for `https://jonbyte.com` with root base `/`. GitHub Pages settings and DNS must agree with this configuration.

1. Preserve the old repository. During the coordinated switch, transfer its Pages custom-domain binding to the new repository; disable its `Deploy VitePress site to Pages` workflow and unpublish only the old Pages deployment. Do not delete its source.
2. Configure `jonbyte.com` in `bytejon/site` Settings → Pages. GitHub Actions deployment requires the Pages setting; a CNAME file alone is insufficient. If GitHub requires a separate domain-ownership verification, obtain the account owner's confirmation before adding a verification record.
3. At the DNS provider, update **only** `www` CNAME from `jonbyte2.github.io` to `bytejon.github.io`. The apex A records already match GitHub Pages: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Preserve the existing nameservers, MX, SPF, and all other mail/verification records. No nameserver change is needed. The observed TTL is 14400 seconds (4 hours).
4. Wait for GitHub's DNS check and certificate issuance, enforce HTTPS, and verify both `https://jonbyte.com` and `https://www.jonbyte.com`, redirects, assets, and RSS before considering the migration complete.

Migration performed on 2026-10-01: `jonbyte.com` is associated with `bytejon/site`, the user updated Squarespace's `www` CNAME to `bytejon.github.io`, and GitHub approved a certificate for both domain names. HTTPS enforcement is enabled. The old `bytejon/website` Pages deployment is unpublished and its deployment workflow is disabled; its source is unchanged. Verify both names after any future DNS change. Draft/demo examples are excluded from the public production build.

## Verification

`npm run verify` inspects built pages for broken internal links/assets and draft leaks and verifies Luau-specific grammar scopes. Browser checks use Playwright on desktop and mobile, including the nested templates temporarily copied into content for verification and removed afterward. Install Chromium with `npx playwright install chromium`, run a local preview, and run `npm run test:browser`. Browser tests use the `BROWSER_BASE_URL` environment variable if a different preview/live URL is needed.

Framework references: [Astro Pages deployment](https://docs.astro.build/en/guides/deploy/github/), [Starlight Markdown/MDX authoring](https://starlight.astro.build/guides/authoring-content/), [nested navigation](https://starlight.astro.build/guides/sidebar/).
