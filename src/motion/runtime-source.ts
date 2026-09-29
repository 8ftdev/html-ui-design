// Emitted into local ui-motion.ts; pipe mode embeds the same source in the SFC.
export const motionRuntimeSource = String.raw`
export interface UiDisclosureOptions {
  duration: string;
  easing: string;
  enabled?: boolean;
}

export function uiDisclosureMotion(root: HTMLDetailsElement, panel: HTMLElement, options: UiDisclosureOptions, changed: (open: boolean) => void) {
  const summary = root.querySelector('summary')!;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let desired = root.open;
  let animation: Animation | undefined;
  let revision = 0;
  let disposed = false;
  // Presentation belongs to the animation effect, never caller inline styles.
  let borrowedInert = false;
  const restore = () => {
    if (borrowedInert && panel.inert) panel.inert = false;
    borrowedInert = false;
  };
  const cancel = () => { revision++; animation?.cancel(); animation = undefined; };
  const settle = () => { cancel(); root.open = desired; restore(); };
  const notify = (next: boolean) => { desired = next; changed(next); };
  const timing = () => {
    // Resolve CSS var() references in the component's inherited theme context.
    const probe = document.createElement('span');
    probe.hidden = true;
    probe.style.transitionDuration = options.duration;
    probe.style.transitionTimingFunction = options.easing;
    root.append(probe);
    const css = getComputedStyle(probe);
    const value = (css.transitionDuration.split(',')[0] ?? '0s').trim();
    const duration = Number.parseFloat(value) * (value.endsWith('ms') ? 1 : 1000);
    const easing = css.transitionTimingFunction.split(/,(?![^()]*\))/)[0] ?? 'linear';
    probe.remove();
    return { duration: Number.isFinite(duration) ? Math.max(0, duration) : 0, easing };
  };
  const enabled = () => options.enabled !== false && !reduced.matches && typeof panel.animate === 'function';
  const setOpen = (next: boolean) => {
    if (disposed || (next === desired && (animation || next === root.open))) return;
    const from = root.open ? panel.getBoundingClientRect().height : 0;
    const fromOpacity = root.open ? getComputedStyle(panel).opacity : '0';
    cancel();
    restore();
    notify(next);
    if (!enabled()) { settle(); return; }
    const {duration, easing} = timing();
    if (!duration) { settle(); return; }
    root.open = true;
    restore();
    const to = next ? panel.getBoundingClientRect().height : 0;
    const toOpacity = next ? getComputedStyle(panel).opacity : '0';
    if (!next && panel.contains(document.activeElement)) summary.focus();
    borrowedInert = !next && !panel.inert;
    if (borrowedInert) panel.inert = true;
    const current = revision;
    try {
      animation = panel.animate([
        {height: from + 'px', opacity: fromOpacity, overflow: 'hidden', boxSizing: 'border-box'},
        {height: to + 'px', opacity: toOpacity, overflow: 'hidden', boxSizing: 'border-box'},
      ], {duration, easing, fill: 'both'});
      animation.finished.then(() => {
        if (!disposed && revision === current) settle();
      }).catch(() => {}); // Cancellation is expected when the user reverses direction.
      // An application !important rule may prevent border-box sizing. Honor it
      // with native settling rather than animate mismatched padded heights.
      if (getComputedStyle(panel).boxSizing !== 'border-box') settle();
    } catch { settle(); }
  };
  const click = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!enabled() || event.defaultPrevented || event.button !== 0 || target?.closest('a,button,input,select,textarea,[contenteditable]')) return;
    event.preventDefault();
    setOpen(!desired);
  };
  const toggle = () => {
    // A named sibling can close this details through native exclusive grouping.
    if (animation && root.open) return;
    if (root.open !== desired) { cancel(); restore(); notify(root.open); }
  };
  const reduce = () => { if (reduced.matches) settle(); };
  summary.addEventListener('click', click);
  root.addEventListener('toggle', toggle);
  reduced.addEventListener('change', reduce);
  return {
    readOpen: () => animation && root.open ? desired : root.open,
    setOpen,
    update: (next: UiDisclosureOptions) => { options = next; if (!enabled()) settle(); },
    dispose: () => {
      settle(); disposed = true;
      summary.removeEventListener('click', click);
      root.removeEventListener('toggle', toggle);
      reduced.removeEventListener('change', reduce);
    },
  };
}
`;
