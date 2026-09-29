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
