import { test, expect } from "bun:test";
import { parsePlugin } from "../../src/plugins/schema";
export const recipe = {
  base: ["inline-flex"],
  variants: { size: { sm: ["h-8"], lg: ["h-10"] } },
  axisTypes: { size: "string" },
  defaultVariants: { size: "sm" },
  compoundVariants: [],
};
export const fixture = {
  pluginVersion: 1,
  name: "test",
  provenance: { source: "local", revision: "1", license: "MIT" },
  tokens: [],
  components: {
    button: {
      primitive: "button",
      parts: { root: recipe },
      slots: { label: "default" },
      requirements: [],
    },
  },
};
test("accepts a complete plugin and rejects unsupported versions", () => {
  expect(
    parsePlugin(fixture).components.button.parts.root.defaultVariants.size,
  ).toBe("sm");
  expect(() => parsePlugin({ ...fixture, pluginVersion: 2 })).toThrow();
});
test("rejects unknown defaults, axes, and unsafe keys", () => {
  const bad = structuredClone(fixture);
  bad.components.button.parts.root.defaultVariants.size = "huge";
  expect(() => parsePlugin(bad)).toThrow(/default|size/);
  expect(() => parsePlugin({ ...fixture, unknown: true })).toThrow();
  expect(() =>
    parsePlugin(
      JSON.parse(JSON.stringify(fixture).replace('"button":', '"__proto__":')),
    ),
  ).toThrow();
});
test("rejects incompatible shared axes and conditions", () => {
  const bad: any = structuredClone(fixture);
  bad.components.button.parts.label = {
    ...recipe,
    defaultVariants: { size: "lg" },
  };
  expect(() => parsePlugin(bad)).toThrow(/axis|default/);
  bad.components.button.parts = {
    root: {
      ...recipe,
      compoundVariants: [{ when: { size: "missing" }, classes: ["foo"] }],
    },
  };
  expect(() => parsePlugin(bad)).toThrow(/condition|size/);
});
test.each([
  "foo-bar",
  "aria-label",
  "key",
  "ref",
  "ref_for",
  "class",
  "className",
  "style",
  "onClick",
])("rejects unsafe presentation axis %s", (axis) => {
  const p: any = structuredClone(fixture);
  p.components.button.parts.root.variants = { [axis]: { foo: ["bg-red-500"] } };
  p.components.button.parts.root.axisTypes = { [axis]: "string" };
  p.components.button.parts.root.defaultVariants = {};
  expect(() => parsePlugin(p)).toThrow(/axis|reserved|camel/);
});
test("rejects empty styled anatomy and empty component-name segments", () => {
  const p: any = structuredClone(fixture);
  p.components.button.parts = {};
  expect(() => parsePlugin(p)).toThrow(/part/);
  p.components = { "trailing-": fixture.components.button };
  expect(() => parsePlugin(p)).toThrow(/name|segment/);
});
