import type {ClassRecipe,UIPlugin} from '../src/plugins/schema';

const recipe=(base:string,variants:ClassRecipe['variants']={},defaults:ClassRecipe['defaultVariants']={}):ClassRecipe=>({base:[base],variants,axisTypes:Object.fromEntries(Object.keys(variants).map(k=>[k,'string'])),defaultVariants:defaults,compoundVariants:[]});
const mask=(path:string)=>{
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${decodeURIComponent(path)}" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  // No nested quotes in the utility: Tailwind scans the serialized recipe source.
  const url=encodeURIComponent(svg).replace(/'/g,'%27');
  return `[mask-image:url(data:image/svg+xml,${url})] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center]`;
};

/** Adapt the pinned Nova recipes to native controls, never replace their semantics. */
export function addFormParity(p:UIPlugin,source:(name:string)=>string){
  for(const name of ['input','textarea']){
    const original=source(name).match(/className=\{cn\(\s*"([^"]+)"/)![1];
    p.components[name].parts.control=recipe(original+' font-normal');
  }
  const focus='outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50';
  const invalid='aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40';
  const binary='peer size-4 shrink-0 cursor-pointer appearance-none border border-input bg-transparent transition-colors '+focus+' '+invalid+' dark:bg-input/30 checked:border-primary checked:bg-primary dark:checked:bg-primary disabled:cursor-not-allowed forced-colors:appearance-auto';
  const root='relative inline-flex w-fit items-center gap-2 text-sm has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50';
  p.components.checkbox.parts={
    root:recipe(root),
    control:recipe(binary+' rounded-[4px] indeterminate:border-primary indeterminate:bg-primary dark:indeterminate:bg-primary'),
    indicator:recipe('pointer-events-none absolute start-px top-1/2 size-3.5 -translate-y-1/2 bg-primary-foreground opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-100 forced-colors:hidden '+mask('m5%2012%204%204L19%206')+' peer-indeterminate:[mask-image:linear-gradient(black,black)] peer-indeterminate:[mask-size:60%_2px]'),
  };
  p.components.radio.parts={
    root:recipe(root),control:recipe(binary+' rounded-full'),
    indicator:recipe('pointer-events-none absolute start-1 top-1/2 size-2 -translate-y-1/2 rounded-full bg-primary-foreground opacity-0 peer-checked:opacity-100 forced-colors:hidden'),
  };
  p.components['radio-group'].parts.root=recipe('grid w-full min-w-0 gap-2 border-0 p-0 disabled:[&>legend]:opacity-50');
  p.components['radio-group'].parts.legend=recipe('mb-1.5 text-sm font-medium');
  const sizes={default:['h-[18.4px] w-8'],sm:['h-3.5 w-6']};
  p.components.switch.parts={
    root:recipe('relative inline-flex w-fit items-center gap-2 text-sm has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50'),
    control:recipe('peer absolute inset-0 z-10 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed forced-colors:static forced-colors:size-4 forced-colors:appearance-auto forced-colors:opacity-100'),
    track:recipe('pointer-events-none inline-flex shrink-0 items-center rounded-full border border-transparent bg-input transition-colors dark:bg-input/80 peer-checked:bg-primary dark:peer-checked:bg-primary peer-focus-visible:border-ring peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 peer-aria-invalid:border-destructive peer-aria-invalid:ring-3 peer-aria-invalid:ring-destructive/20 peer-checked:[&>span]:translate-x-[calc(100%-2px)] rtl:peer-checked:[&>span]:-translate-x-[calc(100%-2px)] dark:peer-checked:[&>span]:bg-primary-foreground forced-colors:hidden',{size:sizes},{size:'default'}),
    thumb:recipe('block shrink-0 rounded-full bg-background transition-transform motion-reduce:transition-none dark:bg-foreground',{size:{default:['size-4'],sm:['size-3']}},{size:'default'}),
  };
  const select=p.components['native-select'];
  select.parts={
    root:recipe('relative grid w-full gap-2 text-sm font-medium has-[select:disabled]:opacity-50 [color-scheme:light] dark:[color-scheme:dark] [&_option]:bg-[Canvas] [&_option]:text-[CanvasText] [&_optgroup]:bg-[Canvas] [&_optgroup]:text-[CanvasText]'),
    control:recipe('w-full min-w-0 appearance-none rounded-lg border border-input bg-transparent ps-2.5 pe-8 text-sm font-normal transition-colors select-none '+focus+' '+invalid+' disabled:pointer-events-none disabled:cursor-not-allowed forced-colors:appearance-auto dark:bg-input/30 dark:hover:bg-input/50',{size:{default:['h-8 py-1'],sm:['h-7 py-0.5']}},{size:'default'}),
    chevron:recipe('pointer-events-none absolute end-2.5 size-4 bg-muted-foreground forced-colors:hidden '+mask('m6%209%206%206%206-6'),{size:{default:['bottom-2'],sm:['bottom-1.5']}},{size:'default'}),
  };
  // NativeSelect remains the browser-native alternative to the separate select-list adapter.
  // Both mappings share reviewed native anatomy, but their support boundary is explicit.
  p.components.select.parts=structuredClone(select.parts);
  const track='[&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--color-primary)_0%,var(--color-primary)_var(--ui-slider-fill,50%),var(--color-muted)_var(--ui-slider-fill,50%),var(--color-muted)_100%)] [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-muted [&::-moz-range-progress]:h-1 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-primary';
  const thumb='[&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-ring [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-ring [&::-moz-range-thumb]:bg-white';
  p.components.slider.parts.control=recipe('h-5 w-full min-w-0 cursor-pointer appearance-none bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:[&::-webkit-slider-thumb]:ring-3 focus-visible:[&::-webkit-slider-thumb]:ring-ring/50 hover:[&::-webkit-slider-thumb]:ring-3 hover:[&::-webkit-slider-thumb]:ring-ring/50 focus-visible:[&::-moz-range-thumb]:ring-3 focus-visible:[&::-moz-range-thumb]:ring-ring/50 hover:[&::-moz-range-thumb]:ring-3 hover:[&::-moz-range-thumb]:ring-ring/50 forced-colors:appearance-auto '+track+' rtl:'+track.split(' ')[2].replace('to_right','to_left')+' '+thumb);
  p.components.field.parts={
    root:recipe('group/field grid w-full min-w-0 gap-2 data-[invalid=true]:text-destructive', {orientation:{
      vertical:['grid-cols-1 [&>[data-ui-part=content]]:contents [&_[data-ui-part=label]]:order-first [&_[data-ui-part=description]]:order-1 [&_[data-ui-part=error]]:order-2'],
      horizontal:['grid-cols-[auto_minmax(0,1fr)] items-start [&>[data-ui-part=content]]:col-start-2 [&>[data-ui-part=content]]:row-start-1 [&>[data-ui-part=content]]:flex [&>[data-ui-part=content]]:flex-col'],
      responsive:['grid-cols-1 [&>[data-ui-part=content]]:contents [&_[data-ui-part=label]]:order-first [&_[data-ui-part=description]]:order-1 [&_[data-ui-part=error]]:order-2 @md/field-group:grid-cols-[auto_minmax(0,1fr)] @md/field-group:items-start @md/field-group:[&>[data-ui-part=content]]:col-start-2 @md/field-group:[&>[data-ui-part=content]]:row-start-1 @md/field-group:[&>[data-ui-part=content]]:flex @md/field-group:[&>[data-ui-part=content]]:flex-col'],
    }},{orientation:'vertical'}),
    content:recipe('min-w-0 gap-0.5 leading-snug'),
    label:recipe('text-sm font-medium leading-snug empty:hidden group-data-[disabled=true]/field:opacity-50'),
    description:recipe('text-sm font-normal leading-normal text-muted-foreground empty:hidden [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary'),
    error:recipe('text-sm font-normal text-destructive empty:hidden'),
  };
  p.components.field.slots.error='error';
  p.components.fieldset.parts.root=recipe('@container/field-group grid min-w-0 gap-4 border-0 p-0 disabled:[&>legend]:opacity-50 disabled:[&>[data-ui-part=description]]:opacity-50');
  p.components.fieldset.parts.legend=recipe('mb-1.5 font-medium',{legendVariant:{legend:['text-base'],label:['text-sm']}},{legendVariant:'legend'});
  p.components.fieldset.parts.description=recipe('-mt-1.5 text-sm font-normal text-muted-foreground empty:hidden');
  p.components.fieldset.slots.description='description';
}
