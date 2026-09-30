import type {ClassRecipe,UIPlugin} from '../src/plugins/schema';
const recipe=(base:string,variants:ClassRecipe['variants']={},defaults:ClassRecipe['defaultVariants']={}):ClassRecipe=>({base:[base],variants,axisTypes:Object.fromEntries(Object.keys(variants).map(k=>[k,'string'])),defaultVariants:defaults,compoundVariants:[]});
/** The native options slot supplies data; the owned prototype supplies every repeated item's style. */
export function addSelectParity(plugin:UIPlugin,source:(name:string)=>string){
 const select=source('select');
 const original=select.slice(select.indexOf('function SelectTrigger')).match(/className=\{cn\(\s*"([^"]+)"/)![1];
 const trigger=original.split(/\s+/).filter(s=>!s.startsWith('data-[size=')).join(' ').replaceAll('pr-2 pl-2.5','pe-2 ps-2.5').replaceAll('data-[slot=select-value]','data-[ui-part=value]');
 plugin.components.select={
  primitive:'select-list',interaction:'select',
  parts:{
   root:recipe('relative grid min-w-0 gap-2',{side:{bottom:[],top:[]},align:{start:[],center:[],end:[]}},{side:'bottom',align:'start'}),
   label:recipe('text-sm font-medium empty:hidden'),
   control:recipe('sr-only pointer-events-none'),
   trigger:recipe(trigger+' font-normal forced-colors:border-[ButtonText] forced-colors:bg-[ButtonFace] forced-colors:text-[ButtonText]',{size:{default:['h-8'],sm:['h-7 rounded-[min(var(--radius-md),10px)]']}},{size:'default'}),
   value:recipe('flex min-w-0 flex-1 items-center gap-1.5 truncate text-start'),
   chevron:structuredClone(plugin.components['native-select'].parts.chevron),
   popup:recipe('isolate m-0 min-w-36 overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none [&_[data-ui-group-label]]:px-1.5 [&_[data-ui-group-label]]:py-1 [&_[data-ui-group-label]]:text-xs [&_[data-ui-group-label]]:text-muted-foreground forced-colors:border forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]'),
   option:recipe('relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pe-8 ps-1.5 text-sm outline-hidden select-none data-[highlighted=true]:bg-accent data-[highlighted=true]:text-accent-foreground aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>[data-ui-check]]:pointer-events-none [&>[data-ui-check]]:absolute [&>[data-ui-check]]:end-2 [&>[data-ui-check]]:size-4 [&>[data-ui-check]]:hidden aria-selected:[&>[data-ui-check]]:block forced-colors:data-[highlighted=true]:bg-[Highlight] forced-colors:data-[highlighted=true]:text-[HighlightText]'),
  },slots:{label:'default',options:'options'},requirements:[],hooks:[]
 };
 // The trigger owns layout; its chevron is an inline decoration instead of an overlay.
 plugin.components.select.parts.chevron=recipe('pointer-events-none size-4 shrink-0 bg-muted-foreground '+plugin.components['native-select'].parts.chevron.base[0].slice(plugin.components['native-select'].parts.chevron.base[0].indexOf('[mask-image:'))+' forced-colors:bg-[ButtonText]');
}
