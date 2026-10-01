import type {ClassRecipe,UIPlugin} from '../src/plugins/schema';
const recipe=(base:string,variants:ClassRecipe['variants']={},defaults:ClassRecipe['defaultVariants']={}):ClassRecipe=>({base:[base],variants,axisTypes:Object.fromEntries(Object.keys(variants).map(k=>[k,'string'])),defaultVariants:defaults,compoundVariants:[]});
export function addSearchParity(plugin:UIPlugin,source:(name:string)=>string){
 const from=(component:string,fn:string)=>source(component).slice(source(component).indexOf('function '+fn)).match(/className=\{cn\(\s*"([^"]+)"/)![1];
 const input='min-w-0 flex-1 border-0 bg-transparent px-2.5 py-1 text-sm font-normal outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50';
 const surface='flex h-8 min-w-0 items-center gap-1 rounded-lg border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40';
 const comboItem=from('combobox','ComboboxItem').replaceAll('pr-8 pl-1.5','pe-8 ps-1.5').replaceAll('data-highlighted:','data-[highlighted=true]:').replaceAll('data-disabled:','aria-disabled:');
 const commandItem=from('command','CommandItem').replaceAll('data-selected:','data-[highlighted=true]:').replaceAll('data-[disabled=true]:','aria-disabled:').replaceAll('in-data-[slot=dialog-content]:','in-[dialog]:');
 const check='[&>[data-ui-check]]:pointer-events-none [&>[data-ui-check]]:absolute [&>[data-ui-check]]:end-2 [&>[data-ui-check]]:size-4 [&>[data-ui-check]]:hidden aria-selected:[&>[data-ui-check]]:block';
 const forced='forced-colors:border forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]';
 const rowForced='forced-colors:data-[highlighted=true]:bg-[Highlight] forced-colors:data-[highlighted=true]:text-[HighlightText]';
 const groups='[&_[data-ui-group-label]]:px-2 [&_[data-ui-group-label]]:py-1.5 [&_[data-ui-group-label]]:text-xs [&_[data-ui-group-label]]:text-muted-foreground';
 plugin.components.combobox={primitive:'combobox-list',interaction:'combobox',parts:{
  root:recipe('relative grid min-w-0 gap-2',{side:{bottom:[],top:[]},align:{start:[],center:[],end:[]}},{side:'bottom',align:'start'}),
  label:recipe('text-sm font-medium empty:hidden'),control:recipe('sr-only pointer-events-none'),surface:recipe(surface),input:recipe(input+' h-full'),
  icon:recipe('pointer-events-none me-2 size-4 shrink-0 bg-muted-foreground '+plugin.components.select.parts.chevron.base[0].slice(plugin.components.select.parts.chevron.base[0].indexOf('[mask-image:'))),
  popup:recipe('isolate m-0 max-h-63 min-w-36 overflow-x-hidden overflow-y-auto overscroll-contain rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none '+groups+' '+forced),
  option:recipe(comboItem+' '+check+' '+rowForced),empty:recipe('w-full py-2 text-center text-sm text-muted-foreground'),
 },slots:{label:'default',options:'options'},requirements:[],hooks:[]};
 const searchMask="[mask-image:url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22black%22%20stroke-width=%222%22%3E%3Ccircle%20cx=%2211%22%20cy=%2211%22%20r=%228%22/%3E%3Cpath%20d=%22m21%2021-4.3-4.3%22/%3E%3C/svg%3E')] [mask-size:contain] [mask-repeat:no-repeat]";
 plugin.components.command={primitive:'command-list',interaction:'command',parts:{
  root:recipe(from('command','Command').replace('size-full','w-full')+' min-w-0 gap-1'),label:recipe('px-2 py-1 text-sm font-medium empty:hidden'),control:recipe('sr-only pointer-events-none'),
  surface:recipe(surface+' mx-1 border-input/30 bg-input/30 shadow-none'),input:recipe(from('command','CommandInput')+' '+input+' h-full ps-0'),icon:recipe('pointer-events-none order-first ms-2 size-4 shrink-0 bg-muted-foreground '+searchMask),
  popup:recipe(from('command','CommandList')+' '+groups),option:recipe(commandItem+' '+rowForced),empty:recipe(from('command','CommandEmpty')),
 },slots:{label:'default',options:'options'},requirements:[],hooks:[]};
}
