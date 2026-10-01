// One editable local helper per generated library; pipe output embeds it.
export const positionRuntimeSource = String.raw`
export function uiPosition(trigger: HTMLElement, popup: HTMLElement, options: {side?: 'top'|'bottom'|'left'|'right'; align?: 'start'|'center'|'end'; gap?: number; padding?: number; matchWidth?: boolean} = {}): () => void {
  const doc = popup.ownerDocument, view = doc.defaultView;
  if (!view) return () => {};
  const finite = (value: number|undefined, fallback: number) => value !== undefined && Number.isFinite(value) ? Math.max(0, value) : fallback;
  const gap = finite(options.gap, 4), padding = finite(options.padding, 8);
  const preferredSide = options.side ?? 'bottom', align = options.align ?? 'start';
  const constraints=view.getComputedStyle(popup);
  const callerMaxHeight=constraints.maxHeight, callerMaxWidth=constraints.maxWidth, callerMinWidth=constraints.minWidth;
  const minimumWidth=Number.parseFloat(callerMinWidth)||0;
  const limit=(available:number, cap:string)=>cap&&cap!=='none'?'min('+available+'px, '+cap+')':available+'px';
  type StyleValue = { value: string; priority: string };
  const styles = new Map<string, { before: StyleValue; last: StyleValue; released: boolean }>();
  const attributes = new Map<string, { before: string|null; last: string; released: boolean }>();
  const read = (name: string): StyleValue => ({ value: popup.style.getPropertyValue(name), priority: popup.style.getPropertyPriority(name) });
  const same = (a: StyleValue, b: StyleValue) => a.value === b.value && a.priority === b.priority;
  const style = (name: string, value: string) => {
    let owned = styles.get(name);
    if (!owned) { const before = read(name); owned = { before, last: before, released: false }; styles.set(name, owned); }
    if (owned.released) return;
    if (!same(read(name), owned.last)) { owned.released = true; return; }
    if (owned.last.value !== value) popup.style.setProperty(name, value, owned.before.priority);
    owned.last = read(name);
  };
  const attribute = (name: string, value: string) => {
    let owned = attributes.get(name);
    if (!owned) { owned = { before: popup.getAttribute(name), last: value, released: false }; attributes.set(name, owned); }
    else if (owned.released || popup.getAttribute(name) !== owned.last) { owned.released = true; return; }
    popup.setAttribute(name, value); owned.last = value;
  };
  style('position', 'fixed');
  for (const edge of ['top', 'right', 'bottom', 'left']) style(edge, 'auto');
  for (const edge of ['top', 'right', 'bottom', 'left']) style('margin-' + edge, '0px');
  style('box-sizing', 'border-box');
  let disposed = false, frame = 0;
  const update = () => {
    frame = 0;
    if (disposed || !popup.isConnected || !trigger.isConnected || !popup.matches(':popover-open')) return;
    const viewport = view.visualViewport;
    const width = viewport?.width ?? doc.documentElement.clientWidth;
    const height = viewport?.height ?? doc.documentElement.clientHeight;
    const insetX = Math.min(padding, width / 2), insetY = Math.min(padding, height / 2);
    const minX = (viewport?.offsetLeft ?? 0) + insetX, minY = (viewport?.offsetTop ?? 0) + insetY;
    const maxX = minX + Math.max(0, width - 2 * insetX), maxY = minY + Math.max(0, height - 2 * insetY);
    const anchor = trigger.getBoundingClientRect();
    style('--ui-anchor-width', anchor.width + 'px');
    style('max-width', limit(maxX-minX,callerMaxWidth));
    style('min-width',Math.min(maxX-minX,Math.max(minimumWidth,options.matchWidth?anchor.width:0))+'px');
    // Expanding for measurement temporarily clamps a scrolled popup back to zero.
    // Restore its offset after constraining it; resizing can legitimately clamp it.
    const scrollTop=popup.scrollTop, scrollLeft=popup.scrollLeft;
    style('max-height', callerMaxHeight||'none');
    const natural = popup.getBoundingClientRect();
    const horizontal=preferredSide==='left'||preferredSide==='right';
    const above = Math.max(0, Math.min(anchor.top - gap, maxY) - minY);
    const below = Math.max(0, maxY - Math.max(anchor.bottom + gap, minY));
    const before=Math.max(0,Math.min(anchor.left-gap,maxX)-minX);
    const after=Math.max(0,maxX-Math.max(anchor.right+gap,minX));
    let side = preferredSide;
    const preferredSpace = side==='left'?before:side==='right'?after:side==='top'?above:below;
    const otherSpace=side==='left'?after:side==='right'?before:side==='top'?below:above;
    if ((horizontal?natural.width:natural.height)>preferredSpace&&otherSpace>preferredSpace)
      side=side==='left'?'right':side==='right'?'left':side==='top'?'bottom':'top';
    const available = side==='left'?before:side==='right'?after:side==='top'?above:below;
    style('--ui-available-height',(horizontal?maxY-minY:available)+'px');
    style('--ui-available-width',(horizontal?available:maxX-minX)+'px');
    style('max-height',limit(horizontal?maxY-minY:available,callerMaxHeight));
    if(horizontal){
      style('max-width',limit(available,callerMaxWidth));
      style('min-width',Math.min(available,Math.max(minimumWidth,options.matchWidth?anchor.width:0))+'px');
    }
    if(popup.scrollTop!==scrollTop)popup.scrollTop=scrollTop;
    if(popup.scrollLeft!==scrollLeft)popup.scrollLeft=scrollLeft;
    const box = popup.getBoundingClientRect();
    const rtl = view.getComputedStyle(trigger).direction === 'rtl';
    let left = horizontal?(side==='left'?anchor.left-gap-box.width:anchor.right+gap)
      :align === 'center' ? anchor.left + (anchor.width - box.width) / 2
      : (align === 'start') !== rtl ? anchor.left : anchor.right - box.width;
    let top = horizontal?(align==='center'?anchor.top+(anchor.height-box.height)/2:align==='start'?anchor.top:anchor.bottom-box.height)
      :side === 'top' ? anchor.top - gap - box.height : anchor.bottom + gap;
    left = Math.max(minX, Math.min(left, maxX - box.width));
    top = Math.max(minY, Math.min(top, maxY - box.height));
    style('--ui-anchor-offset', (horizontal?anchor.top+anchor.height/2-top:anchor.left+anchor.width/2-left)+'px');
    style('left', left + 'px'); style('top', top + 'px');
    attribute('data-side', side); attribute('data-align', align);
  };
  const schedule = () => { if (!disposed && !frame) frame = view.requestAnimationFrame(update); };
  const cleanups: (() => void)[] = [];
  const on = (target: EventTarget, name: string, capture = false) => {
    target.addEventListener(name, schedule, capture);
    cleanups.push(() => target.removeEventListener(name, schedule, capture));
  };
  on(popup, 'beforetoggle'); on(popup, 'toggle');
  on(view, 'resize');
  // Internal popup scrolling cannot move its anchor and must not remeasure it.
  const onScroll=(event:Event)=>{if(event.target instanceof Node&&popup.contains(event.target))return;schedule()};
  doc.addEventListener('scroll',onScroll,true);cleanups.push(()=>doc.removeEventListener('scroll',onScroll,true));
  if (view.visualViewport) { on(view.visualViewport, 'resize'); on(view.visualViewport, 'scroll'); }
  if (view.ResizeObserver) {
    const observer = new view.ResizeObserver(schedule);
    observer.observe(trigger); observer.observe(popup);
    cleanups.push(() => observer.disconnect());
  }
  schedule();
  return () => {
    if (disposed) return;
    disposed = true;
    if (frame) view.cancelAnimationFrame(frame);
    for (const cleanup of cleanups) cleanup();
    for (const [name, owned] of styles) if (!owned.released && same(read(name), owned.last)) {
      if (owned.before.value) popup.style.setProperty(name, owned.before.value, owned.before.priority);
      else popup.style.removeProperty(name);
    }
    for (const [name, owned] of attributes) if (!owned.released && popup.getAttribute(name) === owned.last) {
      if (owned.before === null) popup.removeAttribute(name); else popup.setAttribute(name, owned.before);
    }
  };
}
`;
