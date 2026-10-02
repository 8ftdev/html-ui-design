export const splitRuntimeSource=String.raw`
export interface UiSplitOptions {size?:number;min?:number;max?:number;step?:number;orientation?:'horizontal'|'vertical';disabled?:boolean}
export function uiSplit(root:HTMLElement,options:UiSplitOptions={},changed?:(size:number)=>void){
 const own=(name:string)=>Array.from(root.querySelectorAll<HTMLElement>('[data-ui-part="'+name+'"]')).find(n=>n.dataset.ui===root.dataset.ui&&n.closest('[data-ui-part="root"]')===root)!;
 const handle=own('separator'),start=own('start');const cleanups:(()=>void)[]=[];
 let size=50,drag:{id:number;coordinate:number;size:number}|undefined,disposed=false;
 const on=(n:EventTarget,t:string,f:(e:any)=>void)=>{n.addEventListener(t,f);cleanups.push(()=>n.removeEventListener(t,f))};
 const number=(n:unknown,fallback:number)=>typeof n==='number'&&Number.isFinite(n)?n:fallback;
 const limits=()=>{const min=Math.max(0,Math.min(100,number(options.min,10)));return {min,max:Math.max(min,Math.min(100,number(options.max,90)))}};
 const vertical=()=>options.orientation==='vertical';
 const disabled=()=>options.disabled||Boolean(root.closest('[inert]'));
 const cancel=()=>{if(drag&&handle.hasPointerCapture(drag.id))handle.releasePointerCapture(drag.id);drag=undefined;root.removeAttribute('data-resizing')};
 const render=()=>{
  const {min,max}=limits();size=Math.max(min,Math.min(max,size));
  root.dataset.orientation=vertical()?'vertical':'horizontal';
  root.style.setProperty('--ui-split-start',size+'fr');root.style.setProperty('--ui-split-end',(100-size)+'fr');
  handle.setAttribute('aria-orientation',vertical()?'horizontal':'vertical');handle.setAttribute('aria-valuemin',String(min));handle.setAttribute('aria-valuemax',String(max));handle.setAttribute('aria-valuenow',String(size));handle.setAttribute('aria-valuetext',Math.round(size)+'%');
  handle.setAttribute('aria-controls',start.id);handle.setAttribute('aria-disabled',String(Boolean(disabled())));handle.tabIndex=disabled()?-1:0;
  if(disabled())cancel();
 };
 const set=(next:number)=>{const old=size;size=next;render();if(size!==old){changed?.(size);root.dispatchEvent(new CustomEvent('resize',{detail:size,bubbles:true}))}};
 on(handle,'keydown',(e:KeyboardEvent)=>{
  if(disabled()||e.altKey||e.metaKey||e.ctrlKey)return;
  const rtl=getComputedStyle(root).direction==='rtl',step=Math.max(.1,number(options.step,1))*(e.shiftKey?10:1);let next=size;
  if(e.key==='Home')next=limits().min;else if(e.key==='End')next=limits().max;
  else if(e.key===(vertical()?'ArrowDown':rtl?'ArrowLeft':'ArrowRight'))next+=step;
  else if(e.key===(vertical()?'ArrowUp':rtl?'ArrowRight':'ArrowLeft'))next-=step;else return;
  e.preventDefault();set(next);
 });
 on(handle,'pointerdown',(e:PointerEvent)=>{if(disabled()||e.button!==0)return;e.preventDefault();handle.focus({preventScroll:true});drag={id:e.pointerId,coordinate:vertical()?e.clientY:e.clientX,size};handle.setPointerCapture(e.pointerId);root.dataset.resizing='true'});
 on(handle,'pointermove',(e:PointerEvent)=>{if(!drag||drag.id!==e.pointerId||disabled())return;const rect=root.getBoundingClientRect(),length=vertical()?rect.height:rect.width;if(length<=0)return;const delta=((vertical()?e.clientY:e.clientX)-drag.coordinate)/length*100;set(Math.round((drag.size+delta*(!vertical()&&getComputedStyle(root).direction==='rtl'?-1:1))*100)/100)});
 for(const t of ['pointerup','pointercancel','lostpointercapture'])on(handle,t,cancel);
 const observer=new MutationObserver(()=>{render()});for(let n:HTMLElement|null=root;n;n=n.parentElement)observer.observe(n,{attributes:true,attributeFilter:['inert']});cleanups.push(()=>observer.disconnect());
 const sync=(next:UiSplitOptions={})=>{if(disposed)return;options=next;size=number(next.size,size);render()};sync(options);
 return {sync,dispose(){disposed=true;cancel();cleanups.forEach(f=>f())}};
}
`;
