import {test,expect} from 'bun:test';
import {execFileSync} from 'node:child_process';
import {parse,compileScript} from '@vue/compiler-sfc';
import {loadPlugin} from '../../src/plugins/load';
import {applyClassPlugin} from '../../src/vue/class-plugin';
for(const name of ['tooltip','hover-card'])test(`${name} generates typed placement and hover options over reviewed anatomy`,async()=>{
 const plugin=await loadPlugin('shadcn-ui'),mapping=plugin.components[name];
 expect(mapping).toBeDefined();expect(mapping.primitive).toBe(name==='tooltip'?'tooltip':'preview-card');
 const input=execFileSync('.test-output/html-ui-to-vue-vapor',[],{input:execFileSync('/usr/local/bin/html-ui',[mapping.primitive]),encoding:'utf8'});
 const output=applyClassPlugin(input,plugin,{component:name,filename:name+'.vue'}).source;
 expect(()=>compileScript(parse(output).descriptor,{id:name,inlineTemplate:true})).not.toThrow();
 expect(output).toContain('openDelay?: number');expect(output).toContain('closeDelay?: number');expect(output).toContain('sideOffset?: number');expect(output).toContain('"left"');expect(output).toContain('"right"');
 const bad=structuredClone(plugin);bad.components[name].interaction='popover';expect(()=>applyClassPlugin(input,bad,{component:name,filename:name+'.vue'})).toThrow('does not match');
 expect(output).not.toMatch(/from ['"](?:@base-ui|@radix-ui|@floating-ui)/);
});
