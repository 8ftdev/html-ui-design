# html-ui-shadcn

A pipeable styling and UI-contract plugin generator for locally owned html-ui Vue components. Choose declaration recipes for local CSS or `--plugin shadcn-ui` for typed CVA/Tailwind recipes. Vue/Vapor is supported; React is not yet supported.

## Build and run

Requires Node >=22.12.0 and Bun for development.

```sh
bun install --frozen-lockfile
bun run build
html-ui accordion | html-ui-to-vue-vapor | node ./dist/cli.js --framework vue --theme ./theme.css > Accordion.vue
```

Use `--config ./components.json` to find its `tailwind.css` stylesheet, or omit both flags to find the nearest components.json from your working directory. Both shadcn and shadcn-vue configurations are accepted. Run `npm install -g .` only if you want the `html-ui-shadcn` command on PATH; building does not install it globally.

The application must load its theme stylesheet. Generated components retain `var(--primary)`, `var(--primary-foreground)`, `var(--ring)`, and other references, so dark mode and later token changes work without regeneration. Legacy HSL-channel themes use `hsl(var(--token))`.

This tool provides html-ui recipes using shadcn's token vocabulary. It does not install official shadcn components, copy their API, synthesize missing interaction adapters, or infer visual presets from `components.json.style`.

Select and NativeSelect use separate producer contracts. Generate the portable styled Select with:

```sh
html-ui select-list | html-ui-to-vue-vapor | node ./dist/cli.js --framework vue --plugin shadcn-ui --theme ./theme.css > Select.vue
```

Use `html-ui select` for the NativeSelect alternative. The plugin resolves each primitive to its unique mapping. See [the compact Select contract](docs/plugins.md#portable-select-contract) for the typed options slot, form behavior and local styles.

## Part/state overrides

Pass `--recipes recipes.json`:

```json
{
  "components": {
    "button": {
      "root": {
        "state": {
          "disabled": { "opacity": "0.6", "cursor": "not-allowed" }
        }
      }
    }
  }
}
```

Overrides use CSS declaration objects. They merge by property within a branch. Use `{ "mode": "replace", "value": { "opacity": "0.3" } }` to replace a branch, `{ "mode": "omit" }` to remove it, or `unstyled: true` on a part to skip its defaults while retaining explicit overrides. See [recipe rules](docs/recipes.md).

In declaration mode, these are generation-time overrides. The original exported styling types remain available, but declaration mode does not add a runtime `classes` prop or compile arbitrary runtime Tailwind strings. Change recipes and regenerate for structural styling changes.

## Compatibility and CSS ownership

Input must conform to the [generated Vue profile](docs/profile.md). All 76 catalog entries compile and typecheck in declaration mode. Class-plugin coverage is listed in [the support matrix](docs/support.md). Native behavior remains in the producer; reviewed local interaction helpers satisfy selected adapter-required profiles. Accordion owns details/summary/content and has no native disabled state; tabs owns root/list only.

The stylesheet uses the `html-ui` cascade layer and native scoped selectors. The initial layer-order statement is `theme, base, html-ui, components, utilities`; host stylesheets should establish the same order before declaring layers. Unlayered CSS intentionally takes precedence. A second unlayered reset can therefore override the recipes. A second theme provider must not redeclare the same variables with incompatible color formats. Keep one reset/theme owner when combining Tailwind and UnoCSS. The dashboard integration documents the concrete fix for its duplicate reset and theme.

## Verification

```sh
bun run check
bun run test
bun run build
bun run test:catalog
bun run test:plugins
bun run test:dashboard:generate
```

The catalog test builds sibling producer/converter sources; override `HTML_UI_SOURCE` and `HTML_UI_VUE_SOURCE` for other checkout paths. Dashboard generation uses `HTML_UI_DASHBOARD`, `HTML_UI_BIN`, and `HTML_UI_VUE_BIN` when supplied. It writes generated fixture components and a route only in the selected dashboard, refuses unrelated existing files, and never edits theme/build configuration. See [verification](docs/verification.md).

After generation, run the dashboard's `check`, `build`, and `test` scripts from its repository root. stdout contains only the generated SFC; warnings/errors go to stderr. Failures have nonzero exit status and no partial SFC output. Shell redirection can still truncate a destination before the CLI starts; use a temporary output file when replacing valuable source.

## UI contract plugins (Vue/Vapor)

Use `--plugin shadcn-ui` to emit typed CVA/Tailwind recipes on local html-ui implementations. Use `--out-dir` to generate the shared local library, with recipe/metadata companions. Tailwind and CVA are allowed dependencies; external component implementations are not used. See [plugin usage and custom contracts](docs/plugins.md), [support matrix](docs/support.md), and [source notices](docs/THIRD-PARTY-NOTICES.md).

The class plugin currently emits 71 building blocks (70 mappings plus local IconButton). Accordion and Collapsible optionally share a local WAAPI disclosure helper; motion recipes and the native batch are documented in [plugin usage](docs/plugins.md#native-contract-batch-and-motion).


Calendar and DatePicker share `date-grid`; select the plugin component explicitly for standalone output:

```sh
html-ui date-grid | html-ui-to-vue-vapor | html-ui-shadcn --framework vue --plugin shadcn-ui --component calendar > Calendar.vue
html-ui date-grid | html-ui-to-vue-vapor | html-ui-shadcn --framework vue --plugin shadcn-ui --component date-picker > DatePicker.vue
```

NativeDatePicker keeps the original `date-field` alternative. See [date contracts](docs/plugins.md#calendar-and-datepicker) for ISO models, labels, keyboard behavior and scope.
