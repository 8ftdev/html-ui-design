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
  const statements = parseJS(setup.content, {
    sourceType: "module",
    plugins: ["typescript"],
  }).program.body;
  const recipeStatements = new Set<(typeof statements)[number]>();
  for (const n of statements) {
    if (
      n.type === "VariableDeclaration" &&
      n.declarations.every(
        (d) => d.id.type === "Identifier" && /^uiRecipe\d+$/.test(d.id.name),
      )
    ) {
      recipeStatements.add(n);
      recipes.push("export " + setup.content.slice(n.start!, n.end!));
      names.push(...n.declarations.map((d) => (d.id as { name: string }).name));
      edits.remove(
        setup.loc.start.offset + n.start!,
        setup.loc.start.offset + n.end!,
      );
    }
  }
  // Keep helpers in every file that uses them. CVA normally belongs only to
  // recipes; Tailwind Merge normally belongs only to the component bindings.
  // A recipe may also share a helper with its component.
  const recipeCode = recipes.join("\n"),
    componentCode = statements
      .filter(n => n.type !== "ImportDeclaration" && !recipeStatements.has(n))
      .map(n => setup.content.slice(n.start!, n.end!))
      .join("\n") + "\n" + descriptor.template!.content,
    helperImports: string[] = [];
  for (const n of statements) {
    if (n.type !== "ImportDeclaration" ||
      !["class-variance-authority", "tailwind-merge"].includes(n.source.value)) continue;
    const used = (code: string, name: string) =>
      new RegExp(`(?<![\\w$])${name.replace(/[$]/g, "\\$")}(?![\\w$])`).test(code);
    const recipeSpecifiers = n.specifiers.filter(s => used(recipeCode, s.local.name));
    if (!recipeSpecifiers.length) continue;
    const componentSpecifiers = n.specifiers.filter(s => used(componentCode, s.local.name));
    const render = (specifiers: typeof n.specifiers) => {
      const named = specifiers.filter(s => s.type === "ImportSpecifier");
      const other = specifiers.filter(s => s.type !== "ImportSpecifier");
      const text = (s: (typeof n.specifiers)[number]) => setup.content.slice(s.start!, s.end!);
      const imports = [...other.map(text), ...(named.length ? [`{ ${named.map(text).join(", ")} }`] : [])];
      return `import ${n.importKind === "type" ? "type " : ""}${imports.join(", ")} from ${setup.content.slice(n.source.start!, n.source.end!)}`;
    };
    helperImports.push(render(recipeSpecifiers));
    edits.overwrite(setup.loc.start.offset + n.start!, setup.loc.start.offset + n.end!,
      componentSpecifiers.length ? render(componentSpecifiers) : "");
  }
  edits.appendLeft(
    setup.loc.start.offset,
    `\nimport { ${names.join(", ")} } from './${name}.recipe'\n`,
  );
  return {
    component: edits.toString().replace(/\n{3,}/g, "\n\n"),
    recipe: [...helperImports, ...recipes].join("\n\n") + "\n",
  };
}
