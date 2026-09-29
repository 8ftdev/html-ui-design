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
<Toggle v-model:pressed="pressed">Pin</Toggle><DatePicker v-model:value="date">Date</DatePicker>
<Dialog id="consumer-dialog" title-id="consumer-title"><template #trigger>Open</template><template #title>Title</template>Body<template #close>Close</template></Dialog>
<DropdownMenu id="consumer-menu" label="Actions"><template #trigger>Actions</template><Button role="menuitem">Save</Button></DropdownMenu>
<Chart><svg role="img" aria-label="Trend"/><template #caption>Trend</template></Chart>
</template>`);
check();
for(const [component,attrs,slot] of [['Toggle',':pressed="1"','Pin'],['DatePicker',':value="new Date()"','Date'],['DropdownMenu','id="missing-menu-label"','<template #trigger>Open</template>'],['InputOtp',':max-length="false"','Code']]){
 writeFileSync(resolve(out,'Invalid.vue'),`<script setup lang="ts" vapor>import ${component} from './${component}.vue'</script><template><${component} ${attrs}>${slot}</${component}></template>`);
 try{check();throw new Error(`invalid ${component} props accepted`)}catch(e){if(!String((e as any).stdout).includes('error TS'))throw e}finally{rmSync(resolve(out,'Invalid.vue'))}
}
rmSync(resolve(out,'Remaining.vue'));check();
console.log('PASS: remaining local consumers typecheck; invalid pressed/date/menu-label/OTP types rejected');
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
