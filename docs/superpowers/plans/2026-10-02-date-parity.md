# Date parity implementation plan

> **For agentic workers:** Use superpowers:executing-plans inline; one final independent review.

**Goal:** Local single-date month grid and popup picker with native form semantics.
**Architecture:** date-grid owned prototypes → Vue native value model → calendar/date-picker interaction + pinned recipes. NativeDatePicker preserves browser picker.
**Tech Stack:** Go producer, TypeScript plugin, Vue Vapor, native date/popover APIs, Tailwind/CVA.
**Spec:** docs/superpowers/specs/2026-10-02-date-parity-design.md

## Global constraints
- Local editable implementation; no external component/date engine.
- ISO date strings, one month/selection; typed override for every owned part.
- Existing approved inline/main workflow; leave unrelated cache edits alone.

## Review focus
- Leap days/month rollover and years below 100 cannot shift dates through timezones.
- Empty constrained calendars and invalid model strings must remain operable.
- Disabled fieldsets, inert and external resets must synchronize visual/native state.
- Re-rendering prototypes must preserve focused date and caller styles.
- Popup Escape/Tab dismissal must not swallow another component's keyboard events.

### Task 1: Native calendar contract
Files: internal/catalog/catalog.json, ui.json, calendar_anatomy_test.go. Interface: date-grid with native control input events, named table prototypes and caller IDs.
- [x] Write `TestCalendarGridContract`; run `go test ./internal/catalog -run TestCalendarGridContract` expecting missing primitive.
- [x] Add the owned anatomy/props/bindings/UI state metadata; rebuild producer; same test passes.
- [x] Run producer suite; supply copied binary request when ready while continuing locally.

### Task 2: Local date interaction and recipes
Files: src/interaction/date-source.ts, date-math-source.ts, inject.ts, runtime-source.ts; src/plugins/schema.ts; scripts/plugin-date-parity.ts, build-plugin.ts, support-policy.json; tests/plugins/date-plugin.test.ts, date-math.test.ts, date-runtime.test.ts.
Interfaces: `uiDate(root,kind,options)` returns sync(options)/dispose; kind calendar/date-picker; options locale, firstDayOfWeek, defaultMonth. Native value model dispatches input/change.
- [x] Verify old mapping fails `expect(mapping.primitive).toBe('date-grid')` and old math fails leap-date assertions.
- [x] Implement UTC date-only helpers with roundtrip validation, clamped month movement and no Date.parse local ambiguity; test leap/nonleap February and 0099.
- [x] Clone owned weekday/week/cell/day prototypes into semantic grid with roving keyboard focus; preserve focus on style/locale/model updates; bridge native reset/disabled/invalid.
- [x] Adapt pinned Base Nova recipes; add NativeDatePicker; validate owned tags/ancestry and reject malformed prototypes.
- [x] Run unit/runtime suites and strict generated consumers.

### Task 3: Nuxt preview and verification
Files: tests/integration/html-ui-date-parity.vue/.spec.ts, gallery generator/fixtures, docs/plugins.md and remaining-contracts.md; generated dashboard library, preview page/tests.
Interface: compact Calendar/DatePicker imports + native fallback, all local files.
- [x] Test keyboard uncommitted movement, month/year rollover, min/max, locale/week starts, controlled values/reset/FormData, disabled/inert, invalid focus, popup focus/Escape/mobile collision, reactive overrides and cleanup in Chromium/Firefox/WebKit.
- [x] Rebuild plugin/support/catalog and real dashboard library; check strict types, Nuxt check/build, cross-browser suite and generation drift.
- [x] Inspect desktop/mobile light/dark once; repair observed defects; independent whole-change review.
- [x] Record exact boundaries and validation results, retain reviewable files.


## Evidence and repairs
- Producer `make check`: Go/race/vet, native/TypeScript checks and 54 browser checks passed. Installed producer hash matches local binary.
- Red/green contract and date arithmetic checks preceded the implementation. Review regressions reproduced and repaired reactive bounds, supported-year endpoints and canceled native opening.
- Pointer navigation regression reproduced dismissal during native focus transitions. Internal related-target transitions remain owned; when navigation reaches a limit, focus moves into the month. Safari pointer activation now focuses owned buttons explicitly.
- Standalone `--component` CLI selection added with positive Calendar/DatePicker and negative ambiguous/mismatched/unsupported-mode coverage; installed pipeline verified for both mappings.
- Plugin: 263 tests passed; typecheck, strict generated consumers and current support artifacts passed. All 74 catalog outputs compile/typecheck. Installed library regeneration has zero drift.
- Nuxt nightly typecheck and production build passed; focused date suite passed 27 checks across Chromium/Firefox/WebKit. Full dashboard suite passed all 363 checks; evidence is also recorded in docs/plugins.md.
- Desktop light/dark and 390px mobile inspected; final screenshot saved. Source detector reported no findings. One independent whole-change review completed and its three findings repaired.
- Scope retained: single Gregorian date/month only; native alternative stays separate; no external date/component runtime. Integration: user authorized committing and pushing the verified batch to main.
