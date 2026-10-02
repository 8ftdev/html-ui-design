# html-ui-design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Generate shadcn-token-styled Vue components from html-ui v2 framework output and prove the complete pipeline works in the Korestack Nuxt Vapor dashboard.

**Architecture:** Parse the existing Vue SFC profile without evaluating code. Resolve token dependencies and declaration recipes, compile native state selectors, and append scoped CSS while preserving behavior and metadata. The dashboard consumes the actual built output as the final integration gate.

**Tech Stack:** TypeScript CLI on Node 22.12+, Bun for development tests, Vue compiler-sfc/compiler-dom, Babel TypeScript parser, PostCSS with a CSS value parser, Playwright. Pin direct package versions and commit a lockfile when a repository is established; use Vue 3.6.0-rc.9 for the initial conformance toolchain.

**Spec:** [Approved specification](./html-ui-design-spec.md).

## Global constraints

- New project: `/Users/andi/webdev/html-ui/html-ui-design`.
- First supported framework flag is `--framework vue`; React is outside this milestone.
- Keep default html-ui contract version 2 and the existing Vue converter compatible.
- No evaluation of input modules, project JavaScript, or theme-package JavaScript.
- Preserve native anatomy, behavior, slots, props, models, emitted events, and adapter-required warnings.
- CSS variables remain live theme references; do not bake resolved light-mode colors into components.
- Overrides are generation-time declaration recipes; no new runtime classes API is claimed.
- Output is a single Vue SFC. Do not add a styling runtime dependency to generated components.
- No system binary installation or dependency upgrades to the dashboard merely to pass tests.
- Dashboard target: `/Users/andi/webdev/korestack-web/apps/dashboard`; use its actual installed dependency versions and production Playwright configuration.
- Preserve the existing edit in `packages/ui/src/components/ui/tabs/navbar-expand-tabs.tsx` and any subsequent user edits.
- Use scratch space under this chat's `work/` if filesystem approval is needed; final source belongs in the authorized new project. Never copy a stale snapshot over an existing project.

## Review focus

1. Nested identical components must not inherit another instance's state: selector tests and nested-disclosure browser checks in tasks 4 and 7.
2. Theme aliases may pass through package CSS, @theme, fallback values, and --alpha(): dependency-graph tests in task 3 and dashboard computed styles in task 7.
3. Malformed or adversarial literals must not execute or escape generated CSS/SFC blocks: parser and serialization rejection tests in tasks 1, 2, and 4.
4. Repeated transforms and two differently themed copies must preserve user styles and avoid marker collisions: task 5 and task 7.
5. Framework-level typecheck success may hide SSR/hydration failures: task 7 requires server HTML, hydration diagnostics, and post-hydration interactions without ClientOnly.

## File map

All paths below are relative to the new CLI project unless explicitly marked Dashboard.

| Files | Responsibility |
| --- | --- |
| `package.json`, `tsconfig.json`, `bun.lock`, `scripts/build.ts`, `src/cli.ts` | Reproducible build, installable Node entry point, arguments and streams |
| `src/model.ts`, `src/diagnostic.ts` | Shared typed contracts and located diagnostics |
| `src/vue/parse.ts`, `src/contract/literal.ts`, `src/contract/validate.ts`, `src/contract/style-types.ts` | SFC profile, literal decoding, v2/native validation, public type agreement |
| `src/theme/config.ts`, `src/theme/load.ts`, `src/theme/colors.ts` | Theme discovery, CSS import/alias graph, token representations |
| `src/recipes/preset.ts`, `src/recipes/resolve.ts`, `src/recipes/schema.ts` | Role defaults, component refinements, override grammar and resolution |
| `src/css/selectors.ts`, `src/css/emit.ts`, `src/vue/transform.ts` | Structural state selectors, cascade, source-preserving SFC edits |
| `src/transform.ts` | Orchestrate validation, theme resolution, recipes, and framework transformation |
| `tests/*.test.ts`, `tests/fixtures/`, `tests/support/` | Unit, CLI, compiler, type, and browser coverage |
| `scripts/generate-dashboard.ts` | Reproducible actual-binary pipeline and dashboard fixture generation |
| `README.md`, `docs/profile.md`, `docs/recipes.md`, `docs/verification.md` | Usage, boundaries, override schema, verification evidence |

## Shared interfaces

Define these in `src/model.ts`, extending internal implementation details without changing the responsibilities:

```ts
export type Declarations = Record<string, string>
export type StyleBranch = Declarations | { mode: 'replace'; value: Declarations } | { mode: 'omit' }
export interface PartRecipe { base?: StyleBranch; state?: Record<string, StyleBranch>; unstyled?: boolean }
export interface RecipeOverrides { components?: Record<string, Record<string, PartRecipe>> }
export type StateSource = { node: string } & (
  | { pseudo: string }
  | { attribute: string; present: boolean }
  | { attribute: string; value: string }
)
export interface UIPart { node: string; styleRole: string; state?: Record<string, { source: StateSource }> }
export interface UIContract {
  component: string
  behavior: { kind: 'native' | 'adapter-required'; requirements: string[] }
  parts: Record<string, UIPart>
}
export interface OwnedNode { part: string; node: string; tag: string; parent: string | null; attributes: Record<string, string>; start: number; end: number }
export interface VueInput { source: string; filename: string; ui: UIContract; nodes: OwnedNode[] }
export interface Theme { token(name: string, kind: 'color' | 'value'): string; files: string[] }
export interface ResolvedPart { base: Declarations; state: Record<string, Declarations> }
export interface TransformOptions { framework: 'vue'; themePath: string; recipes?: RecipeOverrides; strict: boolean }
export interface TransformResult { source: string; warnings: string[] }
```

Function boundaries:

```ts
parseVue(source: string, filename: string): VueInput
validateContract(input: VueInput): void
loadTheme(path: string): Promise<Theme>
resolveRecipes(input: VueInput, theme: Theme, overrides: RecipeOverrides, strict: boolean): { parts: Record<string, ResolvedPart>; warnings: string[] }
emitCSS(input: VueInput, parts: Record<string, ResolvedPart>, marker: string): string
transformVue(input: VueInput, css: string, marker: string): string
transform(source: string, options: TransformOptions): Promise<TransformResult>
```

### Task 1: CLI package and stream contract

**Files:** package/build configuration, `src/cli.ts`, `src/model.ts`, `src/diagnostic.ts`, `tests/cli.test.ts`.

- [ ] Record project existence, upstream binary paths/hashes, dashboard Git status, and installed toolchain. Create the project only if absent; retain baseline evidence in `work/`.
- [ ] Add a test for argument rejection before any source is emitted:

```ts
test('rejects a conflicting theme source without stdout', () => {
  const result = spawnSync(process.execPath, ['dist/cli.js', '--framework', 'vue', '--theme', 'a.css', '--config', 'components.json'], { input: '<template/>', encoding: 'utf8' })
  expect(result.status).not.toBe(0)
  expect(result.stdout).toBe('')
  expect(result.stderr).toContain('--theme')
})
```

- [ ] Run `bun test tests/cli.test.ts`; confirm failure reflects the missing implementation.
- [ ] Implement help/version, required framework, single-value flags, duplicates/conflicts, stdin reading and buffered stdout. Provide config discovery independently of current input text. Catch located errors once at the CLI boundary.
- [ ] Build `dist/cli.js` with a Node shebang and package bin mapping. Use normal runtime package dependencies, not dependencies accidentally resolved through the sibling converter.
- [ ] Run CLI tests for empty input, unknown framework, missing flag values, duplicate flags, absent config, help/version, and broken output stream handling. Verify the packed package entry point in a temporary install.

### Task 2: Parse and validate the generated Vue profile

**Files:** `src/vue/parse.ts`, `src/contract/*`, `tests/contract.test.ts`, `tests/fixtures/`.

- [ ] Capture button, accordion, input, and autocomplete SFCs from the rebuilt upstream binaries as fixtures, retaining native/adapter-required diagnostics separately.
- [ ] Add rejection and graph tests:

```ts
test('does not accept executable ui metadata', () => {
  const source = accordion.replace('export const ui = {', 'export const ui = (() => { throw new Error("executed") })() || {')
  expect(() => validateContract(parseVue(source, 'Accordion.vue'))).toThrow(/literal/)
})
test('summary expanded references details', () => {
  const input = parseVue(accordion, 'Accordion.vue')
  validateContract(input)
  expect(input.ui.parts.trigger.state?.expanded.source).toEqual({node: 'root', attribute: 'open', present: true})
})
```

- [ ] Confirm red tests, then use Vue parsing for SFC/template locations and Babel's TypeScript AST for literal exports and style type declarations. Reject unsupported executable literal shapes without evaluation.
- [ ] Validate exact node/part coverage, rooted owned tree, duplicate object keys, null values, unexpected fields, native state applicability, disabled semantics, and equivalent generated style types. Preserve original source offsets for edits.
- [ ] Test missing/duplicate markers, forged state types, dynamic markers, owned-node v-if/v-for/teleport, conflicting versions, malformed SFCs, and script/style terminator payloads. Reject ambiguous anatomy; do not silently skip nodes.
- [ ] Run `bun test tests/contract.test.ts` and project type-check.

### Task 3: Load the actual theme and resolve token dependencies

**Files:** `src/theme/*`, `tests/theme.test.ts`, CSS/package fixtures.

- [ ] Add tests for config-relative paths and a local package CSS export supplying a palette alias:

```ts
test('keeps a semantic reference through package palette imports', async () => {
  const theme = await loadTheme(packagePaletteFixture)
  expect(theme.token('primary', 'color')).toBe('var(--primary)')
  expect(theme.files.some(path => path.endsWith('palette.css'))).toBe(true)
})
test('wraps legacy channel values', async () => {
  const theme = await loadTheme(legacyThemeFixture)
  expect(theme.token('primary', 'color')).toBe('hsl(var(--primary))')
})
```

- [ ] Confirm red, then implement config discovery, shadcn/shadcn-vue field compatibility, CSS parsing and local/package CSS import resolution. Resolve packages from the theme project. Skip unrelated remote font imports; reject unresolved required remote token dependencies.
- [ ] Model declarations across selectors and @theme; traverse var aliases with fallbacks and cycle detection. Preserve modern colors and recognized host-compiled --alpha expressions. Detect inconsistent legacy/full-color representations across themes.
- [ ] Test import cycles, alias cycles, missing token with/without fallback, conditional definitions, package exports, layered declarations, radius calculations, missing files, and cssVariables false. Require only recipe-used tokens.
- [ ] Load the real dashboard theme and verify its primary, foreground, border, input, ring, and radius dependencies. This is a read-only test; do not rewrite the theme.

### Task 4: Resolve recipes and compile exact native state selectors

**Files:** `src/recipes/*`, `src/css/*`, `tests/recipes.test.ts`, `tests/selectors.test.ts`.

- [ ] Add a merge regression distinguishing property merge from whole-branch replacement:

```ts
test('disabled override keeps default cursor until branch replacement', () => {
  const overrides = {components:{button:{root:{state:{disabled:{opacity:'0.4'}}}}}}
  const result = resolveRecipes(buttonInput, theme, overrides, true)
  expect(result.parts.root.state.disabled.opacity).toBe('0.4')
  expect(result.parts.root.state.disabled.cursor).toBe('not-allowed')
})
```

- [ ] Confirm red, then provide documented defaults for all current catalog style roles. Use token references for colors/radius and a consistent documented spacing/type scale; preserve native display/visibility semantics. Specialize button, accordion, and input recipes.
- [ ] Implement declaration validation and recursive recipe precedence with merge, replace, omit, and unstyled. Reject unknown part/state paths, invalid declaration grammar, and incompatible override values.
- [ ] Generate native conditions from the explicit owned tree, using direct combinators and anchored :has for cross-node conditions. Escape all CSS identifiers/attribute values; no input string may terminate the style block.
- [ ] Emit shared ordered state layers, hover media gating, and disabled exclusion using that part's declared disabled source. Do not infer disabled on accordion or treat busy/inert as disabled.
- [ ] Test same-node, ancestor, descendant, sibling, attribute absence, aria-disabled false, nested identical trees, and invalid source references. Assert computed behavior later, not just string snapshots.
- [ ] Test unknown roles in normal/strict mode and verify override unknown keys do not disappear silently.

### Task 5: Apply styles without changing Vue behavior

**Files:** `src/vue/transform.ts`, `src/transform.ts`, `tests/transform.test.ts`, `tests/cli.test.ts`.

- [ ] Add an idempotence test and preserve pre-existing style content:

```ts
test('a repeated transform is byte-stable', async () => {
  const first = await transform(accordion, options)
  const second = await transform(first.source, options)
  expect(second.source).toBe(first.source)
})
```

- [ ] Confirm red, then derive deterministic recipe markers from normalized resolved recipes/anatomy. Use parser offsets to add static markers and an owned scoped style block. Strip only verified tool-owned additions before repeat transformation.
- [ ] Preserve both script blocks and template binding/event/slot expressions byte-for-byte outside the required insertions. Preserve arbitrary pre-existing style blocks. Reject forged/conflicting reserved ownership markers.
- [ ] Wire the CLI to the complete transform. Ensure errors never write partial SFC output and warnings never appear on stdout.
- [ ] Test changed themes/recipes, two variants of one primitive, unstyled output, existing classes and styles, different SFC block orders, and renamed exported component types.

### Task 6: Catalog conformance and installable release artifact

**Files:** `tests/compiler.test.ts`, `tests/types.test.ts`, `tests/support/`, docs and examples.

- [ ] Build upstream binaries from their current source and enumerate `html-ui --list`. Use `execFile` argument arrays and explicit stdin between stages; never shell-interpolate contract text.
- [ ] Generate, theme, compile, and type-check all 37 SFCs. Compare preserved ASTs for scripts/behavior and metadata; allow only owned markers and style insertion.
- [ ] Add public type consumers exercising valid overrides and `@ts-expect-error` for fictional accordion disabled/content parts. Do not add permissive index signatures or broad ignore directives to make checks pass.
- [ ] Verify Vapor and ordinary generated Vue SFC profiles with the appropriate compiler pipeline. Preserve adapter-required warnings in integration output.
- [ ] Write README examples, theme requirements, recipe JSON schema, supported profile, installation instructions, and test commands. Clearly state no React emitter or runtime classes prop in this release.
- [ ] Build/pack and run the installed CLI from a temporary consumer directory against the fixture theme, ensuring dependencies resolve without sibling node_modules leakage.

### Task 7: Final Nuxt dashboard gate

**Files:** `scripts/generate-dashboard.ts` in CLI; Dashboard `app/components/html-ui-generated/*.vue`, `app/pages/html-ui-contract-check.vue`, `tests/html-ui-contract.spec.ts`; add only needed documented script hooks.

- [ ] Record dashboard baseline `check`, `build`, and existing `test` output before adding fixtures. Current tests directory is empty; record that accurately instead of treating an empty suite as a passing compatibility test.
- [ ] Implement fixture generation using actual built binaries and the dashboard's components.json. Store an explicit import map covering every generated component. Produce a reproducible route with valid per-component slots/props; do not invent behavior for adapter-required primitives.
- [ ] Use native Vapor imports and the existing app shell. Keep harness styling local and use the repository's named theme utilities. Do not modify the user's tabs file.
- [ ] Add Playwright tests with runtime error capture before navigation:

```ts
test('accordion hydrates and remains native', async ({page}) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (/hydration|mismatch/i.test(message.text())) errors.push(message.text())
  })
  await page.goto('/html-ui-contract-check')
  const root = page.locator('[data-testid="accordion-case"] details').first()
  await root.locator(':scope > summary').click()
  await expect(root).toHaveAttribute('open', '')
  expect(errors).toEqual([])
})
```

- [ ] Add server-HTML assertions, slot/model/event checks, keyboard activation, button disabled/focus/hover checks, native input states, and nested accordion state isolation. Avoid checking only attribute presence when a computed style or behavior is the actual requirement.
- [ ] Compare computed foreground/background/focus/state styles against theme probe elements. Toggle `.dark` and override a semantic CSS variable at runtime; verify styles update without regenerating components.
- [ ] Run the required real-project commands from the Korestack root:

```sh
bun --filter @korestack/dashboard check
bun --filter @korestack/dashboard build
bun --filter @korestack/dashboard test
```

- [ ] Diagnose failures at their responsible producer/converter/theme stage. Fix generated output at the source, regenerate, and rerun affected checks. Do not edit generated files by hand, disable SSR, or use ClientOnly to conceal integration failures.
- [ ] Record installed Nuxt/Vue versions, test counts, browser results, baseline issues, and any remaining limitations. Save a themed Accordion.vue and verification report under the chat's outputs directory.

### Task 8: Final review and delivery

- [ ] Request one independent code review covering the approved specification, malformed inputs, scope isolation, and actual integration evidence. This review is explicitly prescribed by the requesting-code-review skill; it does not delegate implementation.
- [ ] Address material findings, rerun affected tests, and inspect final diffs for unintended project changes.
- [ ] Copy verified source from scratch only if scratch was necessary, using guards against changed destination files. Verify the final installed project source produces the same tested artifacts.
- [ ] Report how to build/run the CLI, the exact verified pipeline, and dashboard compatibility evidence. Do not claim untested framework support, complete adapter-required behavior, or successful checks that did not run.

## Execution recommendation

Use native execution in this chat, with one independent review at the end. The parsing, recipe, and selector modules share a compact set of interfaces, and the final dashboard gate is sequential. This avoids repeated agent context setup while preserving a separate final review.

Status: plan written and self-reviewed; implementation has not started.
