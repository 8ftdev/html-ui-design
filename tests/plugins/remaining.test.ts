import {test,expect} from 'bun:test';
import {execFileSync} from 'node:child_process';
import {parse,compileScript} from '@vue/compiler-sfc';
import {loadPlugin} from '../../src/plugins/load';
import {applyClassPlugin} from '../../src/vue/class-plugin';

const remaining=['alert-dialog','attachment','bubble','calendar','carousel','chart','combobox','command','context-menu','data-table','date-picker','dialog','drawer','dropdown-menu','input-otp','marker','menubar','message','message-scroller','navigation-menu','popover','questionnaire','resizable','select','sheet','sidebar','tabs','toast','toggle','toggle-group','toolbar','tooltip'];
for(const name of remaining)test(`remaining ${name} generates a local compilable contract`,async()=>{
 const plugin=await loadPlugin('shadcn-ui'),mapping=plugin.components[name];
 expect(mapping).toBeDefined();
 if(!mapping)return;
 const input=execFileSync('.test-output/html-ui-to-vue-vapor',[],{input:execFileSync('.test-output/html-ui',[mapping.primitive]),encoding:'utf8',stdio:['pipe','pipe','pipe']});
 const output=applyClassPlugin(input,plugin,{component:name,filename:`${name}.vue`}).source;
 expect(()=>compileScript(parse(output).descriptor,{id:name,inlineTemplate:true})).not.toThrow();
 expect(output).not.toMatch(/from ['"]@(?:base-ui|radix-ui|shadcn|recharts)/);
});
test('adapter-required input still fails without its matching local interaction',async()=>{
 const plugin=await loadPlugin('shadcn-ui');
 const input=execFileSync('.test-output/html-ui-to-vue-vapor',[],{input:execFileSync('.test-output/html-ui',['tabs']),encoding:'utf8',stdio:['pipe','pipe','pipe']});
 delete plugin.components.tabs.interaction;
 expect(()=>applyClassPlugin(input,plugin,{component:'tabs',filename:'Tabs.vue'})).toThrow('interaction adapter');
 plugin.components.tabs.interaction='menu';
 expect(()=>applyClassPlugin(input,plugin,{component:'tabs',filename:'Tabs.vue'})).toThrow('does not match');
 plugin.components.tabs.interaction='tabs';
 expect(()=>applyClassPlugin(input.replace('<div role="tablist"','<button role="tablist"').replace('</div>\n    <slot','</button>\n    <slot'),plugin,{component:'tabs',filename:'Tabs.vue'})).toThrow('reviewed tabs anatomy');
});
test('composed Button forwards typed native ARIA, role and tabindex to its button',async()=>{
 const plugin=await loadPlugin('shadcn-ui');
 const source=execFileSync('.test-output/html-ui-to-vue-vapor',[],{input:execFileSync('.test-output/html-ui',['button']),encoding:'utf8'});
 const output=applyClassPlugin(source,plugin,{component:'button',filename:'Button.vue'}).source;
 expect(output).toContain('"role"?: UiHTMLAttributes["role"]');
 expect(output).toContain(":role=\"_htmlUiProps['role']\"");
 expect(output).toContain('"ariaControls"?: UiHTMLAttributes["aria-controls"]');
 expect(output).toContain(":aria-controls=\"_htmlUiProps['ariaControls']\"");
 expect(output).toContain(":aria-label=\"_htmlUiProps.ariaLabel\"");
 expect(output).toContain('"ariaPressed": undefined');
 expect(output).toContain('"ariaExpanded": undefined');
});
