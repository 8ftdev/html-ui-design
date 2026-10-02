import {cva} from 'class-variance-authority';
import {twMerge} from 'tailwind-merge';
import type {UIPlugin,ClassRecipe} from '../src/plugins/schema';
const plain=(base:string):ClassRecipe=>({base:[base],variants:{},axisTypes:{},defaultVariants:{},compoundVariants:[]});
/** Compact, locally owned adaptations of the pinned Base Nova source anatomy. */
export function addFinalParity(p:UIPlugin,source:(name:string)=>string){
 for(const name of ['input-otp','resizable','toast'])source(name);
 for(const name of ['card','accordion','tabs'])source(name);
 p.components.card.parts.root=plain('flex flex-col gap-4 rounded-xl bg-card p-4 text-sm text-card-foreground ring-1 ring-foreground/10');
 const chevron='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 const chevronMask='after:[mask-image:url(data:image/svg+xml,'+encodeURIComponent(chevron).replace(/'/g,'%27')+')] after:[mask-size:contain] after:[mask-repeat:no-repeat] after:[mask-position:center]';
 p.components.accordion.parts.root=plain('group/disclosure w-full border-border text-sm not-last:border-b');
 p.components.accordion.parts.trigger=plain("flex w-full cursor-pointer list-none items-start justify-between gap-4 rounded-lg border border-transparent py-2.5 text-start text-sm font-medium outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden after:pointer-events-none after:mt-0.5 after:size-4 after:shrink-0 after:bg-muted-foreground after:content-[''] after:transition-transform group-open/disclosure:after:rotate-180 motion-reduce:after:transition-none "+chevronMask);
 p.components.accordion.parts.content=plain('pb-2.5 text-sm [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4');
 p.components.tabs.parts.list=plain('inline-flex h-8 w-fit max-w-full items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground [&>[role=tab]]:h-[calc(100%-1px)] [&>[role=tab]]:flex-1 [&>[role=tab]]:rounded-md [&>[role=tab]]:border-transparent [&>[role=tab]]:px-1.5 [&>[role=tab]]:py-0.5 [&>[role=tab]]:text-sm [&>[role=tab]]:text-foreground/60 [&>[role=tab]:hover]:text-foreground [&>[role=tab][aria-selected=true]]:bg-background [&>[role=tab][aria-selected=true]]:text-foreground [&>[role=tab][aria-selected=true]]:shadow-sm dark:[&>[role=tab][aria-selected=true]]:border-input dark:[&>[role=tab][aria-selected=true]]:bg-input/30 [&>[role=tab]:disabled]:opacity-50 [&>[role=tab]:focus-visible]:border-ring [&>[role=tab]:focus-visible]:ring-3 [&>[role=tab]:focus-visible]:ring-ring/50');
 p.components.tabs.parts.root=plain('grid min-w-0 gap-2 [&>[role=tabpanel]]:text-sm [&>[role=tabpanel]]:outline-none');

 const button=p.components.button.parts.root;const action=cva(button.base,{variants:button.variants,defaultVariants:button.defaultVariants} as any);
 p.components['input-otp']={primitive:'otp-field',interaction:'input-otp',parts:{
  root:plain('inline-grid max-w-full min-w-0 gap-2 text-sm font-medium'),surface:plain('relative w-fit max-w-full'),
  control:plain('absolute inset-0 size-full cursor-text border-0 bg-transparent p-0 text-transparent opacity-0 outline-none disabled:cursor-not-allowed'),
  cells:plain('pointer-events-none flex w-fit max-w-full items-center data-[disabled=true]:opacity-50'),
  cell:plain('relative flex size-8 shrink-0 items-center justify-center border-y border-e border-input text-sm font-normal outline-none transition-shadow data-[group-start=true]:not-data-[ui-otp-index=0]:ms-4 data-[group-start=true]:rounded-s-lg data-[group-start=true]:border-s data-[group-end=true]:rounded-e-lg data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-3 data-[active=true]:ring-ring/50 data-[invalid=true]:border-destructive data-[active=true]:data-[invalid=true]:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:data-[invalid=true]:ring-destructive/40 forced-colors:border-[ButtonText]'),
  character:plain('select-none data-[selected=true]:bg-accent'),caret:plain('pointer-events-none absolute h-4 w-px bg-foreground'),
 },slots:{label:'default'},requirements:[],hooks:[]};
 p.components.resizable={primitive:'split-view',interaction:'resizable',parts:{
  root:plain('grid min-h-0 min-w-0 w-full grid-cols-[minmax(0,var(--ui-split-start))_auto_minmax(0,var(--ui-split-end))] grid-rows-[minmax(0,1fr)] data-[orientation=vertical]:grid-cols-[minmax(0,1fr)] data-[orientation=vertical]:grid-rows-[minmax(0,var(--ui-split-start))_auto_minmax(0,var(--ui-split-end))] data-[resizing=true]:select-none'),start:plain('min-h-0 min-w-0 overflow-auto'),end:plain('min-h-0 min-w-0 overflow-auto'),
  separator:plain("relative flex w-px touch-none select-none items-center justify-center bg-border ring-offset-background outline-none after:absolute after:inset-y-0 after:start-1/2 after:w-2 after:-translate-x-1/2 after:content-[''] focus-visible:ring-1 focus-visible:ring-ring aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:inset-x-0 aria-[orientation=horizontal]:after:top-1/2 aria-[orientation=horizontal]:after:h-2 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 aria-[orientation=vertical]:cursor-col-resize aria-[orientation=horizontal]:cursor-row-resize aria-disabled:cursor-default aria-disabled:opacity-50 forced-colors:bg-[ButtonText]"),
  grip:plain('z-10 h-6 w-1 shrink-0 rounded-lg bg-border in-aria-[orientation=horizontal]:rotate-90'),
 },slots:{start:'start',end:'end'},requirements:[],hooks:[]};
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m18 6-12 12M6 6l12 12" fill="none" stroke="black" stroke-width="2" stroke-linecap="round"/></svg>';
 const close=twMerge(action({variant:'ghost',size:'icon-sm'} as any),"relative shrink-0 text-muted-foreground hover:text-foreground before:size-4 before:bg-current before:content-[''] before:[mask-image:url(data:image/svg+xml,"+encodeURIComponent(svg).replace(/'/g,'%27')+")] before:[mask-size:contain] before:[mask-repeat:no-repeat] before:[mask-position:center]");
 p.components.toast={primitive:'toast-message',interaction:'toast',parts:{
  root:plain('min-w-0'),announcer:plain('sr-only'),surface:plain('flex w-full items-center gap-3 rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-lg [&[hidden]]:hidden'),
  body:plain('flex min-w-0 flex-1 flex-col gap-1'),title:plain('text-sm font-medium empty:hidden'),content:plain('text-sm text-muted-foreground empty:hidden [overflow-wrap:anywhere]'),actions:plain('shrink-0 empty:hidden'),close:plain(close),
 },slots:{title:'title',default:'default',action:'action'},requirements:[],hooks:[]};
}
