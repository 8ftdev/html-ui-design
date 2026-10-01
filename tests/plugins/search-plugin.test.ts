import {test,expect} from 'bun:test';
import {execFileSync} from 'node:child_process';
import {parse,compileScript} from '@vue/compiler-sfc';
import {loadPlugin} from '../../src/plugins/load';
import {applyClassPlugin} from '../../src/vue/class-plugin';
for(const name of ['combobox','command'])test(`${name} emits a compact owned searchable contract`,async()=>{
 const plugin=await loadPlugin('shadcn-ui'),mapping=plugin.components[name];
 expect(mapping.primitive).toBe(name+'-list');
 const input=execFileSync('.test-output/html-ui-to-vue-vapor',[],{input:execFileSync('.test-output/html-ui',[mapping.primitive]),encoding:'utf8'});
 const output=applyClassPlugin(input,plugin,{component:name,filename:name+'.vue'}).source;
 expect(()=>compileScript(parse(output).descriptor,{id:name,inlineTemplate:true})).not.toThrow();
 expect(output).toContain('uiSearch');expect(output).toContain("'select': [value:string]");expect(output).toContain('"update:value"');
 const broken=structuredClone(plugin);broken.components[name].interaction='select';
 expect(()=>applyClassPlugin(input,broken,{component:name,filename:name+'.vue'})).toThrow('does not match');
 expect(output).not.toMatch(/from ['"](?:@base-ui|@radix-ui|cmdk|@floating-ui)/);
});
