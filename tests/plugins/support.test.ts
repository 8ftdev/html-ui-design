import {test,expect} from 'bun:test';
import {execFileSync} from 'node:child_process';
import {loadPlugin} from '../../src/plugins/load';
test('support report names every generated mapping and explains legacy scope separately',async()=>{
 const p=await loadPlugin('shadcn-ui');
 const report=await Bun.file('src/plugins/builtin/support.json').json();
 expect(report.contractVersion).toBe(2);
 expect(report.legacyDeclarationMode).toEqual({catalogCount:70,establishesPluginSupport:false});
 for(const [name,mapping] of Object.entries(p.components)){
  const entry=report.components[name];
  expect(entry.primitive).toBe(mapping.primitive);
  expect(entry.parts).toEqual(Object.keys(mapping.parts));
  expect(entry.status).not.toBe('unsupported');
 }
 expect(report.components.accordion.motion.content.expanded.preset).toBe('disclosure');
 expect(report.components.accordion.nativeStates.content.expanded.source.attribute).toBe('open');
 expect(report.components.tabs.status).toBe('partial');
 expect(report.components.tabs.interaction).toBe('tabs');
});
test('coverage regeneration check succeeds without changing published artifacts',()=>{
 expect(execFileSync('bun',['scripts/build-support.ts','--check'],{encoding:'utf8'})).toContain('current');
});
