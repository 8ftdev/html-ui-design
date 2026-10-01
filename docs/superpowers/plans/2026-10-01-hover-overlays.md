# Tooltip and HoverCard parity continuation

Approved continuation of the existing visual-parity roadmap. Preserve compact local Vue/Vapor components, pinned Base Nova recipes, typed classes/styles/unstyled, native focus semantics and existing searchable/Select work. Implement inline in the current linked checkouts; no commit or push requested. Installed producer is now verified with zero library drift; this batch needs no producer/converter change.

## Contract

Tooltip keeps the existing button trigger and descriptive text slot/aria-describedby. Its local adapter promotes the existing owned tooltip to a manual native popover while mounted, preserving hidden behavior and restoring owned attributes on cleanup. It does not focus or trap content. HoverCard maps existing preview-card anatomy: one owned button trigger plus native auto-popover and default content slot, hover/focus intent and click/touch fallback. Additional content never supplies the sole accessible name or an essential action.

Both share local uiHover(root, kind, options) returning sync(options)/dispose, and uiPosition. Public placement is top/bottom/left/right and logical start/center/end. Typed optional openDelay/closeDelay/sideOffset numbers are adapter props; clamp negative/non-finite values to safe defaults. Tooltip defaults immediate opening, 200ms close grace; HoverCard defaults 600ms opening, 300ms close grace. Keyboard focus opens immediately. Hovering content or moving focus within HoverCard keeps it open; crossing the gap has a close grace. Escape hides and latches dismissal until a new hover/focus interaction. Touch never schedules hover; HoverCard click remains native. Disabled, aria-disabled, disabled fieldset and inert block opening and dismiss an open surface. No provider, global warmup policy, controlled-open model, safe-polygon cursor tracking, polymorphic trigger or external UI runtime.

## Tasks

1. Add real-browser failing tests for Tooltip top-layer positioning/clipping, delayed/pointer intent, gap crossing, focus/Escape latching, HoverCard click and focusable content, disabled/relocated ancestors, timers/geometry cleanup, nested ownership. Extend shared position tests for left/right flipping and viewport width limits without regressing vertical scroll.
2. Implement uiHover as one emitted local source, replace old Tooltip runtime branch, validate new hover-card profile against preview-card anatomy. Add typed adapter props and Vue post-effect sync with scope cleanup. Extend uiPosition minimally for horizontal sides and preserve existing vertical behavior.
3. Pin official HoverCard/Tooltip recipes through shadcn CLI, add compact mapping/axes and Base Nova geometry; update support/schema/library/gallery and strict valid/invalid consumers. No tiny exported subcomponents.
4. Generate the real dashboard library and light/dark hover parity preview; cover keyboard, pointer, native click/touch, mobile clipping, RTL, scroll/resize, local overrides/disposal and Dialog composition across Chromium/Firefox/WebKit. Run plugin suite, strict consumers, support drift, installed library drift, Nuxt typecheck/build and dashboard regressions. One independent architecture review/fix pass. Document limits and evidence.

## Review focus

Dismissal must not reopen under a stationary pointer/focus; touch must not create phantom hover; leave timers must not close a newly re-entered surface; disabled ancestry must track relocation; cleanup must cancel timer/observer/position writes and preserve caller edits. Shared positioning must preserve Select internal scroll and restore its style ownership.

## Execution

Installed searchable CLI check passed before this batch: matching SHA-256, all 73 catalog names, complete library regenerated with zero differences.


Completed implementation and review:

- Added the local hover adapter, four-side shared positioning, compact Tooltip/HoverCard contracts and pinned Base Nova recipes. HoverCard uses existing `preview-card`; no producer rebuild or converter changes were needed.
- Generated 70 dashboard building blocks and the hover parity page, with typed placement/delay props and editable local recipes. Strict consumer checks accept valid options and reject invalid sides, delay types and missing IDs.
- Real-browser RED/GREEN regressions cover caller attribute ownership during disposal, reactive popup IDs and bounded scrolling for long tooltip descriptions. The independent architecture review findings were all addressed; ordinary short tooltip content retains its exterior arrow.
- The plugin suite passes 222 tests. Plugin typecheck/build, strict consumers, Nuxt nightly typecheck/build, support/gallery drift checks and installed-binary library regeneration all pass. Installed generation reports `changed: []`.
- The final browser investigation identified two test assumptions: popup visibility precedes RAF positioning, and the open HoverCard covers the fixture's following button. The tests now wait for bounded coordinates and click a genuinely exterior point. Both scenarios pass three repetitions in each browser (18 checks); no production change was required.

Changes remain uncommitted, as requested by the scope of this continuation.

Final production dashboard verification: all 282 checks pass across Chromium, Firefox and WebKit, including the new hover overlays and existing Select/search scroll regressions. Desktop and mobile light/dark preview inspection passed.
