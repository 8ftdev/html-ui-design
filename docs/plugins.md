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
