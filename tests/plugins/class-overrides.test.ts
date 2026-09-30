import { expect, test } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { baseParse, NodeTypes, type TemplateChildNode } from '@vue/compiler-dom';
import { compileScript, parse } from '@vue/compiler-sfc';
import { parse as parseJS } from '@babel/parser';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { normalizeClass, normalizeStyle } from 'vue';
import { applyClassPlugin } from '../../src/vue/class-plugin';
import { splitCompanions } from '../../src/library/companions';
import { fixture } from './schema.test';

// Evaluate the generated template's real bindings, including its extracted recipes.
// Removing twMerge or reversing its arguments must break the literal expectations.
function generatedBindings(component: 'button' | 'input' | 'slider' = 'button', rootRecipe = true) {
  const source = execFileSync('.test-output/html-ui-to-vue-vapor', [], {
    input: execFileSync('.test-output/html-ui', [component]), encoding: 'utf8',
  });
  const plugin: any = structuredClone(fixture);
  const recipe = plugin.components.button.parts.root;
  recipe.base = ['inline-flex', 'w-full', 'h-8', 'hover:bg-red-500'];
  recipe.variants.size.lg = ['h-12', 'hover:bg-blue-500'];
  if (component !== 'button') plugin.components = {
    [component]: { primitive: component, slots: {}, requirements: [], parts: { root: recipe, control: recipe } },
  };
  if (!rootRecipe) delete plugin.components[component].parts.root;
  const output = applyClassPlugin(source, plugin, { component, filename: 'Override.vue' }).source;
  const companions = splitCompanions(output, 'Override');
  const recipeNames = [...companions.recipe.matchAll(/export const (uiRecipe\d+)/g)].map(m => m[1]);
  const recipes = new Function('uiCva', 'uiTwMerge', companions.recipe
    .replace(/^import .+$/gm, '').replace(/export const /g, 'const ') + `\nreturn { ${recipeNames.join(', ')} }`)(cva, twMerge);
  const bindings: Record<string, Record<string, string>> = {};
  function visit(children: TemplateChildNode[]) {
    for (const node of children) {
      if (node.type !== NodeTypes.ELEMENT) continue;
      const part = node.props.find(p => p.type === NodeTypes.ATTRIBUTE && p.name === 'data-ui-part');
      if (part?.type === NodeTypes.ATTRIBUTE && part.value) {
        bindings[part.value.content] = Object.fromEntries(node.props.flatMap(p =>
          p.type === NodeTypes.DIRECTIVE && p.name === 'bind' && p.arg?.type === NodeTypes.SIMPLE_EXPRESSION && p.exp?.type === NodeTypes.SIMPLE_EXPRESSION
            ? [[p.arg.content, p.exp.content]] : []));
      }
      visit(node.children);
    }
  }
  visit(baseParse(parse(companions.component).descriptor.template!.content).children);
  const setup = parse(companions.component).descriptor.scriptSetup!.content;
  const helper = parseJS(setup, { sourceType: 'module', plugins: ['typescript'] }).program.body.find(n =>
    n.type === 'VariableDeclaration' && n.declarations.some(d => d.id.type === 'Identifier' && d.id.name === '_uiRangeStyle'));
  const helperCode = helper ? new Bun.Transpiler({ loader: 'ts' }).transformSync(setup.slice(helper.start!, helper.end!)) : '';
  const nativeState = { value: undefined as number | undefined };
  const evaluate = (part: string, attr: string, props: unknown) => new Function(
    '_htmlUiProps', 'uiTwMerge', 'uiNormalizeClass', '_htmlUiState0', ...recipeNames,
    `${helperCode}\nreturn (${bindings[part][attr]})`,
  )(props, twMerge, normalizeClass, nativeState, ...recipeNames.map(name => recipes[name]));
  return { output, companions, evaluate, nativeState };
}

test('caller part utilities replace recipe width and variant/hover utilities', () => {
  const { evaluate } = generatedBindings('input');
  const props = { size: 'lg', classes: { root: 'w-40 h-10 hover:bg-green-500', control: 'w-24 h-6 hover:bg-yellow-500' } };
  expect(evaluate('root', 'class', props)).toBe('inline-flex w-40 h-10 hover:bg-green-500');
  expect(evaluate('control', 'class', props)).toBe('inline-flex w-24 h-6 hover:bg-yellow-500');
});

test('ordinary root Vue class and style override part customization and normalize caller classes', () => {
  const { output, companions, evaluate } = generatedBindings();
  const props = { size: 'lg', classes: { root: 'w-40 hover:bg-green-500' }, class: ['w-24', { 'hover:bg-yellow-500': true, hidden: false }], styles: { root: { color: 'red', padding: '2px' } }, style: { color: 'blue' } };
  expect(evaluate('root', 'class', props)).toBe('inline-flex h-12 w-24 hover:bg-yellow-500');
  expect(normalizeStyle(evaluate('root', 'style', props))).toEqual({ color: 'blue', padding: '2px' });
  const compiled = compileScript(parse(output).descriptor, { id: 'override', inlineTemplate: true }).content;
  expect(compiled).toMatch(/class:\s*\{/);
  expect(compiled).toMatch(/style:\s*\{/);
  expect(compiled).not.toContain('inheritAttrs: false');
  expect(companions.component).toContain("from 'tailwind-merge'");
  expect(companions.recipe).toContain("from 'class-variance-authority'");
  expect(companions.component).not.toContain("from 'class-variance-authority'");
  expect(output).not.toMatch(/from ['"](?:@(?:base-ui|radix-ui)|reka-ui)/);
});

test('unstyled retains caller classes and root class never leaks into another part', () => {
  const { evaluate } = generatedBindings('input');
  const props = { unstyled: true, classes: { root: 'w-40', control: 'w-20' }, class: 'w-24' };
  expect(evaluate('root', 'class', props)).toBe('w-24');
  expect(evaluate('control', 'class', props)).toBe('w-20');
});

test('recipe and component each retain shared class helpers when splitting companions', () => {
  const { output } = generatedBindings();
  const end = parse(output).descriptor.scriptSetup!.loc.end.offset;
  const source = output.slice(0, end) + "\nconst uiRecipe99 = () => uiTwMerge('w-full', 'w-40')\n" + output.slice(end);
  const { component, recipe } = splitCompanions(source, 'Shared');
  expect(recipe).toContain("from 'tailwind-merge'");
  expect(component).toContain("from 'tailwind-merge'");
  const evaluate = new Function('uiCva', 'uiTwMerge', recipe.replace(/^import .+$/gm, '').replace(/export const /g, 'const ') + '\nreturn uiRecipe99()');
  expect(evaluate(cva, twMerge)).toBe('w-40');
});


test('native slider fill follows reactive sanitized value and bounds with caller styles last', () => {
  const { output, evaluate, nativeState } = generatedBindings('slider');
  const props = { value: 99, min: 20, max: 80 };
  nativeState.value = 35;
  expect(normalizeStyle(evaluate('control', 'style', props))).toEqual({ '--ui-slider-fill': '25%' });
  nativeState.value = 65;
  expect(normalizeStyle(evaluate('control', 'style', props))).toEqual({ '--ui-slider-fill': '75%' });
  nativeState.value = 200;
  expect(normalizeStyle(evaluate('control', 'style', props))).toEqual({ '--ui-slider-fill': '100%' });
  nativeState.value = -100;
  expect(normalizeStyle(evaluate('control', 'style', props))).toEqual({ '--ui-slider-fill': '0%' });
  nativeState.value = undefined;
  expect(normalizeStyle(evaluate('control', 'style', {}))).toEqual({ '--ui-slider-fill': '50%' });
  expect(normalizeStyle(evaluate('control', 'style', { min: 10, max: 5 }))).toEqual({ '--ui-slider-fill': '0%' });
  nativeState.value = 20;
  expect(normalizeStyle(evaluate('control', 'style', { styles: { control: { '--ui-slider-fill': '12%', color: 'red' } } }))).toEqual({ '--ui-slider-fill': '12%', color: 'red' });
  expect(normalizeStyle(evaluate('control', 'style', { unstyled: true, styles: { control: { color: 'red' } } }))).toEqual({ color: 'red' });
  expect(() => compileScript(parse(output).descriptor, { id: 'range', inlineTemplate: true })).not.toThrow();
});


test('ordinary root class/style remain available when a plugin only styles its control', () => {
  const { evaluate } = generatedBindings('input', false);
  const props = { class: ['w-24', { block: true }], style: { color: 'blue' }, classes: { control: 'w-40' } };
  expect(evaluate('root', 'class', props)).toBe('w-24 block');
  expect(normalizeStyle(evaluate('root', 'style', props))).toEqual({ color: 'blue' });
  expect(evaluate('control', 'class', props)).toBe('inline-flex hover:bg-red-500 h-8 w-40');
});
