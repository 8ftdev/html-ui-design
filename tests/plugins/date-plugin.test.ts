import {test,expect} from 'bun:test';
import {loadPlugin} from '../../src/plugins/load';
import {execFileSync} from 'node:child_process';
import {applyClassPlugin} from '../../src/vue/class-plugin';
import {parse,compileScript} from '@vue/compiler-sfc';
for(const name of ['calendar','date-picker'] as const)test(`${name} emits owned date-grid with a local interaction and editable repeated parts`,async()=>{
 const p=await loadPlugin('shadcn-ui'),m=p.components[name];
 expect(m.primitive).toBe('date-grid');expect(m.interaction).toBe(name);
 for(const part of ['weekday','week','cell','day','caption'])expect(m.parts[part]).toBeDefined();
 const input=execFileSync('.test-output/html-ui-to-vue-vapor',[],{input:execFileSync('../html-ui-cli/bin/html-ui',[m.primitive]),encoding:'utf8'});
 const out=applyClassPlugin(input,p,{component:name,filename:name+'.vue'}).source;
 expect(()=>compileScript(parse(out).descriptor,{id:name,inlineTemplate:true})).not.toThrow();
 expect(out).toContain('uiDate');expect(out).not.toMatch(/from ['"](?:@base-ui|@radix-ui|react-day-picker|date-fns)/);
});
test('native date picker retains the native date-field contract',async()=>{const p=await loadPlugin('shadcn-ui');expect(p.components['native-date-picker']?.primitive).toBe('date-field')});
test('date interaction rejects unreviewed day/cell ancestry and semantic tags',async()=>{
 const {parseVue}=await import('../../src/vue/parse');const {validateInteraction}=await import('../../src/interaction/inject');
 const plugin=await loadPlugin('shadcn-ui'),mapping=plugin.components.calendar;
 const source=execFileSync('.test-output/html-ui-to-vue-vapor',[],{input:execFileSync('../html-ui-cli/bin/html-ui',['date-grid']),encoding:'utf8'});
 const input=parseVue(source,'Calendar.vue');
 for(const [part,field,value] of [['day','tag','div'],['week','tag','div'],['cell','parent',input.nodes.find(n=>n.part==='root')!.node]]){
  const invalid=structuredClone(input);(invalid.nodes.find(n=>n.part===part)! as any)[field!]=value;expect(()=>validateInteraction(invalid,mapping)).toThrow();
 }
});
