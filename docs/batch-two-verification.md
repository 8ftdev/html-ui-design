# Native composition contract batch — verification

Completed 2026-09-29. The shadcn-ui class plugin now generates 27 local building blocks: 26 mapped primitives and IconButton. Ten new contracts are Alert, Badge, AspectRatio, Breadcrumb, ButtonGroup, Label, Skeleton, Spinner, Table and Textarea. No external Base UI/Radix component implementation is imported. Recipes remain local CVA/Tailwind source; all owned parts retain overrides.

## Results

- Producer `make check`: Go race tests, vet, generated TypeScript conformance and 27 native browser checks pass.
- Converter `make check`: Go race/vet, framework/compiler/consumer checks, standalone checks and 48 browser checks pass.
- Plugin `bun run check`, `build`, `test`: 114 tests pass.
- `bun run test:catalog`: all 50 real HTML → Vue → declaration-theme outputs compile and typecheck.
- `bun run test:plugins`: full local library and composed consumer typecheck with strict indexed access; invalid variant, ratio, orientation, textarea prop types and motion preset rejected.
- `bun run support:check`: generated matrix and machine report match the real plugin contracts.
- Nuxt nightly dashboard `bun run check` and `bun run build`: pass with Vue 3.6.0-rc.9 Vapor output.
- Complete dashboard development browser suite: 99 pass across Chromium, Firefox and WebKit (1.1m).
- Complete dashboard production browser suite: 105 pass across those browsers (47.5s), including the icon alignment regression.
- Mobile preview and tests: innerWidth, document clientWidth and scrollWidth all 375; table overflow stays inside its own scroll container. CSS ratio recipes, hover, theme switching and reduced motion are checked in all three browsers.
- Scoped mechanical design detector: no findings.

## Fixes discovered through tests and review

The converter now recognizes native tfoot as HTMLTableSectionElement. Text-value writes compare against the native value before assigning; redundant model echoes were suppressing native user minlength validation in Firefox/WebKit. The native regression failed before the fix and passes afterward, as do external-prop updates, reset, range sanitization and form reassociation checks.

An independent read-only review found that Alert's unconditional icon row-span created a phantom second row when description was omitted. The actual Nuxt layout regression reproduced it; the recipe now spans two rows only when description content exists. Optional decorative parts remain hidden when empty. The icon wrapper now uses a square 20px flex box with a centered 16px glyph; a regression reproduced the reported 16 × 21px inline line box before the fix and checks both title-only and full alerts.

Destructive Alert and Badge text mixes the destructive token with foreground for readable contrast. Browser tests verify at least 4.5:1 contrast against the actual host backgrounds in both themes; the original host palette failed this check before the adaptation.

Textarea checks cover minimum/maximum user input length, required validity, value models, reset, readonly validation exemption and submission, disabled FormData exclusion, labels and emitted attributes. Table checks cover caption naming, head/body/foot structure, scoped header cells, browser errors and Vue console hydration warnings. Spinner can be hidden decoratively inside a labeled Button so it does not change the accessible name.

Native platform behavior is preserved. Plain-HTML probes confirmed WebKit's macOS default Tab skips buttons and native ArrowRight does not scroll the horizontal overflow container. Tests use Option+Tab and a horizontal wheel there, ordinary Tab/ArrowRight in Chromium/Firefox, and verify keyboard focusability in every browser. No custom interaction handlers were added to override those preferences.

## Preview and boundaries

Live route: http://localhost:4322/html-ui-plugin-batch-check in the existing Korestack dashboard. The same page includes both batches. The generated library lives in apps/dashboard/app/components/html-ui-plugin-batch; the source fixture and browser tests live in this repository's tests/integration.

The support matrix is the API boundary, not a claim of upstream equivalence. Badge remains a span; Breadcrumb callers supply links/list items; Table callers supply rows/cells; ButtonGroup is a labeled group without toolbar behavior; application logic owns alerts/loading/submission. AspectRatio exposes named recipes and custom style ratios; Skeleton/Spinner use CSS reduced-motion alternatives. Existing local disclosure WAAPI is unchanged.

These changes are local and uncommitted. The preceding batch remains published on main. Dashboard integration and unrelated pre-existing dashboard/navbar work are not included in library publishing. Tests used rebuilt local producer/converter binaries, not the manually installed /usr/bin/html-ui.
