import { parse } from "@vue/compiler-sfc";
import { parse as parseJS } from "@babel/parser";
import MagicString from "magic-string";
export function splitCompanions(
  source: string,
  name: string,
): { component: string; recipe: string } {
  const { descriptor } = parse(source),
    edits = new MagicString(source);
  const stamp = source.match(/^<!-- html-ui-plugin:[^\n]+ -->\n/);
  if (stamp) edits.remove(0, stamp[0].length);
  const module = descriptor.script!;
  for (const n of parseJS(module.content, {
    sourceType: "module",
    plugins: ["typescript"],
  }).program.body)
    if (n.type === "ExportNamedDeclaration")
      edits.remove(
        module.loc.start.offset + n.start!,
        module.loc.start.offset + n.end!,
      );
  const setup = descriptor.scriptSetup!,
    recipes: string[] = [];
  const names: string[] = [];
  for (const n of parseJS(setup.content, {
    sourceType: "module",
    plugins: ["typescript"],
  }).program.body) {
    if (
      n.type === "ImportDeclaration" &&
      n.source.value === "class-variance-authority"
    ) {
      recipes.push(setup.content.slice(n.start!, n.end!));
      edits.remove(
        setup.loc.start.offset + n.start!,
        setup.loc.start.offset + n.end!,
      );
    }
    if (
      n.type === "VariableDeclaration" &&
      n.declarations.every(
        (d) => d.id.type === "Identifier" && /^uiRecipe\d+$/.test(d.id.name),
      )
    ) {
      recipes.push("export " + setup.content.slice(n.start!, n.end!));
      names.push(...n.declarations.map((d) => (d.id as { name: string }).name));
      edits.remove(
        setup.loc.start.offset + n.start!,
        setup.loc.start.offset + n.end!,
      );
    }
  }
  edits.appendLeft(
    setup.loc.start.offset,
    `\nimport { ${names.join(", ")} } from './${name}.recipe'\n`,
  );
  return {
    component: edits.toString().replace(/\n{3,}/g, "\n\n"),
    recipe: recipes.join("\n\n") + "\n",
  };
}
