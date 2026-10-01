// Flat menus and ordinary popovers share native presentation and local geometry.
export const popupRuntimeSource=String.raw`
export type UiPopupOptions={side?:'top'|'bottom'|'left'|'right';align?:'start'|'center'|'end';sideOffset?:number};
export function uiPopup(root:HTMLElement,kind:'popover'|'menu'|'context-menu',options:UiPopupOptions={}){
 const doc=root.ownerDocument,view=doc.defaultView!;
 const owned=(node:Element)=>node.closest('[data-ui-part="root"][data-ui="'+root.dataset.ui+'"]')===root;
 const part=(name:string)=>Array.from(root.querySelectorAll<HTMLElement>('[data-ui-part="'+name+'"]')).find(node=>node.dataset.ui===root.dataset.ui&&owned(node));
 const trigger=part('trigger'),popup=part('popup');
 if(!trigger||!popup)return {sync:(_options:UiPopupOptions={})=>{},dispose:()=>{}};
 const menu=kind!=='popover',cleanups:(()=>void)[]=[];
 const on=(node:EventTarget,type:string,fn:(event:any)=>void,capture=false)=>{node.addEventListener(type,fn,capture);cleanups.push(()=>node.removeEventListener(type,fn,capture))};
 const attributes=new Map<HTMLElement,Map<string,{before:string|null;last:string|null;released:boolean}>>();
 const attr=(node:HTMLElement,name:string,value:string|null)=>{
  let map=attributes.get(node);if(!map){map=new Map();attributes.set(node,map)}
  let entry=map.get(name);if(!entry){const before=node.getAttribute(name);entry={before,last:before,released:false};map.set(name,entry)}
  if(entry.released)return;if(node.getAttribute(name)!==entry.last){entry.released=true;return}
  if(value!==entry.last){if(value===null)node.removeAttribute(name);else node.setAttribute(name,value);entry.last=value}
 };
 const disabled=(node:HTMLElement)=>node.matches(':disabled')||Boolean(node.closest('[inert],[aria-disabled="true"]'));
 const blocked=()=>!root.isConnected||disabled(trigger);
 const visible=()=>popup.matches(':popover-open');
 const items=()=>Array.from(popup.querySelectorAll<HTMLElement>('[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]')).filter(node=>node.closest('[role="menu"]')===popup&&!disabled(node)&&!node.closest('[hidden]')&&Boolean(node.getClientRects().length)&&view.getComputedStyle(node).visibility==='visible');
 let disposed=false,position:(()=>void)|undefined,point:{x:number;y:number}|undefined,config:Required<UiPopupOptions>,openAtLast=false,query='',typedAt=0;
 const geometry=(opening=false)=>{position?.();position=undefined;if(opening||visible())position=uiPosition(trigger,popup,{side:config.side,align:config.align,gap:point?0:config.sideOffset,anchor:point})};
 const mark=(open:boolean)=>{attr(trigger,'aria-expanded',String(open));attr(popup,'data-open',open?'':null)};
 const hide=(restore=false)=>{const active=doc.activeElement;query='';if(visible())popup.hidePopover();position?.();position=undefined;mark(false);point=undefined;if(restore&&active&&popup.contains(active)&&(doc.activeElement===doc.body||doc.activeElement===active||popup.contains(doc.activeElement)))trigger.focus()};
 const focus=(last=false)=>{const all=items();for(const item of all)attr(item,'tabindex','-1');(last?all.at(-1):all[0])?.focus()};
 const show=()=>{if(disposed||blocked())return;if(!visible())popup.showPopover();mark(true);geometry()};
 const sync=(next:UiPopupOptions={})=>{
  if(disposed)return;const before=config;
  config={side:next.side??(kind==='context-menu'?'right':'bottom'),align:next.align??'start',sideOffset:next.sideOffset!==undefined&&Number.isFinite(next.sideOffset)?Math.max(0,next.sideOffset):4};
  attr(trigger,'aria-controls',popup.id);if(menu)attr(trigger,'aria-haspopup','menu');
  if(blocked())hide();else if(visible()&&(!before||before.side!==config.side||before.align!==config.align||before.sideOffset!==config.sideOffset))geometry();
 };
 mark(visible());sync(options);
 on(trigger,'click',()=>{point=undefined;if(visible())geometry()});
 on(popup,'beforetoggle',(e:ToggleEvent)=>{if(e.newState==='open'){if(blocked()||disposed){e.preventDefault();return}mark(true);geometry(true)}else{mark(false);position?.();position=undefined;query='';point=undefined}});
 on(popup,'toggle',()=>{if(disposed)return;mark(visible());if(visible()){if(!position)geometry();if(menu&&!popup.contains(doc.activeElement))focus(openAtLast);openAtLast=false}});
 const observer=new MutationObserver(()=>{if(blocked())hide();else if(trigger.getAttribute('aria-controls')!==popup.id)attr(trigger,'aria-controls',popup.id)});
 observer.observe(doc.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','aria-disabled','inert','id']});
 if(!menu)on(popup,'keydown',(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();hide(true)}});
 if(menu){
  on(trigger,'keydown',(e:KeyboardEvent)=>{
   if(blocked()||e.altKey||e.ctrlKey||e.metaKey)return;
   if(e.key==='ArrowDown'||e.key==='ArrowUp'||(kind==='context-menu'&&(e.key==='ContextMenu'||(e.shiftKey&&e.key==='F10')))){e.preventDefault();point=undefined;openAtLast=e.key==='ArrowUp';show();focus(openAtLast)}
  });
  if(kind==='context-menu'){
   on(root,'contextmenu',(e:MouseEvent)=>{if(blocked()||!owned(e.target as Element)||popup.contains(e.target as Node))return;e.preventDefault();point={x:e.clientX,y:e.clientY};openAtLast=false;show();focus()});
   on(doc,'scroll',(e:Event)=>{if(point&&!(e.target instanceof Node&&popup.contains(e.target)))hide()},true);
  }
  const label=(node:HTMLElement)=>{
   const ids=node.getAttribute('aria-labelledby');if(ids)return ids.split(/\s+/).map(id=>doc.getElementById(id)?.textContent??'').join(' ');
   if(node.hasAttribute('aria-label'))return node.getAttribute('aria-label')!;
   const text=(node:Node):string=>node instanceof Element&&node.matches('[aria-hidden="true"],[hidden],[data-ui-shortcut]')?'':node.nodeType===Node.TEXT_NODE?node.textContent??'':Array.from(node.childNodes).map(text).join('');return text(node);
  };
  const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLocaleLowerCase();
  on(popup,'pointermove',(e:PointerEvent)=>{if(e.pointerType==='touch')return;const item=(e.target as Element).closest<HTMLElement>('[role^="menuitem"]');if(item&&items().includes(item)&&doc.activeElement!==item)item.focus({preventScroll:true})});
  on(popup,'keydown',(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();e.stopPropagation();hide(true);return}
   if(e.key==='Tab'){hide();trigger.focus();return}
   if(e.altKey||e.ctrlKey||e.metaKey||e.isComposing)return;
   const all=items(),current=(e.target as Element).closest<HTMLElement>('[role^="menuitem"]'),index=all.indexOf(current!);if(index<0||!all.length)return;
   const now=view.performance.now();if(now-typedAt>500)query='';
   let next=index;
   if(e.key==='Home')next=0;else if(e.key==='End')next=all.length-1;else if(e.key==='ArrowDown')next=(index+1)%all.length;else if(e.key==='ArrowUp')next=(index-1+all.length)%all.length;
   else if(e.key.length===1&&(e.key!==' '||query)){
    query+=e.key;typedAt=now;
    const letters=Array.from(query),repeat=letters.every(c=>c===letters[0]);const prefix=normalize(repeat?letters[0]!:query);
    const offset=repeat||query.length===1?1:0;
    const match=Array.from({length:all.length},(_,i)=>(index+offset+i)%all.length).find(i=>normalize(label(all[i]!)).startsWith(prefix));
    if(match===undefined)return;next=match;
   }else return;
   e.preventDefault();all[next]!.focus();
  });
  const blockDisabled=(e:MouseEvent)=>{const item=(e.target as Element).closest<HTMLElement>('[role^="menuitem"]');if(item&&item.closest('[role="menu"]')===popup&&!items().includes(item)){e.preventDefault();e.stopImmediatePropagation()}};
  on(popup,'pointerdown',(e:PointerEvent)=>{blockDisabled(e);if(!(e.target as Element).closest('[role^="menuitem"]'))e.preventDefault()},true);on(popup,'click',blockDisabled,true);
  on(popup,'click',(e:MouseEvent)=>{const item=(e.target as Element).closest<HTMLElement>('[role^="menuitem"]');if(item&&items().includes(item))hide(true)});
 }
 return {sync,dispose:()=>{
  if(disposed)return;disposed=true;observer.disconnect();cleanups.forEach(fn=>fn());position?.();position=undefined;
  if(visible())popup.hidePopover();
  for(const [node,map] of attributes)for(const [name,entry] of map)if(!entry.released&&node.getAttribute(name)===entry.last){if(entry.before===null)node.removeAttribute(name);else node.setAttribute(name,entry.before)}
 }};
}
`;
