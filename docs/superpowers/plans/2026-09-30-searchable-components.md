# Searchable local Combobox and Command

Approved continuation: replace the datalist adapters with local generated searchable UI. Preserve the user's compact API, native browser semantics, editable output and typed overrides. Build on Select's projected options and shared collision positioning. Work inline in the existing linked repositories so the dashboard can exercise the real pipeline; preserve the uncommitted Select scroll fix. No publication requested in this batch.

## Contract

Combobox is one editable input controlling a single-choice popover listbox, backed by a CSS-clipped native select for value, name, required, reset and disabled fieldset semantics. Native options/optgroups are the required options slot; label is optional if externally named. Explicit unique input and popup IDs. Typing filters labels and optional data-keywords, arrows skip disabled/hidden choices, Enter commits, Escape/blur cancel the query to the committed label, Tab exits without implicit selection. IME/text editing keys remain native. Empty text is configurable. No free-text values, multiple selection, asynchronous loading policy or virtualization.

Command is an inline searchable list with the same native option data and input keyboard ownership. Each activation emits a typed select event with the action value, including repeated activation; application owns dispatch, global shortcuts and optional Dialog composition. Search does not change the selected value. Native select remains its data/model bridge, with no name or required field. No fuzzy ranking or shortcut registration. Owned input, surface, icon, option and empty parts are independently styleable; generated list groups get the existing descendant recipe controls.

## Task 1 — producer anatomy

Files: html-ui-cli/internal/catalog/catalog.json, ui.json, searchable_list_test.go. Write contract tests that fail when primitives are absent; add combobox-list and command-list anatomy. Reuse value model convention, optional label and option projection prototype. Validate all catalog entries and generated native TypeScript. Build local producer; final installed binary check can run once the user updates it.

## Task 2 — shared adapter and recipes

Files: src/interaction/list-source.ts, search-source.ts, select-source.ts, runtime-source.ts, inject.ts; src/plugins/schema.ts; scripts/plugin-search-parity.ts, build-plugin.ts, support-policy.json; generated schema/plugin/support outputs. Write failing browser tests for filtering, commitment, repeat action, cancellation, native required/reset, disabled groups, IME, dynamic options, overflow and disposal. Extract option projection once for Select/Combobox/Command. Inject a local controller with Vue scope cleanup and post-render model synchronization. Derive visual recipes from the pinned Base Nova Combobox/Command sources. Preserve standalone and shared helper output; reject mismatched anatomy and invalid placement/IDs.

## Task 3 — consumers and verification

Files: tests/integration/html-ui-search-parity.vue/.spec.ts; gallery and previous fixtures using changed Combobox/Command APIs; docs/plugins.md and remaining-contracts.md. Generate the real dashboard components and companion recipes. Provide a light/dark preview including form reset, disabled choices, empty search, repeat commands and Command inside Dialog. Verify local/CLI generation, strict consumers, Nuxt Vapor typecheck/build, all browser projects; inspect live appearance. Independent whole-change architecture review and repair important findings. Record boundaries and evidence; retain local files for user review.

## Review focus

Native validation/reset and fieldset state; focus and IME; search text never mutates committed model; stale active descendants after rerender; repeated Command activation and typed events; nested scope ownership; measurement and internal scrolling; disposal and caller class/style preservation. No external UI runtime imports.

## Execution record

Task 1 complete: missing-contract tests failed, new anatomy added, all73 catalog outputs compile/typecheck. Producer Go/race/vet and54 existing native browser checks pass. The generic Vue converter needed no changes.

Task 2 complete: initial eight searchable behavior tests failed before uiSearch existed; two generation tests failed while Combobox/Command still mapped to datalist. Shared projection and controller now pass14 browser-runtime regressions. Additional RED/GREEN fixes cover external value/filter synchronization, complete surface width, fieldset relocation, label reassociation and committed-choice preservation on reopen/external model change. Full plugin suite202 passes. Strict consumer checks accept model/part/placement/action contracts and reject invalid IDs/placement/event types.

Task 3 complete: real dashboard library, gallery and existing consumers regenerated; standalone and companion generation retained. Nuxt typecheck/build pass. Independent architecture review found relocation and label issues; both fixed and independently reprobed in allthree browsers with no remaining Important/Critical findings. Final production cross-browser run passes all 246 checks across Chromium, Firefox and WebKit, including current-choice preservation after reopening and the viewport-scroll regression.

Ruling: native options remain the compact data API; query does not bind the value model. Command emits a typed select event for repeated activation and is composed inside local Dialog. Classes overrides remain the existing per-part strings (including CSS state selectors), not a new structured override API.

Ruling: Firefox caps a wheel event to approximately one viewport. The regression verifies monotonic progress for successive native wheel events until Workspace40 is fully visible; no wheel interception is added.

Ruling: keep work in the current checkout and preserve the prior Select scroll fix. No commits/push requested for this batch. Installed CLI check complete (2026-10-01): the user updated /usr/local/bin/html-ui; its SHA-256 matches the rebuilt producer, all 73 names are present, and installed-CLI library generation reports zero differences.
