# UI plugin support

Pinned component-index reference: https://ui.shadcn.com/docs/components (2026-09-28). This table describes class-plugin support, not the older declaration-recipe coverage. Partial means the documented local building block works but is not a drop-in upstream API.

| Component | Status | Boundary |
| --- | --- | --- |
| accordion | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| alert | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| alert-dialog | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| aspect-ratio | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| attachment | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| avatar | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| badge | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| breadcrumb | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| bubble | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| button | partial | Native button + pinned Base Nova CVA; external Base UI behaviors excluded. |
| button-group | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| calendar | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| card | partial | Native single surface with adapted spacing; upstream Card subcomponents excluded. |
| carousel | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| chart | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| checkbox | partial | Native checked control adaptation; no indicator/indeterminate API. |
| collapsible | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| combobox | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| command | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| context-menu | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| data-table | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| date-picker | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| dialog | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| direction | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| drawer | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| dropdown-menu | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| empty | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| field | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| input | partial | Base Nova classes on native labeled input; no full Base UI API equivalence. |
| input-group | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| input-otp | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| item | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| kbd | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| label | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| marker | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| menubar | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| message | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| message-scroller | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| native-select | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| navigation-menu | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| pagination | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| popover | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| progress | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| questionnaire | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| radio-group | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| resizable | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| scroll-area | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| select | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| separator | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| sheet | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| sidebar | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| skeleton | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| slider | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| spinner | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| switch | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| table | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| tabs | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| textarea | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| toast | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| toggle | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| toggle-group | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| toolbar | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| tooltip | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| typography | unsupported | No class-plugin mapping in this release; a native catalog entry alone does not establish this UI contract. |
| grid | supported-extension | html-ui local building block, not an upstream shadcn contract. |
| icon | supported-extension | html-ui local building block, not an upstream shadcn contract. |
| icon-button | supported-extension | html-ui local building block, not an upstream shadcn contract. |

Button SVG selectors are restricted to direct SVG children so shared Icon components own their own sizing. Card integrates surface padding instead of generating upstream CardContent wrappers. Input and Checkbox retain html-ui’s labeled native anatomy.
