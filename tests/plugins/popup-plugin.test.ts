import {test,expect} from 'bun:test';
import {execFileSync} from 'node:child_process';
import {parse,compileScript} from '@vue/compiler-sfc';
import {loadPlugin} from '../../src/plugins/load';
import {applyClassPlugin} from '../../src/vue/class-plugin';
for(const name of ['popover','dropdown-menu','context-menu'])test(`${name} compiles local typed placement over installed primitive`,async()=>{
 const plugin=await loadPlugin('shadcn-ui'),mapping=plugin.components[name];const input=execFileSync('.test-output/html-ui-to-vue-vapor',[],{input:execFileSync('/usr/local/bin/html-ui',[mapping.primitive]),encoding:'utf8'});
 const out=applyClassPlugin(input,plugin,{component:name,filename:name+'.vue'}).source;
 expect(()=>compileScript(parse(out).descriptor,{id:name,inlineTemplate:true})).not.toThrow();expect(out.includes('sideOffset?: number')).toBe(true);expect(out.includes('"left"')).toBe(true);expect(out.includes('uiPopup')).toBe(true);expect(mapping.parts.popup.base.join(' ')).toContain('ring-1');expect(out).not.toMatch(/from ['"](?:@base-ui|@radix-ui|@floating-ui)/);
});
