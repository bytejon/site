# Supported-feature QA

This is a coverage checklist for the site's supported features, not a guarantee about every browser or physical device. All `demo-*` content is ignored by Git and opt-in locally. Production builds never enable `INCLUDE_DEMOS` or `INCLUDE_DRAFTS`; deployment rejects leaked fixtures, drafts, feeds/indexes, or build-time parsing assets.

| Feature | Fixtures and assertions |
| --- | --- |
| Shared header, themes, boxed Menu, unboxed Search, hidden landing headings, footer links | `site`, `theme`, `navigation`, `padding`, `pointer-feedback` tests |
| Markdown, MDX/custom components, accessible math and TeX annotations | math article, component tutorial, component project docs; `demos`, `site`, `verify-demos.mjs` |
| Genuine Luau grammar, code tabs/folding/copy/gutters, invalid and incomplete-code fallback | code-tools article and structural fixtures; `code-tools`, `code-gutter`, `verify.mjs`, `verify-folds.mjs` |
| Single/nested articles, breadcrumbs, chapter pagination, metadata order, whole native entry links/new tabs | article/tutorial series and single roots; `writing`, `reader-layout`, `article-entries`, `entry-rows` |
| Published/updated dates, lowercase display tags, quiet detail tags, restored filter variants and centered remove SVG | dated, earlier-updated, no-tags, and long-tags fixtures; `article-tags`, `filter-variants`, `draft-coverage` |
| Filter toggles/removal/clear/disabled states, additive detail links, legacy URLs, Back/Forward and scroll restoration | `writing-filters`, `enhancements`, `articles-routes`, `controls` |
| Related ranking, generic/self/child/draft exclusions and empty state | `verify-related.mjs`, `enhancements` |
| Root sibling project pages, optional bold sections, filled left triangles, real nesting, deterministic ordering/isolation and metadata errors | unsectioned project and `demo-sectioned`; `project-search`, `project-sections`, `verify-project-navigation.mjs` |
| Optional project overview/install/source/docs and absent metadata | full/minimal/no-overview projects; `enhancements`, `entry-rows` |
| Search empty/loading/results/no-results, clear/Cancel, Escape/reopen/focus, control geometry and valid index | `search-layout`, `project-search`, guarded complete search manifest |
| Heading permalink size/alignment and native anchor target | `heading-links` |
| Right-aligned outline, continuous right rail/active segment, bottom/hash/load/resize and long labels | `outline`, `outline-rail` |
| Touch swipe/release, mouse hover, hybrid pointer recovery, independent keyboard/selected states | `pointer-feedback` with Chromium touch emulation and pointer events |
| Draft/ancestor preview exclusion from RSS/sitemap/search; no optional metadata; real long labels | separate draft build; `draft-coverage`, draft-only `enhancements` case |
| Production route/link/asset/anchor/metadata checks, RSS and fixture/draft exclusions | `verify.mjs`, `verify-production.mjs`; CI runs these plus navigation/related assertions |

Run the full desktop/mobile Chromium suite against a build with `INCLUDE_DEMOS=true`, `INCLUDE_DRAFTS` unset, and `TEST_DEMOS=true`. Preview on loopback port 4321, set `BROWSER_BASE_URL=http://127.0.0.1:4321/`, then run `npm run test:browser`. Run draft coverage separately with both build flags enabled and `TEST_FEATURE_DRAFTS=true`; do not run production exclusion guards on an intentionally draft-enabled preview.

The final local preview may include labeled drafts, while the deployed build contains neither fixture nor draft routes. Local demo search/RSS/sitemap are deliberately exercised by QA; the public equivalents exclude all fixtures. Physical iOS/Android and hardware hybrid-device behavior require device testing. Firefox narrow-width checks are viewport tests, not mobile device emulation. Clipboard permissions and real touch gestures are verified in Chromium; focused Firefox checks cover layout, keyboard/navigation, and search.

Authoring roots require a publication date. Undated child pages inherit it; project dates remain optional. Negative schema/navigation assertions reject missing/invalid section declarations and conflicting nested assignments.

Validated on 2026-10-02: the main Chromium run passed 129 cases; its three remaining assertions passed after correcting header/menu scoping, resize setup, and short-document outline expectations. That covers 132 normal-build cases. Six separate draft cases passed, and 12 focused Firefox cases passed across desktop and narrow widths. Two capability-specific Chromium cases run only in their applicable project: touch gestures on mobile and fine-pointer hybrid recovery on desktop. Type checking reported zero errors/warnings and two existing deprecated clipboard API hints. Structural navigation, related-entry ranking, Luau folding/highlighting, link/asset checks, and production exclusion guards passed.

Outline anchor alignment is checked with sufficient page height. On a short document, multiple anchors may reach the same maximum scroll position; the final section is intentionally active at the bottom. Screenshots cover both color themes and 1440px/390px viewports. This evidence does not substitute for physical-device or assistive-technology testing.
