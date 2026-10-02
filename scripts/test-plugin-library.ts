import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { generateLibrary } from "../src/library/generate";
const out = resolve(".test-output/plugin-types");
mkdirSync(out, { recursive: true });
const files = await generateLibrary({
  producer: resolve(".test-output/html-ui"),
  converter: resolve(".test-output/html-ui-to-vue-vapor"),
  plugin: "shadcn-ui",
  themePath: "tests/fixtures/plugins/theme.css",
});
for (const [name, source] of Object.entries(files))
  writeFileSync(resolve(out, name), source);
writeFileSync(
  resolve(out, "tsconfig.json"),
  JSON.stringify({ ...JSON.parse(readFileSync(".test-output/catalog/tsconfig.json", "utf8")), compilerOptions: { ...JSON.parse(readFileSync(".test-output/catalog/tsconfig.json", "utf8")).compilerOptions, noUncheckedIndexedAccess: true } }),
);
const check = () =>
  execFileSync(
    "node",
    [
      "node_modules/vue-tsc/bin/vue-tsc.js",
      "--project",
      out,
      "--pretty",
      "false",
    ],
    { encoding: "utf8" },
  );
check();
writeFileSync(
  resolve(out, "Invalid.vue"),
  `<script setup lang="ts" vapor>import Button from './Button.vue'</script><template><Button variant="unknown">test</Button></template>`,
);
try {
  check();
  throw new Error("invalid variant accepted");
} catch (e) {
  if (!String((e as any).stdout).includes("unknown")) throw e;
} finally {
  rmSync(resolve(out, "Invalid.vue"));
}
check();
console.log(
  "PASS: library including local composition typechecks; invalid variant rejected",
);
writeFileSync(resolve(out, "Motion.vue"), `<script setup lang="ts" vapor>import Accordion from './Accordion.vue'</script><template><Accordion :motion="{content:{expanded:{preset:'disclosure',duration:'250ms'}}}"><template #summary>Heading</template>Body</Accordion></template>`);
check();
writeFileSync(resolve(out, "Motion.vue"), `<script setup lang="ts" vapor>import Accordion from './Accordion.vue'</script><template><Accordion :motion="{content:{expanded:{preset:'unknown'}}}"><template #summary>Heading</template>Body</Accordion></template>`);
try { check(); throw new Error("invalid motion preset accepted"); }
catch (e) { if (!String((e as any).stdout).includes("unknown")) throw e; }
finally { rmSync(resolve(out, "Motion.vue")); }
console.log("PASS: motion overrides typecheck; invalid preset rejected");
writeFileSync(resolve(out, "BatchTwo.vue"), `<script setup lang="ts" vapor>
import {ref} from 'vue'
import {Badge,Alert,AspectRatio,ButtonGroup,Button,Label,Table,Textarea,Spinner,Skeleton,Breadcrumb} from './index'
const value=ref('hello')
</script><template>
<Badge variant="outline">Ready</Badge><Alert variant="destructive"><template #title>Failed</template>Retry</Alert>
<AspectRatio ratio="photo" :styles="{root:{aspectRatio:'3 / 2'}}"/><ButtonGroup label="Actions" orientation="vertical"><Button>Save</Button></ButtonGroup>
<Label html-for="notes">Notes</Label><Textarea id="notes" v-model:value="value" :min-length="2" :rows="3" read-only>Notes</Textarea>
<Table><template #caption>Invoices</template><template #head><tr><th scope="col">Name</th></tr></template><tr><td>One</td></tr></Table>
<Spinner label="Saving"/><Skeleton/><Breadcrumb><li><a href="/">Home</a></li></Breadcrumb>
</template>`);
check();
for (const [component,attrs,slot] of [['Badge','variant="unknown"','test'],['AspectRatio','ratio="unknown"',''],['ButtonGroup','label="Actions" orientation="diagonal"',''],['Textarea',':rows="true"','Notes']] ) {
 writeFileSync(resolve(out,"Invalid.vue"),`<script setup lang="ts" vapor>import ${component} from './${component}.vue'</script><template><${component} ${attrs}>${slot}</${component}></template>`);
 try { check(); throw new Error(`invalid ${component} props accepted`); }
 catch(e) { if (!String((e as any).stdout).includes('error TS')) throw e; }
 finally { rmSync(resolve(out,"Invalid.vue")); }
}
rmSync(resolve(out,"BatchTwo.vue"));
check();
console.log('PASS: batch two consumer compositions typecheck; invalid variant, ratio, orientation and textarea props rejected');
writeFileSync(resolve(out,"BatchThree.vue"),`<script setup lang="ts" vapor>
import {ref} from 'vue'
import {Empty,Item,InputGroup,Kbd,Pagination,Typography,Direction,RadioGroup,Radio,Slider,Button} from './index'
const text=ref('hello'),volume=ref(50)
</script><template>
<Empty variant="icon"><template #title>Empty</template><Button>Create</Button></Empty>
<Item variant="outline" size="xs"><template #title>Item</template>Description</Item>
<InputGroup id="consumer-query" v-model:value="text" read-only>Query<template #end><Kbd>K</Kbd></template></InputGroup>
<Pagination><li><a href="/">1</a></li></Pagination><Direction dir="rtl"><Typography><h2>Heading</h2><p>Body</p></Typography></Direction>
<RadioGroup name="delivery"><template #legend>Delivery</template><template #default="{name}"><Radio :name="name" value="email" default-checked>Email</Radio></template></RadioGroup>
<Slider v-model:value="volume" :min="0" :max="100" :step="10">Volume</Slider>
</template>`);
check();
for(const [component,attrs,slot] of [['Direction','dir="sideways"','text'],['Item','variant="unknown"','<template #title>title</template>'],['InputGroup','','label'],['Radio','name="x" value="one" default-checked="yes"','label'],['Slider',':value="true"','volume']]){
 writeFileSync(resolve(out,"Invalid.vue"),`<script setup lang="ts" vapor>import ${component} from './${component}.vue'</script><template><${component} ${attrs}>${slot}</${component}></template>`);
 try{check();throw new Error(`invalid ${component} props accepted`)}catch(e){if(!String((e as any).stdout).includes('error TS'))throw e}finally{rmSync(resolve(out,"Invalid.vue"))}
}
rmSync(resolve(out,"BatchThree.vue"));check();
console.log('PASS: batch three scoped compositions and models typecheck; invalid direction, variant, required id, radio and slider types rejected');
writeFileSync(resolve(out,'Remaining.vue'),`<script setup lang="ts" vapor>
import {ref} from 'vue'
import {Toggle,DatePicker,Dialog,DropdownMenu,Button,Chart} from './index'
const pressed=ref(false),date=ref('2026-09-29')
</script><template>
<Toggle v-model:pressed="pressed">Pin</Toggle><DatePicker id="consumer-date" popup-id="consumer-month" v-model:value="date">Date</DatePicker>
<Dialog id="consumer-dialog" title-id="consumer-title"><template #trigger>Open</template><template #title>Title</template>Body<template #close>Close</template></Dialog>
<DropdownMenu id="consumer-menu" label="Actions"><template #trigger>Actions</template><Button role="menuitem" variant="menu">Save</Button></DropdownMenu>
<Chart><svg role="img" aria-label="Trend"/><template #caption>Trend</template></Chart>
</template>`);
check();
for(const [component,attrs,slot] of [['Toggle',':pressed="1"','Pin'],['DatePicker','id="invalid-date" popup-id="invalid-month" :value="new Date()"','Date'],['DropdownMenu','id="missing-menu-label"','<template #trigger>Open</template>'],['InputOtp',':max-length="false"','Code']]){
 writeFileSync(resolve(out,'Invalid.vue'),`<script setup lang="ts" vapor>import ${component} from './${component}.vue'</script><template><${component} ${attrs}>${slot}</${component}></template>`);
 try{check();throw new Error(`invalid ${component} props accepted`)}catch(e){if(!String((e as any).stdout).includes('error TS'))throw e}finally{rmSync(resolve(out,'Invalid.vue'))}
}
rmSync(resolve(out,'Remaining.vue'));check();
console.log('PASS: remaining local consumers typecheck; invalid pressed/date/menu-label/OTP types rejected');
writeFileSync(resolve(out,'SelectConsumer.vue'),`<script setup lang="ts" vapor>
import {ref} from 'vue'
import {Select,NativeSelect,Field} from './index'
const status=ref('draft')
</script><template><Field id="consumer-status"><template #label>Status</template><template #control="{id}"><Select :id="id" popup-id="consumer-options" name="status" v-model:value="status" size="sm" side="top" align="end" :classes="{option:'rounded-none'}" :styles="{popup:{maxHeight:'12rem'}}"><template #options><option value="draft">Draft</option><option value="published">Published</option></template></Select></template></Field><NativeSelect name="native-status">Native status<template #options><option value="draft">Draft</option></template></NativeSelect></template>`);
check();rmSync(resolve(out,'SelectConsumer.vue'));
for(const attrs of ['popup-id="choices"','id="choice" popup-id="choices" align="diagonal"','id="choice" popup-id="choices" :value="10"',`id="choice" popup-id="choices" :classes="{unknownPart: 'x'}"`]){
 writeFileSync(resolve(out,'Invalid.vue'),`<script setup lang="ts" vapor>import Select from './Select.vue'</script><template><Select ${attrs}><template #options><option>One</option></template></Select></template>`);
 try{check();throw new Error('invalid Select contract accepted')}catch(e){if(!String((e as any).stdout).includes('error TS'))throw e}finally{rmSync(resolve(out,'Invalid.vue'))}
}
check();console.log('PASS: compact Select and NativeSelect compositions typecheck; invalid id, placement, value and parts rejected');
// Parts may style different values of one public axis.
const partial = JSON.parse(
  readFileSync("src/plugins/builtin/shadcn-ui.json", "utf8"),
);
for (const [part, value] of [
  ["root", "sm"],
  ["control", "lg"],
]) {
  const r = partial.components.input.parts[part];
  r.variants = { size: { [value]: [] } };
  r.axisTypes = { size: "string" };
  r.defaultVariants = {};
}
const custom = resolve(".test-output/partial-plugin.json");
writeFileSync(custom, JSON.stringify(partial));
const partialFiles = await generateLibrary({
  producer: resolve(".test-output/html-ui"),
  converter: resolve(".test-output/html-ui-to-vue-vapor"),
  plugin: custom,
  themePath: "tests/fixtures/plugins/theme.css",
});
for (const [name, source] of Object.entries(partialFiles))
  writeFileSync(resolve(out, name), source);
check();
console.log("PASS: partial per-part axes share a typed public union");
writeFileSync(resolve(out,'Search.vue'),`<script setup lang="ts" vapor>
import {ref} from 'vue'
import {Combobox,Command,Dialog} from './index'
const value=ref('nuxt'),actions=ref<string[]>([])
const run=(value:string)=>actions.value.push(value)
</script><template>
<Combobox id="consumer-search" popup-id="consumer-options" v-model:value="value" name="framework" required side="top" align="end" :classes="{input:'font-normal',option:'aria-disabled:opacity-70'}" :styles="{popup:{maxHeight:'12rem'}}">Framework<template #options><option value="nuxt">Nuxt</option><option value="astro" data-keywords="stars">Astro</option></template></Combobox>
<Dialog id="consumer-command-dialog" title-id="consumer-command-title"><template #trigger>Open</template><template #title>Actions</template><Command id="consumer-command" popup-id="consumer-actions" empty-text="No actions" @select="run">Actions<template #options><optgroup label="Reports"><option value="new">New report</option></optgroup></template></Command><template #close>Close</template></Dialog>
</template>`);
check();
for(const [component,attrs] of [['Combobox','id="one"'],['Combobox','id="one" popup-id="two" side="left"'],['Command','id="one"'],['Command','id="one" popup-id="two" @select="(value: boolean)=>{}"']]){
 writeFileSync(resolve(out,'Invalid.vue'),`<script setup lang="ts" vapor>import ${component} from './${component}.vue'</script><template><${component} ${attrs}>Label<template #options><option value="one">One</option></template></${component}></template>`);
 try{check();throw new Error('invalid searchable contract accepted')}catch(e){if(!String((e as any).stdout).includes('error TS'))throw e}finally{rmSync(resolve(out,'Invalid.vue'))}
}
rmSync(resolve(out,'Search.vue'));check();console.log('PASS: searchable model, part overrides, placement and Command action events typecheck; invalid IDs/placement/event types rejected');

writeFileSync(resolve(out,'Hover.vue'),`<script setup lang="ts" vapor>import {Tooltip,HoverCard} from './index'</script><template>
<Tooltip id="typed-tooltip" side="left" align="end" :open-delay="100" :close-delay="200" :side-offset="8" :classes="{tooltip:'max-w-48'}"><template #trigger>Help</template>Descriptive text</Tooltip>
<HoverCard id="typed-preview" side="right" align="start" :open-delay="100" :close-delay="200" :styles="{popup:{maxHeight:'10rem'}}"><template #trigger>Preview</template>Preview details</HoverCard>
</template>`);check();
for(const [component,attrs] of [['Tooltip','id="one" side="diagonal"'],['HoverCard','id="one" open-delay="slow"'],['HoverCard','align="start"']]){
 writeFileSync(resolve(out,'Invalid.vue'),`<script setup lang="ts" vapor>import ${component} from './${component}.vue'</script><template><${component} ${attrs}><template #trigger>Help</template>Details</${component}></template>`);
 try{check();throw new Error('invalid hover contract accepted')}catch(e){if(!String((e as any).stdout).includes('error TS'))throw e}finally{rmSync(resolve(out,'Invalid.vue'))}
}
rmSync(resolve(out,'Hover.vue'));check();console.log('PASS: hover placement, delays and part overrides typecheck; invalid placement/delay and missing IDs rejected');

writeFileSync(resolve(out,'Popup.vue'),`<script setup lang="ts" vapor>import {Popover,DropdownMenu,ContextMenu,Button} from './index'</script><template>
<Popover id="typed-popover" side="left" align="end" :side-offset="8"><template #trigger>Settings</template>Settings content</Popover>
<DropdownMenu id="typed-dropdown" label="Actions" side="right" align="start" :side-offset="6" :classes="{popup:'rounded-none'}"><template #trigger>Actions</template><Button role="menuitem" variant="menu">Save</Button></DropdownMenu>
<ContextMenu id="typed-context" label="Context actions" side="bottom" align="center"><template #trigger>Context</template><Button role="menuitem" variant="menu">Inspect</Button></ContextMenu>
</template>`);check();
for(const [component,attrs] of [['Popover','id="one" side="diagonal"'],['DropdownMenu','id="one" label="Actions" side-offset="far"'],['ContextMenu','id="one" align="start"']]){
 writeFileSync(resolve(out,'Invalid.vue'),`<script setup lang="ts" vapor>import ${component} from './${component}.vue'</script><template><${component} ${attrs}><template #trigger>Open</template>Details</${component}></template>`);
 try{check();throw new Error('invalid popup contract accepted')}catch(e){if(!String((e as any).stdout).includes('error TS'))throw e}finally{rmSync(resolve(out,'Invalid.vue'))}
}
rmSync(resolve(out,'Popup.vue'));check();console.log('PASS: popup/menu placement and local rows typecheck; invalid sides/offsets and missing menu labels rejected');

writeFileSync(resolve(out,'Modal.vue'),`<script setup lang="ts" vapor>import {Dialog,AlertDialog,Drawer,Sheet,Button} from './index'</script><template>
<Dialog id="typed-dialog" title-id="typed-title" description-id="typed-help" variant="outline" close-variant="ghost" close-size="icon-sm" :classes="{header:'gap-3',description:'text-muted-foreground',footer:'justify-start'}"><template #trigger>Edit</template><template #title>Edit profile</template><template #description>Profile help</template><template #close>Close</template><template #footer><Button command="close" command-for="typed-dialog">Save</Button></template></Dialog>
<AlertDialog id="typed-alert" title-id="typed-alert-title" description-id="typed-alert-help" content-size="sm"><template #trigger>Delete</template><template #title>Delete?</template><template #description>This is permanent.</template><template #close>Cancel</template><template #footer><Button variant="destructive" command="close" command-for="typed-alert">Confirm</Button></template></AlertDialog>
<Drawer id="typed-drawer" title-id="typed-drawer-title" side="bottom"><template #trigger>Open drawer</template><template #title>Drawer</template><template #close>Cancel</template></Drawer>
<Sheet id="typed-sheet" title-id="typed-sheet-title" side="left"><template #trigger>Open sheet</template><template #title>Sheet</template><template #close>Close</template></Sheet>
</template>`);check();
for(const [component,attrs] of [['Dialog','id="one" title-id="two" close-size="tiny"'],['Sheet','id="one" title-id="two" side="diagonal"'],['AlertDialog','id="one" title-id="two"'],['AlertDialog','id="one" title-id="two" description-id="three" content-size="huge"']]){
 writeFileSync(resolve(out,'Invalid.vue'),`<script setup lang="ts" vapor>import ${component} from './${component}.vue'</script><template><${component} ${attrs}><template #trigger>Open</template><template #title>Title</template><template #description>Details</template><template #close>Close</template></${component}></template>`);
 try{check();throw new Error('invalid modal contract accepted')}catch(e){if(!String((e as any).stdout).includes('error TS'))throw e}finally{rmSync(resolve(out,'Invalid.vue'))}
}
rmSync(resolve(out,'Modal.vue'));check();console.log('PASS: compact modal slots, command Buttons and independent close axes typecheck; invalid dimensions, sides and missing AlertDialog description IDs rejected');
writeFileSync(resolve(out,'Dates.vue'),`<script setup lang="ts" vapor>
import {ref} from 'vue';import {Calendar,DatePicker,NativeDatePicker} from './index';const date=ref('2024-02-29');
</script><template><Calendar id="typed-calendar" popup-id="typed-calendar-grid" v-model:value="date" locale="es-ES" :first-day-of-week="1" :classes="{day:'rounded-none',week:'mt-1',weekday:'font-medium'}" :styles="{cell:{borderRadius:'0px'}}" ariaLabel="Booking"/><DatePicker id="typed-picker" popup-id="typed-picker-grid" v-model:value="date" default-month="2024-02" min="2024-01-01" required>Arrival</DatePicker><NativeDatePicker v-model:value="date">Native</NativeDatePicker></template>`);check();rmSync(resolve(out,'Dates.vue'));
for(const attrs of [':value="new Date()"',':first-day-of-week="\'Monday\'"',':classes="{missingPart:\'x\'}"']){
 writeFileSync(resolve(out,'Invalid.vue'),`<script setup lang="ts" vapor>import {Calendar} from './index'</script><template><Calendar id="invalid-date" popup-id="invalid-grid" ${attrs} ariaLabel="Date"/></template>`);
 try{check();throw new Error('invalid calendar props accepted')}catch(e){if(!String((e as any).stdout).includes('error TS'))throw e}finally{rmSync(resolve(out,'Invalid.vue'))}
}
console.log('PASS: Calendar, DatePicker and NativeDatePicker typed contracts; invalid values/week-start/owned parts rejected');
