import {test,expect} from 'bun:test';
import {execFileSync} from 'node:child_process';
import {loadPlugin} from '../../src/plugins/load';
import {applyClassPlugin} from '../../src/vue/class-plugin';
import {parse,compileScript} from '@vue/compiler-sfc';
for(const name of ['dialog','alert-dialog','drawer','sheet'])test(`${name} has compact owned description/content/footer and independent close variants`,async()=>{
 const p=await loadPlugin('shadcn-ui'),m=p.components[name];
 for(const part of ['header','description','content','footer'])expect(m.parts[part]).toBeDefined();
 const input=execFileSync('.test-output/html-ui-to-vue-vapor',[],{input:execFileSync('../html-ui-cli/bin/html-ui',[m.primitive]),encoding:'utf8'});
 const out=applyClassPlugin(input,p,{component:name,filename:name+'.vue'}).source;
 expect(()=>compileScript(parse(out).descriptor,{id:name,inlineTemplate:true})).not.toThrow();
 expect(out).toContain('closeVariant');expect(out).toContain('name="description"');expect(out).toContain('name="footer"');
 if(name==='drawer'||name==='sheet')expect(m.parts.dialog.variants.side).toBeDefined();
 expect(out).not.toMatch(/from ['"](?:@base-ui|@radix-ui)/);
});

test('modal interaction rejects invalid owned footer elements and ancestry',async()=>{
 const {parseVue}=await import('../../src/vue/parse');const {validateInteraction}=await import('../../src/interaction/inject');
 const plugin=await loadPlugin('shadcn-ui'),mapping=plugin.components['alert-dialog'];
 const source=execFileSync('.test-output/html-ui-to-vue-vapor',[],{input:execFileSync('../html-ui-cli/bin/html-ui',['alert-dialog']),encoding:'utf8'});
 const input=parseVue(source,'alert-dialog.vue');
 for(const mutate of [(n:any)=>n.tag='button',(n:any)=>n.parent=input.nodes.find(n=>n.part==='root')!.node]){
  const invalid=structuredClone(input);mutate(invalid.nodes.find(n=>n.part==='footer')!);
  expect(()=>validateInteraction(invalid,mapping)).toThrow();
 }
});
