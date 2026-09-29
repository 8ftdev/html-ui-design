import { test, expect } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { parse, compileScript } from '@vue/compiler-sfc';
import { loadPlugin } from '../../src/plugins/load';
import { applyClassPlugin } from '../../src/vue/class-plugin';
import { parseVue } from '../../src/vue/parse';
import { cva } from 'class-variance-authority';
const batch = [
  ['alert', 'alert', ['root','icon','title','description']],
  ['badge', 'badge', ['root']],
  ['aspect-ratio', 'aspect-ratio', ['root']],
  ['breadcrumb', 'breadcrumb', ['root','list']],
  ['button-group', 'button-group', ['root']],
  ['label', 'label', ['root']],
  ['skeleton', 'skeleton', ['root']],
  ['spinner', 'spinner', ['root','indicator']],
  ['table', 'table', ['root','table','caption','head','body','foot']],
  ['textarea', 'textarea', ['root','control']],
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
test('badge and alert variants, aspect ratios and group orientation resolve to concrete styles', async () => {
 const p = await loadPlugin('shadcn-ui');
 const select = (name:string,part:string,props:Record<string,string>) => {
  const r = p.components[name]?.parts[part];
  expect(r).toBeDefined();
  return cva(r.base,{variants:r.variants,defaultVariants:r.defaultVariants as Record<string,string>})(props);
 };
 expect(select('badge','root',{variant:'outline'})).toContain('border-border');
 expect(select('badge','root',{variant:'outline'})).not.toContain('border-transparent');
 expect(select('alert','root',{variant:'destructive'})).toContain('var(--destructive)');
 expect(select('aspect-ratio','root',{ratio:'video'})).toContain('aspect-video');
 expect(select('button-group','root',{orientation:'vertical'})).toContain('flex-col');
});
