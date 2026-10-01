// Native option data is projected once; the owned prototype controls every local row.
export const listRuntimeSource = String.raw`
export function uiOptionEnabled(option: HTMLOptionElement | undefined) {
 return Boolean(option&&!option.disabled&&!option.hidden&&!(option.parentElement instanceof HTMLOptGroupElement&&(option.parentElement.disabled||option.parentElement.hidden)));
}
export function uiOptions(control: HTMLSelectElement, popup: HTMLElement, prototype: HTMLElement, check=true) {
 const doc=popup.ownerDocument, items:HTMLElement[]=[], generated:HTMLElement[]=[];
 const clear=()=>{generated.forEach(node=>node.remove());generated.length=0;items.length=0};
 const render=()=>{
  clear();const options=Array.from(control.options);
  const append=(option:HTMLOptionElement,parent:HTMLElement)=>{
   if(option.hidden)return;
   const index=options.indexOf(option),item=prototype.cloneNode(false) as HTMLElement;
   item.hidden=false;item.id=popup.id+'-option-'+index;item.dataset.optionIndex=String(index);item.removeAttribute('data-highlighted');item.tabIndex=-1;
   const text=doc.createElement('span');text.textContent=option.label||option.textContent||'';item.append(text);
   if(check){
    const icon=doc.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('fill','none');icon.setAttribute('stroke','currentColor');icon.setAttribute('stroke-width','2');icon.setAttribute('aria-hidden','true');icon.dataset.uiCheck='';
    const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','m5 12 4 4L19 6');icon.append(path);item.append(icon);
   }
   parent.append(item);items.push(item);if(parent===popup)generated.push(item);
  };
  for(const child of Array.from(control.children)){
   if(child instanceof HTMLOptionElement)append(child,popup);
   else if(child instanceof HTMLOptGroupElement&&!child.hidden){
    const group=doc.createElement('div');group.setAttribute('role','group');group.setAttribute('aria-label',child.label);
    const label=doc.createElement('div');label.dataset.uiGroupLabel='';label.textContent=child.label;label.setAttribute('aria-hidden','true');group.append(label);
    for(const option of Array.from(child.children))if(option instanceof HTMLOptionElement)append(option,group);
    popup.append(group);generated.push(group);
   }
  }
 };
 const filter=(matches:(option:HTMLOptionElement)=>boolean)=>{
  let count=0;
  for(const item of items){const option=control.options[Number(item.dataset.optionIndex)];item.hidden=!option||!matches(option);if(!item.hidden)count++}
  for(const node of generated)if(node.getAttribute('role')==='group')node.hidden=!Array.from(node.querySelectorAll<HTMLElement>('[data-option-index]')).some(item=>!item.hidden);
  return count;
 };
 return {items,render,filter,dispose:clear};
}
`;
