import { parse } from "@babel/parser";
import { literal, object } from "../contract/literal.js";
import { recipeSchema, validateRecipe, type ClassRecipe } from "./schema.js";
function classes(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (Array.isArray(v) && v.every((x) => typeof x === "string")) return v;
  throw new Error("classes must be static strings or string arrays");
}
export function importCva(source: string, exportName: string): ClassRecipe {
  const ast = parse(source, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });
  const imports = new Set<string>();
  for (const n of ast.program.body)
    if (
      n.type === "ImportDeclaration" &&
      n.source.value === "class-variance-authority"
    )
      for (const s of n.specifiers)
        if (
          s.type === "ImportSpecifier" &&
          s.imported.type === "Identifier" &&
          s.imported.name === "cva"
        )
          imports.add(s.local.name);
  const exported = ast.program.body.some(
    (n) =>
      n.type === "ExportNamedDeclaration" &&
      !n.source &&
      n.specifiers.some(
        (s) =>
          s.type === "ExportSpecifier" &&
          s.local.name === exportName &&
          s.exported.type === "Identifier" &&
          s.exported.name === exportName,
      ),
  );
  for (const n of ast.program.body) {
    const declaration =
      n.type === "ExportNamedDeclaration"
        ? n.declaration
        : exported
          ? n
          : undefined;
    if (declaration?.type !== "VariableDeclaration") continue;
    for (const d of declaration.declarations) {
      if (d.id.type !== "Identifier" || d.id.name !== exportName) continue;
      try {
        const call = d.init;
        if (
          call?.type !== "CallExpression" ||
          call.callee.type !== "Identifier" ||
          !imports.has(call.callee.name) ||
          call.arguments.length > 2 ||
          !call.arguments.length
        )
          throw new Error("expected imported CVA call with literal arguments");
        const base = classes(literal(call.arguments[0]));
        const config = call.arguments[1] ? literal(call.arguments[1]) : {};
        object(config, ["variants", "defaultVariants", "compoundVariants"], []);
        const variants: ClassRecipe["variants"] = {},
          axisTypes: ClassRecipe["axisTypes"] = {};
        if (config.variants !== undefined) {
          if (
            !config.variants ||
            typeof config.variants !== "object" ||
            Array.isArray(config.variants)
          )
            throw new Error("invalid variants");
          for (const [a, choices] of Object.entries(config.variants)) {
            if (
              !choices ||
              typeof choices !== "object" ||
              Array.isArray(choices)
            )
              throw new Error("invalid choices");
            variants[a] = Object.fromEntries(
              Object.entries(choices).map(([v, c]) => [v, classes(c)]),
            );
            axisTypes[a] = Object.keys(choices).every(
              (v) => v === "true" || v === "false",
            )
              ? "boolean"
              : "string";
          }
        }
        const compounds = config.compoundVariants ?? [];
        if (!Array.isArray(compounds)) throw new Error("invalid compounds");
        const result = recipeSchema.parse({
          base,
          variants,
          axisTypes,
          defaultVariants: config.defaultVariants ?? {},
          compoundVariants: compounds.map((c) => {
            if (!c || typeof c !== "object" || Array.isArray(c))
              throw new Error("invalid compound");
            const { class: cl, className, ...when } = c;
            if (cl !== undefined && className !== undefined)
              throw new Error("choose class or className");
            return { when, classes: classes(cl ?? className) };
          }),
        });
        validateRecipe(result);
        return result;
      } catch (e) {
        throw new Error(
          `${exportName} at ${d.loc?.start.line}:${d.loc?.start.column}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }
  }
  throw new Error(`missing exported CVA declaration ${exportName}`);
}
