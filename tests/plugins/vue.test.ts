import { test, expect } from "bun:test";
import { execFileSync } from "node:child_process";
import { parse, compileScript } from "@vue/compiler-sfc";
import { applyClassPlugin } from "../../src/vue/class-plugin";
import { fixture } from "./schema.test";
const source = execFileSync(".test-output/html-ui-to-vue-vapor", [], {
  input: execFileSync(".test-output/html-ui", ["button"]),
  encoding: "utf8",
});
test("emits a compilable typed class recipe and stays idempotent", () => {
  const r = applyClassPlugin(source, fixture, {
    component: "button",
    filename: "Button.vue",
  });
  const d = parse(r.source).descriptor;
  expect(() =>
    compileScript(d, { id: "button", inlineTemplate: true }),
  ).not.toThrow();
  expect(d.styles.length).toBe(0);
  expect(r.source).toContain("class-variance-authority");
  expect(r.source).toContain('"sm" | "lg"');
  expect(r.source).toContain('<slot name="default"');
  expect(
    applyClassPlugin(r.source, fixture, {
      component: "button",
      filename: "Button.vue",
    }).source,
  ).toBe(r.source);
  expect(() =>
    applyClassPlugin(r.source.replace("inline-flex", "changed"), fixture, {
      component: "button",
      filename: "Button.vue",
    }),
  ).toThrow(/edited/);
});
test("rejects missing capabilities and native prop collisions", () => {
  const p: any = structuredClone(fixture);
  p.components.button.requirements = [
    { part: "root", state: "pressed", description: "pressed source" },
  ];
  expect(() =>
    applyClassPlugin(source, p, {
      component: "button",
      filename: "Button.vue",
    }),
  ).toThrow(/pressed/);
  p.components.button.requirements = [];
  p.components.button.parts.root.variants.disabled = { true: [] };
  p.components.button.parts.root.axisTypes.disabled = "boolean";
  expect(() =>
    applyClassPlugin(source, p, {
      component: "button",
      filename: "Button.vue",
    }),
  ).toThrow(/collision/);
});
test("explicit coss capability requirements refuse unavailable behavior", async () => {
  const { importCva } = await import("../../src/plugins/import-cva");
  const p: any = structuredClone(fixture);
  p.components.button.parts.root = importCva(
    await Bun.file("tests/fixtures/plugins/coss-button.ts").text(),
    "buttonVariants",
  );
  p.components.button.requirements = [
    {
      part: "root",
      hook: "button-loading-indicator",
      description: "Requires a loading child and state adapter",
    },
  ];
  expect(() =>
    applyClassPlugin(source, p, {
      component: "button",
      filename: "Button.vue",
    }),
  ).toThrow(/button-loading-indicator/);
});
test("rejects string presence hooks and invalid slot mappings", () => {
  const p: any = structuredClone(fixture);
  p.components.button.hooks = [
    { part: "root", attribute: "data-type", prop: "type" },
  ];
  expect(() =>
    applyClassPlugin(source, p, {
      component: "button",
      filename: "Button.vue",
    }),
  ).toThrow(/boolean/);
  delete p.components.button.hooks;
  p.components.button.slots = { missing: "default" };
  expect(() =>
    applyClassPlugin(source, p, {
      component: "button",
      filename: "Button.vue",
    }),
  ).toThrow(/slot/);
});
test("boolean axes preserve true and absent defaults through Vue boolean casting", () => {
  const p: any = structuredClone(fixture);
  const r = p.components.button.parts.root;
  r.variants.busy = { true: ["opacity-50"], false: ["opacity-100"] };
  r.axisTypes.busy = "boolean";
  r.defaultVariants.busy = true;
  let out = applyClassPlugin(source, p, {
    component: "button",
    filename: "Button.vue",
  }).source;
  let code = compileScript(parse(out).descriptor, {
    id: "bool",
    inlineTemplate: true,
  }).content;
  expect(code).toMatch(/busy:\s*\{[^}]*default: true/);
  delete r.defaultVariants.busy;
  out = applyClassPlugin(source, p, {
    component: "button",
    filename: "Button.vue",
  }).source;
  code = compileScript(parse(out).descriptor, {
    id: "bool",
    inlineTemplate: true,
  }).content;
  expect(code).toMatch(/busy:\s*\{[^}]*default: undefined/);
});
