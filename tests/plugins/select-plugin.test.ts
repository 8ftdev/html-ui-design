import {test,expect} from 'bun:test';
import {execFileSync} from 'node:child_process';
import {parse,compileScript} from '@vue/compiler-sfc';
import {loadPlugin} from '../../src/plugins/load';
import {applyClassPlugin} from '../../src/vue/class-plugin';
test('Select emits a modelled owned combobox while NativeSelect remains native',async()=>{
 const plugin=await loadPlugin('shadcn-ui');
 for(const name of ['select','native-select']){
  const mapping=plugin.components[name];
  const input=execFileSync('.test-output/html-ui-to-vue-vapor',[],{input:execFileSync('.test-output/html-ui',[mapping.primitive]),encoding:'utf8',stdio:['pipe','pipe','pipe']});
  const output=applyClassPlugin(input,plugin,{component:name,filename:name+'.vue'}).source;
  if(name==='select'){expect(output).toContain('role="combobox"');expect(output).toContain('"update:value"');expect(output).toContain('uiSelect');expect(output).toContain('root.dataset.align=align');expect(output).toContain('data-ui-part="option"')}
  else {expect(output).not.toContain('role="combobox"');expect(output).not.toContain('uiSelect')}
  expect(()=>compileScript(parse(output).descriptor,{id:name,inlineTemplate:true})).not.toThrow();
  expect(output).not.toMatch(/from ['"]@(?:base-ui|radix-ui|floating-ui)/);
 }
});
