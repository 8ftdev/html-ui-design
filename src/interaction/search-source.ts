// Query and committed selection deliberately have separate lifecycles.
export const searchRuntimeSource = String.raw`
export function uiSearch(root:HTMLElement,kind:'combobox'|'command',selected?:(value:string)=>void){
 const owned=(node:Element)=>node.closest('[data-ui-part="root"][data-ui="'+root.dataset.ui+'"]')===root;
 const part=(name:string)=>Array.from(root.querySelectorAll<HTMLElement>('[data-ui-part="'+name+'"]')).find(owned)!;
 const control=part('control') as HTMLSelectElement,input=part('input') as HTMLInputElement,popup=part('popup'),prototype=part('option'),empty=part('empty');
 if(!control||!input||!popup||!prototype||!empty)throw new Error('Search requires reviewed owned parts');
 const command=kind==='command',list=uiOptions(control,popup,prototype,!command),cleanups:(()=>void)[]=[],doc=root.ownerDocument;
 const listen=(node:EventTarget,name:string,fn:(e:any)=>void)=>{node.addEventListener(name,fn);cleanups.push(()=>node.removeEventListener(name,fn))};
 let disposed=false,editing=false,composing=false,active=-1,query='',baseline=false,queued=false,lastValue:string|undefined;
 let invalid=false,previousInvalid:string|null=null,disposePosition:(()=>void)|undefined,placement='';
 let observedLabels:HTMLLabelElement[]=[];
 const opened=()=>command||popup.matches(':popover-open');
 const unavailable=()=>control.matches(':disabled')||Boolean(root.closest('[inert]'));
 const labelText=()=>{const option=control.selectedOptions[0];return option&&option.value!==''?(option.label||option.text):''};
 const normalize=(text:string)=>text.normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase().trim();
 const matches=(option:HTMLOptionElement)=>normalize(query).split(/\s+/).every(word=>normalize((option.label||option.text)+' '+(option.dataset.keywords??'')).includes(word));
 const candidates=()=>unavailable()?[]:list.items.filter(item=>!item.hidden&&uiOptionEnabled(control.options[Number(item.dataset.optionIndex)])).map(item=>Number(item.dataset.optionIndex));
 const enabled=(index:number)=>candidates().includes(index);
 const highlight=(index:number)=>{
  active=index;
  for(const item of list.items){const current=Number(item.dataset.optionIndex)===index;item.toggleAttribute('data-highlighted',current);if(current)item.setAttribute('data-highlighted','true');if(command)item.setAttribute('aria-selected',String(current))}
  const item=list.items.find(item=>Number(item.dataset.optionIndex)===index&&!item.hidden);
  if(item&&opened()){input.setAttribute('aria-activedescendant',item.id);if(doc.activeElement===input)item.scrollIntoView({block:'nearest'})}else input.removeAttribute('aria-activedescendant');
 };
 const restore=()=>{editing=false;query='';if(!command)input.value=labelText()};
 const hide=()=>{
  if(command)return;
  if(opened())popup.hidePopover();input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1;restore();
 };
 const filter=()=>{
  const count=list.filter(matches);empty.hidden=count!==0;
  const all=candidates();highlight(enabled(active)?active:(!command&&!editing&&enabled(control.selectedIndex)?control.selectedIndex:(all[0]??-1)));
 };
 const sync=()=>{
  if(disposed)return;
  if(!baseline){for(const option of Array.from(control.options))option.defaultSelected=option.selected;baseline=true}
  if(input.disabled!==unavailable())input.disabled=unavailable();
  input.setAttribute('aria-required',String(!command&&control.required));
  const nextLabels=Array.from(input.labels??[]);
  if(nextLabels.length!==observedLabels.length||nextLabels.some((label,index)=>label!==observedLabels[index])){labels.disconnect();observedLabels=nextLabels;for(const label of nextLabels)labels.observe(label,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['for','id']})}
  const labelledby=input.getAttribute('aria-labelledby');
  if(labelledby){popup.setAttribute('aria-labelledby',labelledby);popup.removeAttribute('aria-label')}
  else{popup.removeAttribute('aria-labelledby');popup.setAttribute('aria-label',input.getAttribute('aria-label')||Array.from(input.labels??[]).map(label=>label.textContent?.trim()).filter(Boolean).join(' ')||(command?'Commands':'Options'))}
  if(!command){
   const next=(root.dataset.side??'bottom')+':'+(root.dataset.align??'start');
   if(next!==placement){disposePosition?.();placement=next;disposePosition=uiPosition(part('surface'),popup,{side:root.dataset.side==='top'?'top':'bottom',align:(root.dataset.align??'start') as 'start'|'center'|'end',matchWidth:true})}
   if(!editing||lastValue!==control.value){if(lastValue!==control.value)active=-1;restore();input.value=labelText()}
   for(const item of list.items)item.setAttribute('aria-selected',String(Number(item.dataset.optionIndex)===control.selectedIndex));
  }
  lastValue=control.value;
  for(const item of list.items)item.setAttribute('aria-disabled',String(!uiOptionEnabled(control.options[Number(item.dataset.optionIndex)])));
  if(invalid&&control.validity.valid){invalid=false;if(input.getAttribute('aria-invalid')==='true'){if(previousInvalid===null)input.removeAttribute('aria-invalid');else input.setAttribute('aria-invalid',previousInvalid)}}
  if(unavailable()){hide();highlight(-1)}
  filter();
 };
 const render=()=>{if(disposed)return;list.render();sync();filter()};
 const schedule=()=>{if(queued||disposed)return;queued=true;queueMicrotask(()=>{queued=false;render()})};
 const show=()=>{
  if(command||unavailable())return;
  if(!opened()){render();popup.showPopover()}input.setAttribute('aria-expanded','true');filter();
 };
 const commit=(index:number)=>{
  if(unavailable()||!enabled(index)||composing)return;
  const changed=control.selectedIndex!==index;control.selectedIndex=index;lastValue=control.value;
  if(!command)restore();sync();
  if(changed){control.dispatchEvent(new Event('input',{bubbles:true}));control.dispatchEvent(new Event('change',{bubbles:true}))}
  selected?.(control.value);
  if(!command){hide();input.focus()}
 };
 listen(input,'focus',()=>{if(!command)show()});
 listen(input,'click',()=>{if(!command)show()});
 listen(input,'input',()=>{if(composing||unavailable())return;editing=true;query=input.value;if(!command)show();filter()});
 listen(input,'compositionstart',()=>{composing=true});
 listen(input,'compositionend',()=>{composing=false;if(unavailable())return;editing=true;query=input.value;if(!command)show();filter()});
 listen(input,'keydown',(e:KeyboardEvent)=>{
  if(unavailable()||composing||e.isComposing||e.keyCode===229||e.ctrlKey||e.metaKey)return;
  if(e.key==='Escape'){
   if(command){if(query){input.value='';editing=true;query='';filter()}}
   else if(opened()){e.preventDefault();e.stopPropagation();hide()}
   return;
  }
  if(e.key==='Tab'){hide();return}
  if(e.key==='Enter'&&opened()){e.preventDefault();commit(active);return}
  // Home/End, Space and horizontal arrows always remain native text editing.
  if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;
  e.preventDefault();if(!opened()){show();return}
  const all=candidates(),index=all.indexOf(active);highlight(all[Math.max(0,Math.min(all.length-1,index+(e.key==='ArrowDown'?1:-1)))]??-1);
 });
 listen(input,'blur',()=>{if(!command)hide()});
 listen(popup,'pointerdown',(e:PointerEvent)=>{if((e.target as Element).closest('[data-option-index]'))e.preventDefault()});
 listen(popup,'pointermove',(e:PointerEvent)=>{const item=(e.target as Element).closest<HTMLElement>('[data-option-index]');if(item&&owned(item)&&enabled(Number(item.dataset.optionIndex)))highlight(Number(item.dataset.optionIndex))});
 listen(popup,'click',(e:MouseEvent)=>{const item=(e.target as Element).closest<HTMLElement>('[data-option-index]');if(item&&owned(item)){e.preventDefault();commit(Number(item.dataset.optionIndex))}});
 if(!command)listen(popup,'toggle',()=>{if(disposed)return;input.setAttribute('aria-expanded',String(opened()));if(!opened()){restore();input.removeAttribute('aria-activedescendant');active=-1}});
 listen(control,'input',sync);listen(control,'change',sync);
 if(!command)listen(control,'invalid',(e:Event)=>{e.preventDefault();if(!invalid)previousInvalid=input.getAttribute('aria-invalid');invalid=true;input.setAttribute('aria-invalid','true');hide();input.focus()});
 listen(doc,'reset',(e:Event)=>{if(e.target!==control.form)return;setTimeout(()=>{if(disposed||e.defaultPrevented)return;hide();restore();if(command)input.value='';sync();filter()},0)});
 const options=new MutationObserver(schedule);options.observe(control,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['label','value','selected','disabled','hidden','required','data-keywords']});
 const presentation=new MutationObserver(schedule);presentation.observe(prototype,{attributes:true,attributeFilter:['class','style']});presentation.observe(root,{attributes:true,attributeFilter:['data-side','data-align']});presentation.observe(popup,{attributes:true,attributeFilter:['id']});presentation.observe(input,{attributes:true,attributeFilter:['id','aria-label','aria-labelledby']});
 const ancestry=new MutationObserver(records=>{if(records.some(record=>record.type==='attributes'&&record.target instanceof Element&&record.target.contains(root)||record.type==='childList'&&Array.from(record.addedNodes).some(node=>node===root||node.contains(root))))sync()});ancestry.observe(doc.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['disabled','inert']});
 const labels=new MutationObserver(()=>sync());
 cleanups.push(()=>options.disconnect(),()=>presentation.disconnect(),()=>ancestry.disconnect(),()=>labels.disconnect(),()=>disposePosition?.());
 render();
 return {sync,dispose:()=>{if(disposed)return;disposed=true;hide();input.removeAttribute('aria-activedescendant');cleanups.forEach(dispose=>dispose());list.dispose()}};
}
`;
