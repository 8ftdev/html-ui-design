import { test, expect } from "bun:test";
import { resolve } from "node:path";
import { generateLibrary } from "../../src/library/generate";
test("library keeps recipe and contract companions while compositions share local implementations", async () => {
  const files = await generateLibrary({
    producer: resolve(".test-output/html-ui"),
    converter: resolve(".test-output/html-ui-to-vue-vapor"),
    plugin: "shadcn-ui",
    themePath: "tests/fixtures/plugins/theme.css",
  });
  expect(files["Button.recipe.ts"]).toContain("class-variance-authority");
  expect(files["Button.vue"]).not.toContain("export const ui");
  expect(
    JSON.parse(files["ui-library.json"]).contracts.button.parts.root.state
      .disabled.source.pseudo,
  ).toBe("disabled");
  expect(files["IconButton.vue"]).toContain(
    "import Button from './Button.vue'",
  );
  for (const text of Object.values(files))
    expect(text).not.toMatch(/from ['"]@(?:base-ui|radix-ui)/);
});
async function customLibrary(components: unknown) {
  const { mkdtemp, writeFile } = await import("node:fs/promises");
  const builtin = JSON.parse(
    await Bun.file("src/plugins/builtin/shadcn-ui.json").text(),
  );
  builtin.components = components;
  const dir = await mkdtemp("/private/tmp/ui-review-");
  const path = dir + "/plugin.json";
  await writeFile(path, JSON.stringify(builtin));
  return generateLibrary({
    producer: resolve(".test-output/html-ui"),
    converter: resolve(".test-output/html-ui-to-vue-vapor"),
    plugin: path,
    themePath: "tests/fixtures/plugins/theme.css",
  });
}
test("custom Button without icon-size axes does not receive an invalid IconButton", async () => {
  const p = JSON.parse(
    await Bun.file("src/plugins/builtin/shadcn-ui.json").text(),
  );
  const b = p.components.button.parts.root;
  b.variants = { tone: { default: ["text-primary"] } };
  b.axisTypes = { tone: "string" };
  b.defaultVariants = { tone: "default" };
  const files = await customLibrary({
    button: p.components.button,
    icon: p.components.icon,
  });
  expect(files["IconButton.vue"]).toBeUndefined();
  expect(
    JSON.parse(files["ui-library.json"]).compositions.iconButton.reason,
  ).toContain("size");
});
test("rejects output filename aliases before generating", async () => {
  const p = JSON.parse(
    await Bun.file("src/plugins/builtin/shadcn-ui.json").text(),
  );
  await expect(
    customLibrary({ "foo-bar": p.components.card, fooBar: p.components.card }),
  ).rejects.toThrow(/collision/);
  await expect(
    customLibrary({ button: p.components.button, Button: p.components.button }),
  ).rejects.toThrow(/collision/);
});
test("an explicitly mapped IconButton is never overwritten by auto-composition", async () => {
  const p = JSON.parse(
    await Bun.file("src/plugins/builtin/shadcn-ui.json").text(),
  );
  const files = await customLibrary({
    button: p.components.button,
    icon: p.components.icon,
    "icon-button": p.components.card,
  });
  expect(files["IconButton.recipe.ts"]).toBeDefined();
  expect(files["IconButton.vue"]).not.toContain(
    "import Button from './Button.vue'",
  );
  expect(
    JSON.parse(files["ui-library.json"]).compositions.iconButton.reason,
  ).toContain("explicit");
});
