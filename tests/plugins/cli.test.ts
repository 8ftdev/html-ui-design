import { test, expect } from "bun:test";
import { spawnSync, execFileSync } from "node:child_process";
const input = execFileSync(".test-output/html-ui-to-vue-vapor", [], {
  input: execFileSync(".test-output/html-ui", ["button"]),
  encoding: "utf8",
});
test("CLI emits plugin-selected component with no old CSS", () => {
  const r = spawnSync(
    "node",
    [
      "dist/cli.js",
      "--framework",
      "vue",
      "--theme",
      "tests/fixtures/plugins/theme.css",
      "--plugin",
      "shadcn-ui",
    ],
    { input, encoding: "utf8" },
  );
  expect(r.status).toBe(0);
  expect(r.stdout).toContain("class-variance-authority");
  expect(r.stdout).not.toContain("<style");
});
test("CLI statically extracts a named exported recipe", () => {
  const r = spawnSync(
    "node",
    [
      "dist/cli.js",
      "--import-cva",
      "tests/fixtures/plugins/simple.ts",
      "--export",
      "styles",
    ],
    { encoding: "utf8" },
  );
  expect(r.status).toBe(0);
  expect(JSON.parse(r.stdout).base).toEqual(["flex"]);
});
test("CLI writes a local library with companion recipes", async () => {
  const { mkdtemp } = await import("node:fs/promises");
  const { resolve } = await import("node:path");
  const dir = await mkdtemp("/private/tmp/ui-cli-library-");
  const r = spawnSync(
    "node",
    [
      "dist/cli.js",
      "--framework",
      "vue",
      "--theme",
      "tests/fixtures/plugins/theme.css",
      "--out-dir",
      dir,
      "--producer",
      resolve(".test-output/html-ui"),
      "--converter",
      resolve(".test-output/html-ui-to-vue-vapor"),
    ],
    { encoding: "utf8" },
  );
  expect(r.status).toBe(0);
  expect(await Bun.file(dir + "/IconButton.vue").exists()).toBe(true);
  expect(await Bun.file(dir + "/Button.recipe.ts").exists()).toBe(true);
});
test('CLI resolves custom and native Select from their distinct primitive contracts',()=>{
 for(const primitive of ['select-list','select']){
  const input=execFileSync('.test-output/html-ui-to-vue-vapor',[],{input:execFileSync('.test-output/html-ui',[primitive]),encoding:'utf8',stdio:['pipe','pipe','pipe']});
  const result=spawnSync('node',['dist/cli.js','--framework','vue','--plugin','shadcn-ui','--theme','tests/fixtures/plugins/theme.css'],{input,encoding:'utf8'});
  expect(result.status).toBe(0);expect(result.stdout.includes('role="combobox"')).toBe(primitive==='select-list');
 }
});
test('CLI explicitly selects Calendar and DatePicker from date-grid and rejects ambiguous input',()=>{
 const input=execFileSync('.test-output/html-ui-to-vue-vapor',[],{input:execFileSync('.test-output/html-ui',['date-grid']),encoding:'utf8',stdio:['pipe','pipe','pipe']});
 const args=['dist/cli.js','--framework','vue','--plugin','shadcn-ui','--theme','tests/fixtures/plugins/theme.css'];
 for(const component of ['calendar','date-picker']){const r=spawnSync('node',[...args,'--component',component],{input,encoding:'utf8'});expect(r.status).toBe(0);expect(r.stdout).toContain(`uiDate(root,"${component}"`)}
 const ambiguous=spawnSync('node',args,{input,encoding:'utf8'});expect(ambiguous.status).toBe(2);expect(ambiguous.stdout).toBe('');expect(ambiguous.stderr).toContain('--component');
 for(const component of ['button','missing']){const r=spawnSync('node',[...args,'--component',component],{input,encoding:'utf8'});expect(r.status).toBe(2);expect(r.stdout).toBe('')}
});
test('CLI component selection requires a standalone class plugin',()=>{
 for(const args of [['--framework','vue','--theme','tests/fixtures/plugins/theme.css','--component','button'],['--framework','vue','--plugin','shadcn-ui','--component','button','--out-dir','/private/tmp/ui-date-invalid-output'],['--import-cva','tests/fixtures/plugins/simple.ts','--export','styles','--component','button']]){const r=spawnSync('node',['dist/cli.js',...args],{input,encoding:'utf8'});expect(r.status).toBe(2);expect(r.stdout).toBe('')}
});
