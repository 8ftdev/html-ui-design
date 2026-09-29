# Verification

The catalog script builds the actual producer and Vue converter, pipes all 37 contracts through the built Node CLI, compiles scripts/templates/scoped CSS, and performs strict Vue type-checking. Unit tests cover malformed metadata, type disagreement, theme dependencies, override operations, native selectors, repeat transforms, and clean CLI streams.

The dashboard fixture generator imports all 37 primitives and three override variants into a Vapor page at `/html-ui-contract-check`. Production Playwright tests cover server rendering, hydration/event forwarding, slots/models, nested native disclosures, unavailable controls, keyboard focus, validation, checked state, light/dark token changes, and isolated override operations.

The real dashboard initially passed check/build but had no browser tests. Its first generated integration run passed server/hydration cases and exposed a stylesheet conflict: UnoCSS's unlayered reset defeated layered recipes, and unocss-preset-shadcn replaced complete CSS colors with raw OKLCH channels. The dashboard configuration was aligned to let main.css own reset/token values while retaining Uno utilities. This is a host configuration requirement, not something the CLI silently changes.

Final results on 28 September 2026:

- 50 unit/CLI tests passed; strict TypeScript check passed.
- All 37 actual producer -> Vue converter -> built Node CLI outputs compiled and passed strict vue-tsc.
- Dashboard check and production build passed.
- 24 production browser tests passed: eight cases each in Chromium, Firefox, and WebKit, including the original dashboard page.
- A locally packed package installed into a disposable consumer and converted an accordion through its Node executable.
- Independent review found one color-function dependency bug; three failing regressions were added and the bug was fixed. No unresolved Important/Critical findings remain.

Tested dashboard versions: nuxt-nightly 4.6.0-29839379.1718612a, Vue and server-renderer 3.6.0-rc.9, Playwright 1.63.0. Node 26.10.0 and Bun 1.4.2 were used for these checks. Tests establish compatibility for the exercised versions and behavior, not all future nightly releases or missing adapter-required algorithms.
