import { test, expect } from "bun:test";
import { cva } from "class-variance-authority";
import { importCva } from "../../src/plugins/import-cva";
const config = {
  variants: {
    size: { sm: "h-8", lg: "h-10" },
    busy: { true: "opacity-50", false: "" },
  },
  defaultVariants: { size: "sm", busy: false },
  compoundVariants: [{ size: ["sm", "lg"], busy: true, class: "cursor-wait" }],
};
const source = `import {cva as recipe} from 'class-variance-authority'; export const buttonVariants=recipe('inline-flex', ${JSON.stringify(config)});`;
test("extracts aliased CVA with defaults, boolean axes and compound arrays", () => {
  const result = importCva(source, "buttonVariants");
  expect(result.axisTypes.busy).toBe("boolean");
  const imported = cva(result.base, {
    variants: result.variants,
    defaultVariants: result.defaultVariants,
    compoundVariants: result.compoundVariants.map((c: any) => ({
      ...c.when,
      class: c.classes,
    })),
  } as any);
  const original = cva("inline-flex", config as any);
  for (const size of ["sm", "lg"])
    for (const busy of [true, false])
      expect(imported({ size, busy } as any)).toBe(
        original({ size, busy } as any),
      );
});
test("preserves arbitrary selector and responsive utilities", () => {
  const s = `import {cva} from 'class-variance-authority'; export const x=cva('sm:[&_svg]:size-4 [:active,[data-pressed]]:shadow-none');`;
  expect(importCva(s, "x").base).toEqual([
    "sm:[&_svg]:size-4 [:active,[data-pressed]]:shadow-none",
  ]);
});
test.each([
  `cva(base())`,
  `cva('x',{...config})`,
  `cva('x',{defaultVariants:{x:null}})`,
  `cva('x',{variants:{x:{a:'a',a:'b'}}})`,
])("rejects unsupported static source %s", (expr) => {
  expect(() =>
    importCva(
      `import {cva} from 'class-variance-authority';export const x=${expr};`,
      "x",
    ),
  ).toThrow();
});
test("rejects unrelated cva functions", () =>
  expect(() =>
    importCva(`function cva(){};export const x=cva('x');`, "x"),
  ).toThrow());
test("extracts a declaration exported separately as in shadcn", () => {
  expect(
    importCva(
      `import {cva} from 'class-variance-authority';const buttonVariants=cva('flex');export {buttonVariants};`,
      "buttonVariants",
    ).base,
  ).toEqual(["flex"]);
});
test("imports recipe from a TSX component without converting the component", () => {
  expect(
    importCva(
      `import {cva} from 'class-variance-authority';const x=cva('flex');function Button(){return <button/>};export {x,Button};`,
      "x",
    ).base,
  ).toEqual(["flex"]);
});
test("all supplied coss size/variant selections match the original CVA recipe", async () => {
  const { buttonVariants } = await import("../fixtures/plugins/coss-button");
  const text = await Bun.file("tests/fixtures/plugins/coss-button.ts").text();
  const r = importCva(text, "buttonVariants");
  const imported = cva(r.base, {
    variants: r.variants,
    defaultVariants: r.defaultVariants,
  } as any);
  for (const size of Object.keys(r.variants.size))
    for (const variant of Object.keys(r.variants.variant))
      expect(imported({ size, variant } as any)).toBe(
        buttonVariants({ size, variant } as any),
      );
});
