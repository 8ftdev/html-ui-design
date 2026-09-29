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
