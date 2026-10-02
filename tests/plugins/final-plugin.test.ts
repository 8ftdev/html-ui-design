import {test,expect} from 'bun:test';
import {execFileSync} from 'node:child_process';
import {parse,compileScript} from '@vue/compiler-sfc';
import {loadPlugin} from '../../src/plugins/load';
import {applyClassPlugin} from '../../src/vue/class-plugin';
for(const [name,primitive,helper] of [['input-otp','otp-field','uiOtp'],['resizable','split-view','uiSplit'],['toast','toast-message','uiToast']] as const)test(`${name} generates compact locally editable anatomy with a typed adapter`,async()=>{
 const p=await loadPlugin('shadcn-ui'),m=p.components[name!];expect(m.primitive).toBe(primitive);expect(m.interaction).toBe(name);
 const input=execFileSync('.test-output/html-ui-to-vue-vapor',[],{input:execFileSync('../html-ui-cli/bin/html-ui',[primitive!]),encoding:'utf8'});
 const source=applyClassPlugin(input,p,{component:name!,filename:name+'.vue'}).source;
 expect(source).toContain(helper!);expect(()=>compileScript(parse(source).descriptor,{id:name!,inlineTemplate:true})).not.toThrow();
 expect(source).not.toMatch(/from ['"](?:@base-ui|react-resizable-panels|input-otp)/);
 if(name==='resizable')expect(source).toContain("'update:size'");if(name==='toast')expect(source).toContain("'update:open'");
});
