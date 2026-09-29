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
