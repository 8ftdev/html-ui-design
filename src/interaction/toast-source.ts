export const toastRuntimeSource=String.raw`
export interface UiToastOptions {open?:boolean;duration?:number}
export function uiToast(root:HTMLElement,options:UiToastOptions={},changed?:(open:boolean)=>void){
 const part=(n:string)=>Array.from(root.querySelectorAll<HTMLElement>('[data-ui-part="'+n+'"]')).find(e=>e.dataset.ui===root.dataset.ui&&e.closest('[data-ui-part="root"]')===root)!;
 const surface=part('surface'),announcer=part('announcer'),title=part('title'),content=part('content'),close=part('close');
 const cleanups:(()=>void)[]=[];let open=false,disposed=false,pointer=false,focused=false,timer:ReturnType<typeof setTimeout>|undefined,remaining=0,started=0,previous:HTMLElement|null=null;
 const on=(n:EventTarget,t:string,f:(e:any)=>void)=>{n.addEventListener(t,f);cleanups.push(()=>n.removeEventListener(t,f))};
 const duration=()=>typeof options.duration==='number'&&Number.isFinite(options.duration)?Math.max(0,options.duration):0;
 const paused=()=>pointer||focused||document.hidden;
 const clear=()=>{if(timer!==undefined){clearTimeout(timer);timer=undefined;remaining=Math.max(0,remaining-(performance.now()-started))}};
 const announce=()=>{const text=[title.textContent?.trim(),content.textContent?.trim()].filter(Boolean).join(' ');if(announcer.textContent!==(open?text:''))announcer.textContent=open?text:''};
 const schedule=()=>{if(disposed)return;clear();if(open&&duration()>0&&!paused()){started=performance.now();timer=setTimeout(()=>{timer=undefined;set(false,true)},remaining)}};
 const set=(next:boolean,notify=false)=>{
  if(disposed||next===open)return;clear();open=next;
  if(open){previous=document.activeElement instanceof HTMLElement?document.activeElement:null;remaining=duration();focused=surface.contains(document.activeElement);pointer=surface.matches(':hover')}
  else if(surface.contains(document.activeElement)){if(previous?.isConnected&&!root.contains(previous))previous.focus({preventScroll:true});else (document.activeElement as HTMLElement).blur()}
  surface.hidden=!open;surface.dataset.state=open?'open':'closed';announce();schedule();if(notify)changed?.(open);
 };
 on(close,'click',()=>set(false,true));
 on(surface,'keydown',(e:KeyboardEvent)=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();set(false,true)}});
 on(surface,'pointerenter',()=>{pointer=true;schedule()});on(surface,'pointerleave',()=>{pointer=false;schedule()});
 on(surface,'focusin',()=>{focused=true;schedule()});on(surface,'focusout',()=>queueMicrotask(()=>{if(disposed)return;focused=surface.contains(document.activeElement);schedule()}));
 on(document,'visibilitychange',schedule);
 const observer=new MutationObserver(announce);observer.observe(title,{subtree:true,childList:true,characterData:true});observer.observe(content,{subtree:true,childList:true,characterData:true});cleanups.push(()=>observer.disconnect());
 surface.hidden=true;surface.dataset.state='closed';announcer.textContent='';
 const sync=(next:UiToastOptions={})=>{if(disposed)return;const old=duration();options=next;if(Boolean(next.open)!==open)set(Boolean(next.open));else if(old!==duration()){clear();remaining=duration();schedule()}announce()};sync(options);
 return {sync,dispose(){disposed=true;clear();cleanups.forEach(f=>f())}};
}
`;
