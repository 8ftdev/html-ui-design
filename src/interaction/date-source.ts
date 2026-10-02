/** Projects the reviewed native date-grid anatomy; the date input remains the form/model authority. */
export const dateRuntimeSource = String.raw`
export interface UiDateOptions {locale?:string;firstDayOfWeek?:number;defaultMonth?:string}
export function uiDate(root:HTMLElement,kind:'calendar'|'date-picker',initial:UiDateOptions={}) {
 const owned=(node:Element)=>node.closest('[data-ui="date-grid"][data-ui-part="root"]')===root;
 const part=(name:string)=>Array.from(root.querySelectorAll<HTMLElement>('[data-ui-part="'+name+'"]')).find(owned)!;
 const control=part('control') as HTMLInputElement,trigger=part('trigger') as HTMLButtonElement,popup=part('popup');
 const label=part('label'),displayed=part('value'),caption=part('caption'),grid=part('grid');
 const previous=part('previous') as HTMLButtonElement,next=part('next') as HTMLButtonElement;
 const weekdays=part('weekdays'),weekdayPrototype=part('weekday'),body=part('body'),weekPrototype=part('week');
 const cellPrototype=part('cell'),dayPrototype=part('day') as HTMLButtonElement;
 if(!control||!trigger||!popup||!grid||!weekPrototype||!dayPrototype)throw new Error('Calendar requires reviewed owned date-grid parts');
 const doc=root.ownerDocument,cleanups:(()=>void)[]=[];
 const listen=(node:EventTarget,name:string,fn:(event:any)=>void,capture=false)=>{node.addEventListener(name,fn,capture);cleanups.push(()=>node.removeEventListener(name,fn,capture))};
 const set=(node:Element,name:string,value:string)=>{if(node.getAttribute(name)!==value)node.setAttribute(name,value)};
 const today=()=>{const d=new Date();return uiDateMake(d.getFullYear(),d.getMonth(),d.getDate())};
 let options=initial,disposed=false,queued=false,baseline=false,lastValue:string|undefined,invalid=false,priorInvalid:string|null=null;
 let month:Date,active:Date,generated:HTMLElement[]=[],positionDispose:(()=>void)|undefined;
 let firstDay=0,formatMonth:Intl.DateTimeFormat,formatDay:Intl.DateTimeFormat,formatShortDay:Intl.DateTimeFormat,formatWeekday:Intl.DateTimeFormat,formatFullWeekday:Intl.DateTimeFormat;
 let previousFormat='',autoLabelledby='';
 const unavailable=()=>control.matches(':disabled')||Boolean(root.closest('[inert]'));
 const min=()=>uiDateParse(control.min),max=()=>uiDateParse(control.max);
 const enabled=(date:Date)=>{const lo=min(),hi=max();return !unavailable()&&date.getUTCFullYear()>=1&&date.getUTCFullYear()<=9999&&(!lo||date>=lo)&&(!hi||date<=hi)};
 const clamp=(date:Date)=>{let result=date;const first=uiDateMake(1,0,1),last=uiDateMake(9999,11,31);if(result<first)result=first;if(result>last)result=last;const lo=min(),hi=max();if(lo&&result<lo)result=lo;if(hi&&result>hi)result=hi;return result};
 const buttons=()=>generated.flatMap(row=>Array.from(row.querySelectorAll<HTMLButtonElement>('[data-ui-date]')));
 const opened=()=>kind==='date-picker'&&popup.matches(':popover-open');
 const hide=(restore=false)=>{if(opened())popup.hidePopover();set(trigger,'aria-expanded','false');if(restore&&!unavailable())trigger.focus()};
 const focusActive=()=>{const button=buttons().find(b=>b.dataset.uiDate===uiDateISO(active)&&!b.disabled)??buttons().find(b=>!b.disabled);if(button)button.focus();else grid.focus()};
 const monthAllowed=(amount:number)=>{const first=uiDateMonth(month,amount),last=uiDateMake(first.getUTCFullYear(),first.getUTCMonth()+1,0),lo=min(),hi=max();return !unavailable()&&first.getUTCFullYear()>=1&&first.getUTCFullYear()<=9999&&(!lo||last>=lo)&&(!hi||first<=hi)&&!(lo&&hi&&lo>hi)};
 const configure=()=>{
  const requested=Number(options.firstDayOfWeek??0);firstDay=Number.isInteger(requested)&&requested>=0&&requested<=6?requested:0;
  const locale=options.locale||'en-US';const signature=locale+':'+firstDay;
  if(signature===previousFormat)return;previousFormat=signature;
  const formatter=(style:Intl.DateTimeFormatOptions)=>{try{return new Intl.DateTimeFormat(locale,{...style,calendar:'gregory',timeZone:'UTC'})}catch{return new Intl.DateTimeFormat('en-US',{...style,calendar:'gregory',timeZone:'UTC'})}};
  formatMonth=formatter({month:'long',year:'numeric'});formatDay=formatter({weekday:'long',year:'numeric',month:'long',day:'numeric'});
  formatShortDay=formatter({year:'numeric',month:'short',day:'numeric'});formatWeekday=formatter({weekday:'short'});formatFullWeekday=formatter({weekday:'long'});
 };
 const name=()=>{
  const id=trigger.id||popup.id;
  if(label&&!label.id)label.id=id+'-label';
  const external=Array.from(trigger.labels??[]).filter(l=>l!==label&&l.textContent?.trim());
  for(let i=0;i<external.length;i++)if(!external[i]!.id)external[i]!.id=id+'-external-label-'+i;
  const explicit=trigger.getAttribute('aria-labelledby');
  const labelledby=explicit&&explicit!==autoLabelledby?explicit:!trigger.getAttribute('aria-label')?[label?.textContent?.trim()?label.id:'',...external.map(l=>l.id)].filter(Boolean).join(' '):'';
  if(labelledby){set(popup,'aria-labelledby',labelledby);popup.removeAttribute('aria-label');if(!explicit||explicit===autoLabelledby){set(trigger,'aria-labelledby',labelledby);autoLabelledby=labelledby}}
  else {popup.removeAttribute('aria-labelledby');set(popup,'aria-label',trigger.getAttribute('aria-label')||'Choose date');if(explicit===autoLabelledby){trigger.removeAttribute('aria-labelledby');autoLabelledby=''}}
  if(!caption.id)caption.id=id+'-month';set(grid,'aria-labelledby',caption.id);
  const describedby=trigger.getAttribute('aria-describedby');if(describedby)set(grid,'aria-describedby',describedby);else grid.removeAttribute('aria-describedby');
 };
 const render=()=>{
  if(disposed)return;
  configure();name();
  const focusedNavigation=doc.activeElement===previous?previous:doc.activeElement===next?next:null;
  const focused=doc.activeElement instanceof HTMLElement&&owned(doc.activeElement)?doc.activeElement.dataset.uiDate:undefined;
  const savedFocus=focused?uiDateParse(focused):null;
  if(savedFocus&&savedFocus.getUTCMonth()===month.getUTCMonth()&&savedFocus.getUTCFullYear()===month.getUTCFullYear()&&enabled(savedFocus))active=savedFocus;
  for(const node of generated)node.remove();generated=[];
  for(const node of Array.from(weekdays.children))if(node!==weekdayPrototype)node.remove();
  for(let i=0;i<7;i++){
   const header=weekdayPrototype.cloneNode(true) as HTMLElement;header.hidden=false;header.removeAttribute('id');
   const date=uiDateMake(2024,0,7+(i+firstDay)%7);header.textContent=formatWeekday.format(date);set(header,'abbr',formatFullWeekday.format(date));weekdays.append(header);
  }
  const title=formatMonth.format(month);if(caption.textContent!==title)caption.textContent=title;
  previous.disabled=!monthAllowed(-1);next.disabled=!monthAllowed(1);trigger.disabled=unavailable();
  const offset=(month.getUTCDay()-firstDay+7)%7,start=uiDateDay(month,-offset),last=uiDateMake(month.getUTCFullYear(),month.getUTCMonth()+1,0);
  const count=Math.ceil((offset+last.getUTCDate())/7)*7,todayISO=uiDateISO(today());
  const all:HTMLButtonElement[]=[];
  for(let i=0;i<count;i+=7){
   const row=weekPrototype.cloneNode(false) as HTMLElement;row.hidden=false;row.removeAttribute('id');
   for(let j=0;j<7;j++){
    const date=uiDateDay(start,i+j),value=uiDateISO(date),cell=cellPrototype.cloneNode(false) as HTMLElement,button=dayPrototype.cloneNode(true) as HTMLButtonElement;
    cell.removeAttribute('id');button.removeAttribute('id');button.hidden=false;button.disabled=!enabled(date);button.tabIndex=-1;button.dataset.uiDate=value;button.textContent=String(date.getUTCDate());
    set(button,'aria-label',formatDay.format(date));set(cell,'aria-selected',String(control.value===value));set(button,'data-selected',String(control.value===value));
    set(button,'data-outside',String(date.getUTCMonth()!==month.getUTCMonth()));set(button,'data-today',String(value===todayISO));
    if(value===todayISO)set(button,'aria-current','date');else button.removeAttribute('aria-current');cell.append(button);row.append(cell);all.push(button);
   }
   body.append(row);generated.push(row);
  }
  let current=all.find(b=>b.dataset.uiDate===uiDateISO(active)&&!b.disabled)??all.find(b=>!b.disabled&&b.dataset.outside==='false')??all.find(b=>!b.disabled);
  if(current){active=uiDateParse(current.dataset.uiDate)!;current.tabIndex=0;grid.removeAttribute('tabindex')}else grid.tabIndex=0;
  set(grid,'aria-disabled',String(unavailable()));set(trigger,'aria-required',String(control.required));
  const ariaInvalid=invalid?'true':trigger.getAttribute('aria-invalid');if(ariaInvalid)set(grid,'aria-invalid',ariaInvalid);else grid.removeAttribute('aria-invalid');
  const selected=uiDateParse(control.value),text=selected?formatShortDay.format(selected):root.dataset.placeholder||'Pick a date';
  if(displayed.textContent!==text)displayed.textContent=text;trigger.toggleAttribute('data-placeholder',!selected);
  if(unavailable())hide();if((savedFocus||focusedNavigation?.disabled)&&current&&!unavailable())current.focus({preventScroll:true});
 };
 const sync=(nextOptions:UiDateOptions=options)=>{
  if(disposed)return;options=nextOptions;
  if(!baseline){control.defaultValue=control.value;baseline=true}
  if(lastValue!==control.value||!month){
   const selected=uiDateParse(control.value),defaultDate=uiDateParse((options.defaultMonth??'')+'-01');
   active=clamp(selected??defaultDate??today());month=uiDateMake(active.getUTCFullYear(),active.getUTCMonth(),1);lastValue=control.value;
  }
  const reachable=clamp(active);if(reachable.getTime()!==active.getTime()&&enabled(reachable)){active=reachable;month=uiDateMake(active.getUTCFullYear(),active.getUTCMonth(),1)}
  if(invalid&&control.validity.valid){invalid=false;if(priorInvalid===null)trigger.removeAttribute('aria-invalid');else set(trigger,'aria-invalid',priorInvalid)}
  render();
 };
 const schedule=()=>{if(disposed||queued)return;queued=true;queueMicrotask(()=>{queued=false;if(!disposed)sync()})};
 const move=(date:Date)=>{
  if(unavailable())return;const target=clamp(date);if(!enabled(target))return;
  // The render preserves existing focus only while it belongs to the same viewed month.
  const old=doc.activeElement as HTMLElement|null;old?.removeAttribute('data-ui-date');
  active=target;month=uiDateMake(target.getUTCFullYear(),target.getUTCMonth(),1);render();focusActive();
 };
 const commit=(date:Date)=>{
  if(!enabled(date))return;const value=uiDateISO(date),changed=control.value!==value;control.value=value;lastValue=value;active=date;month=uiDateMake(date.getUTCFullYear(),date.getUTCMonth(),1);render();
  if(changed){control.dispatchEvent(new Event('input',{bubbles:true}));control.dispatchEvent(new Event('change',{bubbles:true}))}
  if(kind==='date-picker')hide(true);
 };
 const show=()=>{if(unavailable())return;sync();if(!opened())popup.showPopover();set(trigger,'aria-expanded',String(opened()));if(opened())focusActive();else trigger.focus({preventScroll:true})};
 if(kind==='date-picker'){
  popup.setAttribute('popover','auto');set(popup,'role','dialog');set(trigger,'role','combobox');positionDispose=uiPosition(trigger,popup,{side:'bottom',align:'start'});
  listen(trigger,'click',(e:MouseEvent)=>{if(e.defaultPrevented)return;e.preventDefault();if(opened())hide(true);else show()});
  listen(trigger,'keydown',(e:KeyboardEvent)=>{if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();show()}});
  listen(popup,'keydown',(e:KeyboardEvent)=>{if(e.key==='Escape'&&!e.defaultPrevented){e.preventDefault();hide(true)}});
  listen(popup,'toggle',()=>{if(!disposed)set(trigger,'aria-expanded',String(opened()))});
  listen(root,'focusout',(e:FocusEvent)=>{if(e.relatedTarget instanceof Node&&root.contains(e.relatedTarget))return;queueMicrotask(()=>{if(!disposed&&!root.contains(doc.activeElement))hide()})});
 }else {trigger.hidden=true;set(popup,'role','group');listen(doc,'click',(e:MouseEvent)=>{const target=(e.target as Element).closest('label');if(target?.htmlFor===trigger.id&&!e.defaultPrevented){e.preventDefault();focusActive()}})}
 // Safari does not focus buttons on pointer activation; keep popup focus owned until commit.
 listen(popup,'mousedown',(e:MouseEvent)=>{if(e.defaultPrevented||e.button!==0)return;const target=(e.target as Element).closest<HTMLButtonElement>('button');if(target&&owned(target)&&!target.disabled){e.preventDefault();target.focus({preventScroll:true})}});
 listen(popup,'click',(e:MouseEvent)=>{
  if(e.defaultPrevented)return;const target=(e.target as Element).closest<HTMLButtonElement>('button');if(!target||!owned(target)||target.disabled)return;
  if(target===previous||target===next){e.preventDefault();const amount=target===previous?-1:1;if(monthAllowed(amount)){active=clamp(uiDateMonth(active,amount));month=uiDateMake(month.getUTCFullYear(),month.getUTCMonth()+amount,1);render()}return}
  const date=uiDateParse(target.dataset.uiDate);if(date){e.preventDefault();commit(date)}
 });
 listen(grid,'keydown',(e:KeyboardEvent)=>{
  if(e.defaultPrevented||unavailable()||e.ctrlKey||e.metaKey||e.altKey)return;
  const button=(e.target as Element).closest<HTMLButtonElement>('[data-ui-date]'),date=uiDateParse(button?.dataset.uiDate);if(!date)return;
  const rtl=getComputedStyle(root).direction==='rtl';let target:Date|undefined;
  if(e.key==='ArrowRight')target=uiDateDay(date,rtl?-1:1);if(e.key==='ArrowLeft')target=uiDateDay(date,rtl?1:-1);
  if(e.key==='ArrowDown')target=uiDateDay(date,7);if(e.key==='ArrowUp')target=uiDateDay(date,-7);
  if(e.key==='Home')target=uiDateDay(date,-((date.getUTCDay()-firstDay+7)%7));if(e.key==='End')target=uiDateDay(date,6-((date.getUTCDay()-firstDay+7)%7));
  if(e.key==='PageUp'||e.key==='PageDown')target=uiDateMonth(date,(e.key==='PageUp'?-1:1)*(e.shiftKey?12:1));
  if(target){e.preventDefault();move(target)}
 });
 listen(control,'input',()=>sync());listen(control,'change',()=>sync());
 listen(control,'invalid',(e:Event)=>{e.preventDefault();if(!invalid)priorInvalid=trigger.getAttribute('aria-invalid');invalid=true;set(trigger,'aria-invalid','true');render();if(kind==='date-picker'){hide();trigger.focus()}else focusActive()});
 listen(doc,'reset',(e:Event)=>{if(e.target===control.form)setTimeout(()=>{if(!disposed&&!e.defaultPrevented){hide();sync()}},0)});
 const observer=new MutationObserver(schedule);
 for(const prototype of [weekPrototype,cellPrototype,dayPrototype,weekdayPrototype])observer.observe(prototype,{attributes:true,attributeFilter:['class','style']});
 observer.observe(control,{attributes:true,attributeFilter:['min','max','disabled','required']});observer.observe(trigger,{attributes:true,attributeFilter:['id','aria-label','aria-labelledby','aria-describedby','aria-invalid']});observer.observe(label,{subtree:true,childList:true,characterData:true});observer.observe(root,{attributes:true,attributeFilter:['data-placeholder']});
 const ancestry=new MutationObserver(records=>{if(records.some(r=>r.target instanceof Element&&r.target.contains(root)))schedule()});ancestry.observe(doc.documentElement,{subtree:true,attributes:true,attributeFilter:['disabled','inert']});
 cleanups.push(()=>observer.disconnect(),()=>ancestry.disconnect());sync();
 return {sync,dispose:()=>{if(disposed)return;hide();disposed=true;positionDispose?.();for(const dispose of cleanups)dispose();for(const node of generated)node.remove();for(const node of Array.from(weekdays.children))if(node!==weekdayPrototype)node.remove()}};
}
`;
