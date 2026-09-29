import type {UIPlugin,ClassRecipe} from '../src/plugins/schema';
const recipe=(base:string):ClassRecipe=>({base:[base],variants:{},axisTypes:{},defaultVariants:{},compoundVariants:[]});
export function addRemainingContracts(p:UIPlugin,source:(name:string)=>string){
 for(const name of ['dialog','alert-dialog','drawer','popover','toggle','tabs','tooltip','navigation-menu','attachment','bubble','marker','message','message-scroller','questionnaire','carousel','chart','resizable','sidebar'])source(name);
 const add=(name:string,primitive:string,parts:Record<string,ClassRecipe>,slots:Record<string,string>,interaction?:UIPlugin['components'][string]['interaction'])=>{p.components[name]={primitive,parts,slots,requirements:[],...(interaction?{interaction}:{})}};
 for(const token of ['popover','popover-foreground'])if(!p.tokens.includes(token))p.tokens.push(token);
 const action=()=>structuredClone(p.components.button.parts.root);
 const plain=(base:string)=>recipe(base);
 for(const name of ['dialog','alert-dialog','drawer','sheet']){
  const edge=name==='drawer'||name==='sheet';
  add(name,name==='sheet'?'drawer':name,{
   root:plain('contents'),trigger:action(),
   dialog:plain(edge?'fixed inset-y-0 start-auto end-0 m-0 h-dvh max-h-dvh w-full max-w-sm overflow-y-auto border border-border bg-background p-6 text-foreground shadow-lg backdrop:bg-black/50 open:flex open:flex-col open:gap-4':'fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-border bg-background p-6 text-foreground shadow-lg backdrop:bg-black/50 open:flex open:flex-col open:gap-4'),
   title:plain('text-lg font-semibold'),close:action(),
  },{trigger:'trigger',title:'title',content:'default',close:'close'},'dialog');
 }
 add('popover','popover',{root:plain('inline-block'),trigger:action(),popup:plain('fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm overflow-auto rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md')},{trigger:'trigger',content:'default'},'popover');
 add('navigation-menu','navigation-menu',{root:plain('flex min-w-0 flex-wrap items-center gap-2 text-sm [&_a]:inline-flex [&_a]:items-center [&_a]:rounded-lg [&_a]:px-3 [&_a]:py-2 [&_a:hover]:bg-muted [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-ring [&_a[aria-current=page]]:bg-muted')},{content:'default'});
 add('input-otp','otp-field',{root:plain('grid gap-2 text-sm font-medium'),control:plain('h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 font-mono tracking-widest outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 user-invalid:border-destructive')},{label:'default'});
 for(const name of ['date-picker','calendar'])add(name,'date-field',structuredClone(p.components.input.parts),{label:'default'});
 for(const name of ['combobox','command'])add(name,'autocomplete',{root:plain('grid min-w-0 gap-2 text-sm font-medium'),control:structuredClone(p.components.input.parts.control),options:plain('')},{label:'default',options:'options'});
 add('select','select',structuredClone(p.components['native-select'].parts),structuredClone(p.components['native-select'].slots));
 add('data-table','table',structuredClone(p.components.table.parts),structuredClone(p.components.table.slots));
 add('attachment','attachment',{root:plain('inline-flex max-w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground underline-offset-4 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring [overflow-wrap:anywhere]')},{default:'default'});
 add('bubble','bubble',{root:plain('min-w-0 rounded-xl bg-muted px-4 py-3 text-sm/relaxed text-foreground [overflow-wrap:anywhere]')},{default:'default'});
 add('marker','marker',{root:plain('inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground')},{default:'default'});
 add('message','message',{root:plain('flex min-w-0 flex-col gap-2 text-sm')},{default:'default'});
 add('message-scroller','message-scroller',{root:plain('flex max-h-96 min-w-0 flex-col gap-4 overflow-y-auto overscroll-contain rounded-lg p-4 focus-visible:outline-2 focus-visible:outline-ring')},{default:'default'});
 add('carousel','carousel',{root:plain('flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain rounded-lg p-2 focus-visible:outline-2 focus-visible:outline-ring [&>*]:w-full [&>*]:shrink-0 [&>*]:snap-start')},{default:'default'});
 add('chart','chart',{root:plain('grid min-w-0 gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground [&_svg]:max-w-full [&_canvas]:max-w-full'),caption:plain('text-sm text-muted-foreground')},{default:'default',caption:'caption'});
 add('resizable','resizable',{root:plain('h-48 min-h-24 w-full min-w-40 max-w-full resize overflow-auto rounded-lg border border-border p-4 focus-visible:outline-2 focus-visible:outline-ring')},{default:'default'});
 add('sidebar','sidebar',{root:plain('flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-muted p-4 text-foreground')},{default:'default'});
 add('questionnaire','questionnaire',structuredClone(p.components.fieldset.parts),{legend:'legend',content:'default'});
 add('toast','notification',{root:plain('min-w-0 rounded-lg text-sm empty:hidden not-empty:border not-empty:border-border not-empty:bg-background not-empty:p-4 not-empty:shadow-md')},{default:'default'});
 add('tabs','tabs',{root:plain('grid min-w-0 gap-3 [&>[role=tabpanel]]:rounded-lg [&>[role=tabpanel]]:p-4 [&>[role=tabpanel]]:focus-visible:outline-2 [&>[role=tabpanel]]:focus-visible:outline-ring'),list:plain('inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-lg bg-muted p-1 [&>[role=tab]]:rounded-md [&>[role=tab]]:px-3 [&>[role=tab]]:py-1.5 [&>[role=tab]]:text-sm [&>[role=tab]]:text-muted-foreground [&>[role=tab]:hover]:bg-background/50 [&>[role=tab][aria-selected=true]]:bg-background [&>[role=tab][aria-selected=true]]:text-foreground [&>[role=tab][aria-selected=true]]:shadow-sm [&>[role=tab]:disabled]:opacity-50 [&>[role=tab]:focus-visible]:outline-2 [&>[role=tab]:focus-visible]:outline-ring')},{tabs:'tabs',panels:'default'},'tabs');
 const toggle=action();toggle.base.push('aria-pressed:bg-muted aria-pressed:text-foreground');toggle.defaultVariants.variant='ghost';
 add('toggle','toggle',{root:toggle},{label:'default'},'toggle');
 add('toggle-group','toggle-group',{root:plain('inline-flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-border p-1')},{content:'default'},'toggle-group');
 add('toolbar','toolbar',{root:plain('flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-border bg-background p-2')},{content:'default'},'toolbar');
 add('menubar','menubar',{root:plain('flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-border bg-background p-1')},{content:'default'},'toolbar');
 for(const name of ['dropdown-menu','context-menu'])add(name,name==='dropdown-menu'?'menu':'context-menu',{
  root:plain('inline-block'),trigger:action(),popup:plain('fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-56 max-w-[calc(100%-2rem)] overflow-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md [&_[role^=menuitem]]:flex [&_[role^=menuitem]]:w-full [&_[role^=menuitem]]:items-center [&_[role^=menuitem]]:rounded-md [&_[role^=menuitem]]:px-2 [&_[role^=menuitem]]:py-1.5 [&_[role^=menuitem]]:text-start [&_[role^=menuitem]]:text-sm [&_[role^=menuitem]:focus]:bg-muted [&_[role^=menuitem]:focus]:outline-none [&_[role^=menuitem]:hover]:bg-muted [&_[role^=menuitem][aria-disabled=true]]:opacity-50 [&_[role^=menuitem]:disabled]:opacity-50'),
 },{trigger:'trigger',content:'default'},name==='context-menu'?'context-menu':'menu');
 add('tooltip','tooltip',{root:plain('relative inline-block'),trigger:action(),tooltip:plain('absolute bottom-full start-1/2 z-50 w-max max-w-64 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md')},{trigger:'trigger',content:'default'},'tooltip');
}
