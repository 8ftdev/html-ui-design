# Remaining contract adaptations

The pipeline now maps every entry in the current support policy: 68 mappings and local IconButton produce 69 editable Vue/Vapor building blocks. These are explicitly scoped adaptations, not copies of upstream component APIs. The producer contains 70 catalog entries; several legacy adapter profiles are intentionally not used by these mappings.

## Shared local interactions

Plugins may opt into a reviewed `interaction` profile: dialog, popover, tabs, menu, context-menu, toolbar, toggle, toggle-group or tooltip. The class emitter checks the primitive name and owned tags/roles. Adapter-required input still fails without a matching profile. Original contract metadata remains intact; the manifest and support report separately record which helpers satisfy it.

Library generation writes `ui-interaction.ts` once. Standalone pipe output embeds the same helper. Vue/Vapor function directives register its disposer on scope cleanup. There is no external component, charting or animation runtime dependency. Existing disclosure WAAPI is unchanged.

Dialog/AlertDialog/Drawer/Sheet use native modal focus and Escape behavior, with local showModal/close handlers for owned invoker controls. AlertDialog callers supply connected description content and choose a least-destructive autofocus action. Trigger disabled state is native.

Tabs supply automatic activation, disabled skipping, panel visibility, one tab stop, Home/End and direction-aware arrows. Callers compose local Button children with tab roles, unique IDs and aria-controls, plus panels with matching IDs/aria-labelledby. Change bubbles from the root; no controlled selection model is generated.

Toggle adds a typed boolean update:pressed event and local state. ToggleGroup provides horizontal roving navigation over independently modeled Toggles. Toolbar preserves text/select editing keys and excludes hidden/closed-popover descendants. Menubar is a flat menuitem surface; nested submenu coordination is excluded.

DropdownMenu/ContextMenu provide flat native auto-popover menus, accessible label props, arrows/Home/End, disabled skipping, dismissal and Escape focus return. ContextMenu also supports right-click and Shift+F10. Disabled activation is blocked during capture before application handlers. Submenus, typeahead, pointer placement and menuitem radio/checkbox selection policies are excluded.

Tooltip uses noninteractive connected text, focus/hover visibility, hoverable content and Escape dismissal. No provider, configurable delay or collision engine. Popover keeps native light dismissal and editable centered placement.

## Native alternatives and content

Calendar and DatePicker map to a native date-field with ISO string value/model, browser picker, min/max and reset. Calendar is a browser-picker alternative, not an inline month grid. Combobox and Command use labeled input/datalist suggestions, not custom listboxes, fuzzy command dispatch or palettes. Select is native select; InputOtp is one string input preserving leading zeros and one-time-code autofill.

DataTable reuses native Table; application logic owns sorting, selection and pagination. Chart owns figure/caption around caller-supplied SVG, canvas or a data table. Carousel is horizontal native scroll snapping. Resizable is a CSS resize surface, not split panes or a keyboard resize handle. Sidebar is a labeled aside; compose local Sheet for mobile disclosure.

Attachment is a native link/download surface. Bubble, Marker and labeled Message supply transcript anatomy. MessageScroller provides focusable overflow; the application owns streaming announcements and follow policy. Questionnaire reuses fieldset/legend. Toast is a persistent polite status region: mount it before inserting text, and own queues, timing and dismissal in application logic.

All owned parts retain recipe, classes, styles and unstyled control. Slot children remain local primitives with their own styles. See [the support matrix](support.md) for exact boundaries.

## Preview and verification

Preview: http://localhost:4322/html-ui-plugin-remaining-check. Source and cross-browser fixtures are in `tests/integration/html-ui-plugin-remaining-check.vue` and `tests/integration/html-ui-plugin-remaining.spec.ts`. These cover keyboard/focus, disabled actions, native models/reset, labels, semantic content, themes, mobile width and browser errors.

The user updated /usr/local/bin/html-ui after the 12 new names were added. Its SHA-256 matches the rebuilt producer, it lists all 70 catalog entries, and the 69-block installed-CLI generation typechecks with zero regeneration drift. The tool does not replace the system installation.

Validation: producer `make check` (including 27 browser checks), converter `make check` (48 browser checks), plugin unit/contract suite (159 tests), all 70 producer catalog outputs compiled and typechecked, dashboard Nuxt nightly typecheck and production build, and 159 dashboard production browser checks across Chromium, Firefox and WebKit. The original 37-component contract preview still hydrates; its Table fixture now supplies valid native rows and cells.
