# Final primitive parity and visual refinement

Continuation of the approved portable-local-component parity plan, implemented inline in the existing main checkouts. No external implementation dependencies. Semantic Base Nova tokens and full classes/styles/unstyled overrides remain the public contract.

- [x] Producer: extend OTP decorative cell anatomy; add split-view and toast-message; retain native CSS resize and persistent notification alternatives.
- [x] RED: missing producer anatomy; missing adapter helpers; missing plugin mappings/models. GREEN: producer catalog tests and local adapter browser tests.
- [x] Connect validated compact adapters and pinned upstream recipes to Vue/Vapor generation.
- [x] Add strict consumer and production Nuxt browser tests; update gallery samples and support scope.
- [x] Inspect desktop/light/dark/mobile; make one batched visual refinement pass.
- [x] Run producer checks, plugin suite, full catalog/consumer validation, installed pipeline, Nuxt typecheck/build and production browsers.
- [x] One independent final review; repair important findings with regression coverage.

## Scope and interfaces

OTP: one native text input with numeric pattern, leading-zero string model, maxlength 1–32 (default six), groups, decorative cells, selection/caret, autofill/paste/reset, native required/disabled/readonly semantics. No authentication policy or password manager heuristics.
Split: two content slots, unique first-panel ID, labeled numeric separator; percentage size model, min/max, step, horizontal/vertical, RTL, pointer capture and keyboard arrows/Home/End. Nest local splitters for more panels; application owns persistence and collapse policy.
Toast: persistently mounted polite announcer plus independently styled title/content/action/close; open model, Escape/close dismissal, zero-or-positive timer paused during pointer/focus/document visibility; focus restoration if dismissed while interacting. Applications compose the stack and own queue/reordering; no global manager or swipe gesture.

Review focus: observer feedback loops and cleanup, editable projection prototypes, IME/native input selection, control/form reset, numeric bounds, pointer cancellation, reactive model feedback, screen-reader content outside action controls, and timer pause/resume under repeated sync.

## Verification evidence

- Producer `make check`: Go tests/race/vet plus 54 native browser checks pass. Installed `/usr/local/bin/html-ui` matches the rebuilt producer byte for byte.
- Plugin typecheck and full suite: 277 tests pass. All 76 catalog contracts compile; strict positive and negative consumers cover the new models, slots and overrides.
- Generated library: 71 local blocks; installed producer/converter generation has zero drift. Support artifacts and all gallery examples are current.
- Nuxt/Vapor consumer: typecheck and production build pass. Final scenarios: 30 pass across Chromium, Firefox and WebKit; complete dashboard suite: 393 pass.
- Visual inspection: desktop light/dark and 390px mobile. Corrected the first OTP cell's leading margin and added geometry coverage. Card, Accordion and Tabs follow the pinned Base Nova recipes.
- Independent review repaired all five findings: hidden SSR toast surface, IME-safe OTP selection, selected-character highlighting, root inert splitter observation, and queued toast cleanup. Each repair has regression coverage.
- Production preview: `http://127.0.0.1:4343/html-ui-final-parity`.

Native button mouse focus varies in Safari; the toast focus-restoration test opens from the keyboard to verify the actual focus contract without changing native click behavior. Toast queues and persistence remain application-owned; no global manager or swipe gesture is introduced.
