import {cva} from 'class-variance-authority';
import {twMerge} from 'tailwind-merge';
import type {UIPlugin,ClassRecipe} from '../src/plugins/schema';
const recipe=(base:string):ClassRecipe=>({base:[base],variants:{},axisTypes:{},defaultVariants:{},compoundVariants:[]});
const mask=(path:string)=>{const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;return `[mask-image:url(data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g,'%27')})] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]`};
/** Single-date adaptation of the pinned Base Nova calendar, using the local native date-grid contract. */
export function addDateParity(p:UIPlugin,source:(name:string)=>string){
 const upstream=source('calendar');if(!upstream.includes('[--cell-size:--spacing(7)]'))throw new Error('Calendar source lacks pinned Nova cell geometry');
 p.components['native-date-picker']=structuredClone(p.components['date-picker']);
 const button=p.components.button.parts.root;
 const action=cva(button.base,{variants:button.variants,defaultVariants:button.defaultVariants} as any);
 const nav=twMerge(action({variant:'ghost',size:'icon'} as any),'size-(--cell-size) p-0 select-none');
 const day=twMerge(action({variant:'ghost',size:'icon'} as any),'relative flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal rounded-(--cell-radius) select-none');
 const before="before:block before:size-4 before:bg-current before:content-[''] ";
 const previous=before+mask('m15 18-6-6 6-6').split(' ').map(x=>'before:'+x).join(' ');
 const next=before+mask('m9 18 6-6-6-6').split(' ').map(x=>'before:'+x).join(' ');
 for(const name of ['calendar','date-picker'] as const){
  const popup=name==='date-picker';
  p.components[name]={primitive:'date-grid',interaction:name,parts:{
   root:recipe('relative grid w-fit max-w-full min-w-0 gap-2'),label:recipe('text-sm font-medium empty:hidden'),control:recipe('sr-only pointer-events-none'),
   trigger:recipe(popup?twMerge(action({variant:'outline',size:'default'} as any),'w-full justify-start font-normal data-placeholder:text-muted-foreground'):'hidden'),
   value:recipe('min-w-0 truncate'),icon:recipe('ms-auto size-4 shrink-0 bg-current '+mask('M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2')),
   popup:recipe('group/calendar '+(popup?'hidden [&:popover-open]:flex ':'flex ')+'w-fit max-w-full flex-col gap-4 bg-background p-2 text-foreground [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)] '+(popup?'isolate m-0 overflow-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none ':'')+'forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]'),
   header:recipe('flex items-center justify-between gap-1'),previous:recipe(nav+' '+previous+' rtl:rotate-180'),next:recipe(nav+' '+next+' rtl:rotate-180'),caption:recipe('flex h-(--cell-size) flex-1 items-center justify-center text-sm font-medium select-none'),
   grid:recipe('w-full border-collapse'),head:recipe(''),weekdays:recipe('flex'),weekday:recipe('flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none'),body:recipe(''),week:recipe('mt-2 flex w-full'),cell:recipe('relative aspect-square w-(--cell-size) shrink-0 rounded-(--cell-radius) p-0 text-center select-none'),
   day:recipe(day+' data-[today=true]:bg-muted data-[today=true]:text-foreground data-[outside=true]:text-muted-foreground data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:hover:bg-primary/90 data-[selected=true]:hover:text-primary-foreground disabled:text-muted-foreground disabled:opacity-50 forced-colors:border forced-colors:border-[ButtonText] forced-colors:bg-[ButtonFace] forced-colors:text-[ButtonText] forced-colors:data-[selected=true]:bg-[Highlight] forced-colors:data-[selected=true]:text-[HighlightText]'),
  },slots:{label:'default'},requirements:[],hooks:[]};
 }
}
