# html-ui-shadcn: Vue/Vapor first release

Proposed implementation specification · 28 September 2026

## Outcome

Create a separate `html-ui-shadcn` CLI under `~/webdev/html-ui/html-ui-shadcn`. It receives a framework component on stdin and its framework through a flag, validates the preserved v2 UI contract, resolves shadcn-compatible recipes, and writes a styled component to stdout.

The user selected Vue/Vapor first. The first release supports `--framework vue`, covering both the Vapor and ordinary Vue SFC syntax produced by the existing converter. React support and the separate React emitter are subsequent work.

```sh
html-ui accordion |
  html-ui-to-vue-vapor |
  html-ui-shadcn --framework vue --theme ./theme.css > Accordion.vue

# Resolve the theme path from components.json instead.
html-ui button |
  html-ui-to-vue-vapor |
  html-ui-shadcn --framework vue --config ./components.json > Button.vue
```

These commands are proposed interfaces, not implemented commands.

## Architecture and alternatives

Recommended: parse the SFC and metadata, resolve recipes as CSS declarations, and append component-scoped CSS referencing theme variables. This keeps native state matching in CSS, supports deterministic declaration merging, and produces one output file without a Tailwind discovery step.

An alternative is to generate literal Tailwind utilities. This fits existing shadcn authoring conventions but also needs a documented Tailwind version, utility discovery, conflict handling, and cross-condition precedence. A third option is a Tailwind build plugin that transforms consumer state-class objects; that solves a larger problem than this CLI's initial factory stage.

Use TypeScript with established Vue, JavaScript/TypeScript, and CSS parsers for the CLI. Parse source without importing or evaluating it. Pin dependencies and the tested Vue compiler version. The generated component gains CSS and static styling markers, with no styling runtime dependency. The CLI requires its documented JavaScript runtime; it is not initially a standalone Go executable like its upstream tools.

Separate modules handle command-line IO, framework parsing, contract validation, theme loading, recipe resolution, selector generation, and Vue edits. Future framework backends reuse the middle stages.

## Theme source

Accept either `--theme <css-file>` or `--config <components.json>`. With neither, find the nearest components.json from the current working directory upward; fail with an actionable message if absent. Reject both explicit options together. Resolve the config's `tailwind.css` relative to the config directory.

The CSS is the source of token declarations. components.json supplies discovery/configuration; its baseColor and style fields do not contain enough information to reconstruct arbitrary component recipes or custom colors. Reject `cssVariables: false` in this first release.

Read CSS with a parser, preserving token references rather than copying resolved light-mode values into components. Validate only tokens required by the selected recipe. Follow local relative CSS imports and installed packages' CSS entry points with cycle detection; resolve package CSS relative to the theme project, not the CLI installation. Do not fetch remote stylesheets or execute project configuration or package JavaScript. Remote font imports do not prevent validating locally available theme tokens. Unresolved required token dependencies receive an actionable diagnostic.

Support modern complete CSS color values, including oklch, hex, rgb/hsl functions, and variable aliases. Recognize legacy shadcn HSL channel declarations and generate `hsl(var(--token))` for those tokens. Reject ambiguous or inconsistent color representations across theme declarations instead of guessing. Validate alias references and report missing dependencies. Recognize Tailwind theme declarations and expressions such as `--alpha()` as build-time theme inputs; preserve references to their semantic tokens and leave compilation to the host project's existing Tailwind pipeline. Do not try to evaluate arbitrary CSS calculations or prove accessibility contrast.

The consuming application must already load the theme CSS globally. The output references it; it does not duplicate the app's global stylesheet, Tailwind imports, reset rules, or dark-mode controller. Changing theme variable values therefore changes all generated primitives without regeneration.

## Input contract and Vue profile

Require literal `contractVersion = 2`, literal `ui`, and matching generated part/state style types in the regular script. Read the template with the Vue parser. Map each owned native element through its static data-ui and data-ui-part attributes to the corresponding metadata part and symbolic node ID.

Validate versions, exact part coverage, duplicate markers, unknown state sources, native pseudo applicability, attribute presence/value rules, and agreement between types and metadata. Metadata must not contain calls, imports, computed values, spreads, or references. Never execute an input module.

The supported input is the existing converter's documented generated SFC profile. Reject structures that prevent an unambiguous owned tree, including dynamic part markers, structural loops or conditionals around owned nodes, teleports of owned nodes, and conflicting styling markers. Arbitrary handwritten Vue is not a compatibility claim.

Preserve scripts, props, slots, events, model synchronization, Vapor mode, behavior warnings, and DOM anatomy. Add only deterministic static recipe markers on owned nodes and a generated style block. Preserve pre-existing styles; report collisions with reserved generated markers. Reapplying the identical configuration must be byte-stable. A changed configuration replaces the tool-owned style block and markers, not unrelated source.

## Recipes and overrides

The built-in preset is a documented html-ui recipe set using shadcn tokens. It is not a copy of the official shadcn component API or a promise to reproduce every shadcn visual preset.

Resolve reusable styleRole recipes first, then component/part refinements, then an optional `--recipes <json-file>` override. Recipes contain CSS declaration objects under base and state. All override part/state names must exist in the input contract. A missing recipe for an unknown role produces a neutral result and stderr warning; `--strict` makes that an error.

```json
{
  "components": {
    "button": {
      "root": {
        "state": {
          "disabled": {
            "background-color": "var(--destructive)",
            "opacity": "0.6",
            "cursor": "not-allowed"
          }
        }
      }
    }
  }
}
```

Accept CSS properties and string values, including custom properties, validated by the CSS parser. Initial payloads contain declarations only; arbitrary selectors, at-rules, and executable JavaScript are outside this recipe grammar.

Merge by property at the same branch. `{ "mode": "replace", "value": { ... } }` discards earlier declarations at that branch. `{ "mode": "omit" }` removes that branch's recipe. `unstyled: true` skips default appearance for that part while retaining explicit overrides. It does not remove native semantics, browser defaults, or unrelated application CSS.

Provide baseline recipes for the current catalog's roles, with button, native accordion, and input as reference-quality examples. Tabs only styles its currently owned root/list; it does not invent slotted item contracts or missing keyboard behavior. Accordion has no native disabled state or owned content wrapper, so those paths remain invalid.

This release resolves overrides at generation time. Keep the exported generic style types intact, but do not claim the SFC accepts a new runtime classes prop. Runtime unconditioned Tailwind strings require a subsequent build transform or CSS-rule adapter. Theme changes at runtime continue to work through CSS variables.

## Native states and cascade

Generate selectors from metadata and the exact owned native tree. Same-node states use native pseudo-classes or attribute conditions. Ancestor, descendant, and sibling sources use exact structural paths, including direct-child relations and :has where needed. Never use an unconstrained ancestor group selector: an outer open accordion must not style an inner closed accordion's trigger.

Use stable generated recipe markers and Vue scoped styles to isolate compiled recipes. Different recipes for the same primitive must not collide. Determine selector specificity and state precedence deliberately; verify the compiled CSS, not only source snapshots.

Use a shared named CSS layer with ordered sublayers for base and supported states. Initial state order is required, expanded, open, checked, indeterminate, pressed, selected, hover, active, invalid, disabled, focusWithin, focusVisible; unused states emit nothing. Unknown state names require an explicit supported ordering rule or a diagnostic. Recipe merges occur before selector generation. Unlayered application CSS remains an intentional override route.

Gate hover under `(hover: hover)`. Exclude disabled conditions from hover and active feedback, resolving the actual disabled source for that part when declared. Keep focus indication possible on focusable aria-disabled elements. `aria-disabled="false"` is not disabled. Styling does not enforce ARIA-disabled behavior and does not replace disabled with inert.

No event listeners or state mirroring are added to discover hover, focus, checked, open, or other native CSS conditions.

## CLI guarantees

`--framework vue` is required; unsupported frameworks fail clearly. Support `--theme`, `--config`, `--recipes`, `--strict`, `--help`, and `--version` with documented validation. Reject duplicate and conflicting options.

On successful conversion, stdout contains only the complete SFC. Diagnostics go to stderr. Finish parsing, validation, and generation before writing stdout. Invalid input/configuration returns nonzero with empty stdout. The shell may still truncate a redirected destination before the CLI starts; documentation must not promise transactional shell redirection.

Do not modify the input project, theme files, components.json, or installed system binaries. Normal installation/build artifacts belong to the new CLI project. Maintain a README, input/output profile documentation, recipe schema/examples, and checked-in integration fixtures.

## Acceptance checks

1. Pipe all 37 current v2 primitives through the actual Vue converter and this CLI; compile and type-check the generated SFCs with the pinned toolchain.
2. Assert props, slots, models, event forwarding, behavior warnings, and native structure survive transformation.
3. Browser-check button disabled/hover/focus, input validation and checked states, accordion toggle/keyboard behavior, nested disclosures, and simultaneous states in Chromium, Firefox, and WebKit.
4. Change light/dark/custom token values and verify computed styles update without regenerating components.
5. Verify property merge, replace, omit, unstyled, and distinct recipes for the same primitive through computed styles.
6. Test malformed metadata, missing parts/tokens, invalid CSS, ambiguous theme encodings, import cycles, unsupported framework/input profiles, stable repeat transforms, and clean stdout on errors.
7. Build a documented installable CLI and run the real pipeline with its built entry point. Do not claim the React pipeline works in this milestone.
8. Complete the real Nuxt dashboard integration below as the final acceptance gate. Isolated fixture success is insufficient.

## Final acceptance: Korestack dashboard

User-required target: `~/webdev/korestack-web/apps/dashboard`.

Inspected configuration on 28 September 2026: Nuxt is pinned to `npm:nuxt-nightly@4.6.0-29839379.1718612a`, Vue/server-renderer to `3.6.0-rc.9`, and `vue.vapor` is enabled. Use the versions installed in this project when the test runs, recording their resolved versions; do not silently upgrade dependencies to make the test pass.

The dashboard's shadcn-vue components.json locates `app/assets/css/main.css`. Its theme uses Tailwind palette aliases, `@theme`, `--alpha()`, and dark-mode overrides. Accept the relevant configuration fields regardless of whether the schema URL is shadcn or shadcn-vue. The installed Tailwind and UnoCSS plugins remain part of this integration test.

Generate all 37 components using the built producer, built Vue converter, and built theme CLI with the dashboard's actual components.json. Import them explicitly in a dedicated integration fixture route within the dashboard. Exercise representative components with real slots, props, and event handlers. Keep generated fixtures and the route reproducible through a documented test command. Follow the repository's local style and test conventions; preserve existing user edits and do not replace existing product components merely to conduct this check.

Run from the Korestack repository root:

```sh
bun --filter @korestack/dashboard check
bun --filter @korestack/dashboard build
bun --filter @korestack/dashboard test
```

The current Playwright configuration launches the built production server on port 4336 and tests Chromium, Firefox, and WebKit. Extend those tests to visit the fixture route and verify:

- Generated imports compile and type-check in the real Nuxt application.
- Server rendering and hydration complete without component-related console errors or hydration mismatches; no ClientOnly wrapper or SSR disablement is introduced just to pass.
- Native accordion activation, nested state isolation, disabled button behavior, focus styles, input states, slots, model updates, and event forwarding work after hydration.
- Computed foreground/background, focus, and state styles resolve from the dashboard theme in light and dark modes, including imported Tailwind palette values.
- Existing dashboard tests continue passing.

Capture baseline failures before integration and distinguish unrelated existing problems from regressions. A build or import alone does not establish full compatibility. Report compatibility for the tested dependency versions and exercised behavior; preserve adapter-required limitations for primitives whose interactions are intentionally incomplete.

## Sources

- [shadcn theming](https://ui.shadcn.com/docs/theming): semantic token pairs, CSS variable values, and dark-mode overrides.
- [components.json](https://ui.shadcn.com/docs/components-json): theme stylesheet location and CSS-variable configuration.
- The local html-ui v2 contract and the existing Vue converter's emitted Accordion.vue establish the actual stream and framework profile.

Status: proposal for review; no html-ui-shadcn implementation has been created yet.
