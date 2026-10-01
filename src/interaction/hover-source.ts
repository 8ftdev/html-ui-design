// Hover/focus intent is local; native popovers supply top-layer presentation.
export const hoverRuntimeSource=String.raw`
export type UiHoverOptions={side?:'top'|'bottom'|'left'|'right';align?:'start'|'center'|'end';openDelay?:number;closeDelay?:number;sideOffset?:number};
export function uiHover(root:HTMLElement,kind:'tooltip'|'hover-card',options:UiHoverOptions={}){
 const doc=root.ownerDocument,view=doc.defaultView!;
 const owned=(node:Element)=>node.closest('[data-ui-part="root"][data-ui="'+root.dataset.ui+'"]')===root;
 const part=(name:string)=>Array.from(root.querySelectorAll<HTMLElement>('[data-ui-part="'+name+'"]')).find(node=>node.dataset.ui===root.dataset.ui&&owned(node));
 const trigger=part('trigger'),popup=part(kind==='tooltip'?'tooltip':'popup');
 if(!trigger||!popup)return {sync:(_options:UiHoverOptions={})=>{},dispose:()=>{}};
 const tooltip=kind==='tooltip',originalPopover=popup.getAttribute('popover'),originalHidden=popup.hidden;
 const originalExpanded=trigger.getAttribute('aria-expanded'),originalControls=trigger.getAttribute('aria-controls'),originalOpen=popup.getAttribute('data-open');
 let lastExpanded=originalExpanded,lastControls=originalControls,lastHidden=originalHidden,lastOpen=originalOpen;
 const expanded=(value:string)=>{trigger.setAttribute('aria-expanded',value);lastExpanded=value};
 const controls=(value:string)=>{trigger.setAttribute('aria-controls',value);lastControls=value};
 const hidden=(value:boolean)=>{popup.hidden=value;lastHidden=value};
 const mark=(open:boolean)=>{if(open)popup.setAttribute('data-open','');else popup.removeAttribute('data-open');lastOpen=open?'':null};
 if(tooltip){popup.setAttribute('popover','manual');hidden(true)}
 else{controls(popup.id);expanded('false')}
 let disposed=false,escaped=false,returningFocus=false,overTrigger=false,overPopup=false,pointerFocus=false;
 let openTimer:number|undefined,closeTimer:number|undefined,position:(()=>void)|undefined,config:Required<UiHoverOptions>;
 const cleanups:(()=>void)[]=[];
 const on=(target:EventTarget,name:string,fn:(event:any)=>void,capture=false)=>{target.addEventListener(name,fn,capture);cleanups.push(()=>target.removeEventListener(name,fn,capture))};
 const number=(value:number|undefined,fallback:number)=>value===undefined||!Number.isFinite(value)?fallback:Math.max(0,Math.min(2147483647,value));
 const visible=()=>popup.matches(':popover-open');
 const blocked=()=>!root.isConnected||trigger.matches(':disabled,[aria-disabled="true"]')||Boolean(trigger.closest('[inert]'));
 const focused=()=>doc.activeElement===trigger||(!tooltip&&Boolean(doc.activeElement&&popup.contains(doc.activeElement)));
 const active=()=>overTrigger||overPopup||focused();
 const cancelOpen=()=>{if(openTimer!==undefined)view.clearTimeout(openTimer);openTimer=undefined};
 const cancelClose=()=>{if(closeTimer!==undefined)view.clearTimeout(closeTimer);closeTimer=undefined};
 const geometry=()=>{position?.();position=undefined;if(visible())position=uiPosition(trigger,popup,{side:config.side,align:config.align,gap:config.sideOffset})};
 const hide=()=>{
  cancelOpen();cancelClose();if(visible())popup.hidePopover();position?.();position=undefined;
  if(tooltip)hidden(true);else expanded('false');mark(false);
 };
 const show=()=>{
  cancelOpen();cancelClose();if(disposed||escaped||blocked()||!active())return;
  if(tooltip)hidden(false);
  if(!visible()){popup.showPopover();geometry()}
  mark(true);if(!tooltip)expanded('true');
 };
 const open=(immediate=false)=>{
  cancelClose();if(disposed||blocked()||escaped||visible()||openTimer!==undefined)return;
  if(immediate||config.openDelay===0)show();else openTimer=view.setTimeout(()=>{openTimer=undefined;show()},config.openDelay);
 };
 const close=()=>{
  cancelOpen();if(active()||disposed)return;cancelClose();
  if(config.closeDelay===0)hide();else closeTimer=view.setTimeout(()=>{closeTimer=undefined;if(!active())hide()},config.closeDelay);
 };
 on(trigger,'pointerenter',(e:PointerEvent)=>{if(e.pointerType==='touch')return;overTrigger=true;escaped=false;open()});
 on(trigger,'pointerleave',(e:PointerEvent)=>{if(e.pointerType==='touch')return;overTrigger=false;close()});
 on(popup,'pointerenter',(e:PointerEvent)=>{if(e.pointerType==='touch')return;overPopup=true;cancelClose()});
 on(popup,'pointerleave',(e:PointerEvent)=>{if(e.pointerType==='touch')return;overPopup=false;close()});
 on(trigger,'pointerdown',()=>{pointerFocus=true});
 on(doc,'click',()=>{pointerFocus=false},true);
 on(doc,'keydown',()=>{pointerFocus=false},true);
 on(trigger,'pointercancel',()=>{pointerFocus=false});
 on(trigger,'focus',()=>{if(returningFocus||(!tooltip&&pointerFocus))return;escaped=false;open(true)});
 on(root,'focusin',(e:FocusEvent)=>{if(e.target!==trigger&&popup.contains(e.target as Node)){cancelClose();if(!tooltip)open(true)}});
 on(root,'focusout',(e:FocusEvent)=>{if(e.relatedTarget===trigger||(!tooltip&&e.relatedTarget instanceof Node&&popup.contains(e.relatedTarget)))return;view.queueMicrotask(()=>{if(!disposed)close()})});
 on(doc,'keydown',(e:KeyboardEvent)=>{
  if(e.key!=='Escape'||(!visible()&&openTimer===undefined))return;
  const restore=!tooltip&&doc.activeElement instanceof Node&&popup.contains(doc.activeElement);
  escaped=true;hide();e.preventDefault();
  if(restore){returningFocus=true;trigger.focus();returningFocus=false}
 },true);
 on(popup,'beforetoggle',(e:ToggleEvent)=>{
  if(e.newState==='open'&&(disposed||blocked())){e.preventDefault();return}
  if(e.newState==='closed'){cancelOpen();cancelClose();position?.();position=undefined;if(tooltip)hidden(true);else expanded('false');mark(false);escaped=true;overPopup=false}
 });
 on(popup,'toggle',()=>{if(disposed)return;if(visible()){mark(true);if(!tooltip)expanded('true');if(!position)geometry()}});
 // Re-query native disabled/inert ancestry after mutations and relocation.
 const observer=new MutationObserver(()=>{if(blocked()){overTrigger=overPopup=false;hide()}});
 observer.observe(doc.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','aria-disabled','inert']});
 const sync=(next:UiHoverOptions={})=>{
  if(disposed)return;
  if(!tooltip&&trigger.getAttribute('aria-controls')===lastControls)controls(popup.id);
  const before=config;
  config={side:next.side??(tooltip?'top':'bottom'),align:next.align??'center',openDelay:number(next.openDelay,tooltip?0:600),closeDelay:number(next.closeDelay,tooltip?200:300),sideOffset:number(next.sideOffset,4)};
  if(blocked())hide();else if(visible()&&(!before||before.side!==config.side||before.align!==config.align||before.sideOffset!==config.sideOffset))geometry();
 };
 // Long descriptions use native overflow; short content retains the exterior arrow.
 const overflowBefore=popup.style.getPropertyValue('overflow-y'),overflowPriority=popup.style.getPropertyPriority('overflow-y');
 let overflowLast=overflowBefore,overflowLastPriority=overflowPriority,overflowReleased=false,clipFrame=0;
 const measureContent=()=>{
  clipFrame=0;if(disposed||!visible())return;
  if(popup.style.getPropertyValue('overflow-y')!==overflowLast||popup.style.getPropertyPriority('overflow-y')!==overflowLastPriority){overflowReleased=true;return}
  if(overflowReleased)return;
  const computed=view.getComputedStyle(popup),range=doc.createRange();range.selectNodeContents(popup);
  const bounds=range.getBoundingClientRect(),available=popup.clientHeight-(parseFloat(computed.paddingTop)||0)-(parseFloat(computed.paddingBottom)||0);
  const value=bounds.height>available+1?'auto':overflowBefore;
  if(value!==overflowLast){if(value)popup.style.setProperty('overflow-y',value,overflowPriority);else popup.style.removeProperty('overflow-y');overflowLast=popup.style.getPropertyValue('overflow-y');overflowLastPriority=popup.style.getPropertyPriority('overflow-y')}
 };
 const clip=()=>{if(!disposed&&!clipFrame)clipFrame=view.requestAnimationFrame(measureContent)};
 if(tooltip&&view.getComputedStyle(popup).overflowY==='visible'){
  const contentObserver=new MutationObserver(clip);contentObserver.observe(popup,{childList:true,characterData:true,subtree:true});cleanups.push(()=>contentObserver.disconnect());
  if(view.ResizeObserver){const resize=new view.ResizeObserver(clip);resize.observe(popup);cleanups.push(()=>resize.disconnect())}
  on(popup,'toggle',clip);
 }
 sync(options);
 return {sync,dispose:()=>{
  if(disposed)return;disposed=true;cancelOpen();cancelClose();if(clipFrame)view.cancelAnimationFrame(clipFrame);observer.disconnect();cleanups.forEach(fn=>fn());
  if(visible())popup.hidePopover();position?.();position=undefined;
  if(popup.getAttribute('data-open')===lastOpen){if(originalOpen===null)popup.removeAttribute('data-open');else popup.setAttribute('data-open',originalOpen)}
  if(tooltip&&!overflowReleased&&popup.style.getPropertyValue('overflow-y')===overflowLast&&popup.style.getPropertyPriority('overflow-y')===overflowLastPriority){if(overflowBefore)popup.style.setProperty('overflow-y',overflowBefore,overflowPriority);else popup.style.removeProperty('overflow-y')}
  if(tooltip){if(popup.getAttribute('popover')==='manual'){if(originalPopover===null)popup.removeAttribute('popover');else popup.setAttribute('popover',originalPopover)}if(popup.hidden===lastHidden)popup.hidden=originalHidden}
  else{if(trigger.getAttribute('aria-controls')===lastControls){if(originalControls===null)trigger.removeAttribute('aria-controls');else trigger.setAttribute('aria-controls',originalControls)}if(trigger.getAttribute('aria-expanded')===lastExpanded){if(originalExpanded===null)trigger.removeAttribute('aria-expanded');else trigger.setAttribute('aria-expanded',originalExpanded)}}
 }};
}
`;
