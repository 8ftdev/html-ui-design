# Popup/menu parity continuation

Approved continuation of the visual-parity roadmap, implemented inline in the existing repositories. The binding brief is the user's visual-parity audit and compact, local component requirement; existing contract boundaries live in docs/remaining-contracts.md. No automatic commit or push in this batch.

## Contract

Keep one Popover, DropdownMenu and ContextMenu component, with owned trigger/popup styles and existing trigger/default slots. Introduce a local uiPopup(root, kind, options) controller with sync/dispose, reusing uiPosition. Typed side top/bottom/left/right, logical align start/center/end and finite sideOffset configure anchored popups. ContextMenu right-click uses a viewport point, flips/clamps at edges, and keyboard/click opening returns to trigger anchoring. Native auto-popover retains light dismissal and normal focus behavior.

Menus retain flat slotted Button/link menuitem rows. Enabled visible items receive roving focus, pointer highlighting, arrows/Home/End and locale-normalized printable-key typeahead. Disabled/hidden/inert rows never activate, including capture before application handlers. Escape returns focus; Tab closes and moves relative to the trigger in document order. Activating an action dismisses. Checked/radio values remain application-owned, with caller-supplied aria-checked decoration; nested submenus and automatic selection policy are excluded. Local Button `variant="menu"` supplies menu-row defaults through the child recipe merger; caller classes/styles/unstyled remain editable. Parent descendant defaults were rejected during review because they defeated ordinary child overrides. No external UI runtime or producer changes.

## Tasks

1. Runtime RED/GREEN: tests/plugins/popup-runtime.test.ts and positioning.test.ts cover pointer coordinates/collision, re-opening keyboard anchor, hidden/disabled/typeahead/pointer focus, native Tab, disabled ancestry/relocation, disposal/attribute ownership and nested ownership. Modify position-source.ts to accept optional viewport anchor points; add popup-source.ts and delegate existing popup/menu branches from runtime-source.ts.
2. Recipe/API RED/GREEN: tests/plugins/popup-plugin.test.ts verifies actual installed producer -> converter -> plugin compilation, typed sides/offsets and no external UI imports. Add plugin-popup-parity.ts, pin official Base Nova source in the registry fixture, update build-plugin.ts and inject.ts for a post-render controller. Update support reasons and build artifacts. Strict valid/invalid consumer checks cover options.
3. Real pipeline: generate the complete dashboard library, a neutral light/dark html-ui-popup-parity preview and matching browser specs. Verify pointer/context/keyboard invocation, placement, focus return, typeahead, disabled and dynamic content, native Dialog composition, viewport/mobile/RTL, local overrides and cleanup in Chromium/Firefox/WebKit. Run full plugin suite, strict consumers, drift checks and Nuxt typecheck/build; perform one architecture review and bounded desktop/mobile visual inspection. Record results and limitations.

## Review focus

Pointer anchors must not leak into keyboard reopen. Hidden or nested menu descendants cannot participate. Native Tab must escape the top-layer menu into real document order. Reactive IDs/options and disabled ancestors must synchronize without rebuilding listeners; cleanup preserves caller attributes and styles. Positioning changes must not reset Select/search popup scrolling.

## Execution result

Completed all three tasks.

Popup/menu batch verification (2026-10-01): 237 plugin tests pass, including RED/GREEN cases for expired Space typeahead, ARIA-disabled ancestors, native ContextMenu key positioning and pointer-events-none focus retention. Strict generated consumers, plugin typecheck/build and Nuxt nightly typecheck/build pass. All 312 production dashboard browser checks pass across Chromium, Firefox and WebKit (30 new popup/menu checks), including previous Select/search scrolling and hover behavior. Support and 70-example gallery artifacts are current; installed CLI regeneration reports zero drift. Independent review findings were addressed; one bounded desktop/mobile visual pass and a source design scan completed. No producer/converter changes or binary replacement were needed. The batch is left uncommitted.

Review adjustments: row defaults moved from parent selectors to Button variant=menu; native Popover display is scoped to :popover-open; Space after typeahead timeout activates; disabled ancestors and pointer-events-none backgrounds preserve action/focus safety; native ContextMenu key uses trigger positioning. Cross-browser fixtures allow WebKit native Option/Alt+Tab traversal and minor floating-point color/geometry serialization differences.
