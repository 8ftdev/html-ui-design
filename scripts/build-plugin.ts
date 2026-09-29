import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { importCva } from "../src/plugins/import-cva";
import { parsePlugin, pluginSchema } from "../src/plugins/schema";
import { z } from "zod";
import { addNativeBatch } from "./plugin-batch-one";
import { addCompositionBatch } from "./plugin-batch-two";
import { addFormContentBatch } from "./plugin-batch-three";
const raw = readFileSync(
  "tests/fixtures/plugins/shadcn-base-nova.registry.json",
  "utf8",
);
const registry = JSON.parse(raw);
const source = (name: string) =>
  registry.find((r: any) => r.name === name).files[0].content as string;
const recipe = (base: string) => ({
  base: [base],
  variants: {},
  axisTypes: {},
  defaultVariants: {},
  compoundVariants: [],
});
const button = JSON.parse(
  JSON.stringify(importCva(source("button"), "buttonVariants")).replaceAll(
    "[&_svg",
    "[&>svg",
  ),
); // Local Icon owns nested SVG styling.
// CVA does not resolve conflicting Tailwind utilities. Keep the transparent
// border on the variants that need it, so outline's border token is authoritative.
button.base = button.base.map((value: string) => value.split(/\s+/).filter(token => token !== "border-transparent").join(" "));
for (const [variant, values] of Object.entries(button.variants.variant)) {
  if (variant !== "outline") (values as string[]).unshift("border-transparent");
}
const input = source("input").match(/className=\{cn\(\s*"([^"]+)"/)![1];
const p: any = {
  pluginVersion: 1,
  name: "shadcn-ui",
  provenance: {
    source: "shadcn registry/base-nova (2026-09-29)",
    revision: createHash("sha256").update(raw).digest("hex"),
    license: "MIT; shadcn",
  },
  tokens: [
    "background",
    "foreground",
    "primary",
    "primary-foreground",
    "secondary",
    "secondary-foreground",
    "muted",
    "muted-foreground",
    "destructive",
    "border",
    "input",
    "ring",
    "card",
    "card-foreground",
  ],
  components: {},
};
const component = (
  name: string,
  parts: any,
  slots: any = {},
  requirements: any[] = [],
) => (p.components[name] = { primitive: name, parts, slots, requirements });
component("button", { root: button }, { label: "default" }, [
  { part: "root", state: "disabled", description: "Native disabled button" },
]);
p.components.button.hooks = [
  { part: "root", attribute: "data-disabled", prop: "disabled" },
];
component(
  "input",
  { root: recipe("grid gap-2 text-sm font-medium"), control: recipe(input) },
  { label: "default" },
  [
    {
      part: "control",
      state: "disabled",
      description: "Native input disabled state",
    },
  ],
);
component(
  "checkbox",
  {
    root: recipe("inline-flex items-center gap-2 text-sm"),
    control: recipe(
      "size-4 shrink-0 rounded border-input accent-primary focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50 disabled:cursor-not-allowed",
    ),
  },
  { label: "default" },
  [{ part: "control", state: "checked", description: "Native checked state" }],
);
// Native container adaptation: CardContent padding belongs to the single local surface.
component(
  "card",
  {
    root: recipe(
      "flex flex-col gap-4 rounded-xl bg-card p-6 text-sm text-card-foreground ring-1 ring-foreground/10",
    ),
  },
  { default: "default" },
);
component(
  "icon",
  {
    root: recipe(
      "inline-flex shrink-0 items-center justify-center [&>svg]:size-[var(--ui-icon-size,1rem)] [&>svg]:shrink-0 [&>svg]:pointer-events-none",
    ),
  },
  { default: "default" },
);
const grid = recipe("grid") as any;
grid.variants = {
  gap: {
    none: ["gap-0"],
    xs: ["gap-1"],
    sm: ["gap-2"],
    default: ["gap-4"],
    lg: ["gap-6"],
    xl: ["gap-8"],
  },
  columns: {
    "1": ["grid-cols-1"],
    "2": ["grid-cols-2"],
    "3": ["grid-cols-3"],
    "4": ["grid-cols-4"],
  },
  smColumns: {
    "1": ["sm:grid-cols-1"],
    "2": ["sm:grid-cols-2"],
    "3": ["sm:grid-cols-3"],
    "4": ["sm:grid-cols-4"],
  },
  mdColumns: {
    "1": ["md:grid-cols-1"],
    "2": ["md:grid-cols-2"],
    "3": ["md:grid-cols-3"],
    "4": ["md:grid-cols-4"],
  },
};
grid.axisTypes = {
  gap: "string",
  columns: "string",
  smColumns: "string",
  mdColumns: "string",
};
grid.defaultVariants = { gap: "default", columns: "1" };
component("grid", { root: grid }, { default: "default" });
addNativeBatch(p, source);
addCompositionBatch(p, source);
addFormContentBatch(p, source);
writeFileSync(
  "src/plugins/builtin/shadcn-ui.json",
  JSON.stringify(parsePlugin(p), null, 2) + "\n",
);
writeFileSync(
  "schemas/ui-plugin.schema.json",
  JSON.stringify(z.toJSONSchema(pluginSchema), null, 2) + "\n",
);
