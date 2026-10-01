import type {ClassRecipe,UIPlugin} from '../src/plugins/schema';
const recipe=(base:string,variants:ClassRecipe['variants']={},defaults:ClassRecipe['defaultVariants']={}):ClassRecipe=>({base:[base],variants,axisTypes:Object.fromEntries(Object.keys(variants).map(k=>[k,'string'])),defaultVariants:defaults,compoundVariants:[]});
export function addPopupParity(plugin:UIPlugin,source:(name:string)=>string){
 const from=(name:string,fn:string)=>source(name).slice(source(name).indexOf('function '+fn)).match(/className=\{cn\(\s*"([^"]+)"/)![1];
 const staticSurface=(value:string)=>value.split(/\s+/).filter(token=>!/(?:animate-|fade-|zoom-|slide-|origin-|duration-|cn-menu-|max-h-\(--available|w-\(--anchor)/.test(token)).join(' ');
 const placement={side:{top:[],bottom:[],left:[],right:[]},align:{start:[],center:[],end:[]}};
 const forced='forced-colors:border forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]';
 plugin.components.popover.parts.root=recipe('inline-block',placement,{side:'bottom',align:'center'});
 plugin.components.popover.parts.popup=recipe(staticSurface(from('popover','PopoverContent')).replace(/\bflex\b/,'[&:popover-open]:flex')+' isolate m-0 border-0 overflow-auto '+forced);
 for(const name of ['dropdown-menu','context-menu']){
  const prefix=name==='dropdown-menu'?'DropdownMenu':'ContextMenu';
  const row=from(name,prefix+'Item').split(/\s+/).filter(token=>!token.startsWith('group/')&&!token.includes('[&_svg')&&!token.includes('*:[svg]')).join(' ').replaceAll('data-disabled:','aria-disabled:').replaceAll('pl-7','ps-7');
  // Slot children retain their own local recipe and override path.
  const reset='h-auto min-h-6 w-full justify-start border-0 bg-transparent font-normal text-start text-popover-foreground shadow-none ring-0 focus-visible:ring-0 focus-visible:border-transparent hover:bg-accent hover:text-accent-foreground active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none';
  // A Button presentation variant keeps defaults in the child's twMerge path,
  // so ordinary caller classes override them without selector specificity tricks.
  if(name==='dropdown-menu'){
   const button=plugin.components.button.parts.root;
   button.variants.variant.menu=[];
   button.compoundVariants.push({when:{variant:'menu'},classes:[reset+' '+row+' active:not-aria-[haspopup]:translate-y-0 forced-colors:focus:bg-[Highlight] forced-colors:focus:text-[HighlightText]']});
  }
  const shortcut='[&_[data-ui-shortcut]]:ms-auto [&_[data-ui-shortcut]]:text-xs [&_[data-ui-shortcut]]:tracking-widest [&_[data-ui-shortcut]]:text-muted-foreground [&_[role^=menuitem]:focus_[data-ui-shortcut]]:text-accent-foreground';
  plugin.components[name].parts.root=recipe('inline-block',placement,{side:name==='context-menu'?'right':'bottom',align:'start'});
  plugin.components[name].parts.popup=recipe(staticSurface(from(name,prefix+'Content'))+(name==='dropdown-menu'?' w-auto':'')+' isolate m-0 border-0 overscroll-contain '+shortcut+' '+forced);
 }
}
