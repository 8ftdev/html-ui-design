// Native modal behavior, with local fallback for invoker commands and light dismissal.
export const dialogRuntimeSource=String.raw`
export function uiDialog(root:HTMLElement){
 const doc=root.ownerDocument,view=doc.defaultView!;
 const owned=(node:Element)=>node.closest('[data-ui-part="root"][data-ui="'+root.dataset.ui+'"]')===root;
 const part=(name:string)=>Array.from(root.querySelectorAll<HTMLElement>('[data-ui-part="'+name+'"]')).find(node=>node.dataset.ui===root.dataset.ui&&owned(node));
 const trigger=part('trigger'),dialog=part('dialog') as HTMLDialogElement|undefined;
 if(!trigger||!dialog)return ()=>{};
 const cleanups:(()=>void)[]=[];
 const on=(node:EventTarget,type:string,fn:(event:any)=>void,capture=false)=>{node.addEventListener(type,fn,capture);cleanups.push(()=>node.removeEventListener(type,fn,capture))};
 const disabled=(node:HTMLElement)=>node.matches(':disabled')||Boolean(node.closest('[inert],[aria-disabled="true"]'));
 const command=(button:HTMLButtonElement)=>button===trigger?'show-modal':button===part('close')?'close':button.getAttribute('commandfor')===dialog.id?button.getAttribute('command'):null;
 on(root,'click',(e:MouseEvent)=>{const button=(e.target as Element).closest<HTMLButtonElement>('button');if(button&&owned(button)&&command(button)&&disabled(button)){e.preventDefault();e.stopImmediatePropagation()}},true);
 on(root,'click',(e:MouseEvent)=>{
  if(e.defaultPrevented)return;const button=(e.target as Element).closest<HTMLButtonElement>('button');if(!button||!owned(button)||disabled(button))return;
  const action=command(button);if(action==='show-modal'){e.preventDefault();if(!dialog.open){button.focus();dialog.showModal()}}
  else if(action==='close'){e.preventDefault();dialog.close()}
  else if(action==='request-close'){e.preventDefault();request()}
 });
 const request=()=>{if(!dialog.open)return;if(typeof dialog.requestClose==='function')dialog.requestClose();else if(dialog.dispatchEvent(new view.Event('cancel',{cancelable:true})))dialog.close()};
 const outside=(e:PointerEvent)=>{const r=dialog.getBoundingClientRect();return e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)};
 let start:number|undefined;
 on(dialog,'pointerdown',(e:PointerEvent)=>{start=e.button===0&&outside(e)?e.pointerId:undefined});
 on(dialog,'pointercancel',()=>{start=undefined});
 on(dialog,'pointerup',(e:PointerEvent)=>{const dismiss=start===e.pointerId&&outside(e);start=undefined;const policy=dialog.getAttribute('closedby');if(dismiss&&dialog.open&&policy!=='none'&&policy!=='closerequest'&&dialog.getAttribute('role')!=='alertdialog')request()});
 return ()=>{cleanups.forEach(fn=>fn());if(dialog.open)dialog.close()};
}
`;
