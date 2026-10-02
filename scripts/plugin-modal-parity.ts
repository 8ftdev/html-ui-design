import type {UIPlugin,ClassRecipe} from '../src/plugins/schema';
const recipe=(base:string,variants:ClassRecipe['variants']={},defaults:ClassRecipe['defaultVariants']={}):ClassRecipe=>({base:[base],variants,axisTypes:Object.fromEntries(Object.keys(variants).map(k=>[k,'string'])),defaultVariants:defaults,compoundVariants:[]});
export function addModalParity(p:UIPlugin,source:(name:string)=>string){
 const from=(name:string,fn:string)=>source(name).slice(source(name).indexOf('function '+fn)).match(/className=\{cn\(\s*"([^"]+)"/)![1];
 const text=(s:string)=>s.split(/\s+/).filter(t=>t!=='cn-font-heading').join(' ');
 const backdrop='backdrop:bg-black/10 backdrop:supports-backdrop-filter:backdrop-blur-xs';
 const forced='forced-colors:border forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]';
 const sides={side:{right:['max-h-dvh inset-y-0 left-auto right-0 h-dvh w-3/4 max-w-none sm:max-w-sm border-l'],left:['max-h-dvh inset-y-0 left-0 right-auto h-dvh w-3/4 max-w-none sm:max-w-sm border-r'],top:['inset-x-0 top-0 bottom-auto h-auto w-full max-w-none border-b'],bottom:['inset-x-0 top-auto bottom-0 h-auto w-full max-w-none border-t']}};
 const close=(variant:string,size:string,base:string)=>{
  const r=structuredClone(p.components.button.parts.root);
  r.base.push(base);
  r.variants={closeVariant:r.variants.variant,closeSize:r.variants.size};r.axisTypes={closeVariant:'string',closeSize:'string'};r.defaultVariants={closeVariant:variant,closeSize:size};
  r.compoundVariants=r.compoundVariants.map(c=>({...c,when:Object.fromEntries(Object.entries(c.when).map(([k,v])=>[k==='variant'?'closeVariant':k==='size'?'closeSize':k,v]))}));return r;
 };
 for(const name of ['dialog','alert-dialog','drawer','sheet']){
  const m=p.components[name],alert=name==='alert-dialog',edge=name==='drawer'||name==='sheet';
  m.slots={trigger:'trigger',title:'title',description:'description',content:'default',footer:'footer',close:'close'};
  m.parts.root=recipe('contents');
  m.parts.dialog=edge?recipe('fixed isolate m-0 min-h-0 max-h-dvh overflow-y-auto border-border bg-popover p-0 text-sm text-popover-foreground outline-none open:flex open:flex-col open:gap-4 '+backdrop+' '+forced+(name==='sheet'?' shadow-lg':' max-h-[calc(100dvh-6rem)]'),structuredClone(sides),{side:name==='sheet'?'right':'bottom'}):recipe('fixed inset-0 isolate m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-xl border-0 bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 outline-none open:grid open:gap-4 '+backdrop+' '+forced,alert?{contentSize:{default:['max-w-xs sm:max-w-sm'],sm:['max-w-xs']}}:{},{...(alert?{contentSize:'default'}:{})});
  if(!edge&&!alert)m.parts.dialog.base.push('max-w-sm');
  if(name==='drawer')for(const side of ['bottom','top','left','right'])m.parts.dialog.variants.side[side].push(side==='bottom'?'rounded-t-xl':side==='top'?'rounded-b-xl':side==='left'?'rounded-r-xl':'rounded-l-xl');
  m.parts.header=recipe(alert?'grid gap-1.5 text-center sm:text-start':edge?'flex shrink-0 flex-col gap-0.5 p-4'+(name==='drawer'?' pb-0 text-center md:text-start':' pe-12'):'flex flex-col gap-2 pe-8',alert?{contentSize:{default:[],sm:['sm:text-center']}}:{},alert?{contentSize:'default'}:{});
  m.parts.title=recipe(text(from(name==='sheet'?'sheet':name,(name==='sheet'?'Sheet':name==='drawer'?'Drawer':alert?'AlertDialog':'Dialog')+'Title')));
  m.parts.description=recipe(text(from(name==='sheet'?'sheet':name,(name==='sheet'?'Sheet':name==='drawer'?'Drawer':alert?'AlertDialog':'Dialog')+'Description'))+' empty:hidden');
  m.parts.content=recipe((edge?'min-h-0 px-4':'min-w-0')+' empty:hidden');
  m.parts.footer=recipe((edge?'mt-auto flex shrink-0 flex-col gap-2 p-4'+(name==='drawer'?' pt-0':''):'-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t border-border bg-muted/50 p-4 sm:flex-row sm:justify-end')+' empty:hidden',alert?{contentSize:{default:[],sm:['grid grid-cols-2']}}:{},alert?{contentSize:'default'}:{});
  m.parts.close=close(alert||name==='drawer'?'outline':'ghost',alert||name==='drawer'?'default':'icon-sm',edge&&name==='drawer'||alert?'':'absolute top-2 end-2'+(name==='sheet'?' top-3 end-3':''));
 }
}
