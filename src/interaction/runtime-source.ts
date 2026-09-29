// One editable local helper per generated library; pipe output embeds it.
export const interactionRuntimeSource=String.raw`
export type UiInteraction = 'dialog'|'popover'|'tabs'|'menu'|'context-menu'|'toolbar'|'toggle'|'toggle-group'|'tooltip';
export function uiInteraction(root: HTMLElement, kind: UiInteraction, changed?: (pressed:boolean)=>void) {
  const cleanups: (()=>void)[]=[];
  const on=(node:EventTarget,type:string,handler:(event:any)=>void,capture=false)=>{node.addEventListener(type,handler,capture);cleanups.push(()=>node.removeEventListener(type,handler,capture))};
  const owned=(node:Element)=>node.closest('[data-ui-part="root"][data-ui="'+root.dataset.ui+'"]')===root;
  const disabled=(node:HTMLElement)=>node.matches(':disabled,[aria-disabled="true"],[inert]')||Boolean(node.closest('[inert]'));
  const notify=()=>root.dispatchEvent(new Event('change',{bubbles:true}));
  const part=(name:string)=>Array.from(root.querySelectorAll<HTMLElement>('[data-ui-part="'+name+'"]')).find(node=>node.dataset.ui===root.dataset.ui&&owned(node));
  const popup=part('popup'),trigger=part('trigger');
  const visible=()=>Boolean(popup?.matches(':popover-open'));
  const show=()=>{if(popup&&!visible())popup.showPopover()};
  const hide=()=>{if(popup&&visible())popup.hidePopover()};
  if(kind==='dialog'){
    const dialog=part('dialog') as HTMLDialogElement|null;
    // Prevent declarative command default so this also works in older engines.
    on(root,'click',(e:MouseEvent)=>{
      const button=(e.target as Element).closest('button');
      if(!button||disabled(button)||!owned(button)||!dialog)return;
      if(button===trigger){e.preventDefault();if(!dialog.open){trigger!.focus();dialog.showModal()}}
      else if(button===part('close')){e.preventDefault();dialog.close()}
    });
  }
  if(kind==='toggle')on(root,'click',()=>{
    if(disabled(root))return;
    const pressed=root.getAttribute('aria-pressed')!=='true';
    root.setAttribute('aria-pressed',String(pressed));changed?.(pressed);
  });
  if(kind==='tabs'){
    const list=part('list')!;
    const tabs=()=>Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')).filter(t=>owned(t));
    const panels=()=>Array.from(root.querySelectorAll<HTMLElement>('[role="tabpanel"]')).filter(t=>owned(t));
    const select=(tab:HTMLElement,focus=false,announce=false)=>{
      if(disabled(tab))return;
      for(const t of tabs()){const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1}
      for(const panel of panels())panel.hidden=panel.id!==tab.getAttribute('aria-controls');
      if(focus)tab.focus();if(announce)notify();
    };
    const init=()=>{const all=tabs();const tab=all.find(t=>t.getAttribute('aria-selected')==='true'&&!disabled(t))??all.find(t=>!disabled(t));if(tab)select(tab)};
    init();
    const observer=new MutationObserver(init);observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','aria-disabled']});cleanups.push(()=>observer.disconnect());
    on(list,'click',(e:MouseEvent)=>{const tab=(e.target as Element).closest<HTMLElement>('[role="tab"]');if(tab&&owned(tab))select(tab,false,true)});
    on(list,'keydown',(e:KeyboardEvent)=>{
      const all=tabs().filter(t=>!disabled(t)),current=(e.target as Element).closest<HTMLElement>('[role="tab"]');
      if(!current||!all.includes(current)||e.altKey||e.ctrlKey||e.metaKey)return;
      const vertical=list.getAttribute('aria-orientation')==='vertical',rtl=getComputedStyle(list).direction==='rtl';
      let index=all.indexOf(current),next=index;
      if(e.key==='Home')next=0;else if(e.key==='End')next=all.length-1;
      else if(e.key===(vertical?'ArrowDown':rtl?'ArrowLeft':'ArrowRight'))next=(index+1)%all.length;
      else if(e.key===(vertical?'ArrowUp':rtl?'ArrowRight':'ArrowLeft'))next=(index-1+all.length)%all.length;
      else return;
      e.preventDefault();select(all[next]!,true,true);
    });
  }
  if(kind==='toolbar'||kind==='toggle-group'){
    const controls=()=>Array.from(root.querySelectorAll<HTMLElement>('button,a[href],input,select,textarea,[tabindex]')).filter(t=>owned(t)&&!disabled(t)&&!t.closest('[hidden]')&&!t.closest('[popover]:not(:popover-open)'));
    const init=()=>{const all=controls(),active=all.find(t=>t.tabIndex===0)??all[0];all.forEach(t=>t.tabIndex=t===active?0:-1)};
    init();const observer=new MutationObserver(init);observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','aria-disabled','hidden']});cleanups.push(()=>observer.disconnect());
    on(root,'focusin',(e:FocusEvent)=>{const node=e.target as HTMLElement;if(controls().includes(node))controls().forEach(t=>t.tabIndex=t===node?0:-1)});
    on(root,'keydown',(e:KeyboardEvent)=>{
      const node=e.target as HTMLElement;if(!owned(node)||node.matches('input,select,textarea')||e.altKey||e.ctrlKey||e.metaKey)return;
      const all=controls(),index=all.indexOf(node);if(index<0||!all.length)return;
      const rtl=getComputedStyle(root).direction==='rtl';let next=index;
      if(e.key==='Home')next=0;else if(e.key==='End')next=all.length-1;
      else if(e.key===(rtl?'ArrowLeft':'ArrowRight'))next=(index+1)%all.length;
      else if(e.key===(rtl?'ArrowRight':'ArrowLeft'))next=(index-1+all.length)%all.length;else return;
      e.preventDefault();all[next]!.focus();
    });
  }
  if(kind==='menu'||kind==='context-menu'){
    const items=()=>Array.from(popup!.querySelectorAll<HTMLElement>('[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]')).filter(t=>t.closest('[role="menu"]')===popup&&!disabled(t));
    trigger?.setAttribute('aria-haspopup','menu');trigger?.setAttribute('aria-expanded','false');
    if(popup&&trigger){
      let openAtLast=false;
      const focus=(last=false)=>{const all=items();all.forEach(t=>t.tabIndex=-1);(last?all.at(-1):all[0])?.focus()};
      on(popup,'toggle',(e:ToggleEvent)=>{trigger.setAttribute('aria-expanded',String(e.newState==='open'));if(e.newState==='open'){focus(openAtLast);openAtLast=false}});
      on(trigger,'keydown',(e:KeyboardEvent)=>{if(disabled(trigger))return;if(e.key==='ArrowDown'||e.key==='ArrowUp'||(kind==='context-menu'&&e.shiftKey&&e.key==='F10')){e.preventDefault();openAtLast=e.key==='ArrowUp';show();focus(openAtLast)}});
      if(kind==='context-menu')on(root,'contextmenu',(e:MouseEvent)=>{if(!disabled(trigger)){e.preventDefault();show();focus()}});
      on(popup,'keydown',(e:KeyboardEvent)=>{
        if(e.key==='Escape'){e.preventDefault();hide();trigger.focus();return}
        if(e.key==='Tab'){hide();return}
        const all=items(),current=(e.target as Element).closest<HTMLElement>('[role^="menuitem"]'),index=all.indexOf(current!);if(index<0)return;
        let next=index;
        if(e.key==='Home')next=0;else if(e.key==='End')next=all.length-1;else if(e.key==='ArrowDown')next=(index+1)%all.length;else if(e.key==='ArrowUp')next=(index-1+all.length)%all.length;else return;
        e.preventDefault();all[next]!.focus();
      });
      on(popup,'click',(e:MouseEvent)=>{const item=(e.target as Element).closest<HTMLElement>('[role^="menuitem"]');if(item&&disabled(item)){e.preventDefault();e.stopImmediatePropagation()}},true);
      on(popup,'click',(e:MouseEvent)=>{const item=(e.target as Element).closest<HTMLElement>('[role^="menuitem"]');if(!item)return;if(disabled(item)){e.preventDefault();e.stopPropagation();return}hide();trigger.focus()});
    }
  }
  if(kind==='tooltip'){
    const tip=part('tooltip');let escaped=false;
    if(tip&&trigger){
      tip.hidden=true;
      const reveal=()=>{if(!disabled(trigger)&&!escaped)tip.hidden=false};
      const conceal=()=>{tip.hidden=true};
      on(root,'pointerenter',()=>{escaped=false;reveal()});
      on(root,'pointerleave',()=>{if(!root.contains(document.activeElement))conceal();escaped=false});
      on(trigger,'focus',()=>{escaped=false;reveal()});
      on(root,'focusout',(e:FocusEvent)=>{if(!root.contains(e.relatedTarget as Node)&&!root.matches(':hover'))conceal()});
      on(document,'keydown',(e:KeyboardEvent)=>{if(e.key==='Escape'&&!tip.hidden){escaped=true;conceal()}});
    }
  }
  return ()=>cleanups.forEach(dispose=>dispose());
}
`;
