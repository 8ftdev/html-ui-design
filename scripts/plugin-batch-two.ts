import type { UIPlugin, ClassRecipe } from '../src/plugins/schema';
import { importCva } from '../src/plugins/import-cva';

const recipe = (base: string, variants: Record<string, Record<string, string[]>> = {}, defaults: Record<string, string> = {}): ClassRecipe => ({
  base: [base], variants, axisTypes: Object.fromEntries(Object.keys(variants).map(k => [k, 'string'])), defaultVariants: defaults, compoundVariants: [],
});

// Explicit native adaptations: the snapshot supplies visual recipes, never
// external component implementations or selectors for absent upstream anatomy.
export function addCompositionBatch(plugin: UIPlugin, source: (name: string) => string) {
  for (const name of ['alert','badge','aspect-ratio','breadcrumb','button-group','label','skeleton','spinner','table','textarea']) source(name);
  const add = (name: string, parts: Record<string, ClassRecipe>, slots: Record<string, string> = {}, requirements: UIPlugin['components'][string]['requirements'] = []) => {
    plugin.components[name] = { primitive: name, parts, slots, requirements, hooks: [] };
  };
  const destructiveText = 'text-[color:color-mix(in_oklab,var(--destructive),var(--foreground)_30%)]';
  add('alert', {
    root: recipe('relative grid w-full gap-1 rounded-lg border border-border px-3 py-2 text-left text-sm has-[>[data-ui-part=icon]:not(:empty)]:grid-cols-[auto_minmax(0,1fr)] has-[>[data-ui-part=icon]:not(:empty)]:gap-x-2 [&:has(>[data-ui-part=description]:not(:empty))>[data-ui-part=icon]]:row-span-2', {
      variant: { default: ['bg-card text-card-foreground'], destructive: ['bg-card', destructiveText] },
    }, {variant:'default'}),
    icon: recipe('inline-flex size-5 items-center justify-center self-start empty:hidden'),
    title: recipe('min-w-0 font-medium'),
    description: recipe('min-w-0 text-sm empty:hidden [&_a]:underline [&_a]:underline-offset-4', {
      variant: { default: ['text-muted-foreground'], destructive: ['text-inherit'] },
    }, {variant:'default'}),
  }, {icon:'icon',title:'title',description:'default'});
  const badge = importCva(source('badge'),'badgeVariants');
  badge.base = ['inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors motion-reduce:transition-none'];
  for (const [name, values] of Object.entries(badge.variants.variant)) {
    badge.variants.variant[name] = values.map(v => v.split(/\s+/).filter(token => !token.startsWith('[a]:') && !token.includes('focus-visible:') && token !== 'text-destructive').join(' '));
    if (name === 'destructive') badge.variants.variant[name].push(destructiveText);
    if (name !== 'outline') badge.variants.variant[name].unshift('border-transparent');
  }
  add('badge',{root:badge},{default:'default'});
  add('aspect-ratio',{root:recipe('relative min-w-0',{
    ratio:{square:['aspect-square'],video:['aspect-video'],photo:['aspect-[4/3]']},
  },{ratio:'video'})},{default:'default'});
  add('breadcrumb',{
    root:recipe('min-w-0'),
    list:recipe('flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground [overflow-wrap:anywhere] [&>li]:inline-flex [&>li]:min-w-0 [&>li]:items-center [&>li]:gap-1.5 [&>li+li]:before:content-[""] [&>li+li]:before:size-1.5 [&>li+li]:before:shrink-0 [&>li+li]:before:rotate-45 [&>li+li]:before:border-e [&>li+li]:before:border-t [&>li+li]:before:border-muted-foreground [&_a]:rounded-sm [&_a]:transition-colors [&_a:hover]:text-foreground [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-ring [&_[aria-current=page]]:text-foreground'),
  },{default:'default'});
  add('button-group',{root:recipe('inline-flex max-w-full items-stretch [&>button:focus-visible]:relative [&>button:focus-visible]:z-10',{
    orientation:{
      horizontal:['[&>button:not(:last-child)]:rounded-e-none [&>button:not(:first-child)]:rounded-s-none [&>button+button]:border-s-0'],
      vertical:['flex-col [&>button:not(:last-child)]:rounded-b-none [&>button:not(:first-child)]:rounded-t-none [&>button+button]:border-t-0'],
    },
  },{orientation:'horizontal'})},{default:'default'});
  add('label',{root:recipe('inline-flex items-center gap-2 text-sm leading-none font-medium')},{default:'default'});
  add('skeleton',{root:recipe('h-4 w-full animate-pulse rounded-md bg-muted motion-reduce:animate-none')});
  add('spinner',{
    root:recipe('inline-flex shrink-0 items-center justify-center align-middle text-current'),
    indicator:recipe('size-4 animate-spin rounded-full border-2 border-current border-e-transparent motion-reduce:animate-none'),
  });
  add('table',{
    root:recipe('relative w-full min-w-0 overflow-x-auto rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50'),
    table:recipe('w-full caption-bottom text-sm [&_tr]:border-b [&_tr]:border-border [&_tbody>tr]:transition-colors [&_tbody>tr:hover]:bg-muted/50 [&_th]:h-10 [&_th]:px-2 [&_th]:text-start [&_th]:align-middle [&_th]:font-medium [&_th]:whitespace-nowrap [&_td]:p-2 [&_td]:align-middle [&_td]:whitespace-nowrap'),
    caption:recipe('mt-4 text-sm text-muted-foreground'),
    head:recipe('[&>tr]:border-b'),
    body:recipe('[&>tr:last-child]:border-0'),
    foot:recipe('border-t border-border bg-muted/50 font-medium empty:hidden [&>tr:last-child]:border-b-0'),
  },{caption:'caption',head:'head',rows:'default',foot:'foot'});
  const textarea = source('textarea').match(/className=\{cn\(\s*"([^"]+)"/)?.[1];
  if (!textarea) throw new Error('pinned textarea recipe missing');
  add('textarea',{
    root:recipe('grid min-w-0 gap-2 text-sm font-medium'),
    control:recipe(textarea.replaceAll('aria-invalid:', 'user-invalid:') + ' motion-reduce:transition-none read-only:bg-muted/50'),
  },{label:'default'},[
    {part:'control',state:'disabled',description:'Native disabled multiline input'},
    {part:'control',state:'invalid',description:'Native constraint validity; user-invalid styles after interaction'},
    {part:'control',state:'readOnly',description:'Native readonly control remains focusable and submitted'},
  ]);
}
