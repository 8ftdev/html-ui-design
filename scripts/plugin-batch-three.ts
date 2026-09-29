import type { UIPlugin, ClassRecipe } from '../src/plugins/schema';
import { importCva } from '../src/plugins/import-cva';
const recipe=(base:string,variants:Record<string,Record<string,string[]>>={},defaults:Record<string,string>={}):ClassRecipe=>({base:[base],variants,axisTypes:Object.fromEntries(Object.keys(variants).map(k=>[k,'string'])),defaultVariants:defaults,compoundVariants:[]});

// Native form/content adaptations. Upstream visual recipes are provenance,
// never an imported component implementation or a claim of API equivalence.
export function addFormContentBatch(plugin:UIPlugin,source:(name:string)=>string){
 for(const name of ['empty','item','input-group','kbd','pagination','direction','radio-group','slider'])source(name);
 const add=(name:string,parts:Record<string,ClassRecipe>,slots:Record<string,string>={},requirements:UIPlugin['components'][string]['requirements']=[])=>{plugin.components[name]={primitive:name,parts,slots,requirements,hooks:[]}};
 // The pinned files keep these CVA declarations private. Expose only the
 // explicitly named literals to the static importer during this build.
 const media=importCva(source('empty')+'\nexport {emptyMediaVariants};','emptyMediaVariants');
 media.base=['mb-2 flex shrink-0 items-center justify-center empty:hidden'];
 media.variants.variant.icon=['size-8 rounded-lg bg-muted text-foreground'];
 add('empty',{
  root:recipe('flex w-full min-w-0 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border p-6 text-center text-balance'),
  header:recipe('flex w-full max-w-sm flex-col items-center gap-2'),media,
  title:recipe('text-sm font-medium tracking-tight'),
  description:recipe('text-sm/relaxed text-muted-foreground empty:hidden [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary'),
  content:recipe('flex w-full max-w-sm min-w-0 flex-col items-center gap-2.5 text-sm empty:hidden'),
 },{media:'media',title:'title',description:'description',content:'default'});
 const item=importCva(source('item')+'\nexport {itemVariants};','itemVariants');
 item.base=['flex w-full min-w-0 flex-wrap items-center rounded-lg border text-sm transition-colors motion-reduce:transition-none'];
 item.variants.size.xs=['gap-2 px-2.5 py-2'];
 add('item',{
  root:item,media:recipe('inline-flex size-5 shrink-0 items-center justify-center self-start empty:hidden [&_img]:size-full [&_img]:object-contain'),
  content:recipe('flex min-w-0 flex-1 flex-col gap-1'),
  title:recipe('text-sm font-medium [overflow-wrap:anywhere]'),
  description:recipe('text-sm text-muted-foreground empty:hidden [overflow-wrap:anywhere] [&_a]:underline [&_a]:underline-offset-4'),
  actions:recipe('flex max-w-full shrink-0 flex-wrap items-center gap-2 empty:hidden'),
 },{media:'media',title:'title',description:'default',actions:'actions'});
 add('input-group',{
  root:recipe('grid min-w-0 gap-2'),label:recipe('text-sm font-medium'),
  surface:recipe('flex min-w-0 items-center gap-2 rounded-lg border border-input bg-transparent px-2 transition-colors motion-reduce:transition-none dark:bg-input/30 has-[>input:disabled]:bg-input/50 has-[>input:disabled]:opacity-50 has-[>input:focus-visible]:border-ring has-[>input:focus-visible]:ring-3 has-[>input:focus-visible]:ring-ring/50 has-[>input:user-invalid]:border-destructive has-[>input:user-invalid]:ring-3 has-[>input:user-invalid]:ring-destructive/20'),
  start:recipe('inline-flex shrink-0 items-center justify-center gap-2 text-sm text-muted-foreground empty:hidden'),
  control:recipe('h-8 min-w-0 flex-1 border-0 bg-transparent py-1 text-base text-foreground outline-none placeholder:text-muted-foreground md:text-sm disabled:cursor-not-allowed read-only:cursor-default'),
  end:recipe('inline-flex max-w-full shrink-0 items-center justify-center gap-2 text-sm text-muted-foreground empty:hidden'),
 },{label:'default',start:'start',end:'end'},[{part:'control',state:'disabled',description:'Native disabled input; application separately disables addon actions'},{part:'control',state:'invalid',description:'Native user constraint validity'}]);
 add('kbd',{root:recipe('inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm bg-muted px-1 align-middle font-sans text-xs font-medium text-muted-foreground')},{default:'default'});
 add('pagination',{
  root:recipe('flex w-full min-w-0 justify-center'),
  list:recipe('flex max-w-full flex-wrap items-center justify-center gap-1 text-sm [&>li]:inline-flex [&>li>a]:inline-flex [&>li>a]:h-8 [&>li>a]:min-w-8 [&>li>a]:items-center [&>li>a]:justify-center [&>li>a]:rounded-lg [&>li>a]:border [&>li>a]:border-transparent [&>li>a]:px-2 [&>li>a]:font-medium [&>li>a]:transition-colors [&>li>a:hover]:bg-muted [&>li>a:focus-visible]:outline-2 [&>li>a:focus-visible]:outline-ring [&>li>a[aria-current=page]]:border-border [&>li>a[aria-current=page]]:bg-background'),
 },{default:'default'});
 add('typography',{root:recipe('min-w-0 text-foreground [overflow-wrap:anywhere] [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_h4]:text-lg [&_h4]:font-semibold [&_p]:text-sm/relaxed [&>*+*]:mt-4 [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:list-decimal [&_ol]:ps-6 [&_li+li]:mt-2 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-ring [&_blockquote]:border-s-2 [&_blockquote]:border-border [&_blockquote]:ps-4 [&_blockquote]:text-muted-foreground [&_blockquote]:italic [&_pre]:max-w-full [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-sm')},{default:'default'});
 add('direction',{root:recipe('min-w-0')},{default:'default'});
 add('radio-group',{
  root:recipe('grid min-w-0 gap-3 disabled:opacity-50'),legend:recipe('mb-2 text-sm font-medium'),
 },{legend:'legend',content:'default'});
 add('radio',{
  root:recipe('inline-flex min-w-0 items-center gap-2 text-sm has-[>input:disabled]:cursor-not-allowed'),
  control:recipe('size-4 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 user-invalid:outline-2 user-invalid:outline-destructive'),
 },{label:'default'},[{part:'control',state:'checked',description:'Native named-radio exclusivity and reset'},{part:'control',state:'disabled',description:'Native control or fieldset disabled state'}]);
 add('slider',{
  root:recipe('grid min-w-0 gap-2 text-sm font-medium'),
  control:recipe('h-5 w-full min-w-0 cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50'),
 },{label:'default'},[{part:'control',state:'disabled',description:'Native single-thumb range input'}]);
}
