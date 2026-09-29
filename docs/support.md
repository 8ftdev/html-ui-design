# UI plugin support

The builtin `shadcn-ui` plugin generates **37 building blocks**: 36 mapped primitives and one local composition (IconButton). Vue/Vapor is supported; React is not emitted.

This matrix describes **plugin contracts**, not legacy declaration recipes. The legacy mode compiles 58 catalog entries; that does not grant those entries plugin support. Partial means the local native adaptation works within the stated boundary, not upstream API equivalence.

Reference: https://ui.shadcn.com/docs/components (2026-09-29). Machine-readable coverage: `src/plugins/builtin/support.json`. Regenerate with `bun run support:build`; detect drift with `bun run support:check` after `bun run test:catalog`.

## Generated contracts

| Component | Primitive / composition | Styled parts | Public slots | Presentation axes | Motion | Boundary |
| --- | --- | --- | --- | --- | --- | --- |
| accordion | accordion | root, content, trigger | summary, default | — | content.expanded → disclosure (WAAPI) | One native details/summary item; shared name supports exclusive groups. No disabled item, roving focus, generated indicator, upstream panel lifecycle. |
| alert | alert | root, icon, title, description | icon, title, default | variant: default/destructive | CSS / none | Native role=alert with title, decorative icon and description slots. Application owns announcements, actions and dismissal. |
| aspect-ratio | aspect-ratio | root | default | ratio: square/video/photo | CSS / none | Native container with square/video/photo CSS ratio recipes; styles.root.aspectRatio accepts custom ratios. Intrinsic oversized content may increase height; no numeric upstream ratio prop. |
| avatar | avatar | root | — | size: default/sm/lg | CSS / none | Native image with required src/alt and default/sm/lg sizes. App owns image failure handling; fallback, badge and group APIs excluded. |
| badge | badge | root | default | variant: default/secondary/destructive/outline/ghost/link | CSS / none | Noninteractive span with default/secondary/destructive/outline/ghost/link presentation variants. No render-as-link or external primitive behavior. |
| breadcrumb | breadcrumb | root, list | default | — | CSS / none | Labeled nav and ordered list; caller supplies semantic li, links and aria-current=page. CSS decorative separators; no routing, dropdown or ellipsis controller. |
| button | button | root | default | variant: default/outline/secondary/ghost/destructive/link; size: default/xs/sm/lg/icon/icon-xs/icon-sm/icon-lg | CSS / none | Native button + pinned Base Nova CVA; external Base UI behaviors excluded. |
| button-group | button-group | root | default | orientation: horizontal/vertical | CSS / none | Labeled group of local Button children, horizontal/vertical presentation. Buttons retain their own recipes and normal tab order; no toolbar/roving focus or arbitrary nested anatomy. |
| card | card | root | default | — | CSS / none | Native single surface with adapted spacing; upstream Card subcomponents excluded. |
| checkbox | checkbox | root, control | default | — | CSS / none | Native checked control adaptation; no indicator/indeterminate API. |
| collapsible | collapsible | root, content, trigger | summary, default | — | content.expanded → disclosure (WAAPI) | Native details/summary with open model and toggle event. No arbitrary external trigger, disabled prop. |
| direction | direction | root | default | — | CSS / none | Native div dir inheritance with ltr/rtl/auto. Logical CSS follows the browser; no JavaScript DirectionProvider/useDirection context. |
| empty | empty | root, header, media, title, description, content | media, title, description, default | variant: default/icon | CSS / none | Native owned header/media/title/description/action containers. Optional parts hide when empty; app supplies heading semantics, empty conditions and actions. No upstream subcomponent API. |
| field | field | root, label, description | label, control, description | orientation: vertical/horizontal/responsive | CSS / none | Local label/control/description slots, scoped id and vertical/horizontal/responsive orientation. App connects control id and aria-describedby; no error aggregation or validation engine. |
| input | input | root, control | default | — | CSS / none | Base Nova classes on native labeled input; no full Base UI API equivalence. |
| input-group | input-group | root, label, surface, start, control, end | default, start, end | — | CSS / none | Single native labeled text/email/password input with value model, native constraints/reset and inline start/end addons. Label is separate from interactive addon buttons. Unique id required; application owns addon disabled state. No textarea/block addons or addon click-to-focus handler. |
| item | item | root, media, content, title, description, actions | media, title, default, actions | variant: default/outline/muted; size: default/sm/xs | CSS / none | Noninteractive div content row with media/title/description/actions, default/outline/muted and default/sm/xs recipes. Compose local links/buttons in slots; no polymorphic root, list role, header/footer or navigation behavior. |
| kbd | kbd | root | default | — | CSS / none | Native kbd shortcut display. No shortcut registration, KbdGroup controller or external icon dependency. |
| label | label | root | default | — | CSS / none | Native label with htmlFor association or one wrapped labelable control. No disabled state of its own; avoid nested labels. |
| native-select | select | root, control | default, options | size: default/sm | CSS / none | Native labeled select with default/sm sizes, options slot, input/change events and browser arrow. No selection model prop; application reads events or uses selected options. |
| pagination | pagination | root, list | default | — | CSS / none | Labeled native nav and ul; caller supplies li, page links and aria-current=page. Shared link recipes; no routing, page calculations, disabled anchors or generated previous/next controls. |
| progress | progress | root | — | — | CSS / none | Labeled native progress with value/max and indeterminate when value is omitted. Native bar adaptation; no separate Track, Indicator, Label or Value components. |
| radio-group | radio-group | root, legend | legend, default | — | CSS / none | Native fieldset/legend with scoped shared name, bubbling change and disabled propagation. Compose local Radio children. Selection/arrow keys/reset are native; application reads change or FormData. No controlled group model or generated options. |
| scroll-area | scroll-area | root | default | — | CSS / none | Focusable labeled region with native overflow and a default max-height. No custom scrollbar/drag API; application supplies content and can override constraints. |
| separator | separator | root | — | — | CSS / none | Native horizontal thematic hr. No decorative or vertical semantics API; use layout CSS for decorative dividers. |
| skeleton | skeleton | root | — | — | CSS / none | Decorative aria-hidden placeholder; CSS pulse respects reduced motion. App owns shape overrides and loading-region aria-busy. |
| slider | slider | root, control | default | — | CSS / none | Native single-thumb range with numeric value model, input/change, bounds, step, disabled and reset. Native accent styling; no multi-thumb, vertical or external Track/Thumb components. |
| spinner | spinner | root, indicator | — | — | CSS / none | Labeled native status with decorative CSS ring; reduced motion uses a static indicator. No icon package or loading lifecycle dependency. |
| switch | switch | root, control | default | size: default/sm | CSS / none | Labeled native checkbox with switch role, checked model, reset, disabled and default/sm sizes. CSS draws the thumb; no indeterminate or external Thumb component. |
| table | table | root, table, caption, head, body, foot | caption, head, default, foot | — | CSS / none | Native table, required caption and body rows, optional header/footer slots inside a focusable scroll container. Caller owns semantic rows/cells. No sorting, selection or virtualization. |
| textarea | textarea | root, control | default | — | CSS / none | Native enclosing label and multiline control with value model, input/change, reset, disabled, readonly and constraints. No autosize JS or validation engine; field-sizing-content is progressive enhancement. |
| typography | typography | root | default | — | CSS / none | Local native wrapper styling caller-owned semantic headings, paragraphs, lists, links, code and quotes. No generated heading hierarchy or upstream component API. |
| grid | grid | root | default | gap: none/xs/sm/default/lg/xl; columns: 1/2/3/4; smColumns: 1/2/3/4; mdColumns: 1/2/3/4 | CSS / none | html-ui local building block, not an upstream shadcn contract. |
| icon | icon | root | default | — | CSS / none | html-ui local building block, not an upstream shadcn contract. |
| icon-button | button + icon | inherited | default | — | CSS / none | html-ui local building block, not an upstream shadcn contract. |
| fieldset | fieldset | root, legend | legend, default | — | CSS / none | Adapts shadcn FieldSet/FieldLegend from the field registry to native fieldset/legend. Disabled propagates to descendant native controls (first legend exception applies). |
| radio | radio | root, control | default | — | CSS / none | Local native labeled radio with shared name/value, mount-time defaultChecked, required/disabled, native arrow navigation and reset. Group selection uses events/FormData; no independent checked model. |

Native state sources and behavioral scope are recorded per part in the JSON report. Those sources describe the primitive’s capabilities; they do not imply every state has a separate visual recipe. Classes/styles/unstyled overrides remain available for every mapped part. Motion can be disabled with `motion=false`; unstyled also disables generated motion.

## Not yet mapped

| Component | Status | Boundary |
| --- | --- | --- |
| alert-dialog | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| attachment | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| bubble | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| calendar | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| carousel | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| chart | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| combobox | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| command | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| context-menu | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| data-table | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| date-picker | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| dialog | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| drawer | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| dropdown-menu | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| input-otp | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| marker | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| menubar | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| message | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| message-scroller | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| navigation-menu | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| popover | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| questionnaire | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| resizable | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| select | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| sheet | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| sidebar | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| tabs | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| toast | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| toggle | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| toggle-group | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| toolbar | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| tooltip | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |

Native disclosure content wrappers are now explicit owned parts. Accordion remains one disclosure item; use the same nonempty name for exclusive groups. The motion helper is generated locally once as ui-motion.ts and reused by Accordion and Collapsible. Standalone pipe output embeds that same helper. No external component or animation implementation is imported.
