import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {parse as parseSFC} from '@vue/compiler-sfc';
import {parsePlugin} from '../src/plugins/schema';
import {parseVue} from '../src/vue/parse';
import {applyClassPlugin} from '../src/vue/class-plugin';
const plugin=parsePlugin(JSON.parse(readFileSync('src/plugins/builtin/shadcn-ui.json','utf8')));
const policy=JSON.parse(readFileSync('scripts/support-policy.json','utf8'));
const producer=process.env.HTML_UI_BIN ?? resolve('.test-output/html-ui');
const converter=process.env.HTML_UI_VUE_BIN ?? resolve('.test-output/html-ui-to-vue-vapor');
const components:Record<string,any>=structuredClone(policy.components);
for(const [name,mapping] of Object.entries(plugin.components)){
 if(!components[name] || components[name].status==='unsupported') throw new Error(`missing support boundary for ${name}`);
 const vue=execFileSync(converter,[],{input:execFileSync(producer,[mapping.primitive]),encoding:'utf8'});
 const contract=parseVue(vue,`${name}.vue`).ui;
 applyClassPlugin(vue,plugin,{component:name,filename:`${name}.vue`});
 const template=parseSFC(vue).descriptor.template!.content;
 const slots=[...template.matchAll(/<slot name="([^"]+)"/g)].map(m=>mapping.slots[m[1]]??m[1]);
 components[name]={...components[name],primitive:mapping.primitive,parts:Object.keys(mapping.parts),slots,
  axes:Object.fromEntries(Object.values(mapping.parts).flatMap(r=>Object.entries(r.variants).map(([name,choices])=>[name,Object.keys(choices)]))),
  nativeStates:Object.fromEntries(Object.entries(contract.parts).map(([part,p])=>[part,p.state??{}])),
  behavior:contract.behavior.kind,motion:mapping.motion??{},
 };
}
components['icon-button']={...components['icon-button'],composition:['button','icon'],parts:[],slots:['default']};
const catalogCount=execFileSync(producer,['--list'],{encoding:'utf8'}).trim().split('\n').length;
const report={contractVersion:2,reference:policy.reference,snapshot:policy.snapshot,plugin:plugin.name,revision:plugin.provenance.revision,
 summary:{mappedPrimitives:Object.keys(plugin.components).length,compositions:1,total:Object.keys(plugin.components).length+1},
 legacyDeclarationMode:{catalogCount,establishesPluginSupport:false},components};
const doc=['# UI plugin support','',`The builtin \`shadcn-ui\` plugin generates **${report.summary.total} building blocks**: ${report.summary.mappedPrimitives} mapped primitives and one local composition (IconButton). Vue/Vapor is supported; React is not emitted.`,
 '',`This matrix describes **plugin contracts**, not legacy declaration recipes. The legacy mode compiles ${catalogCount} catalog entries; that does not grant those entries plugin support. Partial means the local native adaptation works within the stated boundary, not upstream API equivalence.`,
 '',`Reference: ${policy.reference} (${policy.snapshot}). Machine-readable coverage: \`src/plugins/builtin/support.json\`. Regenerate with \`bun run support:build\`; detect drift with \`bun run support:check\` after \`bun run test:catalog\`.`,
 '', '## Generated contracts','', '| Component | Primitive / composition | Styled parts | Public slots | Presentation axes | Motion | Boundary |','| --- | --- | --- | --- | --- | --- | --- |'];
for(const [name,c] of Object.entries(components).filter(([,c])=>c.status!=='unsupported')){
 const axes=Object.entries(c.axes??{}).map(([k,v]:[string,any])=>`${k}: ${v.join('/')}`).join('; ');
 doc.push(`| ${name} | ${c.primitive??c.composition?.join(' + ')} | ${c.parts.join(', ')||'inherited'} | ${c.slots.join(', ')||'—'} | ${axes||'—'} | ${Object.keys(c.motion??{}).length?'content.expanded → disclosure (WAAPI)':'CSS / none'} | ${c.reason} |`);
}
doc.push('', 'Native state sources and behavioral scope are recorded per part in the JSON report. Those sources describe the primitive’s capabilities; they do not imply every state has a separate visual recipe. Classes/styles/unstyled overrides remain available for every mapped part. Motion can be disabled with `motion=false`; unstyled also disables generated motion.', '', '## Not yet mapped','', '| Component | Status | Boundary |','| --- | --- | --- |');
for(const [name,c] of Object.entries(components).filter(([,c])=>c.status==='unsupported'))doc.push(`| ${name} | unsupported | ${c.reason} |`);
doc.push('', 'Native disclosure content wrappers are now explicit owned parts. Accordion remains one disclosure item; use the same nonempty name for exclusive groups. The motion helper is generated locally once as ui-motion.ts and reused by Accordion and Collapsible. Standalone pipe output embeds that same helper. No external component or animation implementation is imported.','');
for(const [path,text] of [['src/plugins/builtin/support.json',JSON.stringify(report,null,2)+'\n'],['docs/support.md',doc.join('\n')]]){
 if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==text)throw new Error(`support artifact is stale: ${path}`)}else writeFileSync(path,text);
}
console.log(process.argv.includes('--check')?'Support artifacts are current':'Support artifacts generated');
