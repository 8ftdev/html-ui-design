import { test, expect } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { parse, compileScript } from '@vue/compiler-sfc';
import { loadPlugin } from '../../src/plugins/load';
import { applyClassPlugin } from '../../src/vue/class-plugin';
import { parseVue } from '../../src/vue/parse';
import { cva } from 'class-variance-authority';
const batch = [
  ['accordion', 'accordion', ['root', 'content', 'trigger']],
  ['collapsible', 'collapsible', ['root', 'content', 'trigger']],
  ['avatar', 'avatar', ['root']],
  ['field', 'field', ['root', 'label', 'description']],
  ['fieldset', 'fieldset', ['root', 'legend']],
  ['separator', 'separator', ['root']],
  ['progress', 'progress', ['root']],
  ['switch', 'switch', ['root', 'control']],
  ['scroll-area', 'scroll-area', ['root']],
  ['native-select', 'select', ['root', 'control']],
] as const;
for (const [name, primitive, parts] of batch) {
  test(`generates a compilable native ${name} with editable recipes and valid anatomy`, async () => {
    const p = await loadPlugin('shadcn-ui');
    expect(p.components[name]).toBeDefined();
    const source = execFileSync('.test-output/html-ui-to-vue-vapor', [], {
      input: execFileSync('.test-output/html-ui', [primitive]), encoding:'utf8',
    });
    const output = applyClassPlugin(source, p, { component:name, filename:`${name}.vue` }).source;
    const parsed = parseVue(output, `${name}.vue`);
    expect(parsed.ui.component).toBe(primitive);
    expect(Object.keys(p.components[name].parts)).toEqual([...parts]);
    expect(() => compileScript(parse(output).descriptor, {id:name, inlineTemplate:true})).not.toThrow();
    expect(output).not.toMatch(/from ['"]@(?:base-ui|radix-ui)/);
    expect(output).not.toContain('<style');
  });
}
test('avatar, switch and native select choose real size recipes; field orientation is independent of native props', async () => {
  const p = await loadPlugin('shadcn-ui');
  const select = (name:string, part:string, props:Record<string,string>) => {
    const r = p.components[name]?.parts[part];
    expect(r).toBeDefined();
    return cva(r.base, {variants:r.variants,defaultVariants:r.defaultVariants as Record<string,string>})(props);
  };
  expect(select('avatar','root',{size:'sm'})).toContain('size-6');
  expect(select('avatar','root',{size:'lg'})).toContain('size-10');
  expect(select('switch','control',{size:'sm'})).toContain('w-6');
  expect(select('native-select','control',{size:'sm'})).toContain('h-7');
  expect(select('field','root',{orientation:'horizontal'})).toContain('grid-cols');
});
