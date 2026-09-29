import {test,expect} from 'bun:test';
import {parsePlugin} from '../../src/plugins/schema';
import {fixture,recipe} from './schema.test';
import {applyClassPlugin} from '../../src/vue/class-plugin';
import {execFileSync} from 'node:child_process';
const p:any=structuredClone(fixture);
p.components.button.motion={root:{expanded:{preset:'disclosure',duration:'var(--motion-duration-normal, 180ms)',easing:'var(--motion-easing-standard, ease-out)'}}};
test('accepts the typed motion recipe and rejects unsupported parts, states and presets',()=>{
 expect(()=>parsePlugin(p)).not.toThrow();
 for(const motion of [{absent:p.components.button.motion.root},{root:{checked:p.components.button.motion.root.expanded}},{root:{expanded:{...p.components.button.motion.root.expanded,preset:'magic'}}}]){
  const bad=structuredClone(p);bad.components.button.motion=motion;expect(()=>parsePlugin(bad)).toThrow();
 }
});
test('rejects a disclosure recipe on a button instead of guessing behavior',()=>{
 const source=execFileSync('.test-output/html-ui-to-vue-vapor',[],{input:execFileSync('.test-output/html-ui',['button']),encoding:'utf8'});
 expect(()=>applyClassPlugin(source,p,{component:'button',filename:'Button.vue'})).toThrow(/disclosure|details|expanded/);
});
