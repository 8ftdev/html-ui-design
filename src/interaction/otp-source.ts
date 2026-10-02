/** One native input; projected cells never become extra form controls. */
export const otpRuntimeSource=String.raw`
export interface UiOtpOptions {groupSize?:number}
export function uiOtp(root:HTMLElement,options:UiOtpOptions={}){
 const part=(name:string)=>Array.from(root.querySelectorAll<HTMLElement>('[data-ui-part="'+name+'"]')).find(n=>n.dataset.ui===root.dataset.ui)!;
 const input=part('control') as HTMLInputElement,cells=part('cells'),prototype=part('cell');
 const cleanups:(()=>void)[]=[];let disposed=false,composing=false,signature='';
 const on=(n:EventTarget,t:string,f:(e:any)=>void)=>{n.addEventListener(t,f);cleanups.push(()=>n.removeEventListener(t,f))};
 const disabled=()=>input.matches(':disabled')||Boolean(input.closest('[inert]'));
 const length=()=>{const n=input.maxLength;return Number.isInteger(n)&&n>=1&&n<=32?n:6};
 const group=()=>{const n=options.groupSize??3;return Number.isInteger(n)&&n>=1&&n<=length()?n:length()};
 const projections=()=>Array.from(cells.querySelectorAll<HTMLElement>('[data-ui-otp-index]'));
 const render=()=>{
  if(disposed)return;
  const next=[length(),group(),prototype.className,prototype.getAttribute('style'),prototype.innerHTML].join('|');
  if(next!==signature){signature=next;projections().forEach(n=>n.remove());for(let i=0;i<length();i++){
   const cell=prototype.cloneNode(true) as HTMLElement;cell.hidden=false;cell.removeAttribute('id');cell.dataset.uiOtpIndex=String(i);
   cell.dataset.groupStart=String(i%group()===0);cell.dataset.groupEnd=String(i%group()===group()-1||i===length()-1);cells.append(cell);
  }}
  const focus=document.activeElement===input,start=input.selectionStart??0,end=input.selectionEnd??start;
  const invalid=input.getAttribute('aria-invalid')==='true'||!input.validity.valid;
  cells.dataset.disabled=String(disabled());
  for(const cell of projections()){
   const i=Number(cell.dataset.uiOtpIndex),character=cell.querySelector<HTMLElement>('[data-ui-part="character"]')!,caret=cell.querySelector<HTMLElement>('[data-ui-part="caret"]')!;
   character.textContent=input.value[i]??'';character.dataset.selected=String(focus&&i>=start&&i<end);
   const active=focus&&!disabled()&&i===Math.min(start,length()-1);
   cell.dataset.active=String(active);cell.dataset.invalid=String(invalid);cell.dataset.disabled=String(disabled());cell.dataset.selected=String(focus&&i>=start&&i<end);
   caret.hidden=!(active&&!input.value[i]);
  }
 };
 for(const event of ['input','change','focus','blur','keyup','click','select'])on(input,event,render);
 on(document,'selectionchange',()=>{if(document.activeElement===input)render()});
 on(root,'pointerdown',(e:PointerEvent)=>{
  if(disabled()||e.button!==0)return;
  const cell=projections().find(n=>{const b=n.getBoundingClientRect();return e.clientX>=b.left&&e.clientX<=b.right&&e.clientY>=b.top&&e.clientY<=b.bottom});
  if(!cell)return;
  e.preventDefault();input.focus({preventScroll:true});const index=Math.min(Number(cell.dataset.uiOtpIndex),input.value.length);input.setSelectionRange(index,Math.min(index+1,input.value.length));render();
 });
 on(input,'compositionstart',()=>{composing=true});on(input,'compositionend',()=>{composing=false;render()});
 on(input,'input',(e:InputEvent)=>{if(composing||e.isComposing)return;if(input.selectionStart===input.selectionEnd&&input.selectionStart!==null&&input.selectionStart<input.value.length)input.setSelectionRange(input.selectionStart,input.selectionStart+1);render()});
 if(input.form)on(input.form,'reset',()=>queueMicrotask(render));
 const observer=new MutationObserver(records=>{if(records.some(r=>r.target===input||prototype.contains(r.target as Node)||r.target===prototype))render()});
 observer.observe(root,{subtree:true,attributes:true,attributeFilter:['disabled','readonly','maxlength','minlength','required','aria-invalid','class','style']});cleanups.push(()=>observer.disconnect());
 const ancestry=new MutationObserver(render);for(let n:HTMLElement|null=root;n;n=n.parentElement)ancestry.observe(n,{attributes:true,attributeFilter:['disabled','inert']});cleanups.push(()=>ancestry.disconnect());
 render();return {sync(next:UiOtpOptions={}){options=next;render()},dispose(){disposed=true;cleanups.forEach(f=>f());projections().forEach(n=>n.remove())}};
}
`;
