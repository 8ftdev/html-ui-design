import type MagicString from 'magic-string';
import {parse as parseSFC} from '@vue/compiler-sfc';
import {parse as parseJS} from '@babel/parser';
import type {VueInput} from '../model';
import type {ComponentRecipe} from '../plugins/schema';
import {interactionRuntimeSource} from './runtime-source';

export function validateInteraction(input:VueInput,mapping:ComponentRecipe){
 const expected:Record<string,string[]>={dialog:['dialog','alert-dialog','drawer'],popover:['popover'],tabs:['tabs'],menu:['menu'], 'context-menu':['context-menu'],toolbar:['toolbar','menubar'],toggle:['toggle'],'toggle-group':['toggle-group'],tooltip:['tooltip']};
 if(mapping.interaction&&!expected[mapping.interaction].includes(input.ui.component))throw new Error('interaction does not match primitive contract');
 if(!mapping.interaction)return;
 const root=input.nodes.find(n=>n.part==='root');
 const requirePart=(part:string,tag:string,attributes:Record<string,string>={})=>{
  const node=input.nodes.find(n=>n.part===part);
  if(!node||node.tag!==tag||Object.entries(attributes).some(([name,value])=>node.attributes[name]!==value))throw new Error('interaction requires reviewed '+mapping.interaction+' anatomy: '+part);
  return node;
 };
 requirePart('root',mapping.interaction==='toggle'?'button':'div');
 if(mapping.interaction==='tabs')requirePart('list','div',{role:'tablist'});
 if(['dialog','popover','menu','context-menu','tooltip'].includes(mapping.interaction)){
  const trigger=requirePart('trigger','button',{type:'button'});
  if(trigger.parent!==root!.node)throw new Error('interaction trigger must belong to root');
 }
 if(mapping.interaction==='dialog'){
  const dialog=requirePart('dialog','dialog'),close=requirePart('close','button',{type:'button'});
  if(dialog.parent!==root!.node||close.parent!==dialog.node)throw new Error('interaction requires owned dialog and close control');
 }
 if(['popover','menu','context-menu'].includes(mapping.interaction))requirePart('popup','div',{popover:'auto',...(mapping.interaction==='popover'?{}:{role:'menu'})});
 if(mapping.interaction==='tooltip')requirePart('tooltip','div',{role:'tooltip'});
}
export function injectInteraction(source:string,input:VueInput,mapping:ComponentRecipe,edits:MagicString,runtimePath?:string){
 if(!mapping.interaction)return;
 validateInteraction(input,mapping);
 const {descriptor}=parseSFC(source),setup=descriptor.scriptSetup!,offset=setup.loc.start.offset;
 if(source.includes('v-ui-interaction')||setup.content.includes('_uiPressed'))throw new Error('reserved interaction identifier collision');
 edits.appendLeft(offset,runtimePath?`\nimport {uiInteraction} from ${JSON.stringify(runtimePath)}\n`:interactionRuntimeSource.replace(/^export /gm,''));
 if(mapping.interaction==='toggle'){
  edits.appendLeft(offset,`\nimport {ref as _uiInteractRef, watch as _uiInteractWatch} from 'vue'\n`);
  const body=parseJS(setup.content,{sourceType:'module',plugins:['typescript']}).program;
  let emit:any;
  const visit=(n:any)=>{if(!n||typeof n!=='object')return;if(n.type==='CallExpression'&&n.callee.name==='defineEmits')emit=n;for(const v of Object.values(n))if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v)};visit(body);
  if(!emit?.typeParameters?.params[0])throw new Error('missing generated emits contract');
  edits.appendLeft(offset+emit.typeParameters.params[0].end-1,`\n 'update:pressed': [value:boolean]\n`);
  const match=/const value = _htmlUiProps\.pressed/g;let found=0;
  for(const m of setup.content.matchAll(match)){edits.overwrite(offset+m.index!,offset+m.index!+m[0].length,'const value = _uiPressed.value');found++}
  if(found!==1)throw new Error('unsupported generated toggle binding');
  edits.appendLeft(setup.loc.end.offset,`\nconst _uiPressed = _uiInteractRef(_htmlUiProps.pressed)\n_uiInteractWatch(()=>_htmlUiProps.pressed,value=>{_uiPressed.value=value})\nconst vUiInteraction = (root:HTMLElement)=>uiInteraction(root,'toggle',value=>{_uiPressed.value=value;_htmlUiEmit('update:pressed',value)})\n`);
 }else edits.appendLeft(setup.loc.end.offset,`\nconst vUiInteraction = (root:HTMLElement)=>uiInteraction(root,${JSON.stringify(mapping.interaction)})\n`);
 edits.appendLeft(input.nodes.find(n=>n.part==='root')!.start,' v-ui-interaction');
}
