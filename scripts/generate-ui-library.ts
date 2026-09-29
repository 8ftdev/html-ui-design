import { resolve } from "node:path";
import { generateLibrary } from "../src/library/generate";
import { writeLibrary } from "../src/library/write";
const out = process.argv[2],
  themePath = process.argv[3],
  plugin = process.argv[4] ?? "shadcn-ui";
if (!out || !themePath)
  throw new Error(
    "Usage: bun scripts/generate-ui-library.ts OUT_DIRECTORY THEME_CSS [PLUGIN]",
  );
const files = await generateLibrary({
  producer: process.env.HTML_UI_BIN ?? resolve(".test-output/html-ui"),
  converter:
    process.env.HTML_UI_VUE_BIN ?? resolve(".test-output/html-ui-to-vue-vapor"),
  plugin,
  themePath: resolve(themePath),
});
console.log(
  await writeLibrary(files, resolve(out), {
    check: process.argv.includes("--check"),
  }),
);
