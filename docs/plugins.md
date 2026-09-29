# UI contract plugins

A plugin supplies typed variants and class recipes to local html-ui primitives. It does not install Base UI/Radix components or implement missing behavior. Vue/Vapor is the first backend. Tailwind CSS 4 and class-variance-authority 0.7.1 are consumer styling dependencies; the generator does not compile utility CSS.

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

Classes are additive; neither CVA nor this generator promises last-class-wins or resolves Tailwind conflicts. For a full replacement edit the recipe, select a custom plugin, or use `unstyled` with your own classes. State utility variants stay in the recipe and the consuming Tailwind build. No runtime nested `classes.state` API is claimed in this release.

## Building blocks

- Button: variant, size, disabled, type, ariaLabel, default content, click event.
- Input: enclosing label/default slot, text/email/password type, id, autocomplete, placeholder, required, disabled, `v-model:value`.
- Checkbox: enclosing label/default slot, native checked/disabled/required, `v-model:checked`.
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

Textarea's default slot is its native label. It exposes `v-model:value`, input/change notifications, native form reset, disabled/required/readOnly, rows/cols, minLength/maxLength, placeholder/id/autocomplete/name. `classes.control`, `styles.control` and typed state overrides target the control independently. Native validity is recorded as `invalid`; the class recipe uses `user-invalid` so untouched required controls are not immediately painted as errors. `field-sizing-content` enhances compatible browsers; rows/min-height remain native fallbacks.

ButtonGroup requires `label` (emitted as aria-label); orientation is horizontal or vertical. Its direct local Button children keep their shared recipes; group CSS only joins corners/borders and raises focused buttons. Breadcrumb's `label` defaults to Breadcrumb and may be localized. Its default slot takes li/links/current-page markup. Label uses `htmlFor` or wraps one control. These names avoid framework ambiguity between native aria attributes and declared props.

Alert has title, icon and default description slots, with default/destructive variants. The icon is decorative and empty optional parts are hidden. Role alert does not guarantee that an initially rendered message is announced; the application controls insertion and updates. Badge is always a span, including its link presentation variant; use an anchor for navigation.

Table owns caption, thead, tbody, tfoot and a keyboard-focusable horizontal scroll container. Caption and default rows are required slots; head and foot are optional. Supply native tr/th/td with scope relationships. Every owned section has a style part; row/cell presentation comes from the table recipe's descendant selectors. Sorting/selection/virtualization are not included.

AspectRatio offers ratio=video/square/photo; custom numeric ratios use `styles.root.aspectRatio`. CSS aspect ratio is a preferred size, so oversized intrinsic content can grow the box. Skeleton is decorative aria-hidden content with no slot; size it with classes/styles. Spinner exposes a localized label and root/indicator parts. Their CSS pulse/spin stops under prefers-reduced-motion; the application owns loading lifecycle and aria-busy. These blocks do not need a new WAAPI preset.

Use `aria-hidden="true"` when Spinner decorates an already labeled Button, so the status label does not change the button’s accessible name. Standalone loading indicators keep their localized status label. Native keyboard navigation and scrolling follow browser/platform settings; no handlers override Safari’s button tab preference or scroll-key behavior.

The Vue emitter avoids writing an unchanged text value back after input. This matters for native minlength validation in Firefox/WebKit, which distinguish user edits from programmatic assignments. External value changes still synchronize; native reset restores the initial baseline.

Destructive Alert/Badge text mixes the destructive token with 30% foreground in oklab. This adapts the semantic hue toward the paired readable foreground across light/dark surfaces; Alert description inherits the same text color. The dashboard regression checks at least 4.5:1 text contrast in both host themes. Theme owners still control the actual tokens and can override every part recipe.
