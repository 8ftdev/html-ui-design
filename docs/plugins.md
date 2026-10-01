# UI contract plugins

A plugin supplies typed variants and class recipes to local html-ui primitives. Reviewed interaction profiles can generate shared local behavior; unmapped adapter requirements remain errors. It does not install Base UI/Radix components. Vue/Vapor is the first backend. Tailwind CSS 4 and class-variance-authority 0.7.1 are consumer styling dependencies; the generator does not compile utility CSS.

The library now emits 70 building blocks. See [remaining adaptations](remaining-contracts.md) for local interaction helpers and the boundaries of native date, searchable-list, chart, carousel and content alternatives.

The Nuxt gallery at `/html-ui-plugin-gallery` shows all 70 blocks as live examples beside their Vue imports and markup. Generate it from the dashboard's `html-ui-plugin-batch/ui-library.json` with `bun scripts/build-gallery.ts`; use `bun scripts/build-gallery.ts --check` to verify the checked-in gallery and dashboard page have not drifted. The builder requires an example and category for every manifest entry, so a new component cannot silently disappear from the gallery. Set `HTML_UI_DASHBOARD` to target a different dashboard checkout.

## Generate one component

```sh
html-ui button | html-ui-to-vue-vapor |
  html-ui-shadcn --framework vue --plugin shadcn-ui --config components.json > Button.vue
```

This output retains contract metadata for pipeline use. Class plugins replace the declaration-recipe backend. Do not combine --plugin and --recipes. Unknown parts/states, prop collisions, missing theme variables, or declared unsupported hooks are errors.

## Generate a library

```sh
html-ui-shadcn --framework vue --plugin shadcn-ui \
  --theme app/assets/css/main.css --out-dir app/components/ui \
  --producer /path/to/html-ui --converter /path/to/html-ui-to-vue-vapor
```

`--producer` and `--converter` default to commands on PATH. `--check` reports filenames that would change without writing. The writer rejects edited or unowned files. Review regenerated output in a new directory to update edited components; there is no forced overwrite mode. A failed filesystem operation during replacement can leave some files updated; the manifest is written last, so the next run refuses mismatches rather than silently accepting them.

Library output contains readable `.vue` components, local `.recipe.ts` companions, `index.ts`, and `ui-library.json` with the primitive contracts and provenance. IconButton imports the same Button and Icon files that application code imports. Library SFCs are final application artifacts; regenerate from primitive source rather than feeding an individual final library SFC back through the pipeline parser.

Install CVA in the consuming project. Ensure Tailwind scans both `.vue` and `.recipe.ts` files; add an `@source` path if output is outside normal application discovery. Load your existing semantic theme once. The `shadcn-ui` plugin uses the pinned Base Nova Button/Input recipe snapshot, with documented native adaptations for other blocks. It does not require the `cn` package from the upstream registry.

## Consumer CSS discovery and layers

Register the generated directory explicitly in the consuming Tailwind stylesheet, relative to that stylesheet. This includes the `.recipe.ts` companions during development as well as production:

```css
/* For app/assets/css/main.css and app/components/ui/ */
@source "../../components/ui";
```

When UnoCSS and Tailwind are both enabled, unlayered Uno utilities override Tailwind's layered hover/dark rules. Keep the legacy Uno output below Tailwind utilities, for example in `unocss.config.ts`:

```ts
outputToCssLayers: { cssLayerName: () => 'components' }
```

Restart the development server after changing its CSS plugin configuration. Check SVG dimensions and pointer-hover colors in both dev and production; matching two zero-size icons does not establish that they render.

## Custom plugins

Use `schemas/ui-plugin.schema.json` for editor validation and exported `UIPlugin`/`ClassRecipe` types from `html-ui-shadcn`. The schema and types derive from the same Zod definitions. `parsePlugin` additionally checks cross-field rules such as defaults and compound conditions. All object fields are strict.

```ts
import { importCva, parsePlugin } from 'html-ui-shadcn'
const recipe = importCva(sourceText, 'buttonVariants')
const plugin = parsePlugin({
  pluginVersion: 1,
  name: 'my-ui',
  provenance: { source: 'local recipes', revision: '1', license: 'MIT' },
  tokens: ['primary', 'primary-foreground'],
  components: {
    button: {
      primitive: 'button',
      parts: { root: recipe },
      slots: { label: 'default' },
      requirements: [{ part: 'root', state: 'disabled', description: 'Native disabled state' }],
    },
  },
})
```

The importer accepts literal CVA base classes, variants, defaults, and compounds, including separately exported declarations and an aliased CVA import. It does not execute source or extract behavioral meaning from arbitrary selector strings. Dynamic expressions, spreads, interpolated strings, null defaults/classes, and duplicate keys are rejected with diagnostics. Boolean axes use true/false keys; defaults retain Vue boolean semantics.

```sh
html-ui-shadcn --import-cva button.tsx --export buttonVariants > button.recipe.json
```

Attach that recipe to a component/part in a plugin JSON file, then pass its path to `--plugin`. Plugin authors must declare behavioral assumptions through requirements. State requirements are checked against primitive metadata; hook requirements outside supported mappings fail. Presence hooks can map an existing boolean primitive prop to a data attribute using `hooks: [{ part: 'root', attribute: 'data-disabled', prop: 'disabled' }]`; false removes the attribute. Hooks never implement state transitions.

The supplied coss Button recipe imports with all 70 size/variant selections preserved. Its loading child and pressed behavior are not provided by our native Button. A complete coss mapping must declare those requirements and is rejected until the necessary primitive capability exists. Importing its classes alone is not proof of behavior compatibility.

## Overrides and ownership

Each generated primitive has typed `classes` and `styles` maps keyed by its parts, plus `unstyled`. Example: `<Input :classes="{ control: 'tracking-wide' }">Email</Input>`. `unstyled` suppresses recipe classes, preserving native behavior. Inline part styles can override individual style properties. Local recipe files are fully editable.

CVA selects recipe classes; Tailwind Merge resolves known conflicting utilities in recipe → part override → ordinary root class order. Ordinary root class/style props are explicitly consumed by the generated Vapor component. For a full replacement edit the recipe, select a custom plugin, or use `unstyled` with your own classes. State utility variants stay in the recipe and the consuming Tailwind build. No runtime nested `classes.state` API is claimed in this release.

## Building blocks

- Button: variant, size, disabled, type, ariaLabel, default content, click event.
- Input: enclosing label/default slot, text/email/password type, id, autocomplete, placeholder, required, disabled, `v-model:value`.
- Checkbox: optional enclosing label/default slot, native checked/indeterminate/disabled/required, `v-model:checked`, and a local presentational indicator.
- Card: one local surface/default slot; application owns headings and layout.
- Grid: gap none/xs/sm/default/lg/xl; columns, smColumns, mdColumns are string choices 1–4. Default is one column and gap-4.
- Icon: decorative container for local SVG content; accessible meaning belongs to the surrounding text/control. Shared `--ui-icon-size` can change sizing.
- IconButton: local Button + Icon, required accessible label, forwarded variant/size/disabled/type and click; default icon size.

Native input reset baselines remain implemented by html-ui. Application validation and authentication remain application code. No login screen is generated.

### Custom contract validation

Variant axes use camelCase names. Vue-reserved props, event-like names (`onClick`), and CVA's `class`/`className` are rejected. At least one part is required; an empty class recipe on a real part is valid. Component names cannot contain empty hyphenated segments, and output names are checked case-insensitively before generating files.

Automatic IconButton is emitted only when local `button` and `icon` mappings provide the required default slots, a variant axis, and a size axis containing `icon`. Otherwise the library manifest explains why that optional composition was omitted. An explicit IconButton mapping takes precedence and is never overwritten.

## Native contract batch and motion

The builtin now maps 16 native primitives and emits local IconButton, for 17 building blocks. The first expansion adds Accordion, Collapsible, Avatar, Field, Fieldset, Separator, Progress, Switch, ScrollArea, and NativeSelect. See the generated support matrix for anatomy, slots, axes and limitations. NativeSelect maps the producer's `select`; Fieldset adapts the registry's FieldSet.

Motion recipes are optional plugin fields. This release validates one supported preset: `content.expanded` on a native details/summary disclosure with an owned content div and an expanded source bound to root.open.

```ts
motion: {
  content: {
    expanded: {
      preset: 'disclosure',
      duration: 'var(--motion-duration-normal, 180ms)',
      easing: 'var(--motion-easing-standard, ease-out)',
    },
  },
}
```

Library output includes a shared, editable `ui-motion.ts` helper; Accordion and Collapsible import it locally. Standalone pipe output embeds the same implementation. WAAPI animates the measured content height and opacity, retains physical open while closing, and reports the logical open state to the generated model. Rapid reversals cancel the previous effect. Clipping and box sizing live in the WAAPI effect, so caller inline styles and their priorities are never rewritten, including changes made during animation. Closed content becomes inert during exit; focus returns to summary when necessary. Removing the component disposes the effect and listeners. Initial hydration is never animated. Reduced motion, unavailable WAAPI, or an application `!important` rule preventing the effect’s border-box sizing settles immediately. Native exclusive name groups remain native; an automatic sibling closure may settle immediately rather than play an exit effect.

Set `motion=false` to disable it. `unstyled` also disables generated motion. Override only timing while keeping the preset:

```vue
<Accordion
  v-model:open="expanded"
  :motion="{ content: { expanded: { duration: '300ms' } } }"
>
  <template #summary>Account details</template>
  <Grid><p>Content</p><Button>Edit</Button></Grid>
</Accordion>
```

Simple state transitions remain CSS recipes. Switch uses the shared `--motion-duration-fast` token (150ms fallback), and reduced-motion disables its transition. Styling dependencies remain CVA and Tailwind; no animation package or external component implementation is required.

Field's control slot receives `id`; the application assigns that id and `aria-describedby` to a labelable control. Progress omits value for indeterminate state, including reactive transitions back from a determinate value. NativeSelect emits original input/change events; it does not add a model prop. ScrollArea defaults to max-h-64 with native scrolling; use part styles or a custom recipe to replace that constraint.

The batch integration fixtures are `tests/integration/html-ui-plugin-batch-check.vue` and `html-ui-plugin-batch.spec.ts`. The Nuxt dashboard route is `/html-ui-plugin-batch-check`. Tailwind must explicitly scan the generated batch recipes (`@source "../../components/html-ui-plugin-batch"` from its CSS location).

### Reproduce the batch preview

Build the local producer and Vue converter binaries, then run `bun run test:catalog` here to prepare the real pipeline fixtures. Generate the library with:

```sh
bun scripts/generate-ui-library.ts /path/to/app/components/html-ui-plugin-batch /path/to/theme.css
```

Copy `tests/integration/html-ui-plugin-batch-check.vue` into the Nuxt app's pages and `tests/integration/html-ui-plugin-batch.spec.ts` into its Playwright test directory. Add a Tailwind `@source` for the generated folder. The fixture uses the dashboard's `~` alias and semantic theme utilities; it does not import upstream component implementations. Run the fixture tests against dev and production with the host app's three-browser configuration.

The imported Button recipe places its transparent border on the variants that need it, rather than its shared base. This prevents the base utility from overriding the outline border token without adding a runtime class merger.

## Composition contract batch

The second batch adds Alert, Badge, AspectRatio, Breadcrumb, ButtonGroup, Label, Skeleton, Spinner, Table and Textarea. All are local generated implementations. The total is 26 mapped primitives plus local IconButton. Sources are pinned in the Base Nova snapshot, with native adaptations and limitations recorded in the support matrix.

```vue
<script setup lang="ts" vapor>
import {ref} from 'vue'
import {Card,Grid,Textarea,Button,ButtonGroup,Spinner,Badge,Table} from './ui'
const notes=ref('')
</script>
<template>
  <Card><form @submit.prevent="/* connect application logic */ undefined">
    <Grid gap="lg">
      <Textarea v-model:value="notes" name="notes" required :max-length="500">Notes</Textarea>
      <ButtonGroup label="Form actions">
        <Button type="submit"><Spinner aria-hidden="true"/>Save</Button>
        <Button type="reset" variant="outline">Reset</Button>
      </ButtonGroup>
    </Grid>
  </form></Card>
  <Table>
    <template #caption>Invoices</template>
    <template #head><tr><th scope="col">Status</th></tr></template>
    <tr><td><Badge variant="secondary">Paid</Badge></td></tr>
  </Table>
</template>
```

Textarea's default slot is its native label. It exposes `v-model:value`, input/change notifications, native form reset, disabled/required/readOnly, rows/cols, minLength/maxLength, placeholder/id/autocomplete/name. `classes.control`, `styles.control` and typed state overrides target the control independently. Native validity is recorded as `invalid`; the Nova recipe paints errors when the application supplies `aria-invalid="true"`, so untouched required controls are not immediately painted as errors. `field-sizing-content` enhances compatible browsers; rows/min-height remain native fallbacks.

ButtonGroup requires `label` (emitted as aria-label); orientation is horizontal or vertical. Its direct local Button children keep their shared recipes; group CSS only joins corners/borders and raises focused buttons. Breadcrumb's `label` defaults to Breadcrumb and may be localized. Its default slot takes li/links/current-page markup. Label uses `htmlFor` or wraps one control. These names avoid framework ambiguity between native aria attributes and declared props.

Alert has title, icon and default description slots, with default/destructive variants. The icon is decorative and empty optional parts are hidden. Role alert does not guarantee that an initially rendered message is announced; the application controls insertion and updates. Badge is always a span, including its link presentation variant; use an anchor for navigation.

Table owns caption, thead, tbody, tfoot and a keyboard-focusable horizontal scroll container. Caption and default rows are required slots; head and foot are optional. Supply native tr/th/td with scope relationships. Every owned section has a style part; row/cell presentation comes from the table recipe's descendant selectors. Sorting/selection/virtualization are not included.

AspectRatio offers ratio=video/square/photo; custom numeric ratios use `styles.root.aspectRatio`. CSS aspect ratio is a preferred size, so oversized intrinsic content can grow the box. Skeleton is decorative aria-hidden content with no slot; size it with classes/styles. Spinner exposes a localized label and root/indicator parts. Their CSS pulse/spin stops under prefers-reduced-motion; the application owns loading lifecycle and aria-busy. These blocks do not need a new WAAPI preset.

Use `aria-hidden="true"` when Spinner decorates an already labeled Button, so the status label does not change the button’s accessible name. Standalone loading indicators keep their localized status label. Native keyboard navigation and scrolling follow browser/platform settings; no handlers override Safari’s button tab preference or scroll-key behavior.

The Vue emitter avoids writing an unchanged text value back after input. This matters for native minlength validation in Firefox/WebKit, which distinguish user edits from programmatic assignments. External value changes still synchronize; native reset restores the initial baseline.

Destructive Alert/Badge text mixes the destructive token with 30% foreground in oklab. This adapts the semantic hue toward the paired readable foreground across light/dark surfaces; Alert description inherits the same text color. The dashboard regression checks at least 4.5:1 text contrast in both host themes. Theme owners still control the actual tokens and can override every part recipe.

## Native form and content batch

The third batch adds Empty, Item, InputGroup, Kbd, Pagination, Typography, Direction, RadioGroup, Radio and Slider. The plugin now emits 37 local building blocks, including IconButton. Radio and Typography are local extensions; Direction uses HTML `dir` inheritance rather than a framework provider. The [support matrix](support.md) documents each adaptation's boundary.

```vue
<script setup lang="ts" vapor>
import {ref} from 'vue'
import {InputGroup,Icon,Kbd,RadioGroup,Radio,Slider,Button,Grid} from './ui'
const email=ref(''),volume=ref(50)
function selection(event:Event) {
  const radio=event.target as HTMLInputElement
  console.log(radio.value)
}
</script>
<template>
  <form><Grid gap="lg">
    <InputGroup id="email" name="email" type="email" v-model:value="email" required>
      Email
      <template #start><Icon aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 5h18v14H3zM3 5l9 8 9-8"/></svg></Icon></template>
      <template #end><Kbd>⌘ K</Kbd></template>
    </InputGroup>
    <RadioGroup name="delivery" @change="selection">
      <template #legend>Delivery</template>
      <template #default="{name}">
        <Radio :name="name" value="email" default-checked>Email</Radio>
        <Radio :name="name" value="sms">Text message</Radio>
      </template>
    </RadioGroup>
    <Slider name="volume" v-model:value="volume" :min="0" :max="100" :step="10">Volume</Slider>
    <Button type="submit">Save</Button>
  </Grid></form>
</template>
```

InputGroup owns one native text/email/password input, an associated label and inline start/end addons. Its id is required and must be unique. Addon actions remain separate from the label; the application disables those actions when appropriate. This adaptation does not generate textarea/block addons or addon click-to-focus behavior.

RadioGroup supplies its shared name through the default slot. Native radios own exclusivity, arrow keys, required validity and form reset. Read selection through change events or FormData; there is no independent checked model per Radio. `defaultChecked` establishes the mount-time native reset baseline. Slider retains one native range control, numeric update events and browser sanitization; no multi-thumb or vertical abstraction is generated. Optional incoming value does not make the native update event optional.

Empty owns visual title/media/description/action containers; callers supply heading semantics. Item is a noninteractive content row with independently styled parts; compose local actions in its slots. Its bounded media box centers icons and contains tall images. Pagination owns a labeled nav/list; callers supply li and links, destinations and aria-current. Typography styles supplied semantic HTML within a local wrapper; it is not the upstream Typeset CSS/API. Kbd displays a shortcut without registering it. Existing disclosure WAAPI and the protocol are unchanged.


## Form-control parity foundation

Input, Textarea, Checkbox, Radio, RadioGroup, Switch, Slider, NativeSelect, Field and Fieldset now adapt the pinned Base Nova recipes to their owned native DOM. Text controls use normal text weight; binary inputs expose separate decorative indicator parts, Switch exposes track/thumb, and NativeSelect exposes a decorative chevron. The underlying inputs still own form submission, selection, keyboard behavior, validity and reset. Forced colors restore native checkbox/radio/switch/select appearance and hide custom decorations.

Control labels are optional so Field can supply an external label. Pass `id`, `ariaLabel`, `ariaLabelledby`, `ariaDescribedby` and `ariaInvalid` to the primitive; the generated bindings target its input/select/textarea, rather than its enclosing label. `ariaInvalid` uses the HTML strings `"true"` and `"false"`. Field's invalid/disabled props affect presentation; the application also sets the actual control attributes. Native Fieldset `disabled` propagates to descendant controls.

Field owns root/content/label/description/error parts, with vertical, horizontal and responsive orientation. Its control slot supplies `id`; use descriptionId/errorId plus the matching control `aria-describedby` to connect help or validation text. Fieldset has an optional description and a legend/label legendVariant. These are compact local contracts, not the upstream compound component API.

Checkbox's optional `indeterminate` property initializes and synchronizes the native property when that prop changes. Native activation clears it; an unrelated checked model update does not reapply it. The Vue emitter now tracks imperative bindings independently for this reason. Slider derives its fill percentage from the native sanitized value, respecting min/max, caller style overrides and RTL. It remains one native range input, without multiple thumbs or vertical mode.

Class output merges in order: CVA recipe, `classes.part`, then ordinary root `class`, using tailwind-merge. Root style follows part style. `unstyled` suppresses the recipe while retaining explicit overrides. This resolves width/hover utility conflicts consistently, including caller-sized Skeletons. Generated local consumers require Vue, CVA and tailwind-merge; they import no external component implementation.

The neutral-token integration page is `tests/integration/html-ui-form-parity.vue`; its browser regressions cover geometry, glyph masks, light/dark checked surfaces, native interaction/reset, label/error connections, forced colors and mobile overflow. NativeSelect remains distinct from the custom Select contract. Portable custom Select and shared positioning are documented below; Calendar, split panes, toast stacks and other audit gaps remain tracked in the support matrix.

Validation for this batch: 70 producer → Vapor → theme outputs compile/typecheck; 166 plugin tests and strict generated consumers pass. Converter Go/race/vet, 79 compiler tests, four type checks and 48 browser checks pass. Nuxt nightly dashboard typecheck/build and 165 browser checks pass across Chromium, Firefox and WebKit (three workers). One existing Chromium menu-focus check failed once at higher parallel load; five isolated repeats and the final full suite passed. Native reset fill assertions wait for the model synchronization turn. Desktop dark and 390px mobile previews were inspected; the source design detector reported no findings.


## Portable Select contract

Select maps the separate `select-list` producer. NativeSelect continues to map the original `select`. Both remain local generated components. Standalone CLI emission resolves a unique plugin mapping from the incoming primitive; direct same-name mappings take precedence only when their primitive matches. Library emission selects the explicit plugin component.

```vue
<script setup lang="ts" vapor>
import {ref} from 'vue'
import {Select} from './ui'
const status=ref('draft')
</script>
<template>
  <Select id="status" popup-id="status-options" name="status" v-model:value="status"
    :classes="{trigger:'w-full',option:'rounded-none'}" :styles="{popup:{maxHeight:'12rem'}}">
    Status
    <template #options>
      <option value="draft">Draft</option>
      <optgroup label="Public"><option value="published">Published</option></optgroup>
      <option value="archived" disabled>Archived</option>
    </template>
  </Select>
</template>
```

The required unique `id` names the visible trigger; `popupId` names the owned listbox. Labels may be supplied through the default slot, Field, or control-targeted ARIA props. The native select proxy owns value, required validity, disabled inheritance, FormData and reset. `options` accepts native text options/optgroups; the adapter clones one owned option prototype, including its recipe/classes/styles. It does not export a separate SelectItem component. Dynamic options, external model updates and labels synchronize. Initial model selection establishes the native reset baseline.

Public presentation axes are `size: default | sm`, `side: bottom | top` and `align: start | center | end`. The local `ui-position.ts` helper honors recipe/caller size limits, aligns in RTL, flips and bounds the top-layer popup, tracks scrolling/resizing and restores its owned geometry on disposal. It is shared by Select, Popover and flat menus; Tooltip retains its existing behavior. Focus stays on the trigger with aria-activedescendant. Arrows/Home/End navigate enabled choices, Enter/Space/click commit, Escape cancels, Tab commits and leaves, and typing finds text matches.

Scope: one string value, text option content and native optgroups. No editable search, multiple selection, virtualization, item-aligned popup, async loading policy or upstream compound API. Combobox/Command now use separate searchable contracts with shared option projection; see the searchable primitives section below. The neutral light/dark fixture is `tests/integration/html-ui-select-parity.vue`. Use a normal text readout for reactive model diagnostics inside a resetting form: native `<output>` reset replaces its text nodes and can invalidate Vapor's text binding.

Select batch verification (2026-09-30): 185 plugin tests, all 71 declaration-mode catalog outputs and strict plugin consumers pass; invalid Select IDs/placement/value/part overrides are rejected. Installed `/usr/local/bin/html-ui` SHA-256 matches the rebuilt producer and its standalone select-list → Vapor → shadcn pipeline compiles. Producer Go/race/vet and 54 browser checks pass; converter Go/race/vet, 80 compiler tests, four type checks and 48 browser checks pass. Nuxt nightly typecheck/build and 213 production browser checks pass across Chromium, Firefox and WebKit with three workers. Review verified native reset/model behavior and identified the external-label observer fix and stale docs; the final checks include those changes. The previous delayed menu-toggle focus race now has a deterministic regression and preserves navigation. The final source design scan reports no findings. Preview: `http://127.0.0.1:4343/html-ui-select-parity`.

## Searchable primitives

Combobox and Command now map `combobox-list` and `command-list` instead of the legacy datalist primitive. Both generate one local component plus its editable recipe. `ui-interaction.ts` contains the shared option projection and searchable controller; Combobox also reuses `ui-position.ts`. No Base UI, cmdk, Floating UI or other external UI implementation is imported.

```vue
<script setup lang="ts" vapor>
import {ref} from 'vue'
import {Combobox,Command,Dialog} from './ui'
const framework=ref('nuxt')
const runAction=(value:string)=>{ /* application logic */ }
</script>
<template>
  <Combobox id="framework" popup-id="framework-options" name="framework"
    v-model:value="framework" placeholder="Search frameworks…"
    :classes="{option:'aria-disabled:opacity-70'}"
    :styles="{popup:{maxHeight:'12rem'}}">
    Framework
    <template #options>
      <option value="" hidden>Choose a framework</option>
      <option value="nuxt">Nuxt</option>
      <optgroup label="Alternatives">
        <option value="astro" data-keywords="stars static">Astro</option>
        <option value="next" disabled>Next.js</option>
      </optgroup>
    </template>
  </Combobox>
  <Command id="actions" popup-id="action-list" @select="runAction">
    Actions
    <template #options>
      <optgroup label="Reports">
        <option value="new" data-keywords="create">New report</option>
        <option value="export">Export report</option>
      </optgroup>
    </template>
  </Command>
</template>
```

The required `id` names the visible input; `popupId` names the listbox. They must be unique and distinct. Supply an owned label, external label or `ariaLabel`/`ariaLabelledby`. Optional `ariaDescribedby`, `ariaInvalid` and `emptyText` remain typed. Combobox adds `side=bottom/top` and `align=start/center/end`. Every owned root/label/control/surface/input/icon/popup/option/empty part accepts classes/styles, including the repeated option prototype. Selector classes such as `aria-disabled:opacity-70` change a state's style; search/selection behavior stays with the adapter. The generated Vue declaration adds the narrowly typed native option `data-keywords` attribute for strict consumers.

Native option/optgroup text supplies labels and stable string values. Filtering is case/diacritic-insensitive substring matching of query words against labels and optional space-separated `data-keywords`; it preserves option order. Groups with no matching items hide. Disabled and hidden options/groups cannot activate. The prototype supplies styles to projected rows; rich interactive option children are excluded.

Combobox query text is separate from the committed native selection and does not submit or mutate `v-model:value`. Arrow keys navigate with focus on the input; Enter/pointer choice commits. Escape, Tab, blur and light dismissal cancel uncommitted search and restore the selected label. Home/End, horizontal arrows, Space and IME retain native editing behavior. Reset restores the mount-time selection; required validation focuses the visible input, and fieldset/inert state tracks ancestor changes and relocation. An external model update restores the matching label and unfiltered options. Clearing the model from application logic clears the selection.

Command is an inline listbox. `@select` receives a string on every activation, including the same action twice; changed native values also emit the existing input/change and model notifications. Search text remains unchanged by activation. Escape clears the query while allowing a surrounding native Dialog to handle Escape. Compose Command inside the generated Dialog for a palette; application logic owns action dispatch, dialog lifecycle and global shortcut registration. Command has no submitted field name or required form constraint.

Scope: single string values, native option/optgroup data, flat text rows and synchronous filtering. No free-text committed values, chips/multiple selection, virtualization, fuzzy ranking, async loading policy, registered keyboard shortcuts or upstream compound API. Native datalist primitives remain available through the producer's legacy catalog. Preview fixture: `tests/integration/html-ui-search-parity.vue`; generated dashboard preview: `http://127.0.0.1:4343/html-ui-search-parity`.

Searchable batch verification (2026-09-30): 202 plugin tests pass; all 73 declaration-mode catalog outputs compile/typecheck, and strict generated-library consumers accept the searchable API while rejecting invalid IDs, placement and event types. Producer Go/race/vet and 54 native browser checks pass. The generated dashboard passes Nuxt nightly typecheck/build and all 246 production browser checks across Chromium, Firefox and WebKit, including Select scroll preservation and Combobox current-choice preservation. Independent architecture review has no remaining Important/Critical findings. The converter needed no changes. Installed CLI verification (2026-10-01): `/usr/local/bin/html-ui` SHA-256 matches the rebuilt producer, lists all 73 primitives including `combobox-list` and `command-list`, and regenerates the complete dashboard library with zero differences.


## Hover overlays

Tooltip and HoverCard generate compact local components and editable recipes. HoverCard maps the producer's existing `preview-card`; no producer or Vue converter changes are needed. Libraries now expose 70 building blocks, including IconButton. Both reuse the one local `ui-position.ts` helper, with `side: top | bottom | left | right`, `align: start | center | end`, viewport flipping/clamping, RTL logical alignment on vertical sides, scroll/resize tracking and caller size caps. Left/right are physical sides. Native top-layer presentation prevents ancestor overflow clipping.

```vue
<Tooltip id="publish-tip" side="top" :close-delay="200" variant="outline">
  <template #trigger>Publish report</template>
  Share this report with your workspace.
</Tooltip>
<HoverCard id="profile-preview" :open-delay="120" side="bottom" variant="link">
  <template #trigger>@korestack</template>
  <p>Optional profile details.</p>
  <a href="/profile">View profile</a>
</HoverCard>
```

Unique `id` is required. Both support typed numeric `openDelay`, `closeDelay` and `sideOffset` (milliseconds for delays, CSS pixels for offset). Negative values clamp to zero; non-finite values use defaults. Tooltip defaults to immediate hover opening and 200ms close grace, matching the pinned provider's immediate-opening intent; HoverCard defaults to 600ms opening and 300ms close grace. Offset defaults to 4px. Keyboard focus opens immediately. Hovering the popup cancels closure; close grace permits crossing the trigger gap. Leaving all pointer/focus targets dismisses. Escape dismisses and latches until a new hover/focus interaction; a focused HoverCard link returns focus to its button. Within Dialog, the first Escape dismisses the open overlay, and a later Escape reaches the native dialog.

Tooltip retains `aria-describedby` and noninteractive text content. While mounted its reviewed adapter promotes the owned descriptive div into a manual native popover, restores the original attribute/hidden state on disposal, and never focuses content. Its native `hidden` prop remains initial visibility metadata; the adapter owns interactive visibility. Its arrow is an editable CSS `::after` decoration on the tooltip part. Overlong descriptions switch the default visible-overflow recipe to native scrolling inside the bounded popup; the exterior arrow is clipped for that case. Short content restores visible overflow. Caller-selected hidden/auto/scroll overflow is respected, and later inline edits are preserved. HoverCard retains its native auto-popover and button invocation, with click/touch fallback and normal focus order for content. Essential content/actions must remain available elsewhere; previews are supplementary. Touch pointer entry does not schedule hover.

Native disabled/fieldset inheritance, `aria-disabled` and inert ancestry block opening and dismiss open overlays, including after DOM relocation. Timers, document observers, event listeners and position ownership dispose with the Vue scope. Classes/styles/unstyled remain available for all owned parts; caller-edited style values are preserved by the positioning helper. No provider, global warmup policy, controlled-open model, polymorphic link trigger, safe-polygon cursor tracking or external popup implementation. Tooltip text remains noninteractive; use HoverCard or Popover for interactive content. Preview: `http://127.0.0.1:4343/html-ui-hover-parity`.

Hover batch verification (2026-10-01): 222 plugin tests and all 282 production dashboard checks pass across Chromium, Firefox and WebKit. Strict generated consumers, plugin typecheck/build and Nuxt nightly typecheck/build pass. Support/gallery artifacts are current, and installed `/usr/local/bin/html-ui` regeneration reports zero differences. Independent review findings for caller attribute ownership, reactive IDs and long tooltip text are covered by passing regressions.
