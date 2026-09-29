import { z } from "zod";
const key = z
  .string()
  .min(1)
  .refine(
    (k) => !["__proto__", "constructor", "prototype"].includes(k),
    "unsafe key",
  );
const identifier = key.refine(
  (k) => /^[a-zA-Z][\w-]*$/.test(k),
  "invalid name",
);
const axisName = key.regex(
  /^(?!(?:key|ref|class|className|style)$)(?!on[A-Z])[a-z][A-Za-z0-9]*$/,
  "axis must use camelCase and cannot use reserved Vue/CVA names",
);
const componentName = key.regex(
  /^[A-Za-z]\w*(?:-\w+)*$/,
  "component name contains an empty or invalid segment",
);
const classes = z.array(z.string());
const value = z.union([z.string(), z.boolean()]);
export const recipeSchema = z.strictObject({
  base: classes,
  variants: z.record(axisName, z.record(key, classes)),
  axisTypes: z.record(axisName, z.enum(["string", "boolean"])),
  defaultVariants: z.record(axisName, value),
  compoundVariants: z.array(
    z.strictObject({
      when: z.record(axisName, z.union([value, z.array(value).min(1)])),
      classes,
    }),
  ),
});
export const motionRecipeSchema = z.strictObject({
  preset: z.literal("disclosure"),
  duration: z.string().min(1),
  easing: z.string().min(1),
});
export type MotionRecipe = z.infer<typeof motionRecipeSchema>;
export const pluginSchema = z.strictObject({
  pluginVersion: z.literal(1),
  name: identifier,
  provenance: z.strictObject({
    source: z.string().min(1),
    revision: z.string().min(1),
    license: z.string().min(1),
  }),
  tokens: z.array(identifier),
  components: z.record(
    componentName,
    z.strictObject({
      primitive: identifier,
      interaction: z.enum(['dialog','popover','tabs','menu','context-menu','toolbar','toggle','toggle-group','tooltip']).optional(),
      parts: z
        .record(identifier, recipeSchema)
        .refine(
          (parts) => Object.keys(parts).length > 0,
          "at least one styled part is required",
        )
        .meta({ minProperties: 1 }),
      slots: z.record(identifier, identifier),
      requirements: z.array(
        z.strictObject({
          part: identifier,
          state: identifier.optional(),
          hook: z.string().min(1).optional(),
          description: z.string().min(1),
        }),
      ),
      motion: z.record(identifier, z.strictObject({ expanded: motionRecipeSchema })).optional(),
      hooks: z
        .array(
          z.strictObject({
            part: identifier,
            attribute: z.string().regex(/^data-[a-z][a-z0-9-]*$/),
            prop: identifier,
          }),
        )
        .optional(),
    }),
  ),
});
export type ClassRecipe = z.infer<typeof recipeSchema>;
export type UIPlugin = z.infer<typeof pluginSchema>;
export type ComponentRecipe = UIPlugin["components"][string];
export function validateRecipe(r: ClassRecipe): void {
  for (const axis of Object.keys(r.axisTypes))
    if (!Object.hasOwn(r.variants, axis))
      throw new Error(`missing variants for axis ${axis}`);
  for (const [axis, choices] of Object.entries(r.variants)) {
    if (!r.axisTypes[axis] || !Object.keys(choices).length)
      throw new Error(`invalid axis ${axis}`);
    if (
      r.axisTypes[axis] === "boolean" &&
      Object.keys(choices).some((k) => k !== "true" && k !== "false")
    )
      throw new Error(`invalid boolean axis ${axis}`);
  }
  const check = (axis: string, v: string | boolean) => {
    if (
      !Object.hasOwn(r.variants, axis) ||
      typeof v !== r.axisTypes[axis] ||
      !Object.hasOwn(r.variants[axis], String(v))
    )
      throw new Error(`invalid default/condition for ${axis}: ${v}`);
  };
  for (const [a, v] of Object.entries(r.defaultVariants)) check(a, v);
  for (const c of r.compoundVariants)
    for (const [a, vs] of Object.entries(c.when))
      for (const v of Array.isArray(vs) ? vs : [vs]) check(a, v);
}
export function parsePlugin(input: unknown): UIPlugin {
  // Zod strips special JS object keys in some paths; reject before parsing.
  const scan = (v: unknown) => {
    if (v && typeof v === "object")
      for (const [k, x] of Object.entries(v)) {
        if (["__proto__", "constructor", "prototype"].includes(k))
          throw new Error(`unsafe key ${k}`);
        scan(x);
      }
  };
  scan(input);
  const p = pluginSchema.parse(input);
  for (const c of Object.values(p.components)) {
    const axes = new Map<string, string>();
    for (const r of Object.values(c.parts)) {
      validateRecipe(r);
      for (const a of Object.keys(r.variants)) {
        const signature = JSON.stringify([
          r.axisTypes[a],
          r.defaultVariants[a],
        ]);
        if (axes.has(a) && axes.get(a) !== signature)
          throw new Error(`incompatible shared axis/default ${a}`);
        axes.set(a, signature);
      }
    }
    for (const part of Object.keys(c.motion ?? {}))
      if (!Object.hasOwn(c.parts, part)) throw new Error(`unknown motion part ${part}`);
    for (const req of c.requirements)
      if (!Object.hasOwn(c.parts, req.part))
        throw new Error(`unknown required part ${req.part}`);
    for (const h of c.hooks ?? [])
      if (!Object.hasOwn(c.parts, h.part))
        throw new Error(`unknown hook part ${h.part}`);
  }
  return p;
}
