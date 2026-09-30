// The native select owns values, form association and constraints; this adapter owns presentation.
export const selectRuntimeSource = String.raw`
export function uiSelect(root: HTMLElement) {
  const owned = (node: Element) => node.closest('[data-ui="select-list"][data-ui-part="root"]') === root;
  const part = (name: string) => Array.from(root.querySelectorAll<HTMLElement>('[data-ui-part="'+name+'"]')).find(owned)!;
  const control = part('control') as HTMLSelectElement, trigger = part('trigger') as HTMLButtonElement;
  const popup = part('popup'), displayed = part('value'), prototype = part('option');
  if (!control || !trigger || !popup || !displayed || !prototype) throw new Error('Select requires owned reviewed parts');
  const cleanups: (()=>void)[] = [], projected: HTMLElement[] = [];
  const listen = (node: EventTarget, name: string, fn: (e:any)=>void) => {node.addEventListener(name,fn);cleanups.push(()=>node.removeEventListener(name,fn))};
  const doc = root.ownerDocument;
  let disposed=false, active=-1, buffer='', typedAt=0, invalid=false, baseline=false, queued=false;
  let disposePosition: (()=>void)|undefined, placement='', previousInvalid: string|null=null;
  let observedLabels: HTMLLabelElement[]=[];
  const naming=new MutationObserver(()=>sync());cleanups.push(()=>naming.disconnect());
  const opened = () => popup.matches(':popover-open');
  const unavailable = () => control.matches(':disabled') || Boolean(root.closest('[inert]'));
  const options = () => Array.from(control.options);
  const enabled = (i:number) => {const option=control.options[i];return Boolean(option&&!option.disabled&&!option.hidden&&!(option.parentElement instanceof HTMLOptGroupElement&&option.parentElement.disabled))};
  const candidates = () => options().map((_,i)=>i).filter(enabled);
  const hide = () => {if(opened())popup.hidePopover();trigger.setAttribute('aria-expanded','false');trigger.removeAttribute('aria-activedescendant');active=-1};
  const highlight = (index:number) => {
    active=index;
    for(const item of projected){if(Number(item.dataset.optionIndex)===index)item.setAttribute('data-highlighted','true');else item.removeAttribute('data-highlighted')}
    const item=projected.find(item=>Number(item.dataset.optionIndex)===index);
    if(item&&opened()){trigger.setAttribute('aria-activedescendant',item.id);item.scrollIntoView({block:'nearest'})}
    else trigger.removeAttribute('aria-activedescendant');
  };
  const sync = () => {
    if(disposed)return;
    const nextPlacement=(root.dataset.side??'bottom')+':'+(root.dataset.align??'start');
    if(nextPlacement!==placement){disposePosition?.();placement=nextPlacement;disposePosition=uiPosition(trigger,popup,{side:root.dataset.side==='top'?'top':'bottom',align:(['start','center','end'].includes(root.dataset.align??'')?root.dataset.align:'start') as 'start'|'center'|'end',matchWidth:true})}
    // A model value supplied at mount establishes the same reset baseline as initial selected options.
    if(!baseline){for(const option of options())option.defaultSelected=option.selected;baseline=true}
    if(trigger.disabled!==unavailable())trigger.disabled=unavailable();
    trigger.setAttribute('aria-required',String(control.required));
    const labels=Array.from(trigger.labels??[]);
    if(labels.length!==observedLabels.length||labels.some((label,i)=>label!==observedLabels[i])){naming.disconnect();observedLabels=labels;for(const label of labels)naming.observe(label,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['for','id']})}
    const labelledby=trigger.getAttribute('aria-labelledby');
    if(labelledby){popup.setAttribute('aria-labelledby',labelledby);popup.removeAttribute('aria-label')}
    else {popup.removeAttribute('aria-labelledby');popup.setAttribute('aria-label',trigger.getAttribute('aria-label')||Array.from(trigger.labels??[]).map(label=>label.textContent?.trim()).filter(Boolean).join(' ')||'Options')}
    const option=control.selectedOptions[0];
    const placeholder=!option||option.value==='';
    const text=placeholder?(root.dataset.placeholder??'Select an option'):(option.label||option.textContent||'');
    if(displayed.textContent!==text)displayed.textContent=text;
    trigger.toggleAttribute('data-placeholder',placeholder);
    for(const item of projected){const i=Number(item.dataset.optionIndex);item.setAttribute('aria-selected',String(i===control.selectedIndex));item.setAttribute('aria-disabled',String(!enabled(i)))}
    if(invalid&&control.validity.valid){invalid=false;if(trigger.getAttribute('aria-invalid')==='true'){if(previousInvalid===null)trigger.removeAttribute('aria-invalid');else trigger.setAttribute('aria-invalid',previousInvalid)}}
    if(unavailable())hide();
  };
  const render = () => {
    if(disposed)return;
    for(const item of Array.from(popup.children))if(item!==prototype)item.remove();
    projected.length=0;
    const append = (option: HTMLOptionElement, parent:HTMLElement) => {
      if(option.hidden)return;
      const index=options().indexOf(option),item=prototype.cloneNode(false) as HTMLElement;
      item.hidden=false;item.id=popup.id+'-option-'+index;item.dataset.optionIndex=String(index);
      item.removeAttribute('data-highlighted');item.tabIndex=-1;
      const text=doc.createElement('span');text.textContent=option.label||option.textContent||'';
      const icon=doc.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('fill','none');icon.setAttribute('stroke','currentColor');icon.setAttribute('stroke-width','2');icon.setAttribute('aria-hidden','true');icon.dataset.uiCheck='';
      const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','m5 12 4 4L19 6');icon.append(path);
      item.append(text,icon);parent.append(item);projected.push(item);
    };
    for(const child of Array.from(control.children)){
      if(child instanceof HTMLOptionElement)append(child,popup);
      else if(child instanceof HTMLOptGroupElement){
        const group=doc.createElement('div');group.setAttribute('role','group');group.setAttribute('aria-label',child.label);
        const label=doc.createElement('div');label.dataset.uiGroupLabel='';label.textContent=child.label;label.setAttribute('aria-hidden','true');group.append(label);
        for(const option of Array.from(child.children))if(option instanceof HTMLOptionElement)append(option,group);
        popup.append(group);
      }
    }
    sync();if(opened())highlight(enabled(active)?active:(enabled(control.selectedIndex)?control.selectedIndex:(candidates()[0]??-1)));
  };
  const schedule = () => {if(queued||disposed)return;queued=true;queueMicrotask(()=>{queued=false;if(!disposed)render()})};
  const commit = (index:number,close=true) => {
    if(unavailable()||!enabled(index))return;
    const changed=control.selectedIndex!==index;
    control.selectedIndex=index;sync();
    if(changed){control.dispatchEvent(new Event('input',{bubbles:true}));control.dispatchEvent(new Event('change',{bubbles:true}))}
    if(close){hide();trigger.focus()}
  };
  const show = (last=false) => {
    if(unavailable())return;
    render();if(!opened())popup.showPopover();trigger.setAttribute('aria-expanded','true');
    const all=candidates();highlight(enabled(control.selectedIndex)?control.selectedIndex:(last?all.at(-1):all[0])??-1);
  };
  listen(trigger,'click',(e:MouseEvent)=>{e.preventDefault();if(opened())hide();else show()});
  listen(trigger,'keydown',(e:KeyboardEvent)=>{
    if(unavailable()||e.ctrlKey||e.metaKey)return;
    const all=candidates();
    if(e.key==='Escape'){if(opened()){e.preventDefault();hide();trigger.focus()}return}
    if(e.key==='Tab'){if(opened()){if(enabled(active))commit(active,false);hide()}return}
    if(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='Home'||e.key==='End'){
      e.preventDefault();if(!opened()){show(e.key==='ArrowUp'||e.key==='End');if(e.key==='Home')highlight(all[0]??-1);if(e.key==='End')highlight(all.at(-1)??-1);return}
      const i=all.indexOf(active);highlight(e.key==='Home'?(all[0]??-1):e.key==='End'?(all.at(-1)??-1):(all[Math.max(0,Math.min(all.length-1,i+(e.key==='ArrowDown'?1:-1)))]??-1));return;
    }
    if(e.key==='Enter'||e.key===' '){e.preventDefault();if(opened())commit(active);else show();return}
    if(e.altKey||e.key.length!==1||/\s/.test(e.key))return;
    e.preventDefault();const now=Date.now();buffer=(now-typedAt>700?'':buffer)+e.key.toLocaleLowerCase();typedAt=now;
    const query=Array.from(buffer).every(c=>c===buffer[0])?(buffer[0]??''):buffer;
    const start=opened()?active:control.selectedIndex,ordered=[...all.filter(i=>i>start),...all.filter(i=>i<=start)];
    const found=ordered.find(i=>(control.options[i]!.label||control.options[i]!.text).trim().toLocaleLowerCase().startsWith(query));
    if(found!==undefined){if(opened())highlight(found);else commit(found,false)}
  });
  listen(popup,'pointerdown',(e:PointerEvent)=>{if((e.target as Element).closest('[data-option-index]'))e.preventDefault()});
  listen(popup,'pointermove',(e:PointerEvent)=>{const item=(e.target as Element).closest<HTMLElement>('[data-option-index]');if(item&&owned(item)&&enabled(Number(item.dataset.optionIndex)))highlight(Number(item.dataset.optionIndex))});
  listen(popup,'click',(e:MouseEvent)=>{const item=(e.target as Element).closest<HTMLElement>('[data-option-index]');if(item&&owned(item)){e.preventDefault();commit(Number(item.dataset.optionIndex))}});
  listen(popup,'toggle',()=>{
    if(disposed)return;
    trigger.setAttribute('aria-expanded',String(opened()));
    // Delayed toggle delivery must never reset navigation that already happened.
    if(!opened()){trigger.removeAttribute('aria-activedescendant');active=-1}
  });
  listen(control,'input',sync);listen(control,'change',sync);
  listen(control,'invalid',(e:Event)=>{e.preventDefault();if(!invalid)previousInvalid=trigger.getAttribute('aria-invalid');invalid=true;trigger.setAttribute('aria-invalid','true');hide();trigger.focus()});
  listen(doc,'reset',(e:Event)=>{if(e.target!==control.form)return;setTimeout(()=>{if(!disposed&&!e.defaultPrevented){hide();sync()}},0)});
  const observer=new MutationObserver(schedule);
  observer.observe(control,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['label','value','disabled','selected','hidden','required']});
  const presentation=new MutationObserver(schedule);presentation.observe(prototype,{attributes:true,attributeFilter:['class','style']});presentation.observe(root,{attributes:true,attributeFilter:['data-placeholder','data-side','data-align']});presentation.observe(popup,{attributes:true,attributeFilter:['id']});presentation.observe(trigger,{attributes:true,attributeFilter:['aria-label','aria-labelledby','id']});
  const label=part('label');if(label)presentation.observe(label,{childList:true,subtree:true,characterData:true});
  // A form can disable or move a whole component without changing its own props.
  const ancestry=new MutationObserver(records=>{if(records.some(record=>record.type==='attributes'&&(record.target===root||root.parentElement?.closest('[disabled],[inert]')===record.target||record.target instanceof Element&&record.target.contains(root))||record.type==='childList'&&Array.from(record.addedNodes).some(node=>node===root||node.contains(root))))sync()});ancestry.observe(doc.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','inert']});
  cleanups.push(()=>observer.disconnect(),()=>presentation.disconnect(),()=>ancestry.disconnect());
  cleanups.push(()=>disposePosition?.());
  render();
  return {sync,dispose:()=>{if(disposed)return;disposed=true;hide();for(const dispose of cleanups)dispose();for(const item of Array.from(popup.children))if(item!==prototype)item.remove()}};
}
`;
