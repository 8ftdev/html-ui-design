import type MagicString from 'magic-string';
import {parse as parseSFC} from '@vue/compiler-sfc';
import {parse as parseJS} from '@babel/parser';
import type {VueInput} from '../model';
import type {ComponentRecipe} from '../plugins/schema';
import {inlineInteractionRuntimeSource} from './runtime-source';

export function validateInteraction(input:VueInput,mapping:ComponentRecipe){
 const expected:Record<string,string[]>={dialog:['dialog','alert-dialog','drawer'],popover:['popover'],tabs:['tabs'],menu:['menu'], 'context-menu':['context-menu'],toolbar:['toolbar','menubar'],toggle:['toggle'],'toggle-group':['toggle-group'],tooltip:['tooltip'],'hover-card':['preview-card'],select:['select-list'],combobox:['combobox-list'],command:['command-list']};
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
 if(['dialog','popover','menu','context-menu','tooltip','hover-card'].includes(mapping.interaction)){
  const trigger=requirePart('trigger','button',{type:'button'});
  if(trigger.parent!==root!.node)throw new Error('interaction trigger must belong to root');
 }
 if(mapping.interaction==='dialog'){
  const dialog=requirePart('dialog','dialog'),close=requirePart('close','button',{type:'button'});
  if(dialog.parent!==root!.node||close.parent!==dialog.node)throw new Error('interaction requires owned dialog and close control');
 }
 if(['popover','menu','context-menu','hover-card'].includes(mapping.interaction))requirePart('popup','div',{popover:'auto',...(['popover','hover-card'].includes(mapping.interaction)?{}:{role:'menu'})});
 if(mapping.interaction==='select'){
  const control=requirePart('control','select',{'aria-hidden':'true',tabindex:'-1'});
  const trigger=requirePart('trigger','button',{type:'button',role:'combobox','aria-haspopup':'listbox'});
  const popup=requirePart('popup','div',{popover:'auto',role:'listbox'});
  const option=requirePart('option','div',{role:'option',hidden:''});
  const value=requirePart('value','span'),chevron=requirePart('chevron','span',{'aria-hidden':'true'});
  if(control.parent!==root!.node||trigger.parent!==root!.node||popup.parent!==root!.node||option.parent!==popup.node||value.parent!==trigger.node||chevron.parent!==trigger.node)throw new Error('interaction requires owned select anatomy');
 }
 if(['combobox','command'].includes(mapping.interaction)){
  const control=requirePart('control','select',{'aria-hidden':'true',tabindex:'-1'}),surface=requirePart('surface','div');
  const inputNode=requirePart('input','input',{type:'text',role:'combobox','aria-autocomplete':'list'});
  const popup=requirePart('popup','div',{role:'listbox',...(mapping.interaction==='combobox'?{popover:'auto'}:{})});
  const option=requirePart('option','div',{role:'option',hidden:''}),empty=requirePart('empty','div',{role:'status'});
  if(control.parent!==root!.node||surface.parent!==root!.node||inputNode.parent!==surface.node||popup.parent!==root!.node||option.parent!==popup.node||empty.parent!==popup.node)throw new Error('interaction requires owned searchable anatomy');
  if(mapping.interaction==='command'&&Object.hasOwn(popup.attributes,'popover'))throw new Error('Command list must be inline');
 }
 if(mapping.interaction==='tooltip')requirePart('tooltip','div',{role:'tooltip'});
}
export function injectInteraction(source:string,input:VueInput,mapping:ComponentRecipe,edits:MagicString,runtimePath?:string){
 if(!mapping.interaction)return;
 validateInteraction(input,mapping);
 const {descriptor}=parseSFC(source),setup=descriptor.scriptSetup!,offset=setup.loc.start.offset;
 if(source.includes('v-ui-interaction')||setup.content.includes('_uiPressed'))throw new Error('reserved interaction identifier collision');
 edits.appendLeft(offset,runtimePath?`\nimport {${mapping.interaction==='select'?'uiSelect':['combobox','command'].includes(mapping.interaction)?'uiSearch':['tooltip','hover-card'].includes(mapping.interaction)?'uiHover':'uiInteraction'}} from ${JSON.stringify(runtimePath)}\n`:inlineInteractionRuntimeSource);
 if(['tooltip','hover-card'].includes(mapping.interaction)){
  const ast=parseJS(setup.content,{sourceType:'module',plugins:['typescript']}).program;
  const props=ast.body.find((node:any)=>node.type==='TSInterfaceDeclaration'&&node.id.name==='Props') as any;
  if(!props)throw new Error('Hover requires generated Props interface');
  for(const name of ['openDelay','closeDelay','sideOffset'])if(props.body.body.some((node:any)=>node.key?.name===name))throw new Error('reserved hover prop collision');
  edits.appendLeft(offset+props.body.end-1,'\n openDelay?: number\n closeDelay?: number\n sideOffset?: number\n');
  edits.appendLeft(offset,"\nimport {watchPostEffect as _uiHoverEffect} from 'vue'\n");
  edits.appendLeft(setup.loc.end.offset,`\nconst vUiInteraction = (root:HTMLElement) => {
 let disposed=false
 let controller:ReturnType<typeof uiHover>|undefined
 const stop=_uiHoverEffect(()=>{
  const options={side:_htmlUiProps.side,align:_htmlUiProps.align,openDelay:_htmlUiProps.openDelay,closeDelay:_htmlUiProps.closeDelay,sideOffset:_htmlUiProps.sideOffset}
  void _htmlUiProps.id
  ${mapping.interaction==='tooltip'?'void _htmlUiProps.disabled':''}
  if(disposed)return
  controller ??= uiHover(root,${JSON.stringify(mapping.interaction)},options)
  controller.sync(options)
 })
 return ()=>{disposed=true;stop();controller?.dispose()}
}\n`);
  edits.appendLeft(input.nodes.find(n=>n.part==='root')!.start,' v-ui-interaction');return;
 }
 if(['select','combobox','command'].includes(mapping.interaction)){
  const search=mapping.interaction!=='select',command=mapping.interaction==='command';
  if(!/const _htmlUiState0 = _htmlUiRef<string \| undefined>\(_htmlUiProps\["value"\]\)/.test(setup.content))throw new Error('Select requires reviewed native value model');
  edits.appendLeft(offset,`\nimport {watchPostEffect as _uiSelectEffect} from 'vue'\n`);
  if(search){
   if(!descriptor.script)throw new Error('Search requires generated native attribute declarations');
   edits.appendLeft(descriptor.script.loc.end.offset,"\ndeclare module 'vue' { interface OptionHTMLAttributes { 'data-keywords'?: string } }\n");
   const body=parseJS(setup.content,{sourceType:'module',plugins:['typescript']}).program;
   let emit:any;
   const visit=(node:any)=>{if(!node||typeof node!=='object')return;if(node.type==='CallExpression'&&node.callee.name==='defineEmits')emit=node;for(const value of Object.values(node))if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object')visit(value)};visit(body);
   if(!emit?.typeParameters?.params[0])throw new Error('missing generated emits contract');
   edits.appendLeft(offset+emit.typeParameters.params[0].end-1,"\n 'select': [value:string]\n");
  }
  edits.appendLeft(setup.loc.end.offset,`\nconst vUiInteraction = (root:HTMLElement) => {
 let disposed=false
 let controller:ReturnType<typeof ${search?'uiSearch':'uiSelect'}>|undefined
 const stop=_uiSelectEffect(()=>{
  void [_htmlUiState0.value,_htmlUiProps.disabled,${command?'':'_htmlUiProps.required,_htmlUiProps.side,_htmlUiProps.align,'}_htmlUiProps.placeholder,_htmlUiProps.ariaLabel,_htmlUiProps.ariaLabelledby]
  if(disposed)return
${command?'':`  const side=_htmlUiProps.side??'bottom',align=_htmlUiProps.align??'start'\n  if(root.dataset.side!==side)root.dataset.side=side\n  if(root.dataset.align!==align)root.dataset.align=align`}
  controller ??= ${search?`uiSearch(root,${JSON.stringify(mapping.interaction)},value=>_htmlUiEmit('select',value))`:'uiSelect(root)'}
  controller.sync()
 })
 return ()=>{disposed=true;stop();controller?.dispose()}
}\n`);
  edits.appendLeft(input.nodes.find(n=>n.part==='root')!.start,' v-ui-interaction');
  return;
 }
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
