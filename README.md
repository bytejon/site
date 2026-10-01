# Jon's website

Astro + Starlight. The source repository is private; the deployed website is public.

Live: https://bytejon.github.io/site/

## Run locally

Install Node.js 24 and npm, then:

```sh
npm ci
npm run dev
```

Open the URL printed by Astro (normally `http://localhost:4321/site/`). Draft blog posts appear only in development. A production build excludes them from routes, home/blog lists, tags, and RSS.

```sh
npm run check
npm run build
npm run verify
```

## Write a blog post

Add `src/content/blog/my-post.md`. Its filename becomes `/site/blog/my-post/`.

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

Use `draft: false` when ready to publish. Missing `draft` defaults to **true**. Dates are displayed in UTC and posts are sorted newest first. Prefer lowercase, URL-friendly tags. Published tags get index pages automatically. RSS is at `/site/rss.xml` and always excludes drafts.

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

Each file needs at least `title` in its frontmatter. Add `description` for search results and `sidebar: { order: 1 }` to set chapter order. Use `.mdx` for custom components here too. Nested links should be relative, e.g. `./first-chapter/` from a guide's index. All absolute internal links must include the configured base (`/site/` on GitHub Pages).

Copy the starter folders from `examples/tutorials/` or `examples/projects/` into the corresponding published content folder, then replace their text before committing. Examples stay outside published content by default. For unpublished docs, keep them in `examples/` or another directory outside `src/content/docs/`; hiding a sidebar entry does not make a page private. Starlight also ignores filenames beginning with `_` (rename them to publish).

Edit the home page in `src/pages/index.astro` and your bio in `src/pages/about.astro`. Styling is in `src/styles/site.css`. No invented articles or project descriptions are published in this starter.

## Deploy

Commit and push to `main` in `bytejon/site`. `.github/workflows/deploy.yml` installs the locked dependencies, checks types, builds, verifies the output, and deploys the `dist/` artifact through GitHub Pages. Repository Settings → Pages → Source must be **GitHub Actions**. Each push replaces the public build. GitHub Actions logs show deployment status. To roll back, revert the commit and push.

Do not set `INCLUDE_DRAFTS` in the deployment workflow. For a temporary local verification build only, `INCLUDE_DRAFTS=true npm run build` enables the draft routes; `npm run verify` rejects them under normal production settings.

### Custom-domain migration: pending

As inspected on 2026-10-01, the existing `bytejon/website` Pages site owns `www.jonbyte.com`; its source must remain intact. This starter is deployed independently at the GitHub URL until migration is confirmed.

1. Preserve the old repository; disable only its Pages deployment when ready to switch. Remove its Pages custom-domain binding as part of the coordinated switch. Do not delete its source.
2. Configure the desired custom domain in `bytejon/site` Settings → Pages. Verification/security changes require the account owner's confirmation. For a `jonbyte.com` canonical site, change `site` to `https://jonbyte.com` and `base` to `/` in `astro.config.mjs`, commit, and deploy. GitHub Actions deployment requires the Pages setting; a CNAME file alone is insufficient.
3. At the DNS provider, update **only** `www` CNAME from `jonbyte2.github.io` to `bytejon.github.io`. The apex A records already match GitHub Pages: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Preserve the existing nameservers, MX, SPF, and all other mail/verification records. No nameserver change is needed. The observed TTL is 14400 seconds (4 hours).
4. Wait for GitHub's DNS check and certificate issuance, enforce HTTPS, and verify both `https://jonbyte.com` and `https://www.jonbyte.com`, redirects, assets, and RSS before considering the migration complete.

The deployment at the GitHub URL does not alter DNS or the old site. The public draft/demo examples must never be mistaken for finished writing.

## Verification

`npm run verify` inspects built pages for broken internal links/assets and draft leaks and verifies Luau-specific grammar scopes. Browser checks use Playwright on desktop and mobile, including the nested templates temporarily copied into content for verification and removed afterward. Install Chromium with `npx playwright install chromium`, run a local preview, and run `npm run test:browser`. Browser tests use the `BROWSER_BASE_URL` environment variable if a different preview/live URL is needed.

Framework references: [Astro Pages deployment](https://docs.astro.build/en/guides/deploy/github/), [Starlight Markdown/MDX authoring](https://starlight.astro.build/guides/authoring-content/), [nested navigation](https://starlight.astro.build/guides/sidebar/).
