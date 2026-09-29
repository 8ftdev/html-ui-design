import { test, expect } from 'bun:test';
import { execFileSync } from 'node:child_process';
import { parse, compileScript } from '@vue/compiler-sfc';
import { loadPlugin } from '../../src/plugins/load';
import { applyClassPlugin } from '../../src/vue/class-plugin';
import { parseVue } from '../../src/vue/parse';
import { cva } from 'class-variance-authority';
const batch = [
 ['empty','empty',['root','header','media','title','description','content']],
 ['item','item',['root','media','content','title','description','actions']],
 ['input-group','input-group',['root','label','surface','start','control','end']],
 ['kbd','kbd',['root']], ['pagination','pagination',['root','list']],
 ['typography','typography',['root']], ['direction','direction',['root']],
 ['radio-group','radio-group',['root','legend']], ['radio','radio',['root','control']], ['slider','slider',['root','control']],
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
test('item variants and native selectors match local anatomy',async()=>{
 const p=await loadPlugin('shadcn-ui');
 const r=p.components.item.parts.root;
 expect(cva(r.base,{variants:r.variants,defaultVariants:r.defaultVariants as Record<string,string>})({variant:'outline',size:'xs'})).toContain('border-border');
 expect(p.components['input-group'].parts.surface.base.join(' ')).toContain('focus-visible');
 expect(p.components.radio.parts.control.base.join(' ')).toContain('accent-primary');
 expect(p.components.slider.parts.control.base.join(' ')).toContain('accent-primary');
});
