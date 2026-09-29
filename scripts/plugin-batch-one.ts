import type { UIPlugin, ClassRecipe } from '../src/plugins/schema';

const recipe = (base: string, variants: Record<string, Record<string, string[]>> = {}, defaults: Record<string, string> = {}): ClassRecipe => ({
  base: [base], variants, axisTypes: Object.fromEntries(Object.keys(variants).map(k => [k, 'string'])), defaultVariants: defaults, compoundVariants: [],
});

// These recipes adapt the pinned Base Nova anatomy to the local native DOM.
// Selector-dependent Base UI classes are not copied when their nodes/hooks do not exist.
export function addNativeBatch(plugin: UIPlugin, source: (name:string) => string) {
  for (const name of ['accordion', 'collapsible', 'avatar', 'field', 'separator', 'progress', 'switch', 'scroll-area', 'native-select']) source(name);
  const add = (name:string, primitive:string, parts:Record<string,ClassRecipe>, slots:Record<string,string>, requirements: any[] = []) => {
    plugin.components[name] = { primitive, parts, slots, requirements, hooks: [] };
  };
  const disclosure = [{part:'root', state:'expanded', description:'Native details open state'}];
  add('accordion','accordion', {
    root:recipe('group/disclosure w-full border-b border-border pb-2 text-sm'),
    content:recipe('text-sm'),
    trigger:recipe('cursor-pointer rounded-lg py-2.5 text-left text-sm font-medium outline-none transition-colors hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'),
  }, {summary:'summary',content:'default'}, disclosure);
  add('collapsible','collapsible', {
    root:recipe('group/disclosure w-full text-sm'),
    content:recipe('text-sm'),
    trigger:recipe('cursor-pointer rounded-lg py-2 text-sm font-medium outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50'),
  }, {summary:'summary',content:'default'}, disclosure);
  for (const name of ['accordion','collapsible']) plugin.components[name].motion = { content: { expanded: { preset: 'disclosure', duration: 'var(--motion-duration-normal, 180ms)', easing: 'var(--motion-easing-standard, ease-out)' } } };
  add('avatar','avatar', {
    root:recipe('aspect-square shrink-0 rounded-full object-cover ring-1 ring-border', {
      size:{default:['size-8'],sm:['size-6'],lg:['size-10']},
    }, {size:'default'}),
  }, {});
  add('field','field', {
    root:recipe('grid w-full gap-2', {orientation:{
      vertical:['grid-cols-1'],horizontal:['grid-cols-[auto_minmax(0,1fr)] items-center'],responsive:['grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center'],
    }}, {orientation:'vertical'}),
    label:recipe('text-sm font-medium leading-snug'),
    description:recipe('col-span-full text-sm leading-normal text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary'),
  }, {label:'label',control:'control',description:'description'});
  add('fieldset','fieldset', {
    root:recipe('grid min-w-0 gap-4 border-0 p-0 disabled:opacity-50'),
    legend:recipe('mb-1.5 text-base font-medium'),
  }, {legend:'legend',content:'default'}, [{part:'root',state:'disabled',description:'Native descendant form-control disabling'}]);
  add('separator','separator', {root:recipe('m-0 h-px w-full shrink-0 border-0 bg-border')}, {});
  add('progress','progress', {root:recipe('h-1 w-full overflow-hidden rounded-full border-0 bg-muted accent-primary [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary')}, {}, [{part:'root',state:'indeterminate',description:'Omitting value preserves native indeterminate progress'}]);
  add('switch','switch', {
    root:recipe('inline-flex flex-row-reverse items-center justify-end gap-2 text-sm has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50'),
    control:recipe('shrink-0 cursor-pointer appearance-none rounded-full border-0 bg-input bg-[image:radial-gradient(circle,var(--background)_65%,transparent_70%)] bg-no-repeat outline-none transition-[background-color,background-position] duration-[var(--motion-duration-fast,150ms)] motion-reduce:transition-none checked:bg-primary checked:bg-[position:calc(100%-2px)_center] focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 forced-colors:appearance-auto', {
      size:{default:['h-5 w-9 bg-[size:1rem_1rem] bg-[position:2px_center]'], sm:['h-4 w-6 bg-[size:0.75rem_0.75rem] bg-[position:2px_center]']},
    }, {size:'default'}),
  }, {label:'default'}, [
    {part:'control',state:'checked',description:'Native checkbox checked state with switch role'},
    {part:'control',state:'disabled',description:'Native disabled input'},
  ]);
  add('scroll-area','scroll-area', {root:recipe('relative max-h-64 overflow-auto rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50')}, {content:'default'});
  add('native-select','select', {
    root:recipe('grid gap-2 text-sm font-medium'),
    // Retain the browser arrow; upstream appearance-none assumes an extra icon node.
    control:recipe('w-full min-w-0 appearance-auto rounded-lg border border-input bg-background px-2.5 text-sm font-normal outline-none transition-colors motion-reduce:transition-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50', {
      size:{default:['h-8 py-1'],sm:['h-7 py-0.5']},
    }, {size:'default'}),
  }, {label:'default',options:'options'}, [{part:'control',state:'disabled',description:'Native disabled select'}]);
}
