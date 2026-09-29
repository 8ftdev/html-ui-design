# Native forms and content batch — verification

2026-09-29. The plugin now generates 37 local building blocks: 36 mapped primitives and IconButton. The new batch is Empty, Item, InputGroup, Kbd, Pagination, Typography, Direction, RadioGroup, Radio and Slider. The eight official registry recipes are pinned alongside earlier Base Nova sources; Radio and Typography are explicit local extensions. The protocol and existing disclosure WAAPI remain unchanged.

## Verification

- Producer `make check`: Go race tests, vet, generated TypeScript conformance and all 27 native browser checks pass. Native anatomy/state assertions cover the ten new mappings.
- Converter `make check`: Go race/vet, compiler/consumer/standalone checks and 48 browser checks pass.
- Plugin build/check/test: 125 tests pass, with 623 expectations. New real producer → converter → class-plugin tests compile all ten contracts.
- `test:catalog`: all 58 real catalog outputs compile and typecheck in declaration mode; this is distinct from the 37 plugin building blocks.
- `test:plugins`: full local library and scoped-slot compositions typecheck under strict indexed access. Unknown direction/variant, missing InputGroup id, incorrect Radio defaultChecked and nonnumeric Slider values are rejected.
- `support:check`: generated matrix and JSON report match actual contracts.
- Nuxt nightly dashboard typecheck and production build pass with Vue 3.6.0-rc.9 Vapor output.
- New development browser suite: 24 pass across Chromium, Firefox and WebKit (45.4s).
- Full production browser suite: 129 pass across Chromium, Firefox and WebKit (1.1m).

Checks cover native radio arrow selection, focus, exclusivity, FormData and reset; numeric range models, stepping, bounds and reset; labeled InputGroup constraints, readonly submission, disabled omission and separate addon buttons; empty optional parts; content recipe variants; keyboard display; semantic typography and links; native RTL inheritance; theme switching; pagination destinations/current page; mobile document width; loaded-image containment; and browser errors/hydration warnings.

## Regressions found and resolved

An independent read-only review found a tall Item image could overflow its fixed media box. The loaded-image browser test reproduced a 100px image inside a 20px box. The local recipe now bounds images to the box with object-contain, preserving aspect ratio. Icon SVG styling stays with the local Icon primitive.

The strict Slider composition initially failed because an optional incoming value made its update event number-or-undefined. The converter now keeps optional local initialization while emitting the validated native DOM read type. A focused Go regression failed before the fix; the strict numeric consumer and native model/reset/browser suites pass afterward. No runtime model behavior was changed.

The preview variable `readonly` collided with Nuxt nightly's auto-import transform and produced an invalid assignment. Renaming the application state to emailReadonly removes the collision; generated primitive implementations were not the source. Development tests wait for DOM content and explicit Vue readiness rather than unrelated asset load completion.

## Preview and publication

Live preview: http://localhost:4322/html-ui-plugin-batch-three-check. Generated components remain editable local files under apps/dashboard/app/components/html-ui-plugin-batch. The preview source and browser tests are in tests/integration in this repository.

The preceding batch was committed and pushed to main in all three repositories: producer 1f3a01c, converter 3bbd22f, plugin 841c156. The third batch was later published to main as producer 3572c96, converter 3269c5a and plugin 43d16b4 after fresh producer, converter, plugin, catalog, strict consumer and 24 live Nuxt browser checks. Existing unrelated dashboard/navbar changes are preserved.

The user updated /usr/local/bin/html-ui. Its SHA-256 matches the rebuilt producer binary. A complete 37-block library generated using that installed producer and the local converter typechecks successfully; regeneration with --check reports no changed files. The installed producer lists all 58 catalog entries. No system binary was replaced by the tool.

The support matrix defines capability boundaries. RadioGroup uses native selection and events/FormData, not a generated controlled group model. Slider is single-thumb/native. InputGroup is single-input with inline addons; app logic owns addon disablement. Direction is native HTML inheritance, not a JS provider. Typography is a local semantic-content recipe, not upstream Typeset. Pagination callers supply list items and destinations. Empty/Item callers supply actions and heading semantics.
