#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";

const help = `html-ui-shadcn 0.2.0
Usage: html-ui-shadcn --framework vue [--theme theme.css | --config components.json]
                       [--recipes recipes.json | --plugin shadcn-ui|plugin.json] [--component NAME] [--strict]\n       html-ui-shadcn --import-cva source.tsx --export buttonVariants
Library: --out-dir DIR [--producer PATH] [--converter PATH] [--check]
Reads a contract-v2 Vue SFC from stdin and writes a themed SFC to stdout.
Without a theme flag, finds the nearest components.json from the working directory.
The consuming application must load the theme stylesheet globally.
`;
async function main() {
  const seen = new Set<string>();
  for (const arg of process.argv.slice(2))
    if (arg.startsWith("--")) {
      const name = arg.split("=")[0]!;
      if (seen.has(name)) throw new Error(`duplicate option ${name}`);
      seen.add(name);
    }
  const { values } = parseArgs({
    options: {
      framework: { type: "string" },
      plugin: { type: "string" },
      component: { type: "string" },
      "import-cva": { type: "string" },
      export: { type: "string" },
      "out-dir": { type: "string" },
      producer: { type: "string" },
      converter: { type: "string" },
      check: { type: "boolean" },
      theme: { type: "string" },
      config: { type: "string" },
      recipes: { type: "string" },
      strict: { type: "boolean" },
      help: { type: "boolean" },
      version: { type: "boolean" },
    },
    allowPositionals: false,
  });
  if (values.help || values.version) {
    process.stdout.write(values.help ? help : "0.2.0\n");
    return;
  }
  if (values["import-cva"]) {
    if (
      !values.export ||
      values.component ||
      values.framework ||
      values.plugin ||
      values.recipes ||
      values.theme ||
      values.config ||
      values.strict ||
      values["out-dir"] ||
      values.producer ||
      values.converter ||
      values.check
    )
      throw new Error(
        "--import-cva requires --export and cannot be combined with generation flags",
      );
    const { importCva } = await import("./plugins/import-cva.js");
    process.stdout.write(
      JSON.stringify(
        importCva(await readFile(values["import-cva"], "utf8"), values.export),
        null,
        2,
      ) + "\n",
    );
    return;
  }
  if (
    (values.producer || values.converter || values.check) &&
    !values["out-dir"]
  )
    throw new Error("--producer, --converter and --check require --out-dir");
  if (values.export) throw new Error("--export requires --import-cva");
  if (values.component !== undefined && (!values.component || values.component.startsWith("--")))
    throw new Error("--component requires a name");
  if (values.component && (!values.plugin || values["out-dir"]))
    throw new Error("--component requires standalone --plugin emission");
  if (values.plugin && values.recipes)
    throw new Error("--plugin and --recipes are mutually exclusive");
  if (values.framework !== "vue")
    throw new Error(
      "--framework vue is required; other frameworks are not supported",
    );
  if (values.theme && values.config)
    throw new Error("--theme and --config are mutually exclusive");
  for (const key of [
    "theme",
    "config",
    "recipes",
    "plugin",
    "out-dir",
    "producer",
    "converter",
  ] as const)
    if (
      values[key] !== undefined &&
      (!values[key] || values[key]!.startsWith("--"))
    )
      throw new Error(`--${key} requires a path`);
  const { findTheme } = await import("./theme/config.js");
  const { transform } = await import("./transform.js");
  const themePath = await findTheme(values.theme, values.config);
  if (values["out-dir"]) {
    if (values.recipes)
      throw new Error("--out-dir requires a class plugin, not --recipes");
    const { generateLibrary } = await import("./library/generate.js");
    const { writeLibrary } = await import("./library/write.js");
    const files = await generateLibrary({
      producer: values.producer ?? "html-ui",
      converter: values.converter ?? "html-ui-to-vue-vapor",
      plugin: values.plugin ?? "shadcn-ui",
      themePath,
    });
    const result = await writeLibrary(files, values["out-dir"], {
      check: values.check ?? false,
    });
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    return;
  }
  const recipes = values.recipes
    ? JSON.parse(await readFile(values.recipes, "utf8"))
    : undefined;
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  const source = Buffer.concat(chunks).toString("utf8");
  const result = values.plugin
    ? await (async () => {
        const { loadPlugin } = await import("./plugins/load.js");
        const { loadTheme } = await import("./theme/load.js");
        const { parseVue } = await import("./vue/parse.js");
        const { cleanGenerated } = await import("./vue/transform.js");
        const { applyClassPlugin } = await import("./vue/class-plugin.js");
        const plugin = await loadPlugin(values.plugin!);
        const theme = await loadTheme(themePath);
        for (const token of plugin.tokens) theme.token(token, "value");
        const primitive = parseVue(cleanGenerated(source), "Component.vue").ui.component;
        const matches = Object.entries(plugin.components).filter(([,mapping])=>mapping.primitive===primitive).map(([name])=>name);
        const component = values.component ?? (plugin.components[primitive]?.primitive===primitive ? primitive : matches.length===1 ? matches[0]! : undefined);
        if(!component)throw new Error(matches.length ? `ambiguous mappings for primitive ${primitive}: ${matches.join(', ')}; use --component NAME or library emission` : `plugin has no mapping for primitive ${primitive}`);
        return applyClassPlugin(source, plugin, {
          component,
          filename: "Component.vue",
        });
      })()
    : await transform(source, {
        framework: "vue",
        themePath,
        recipes,
        strict: values.strict ?? false,
      });
  for (const warning of result.warnings)
    process.stderr.write(`html-ui-shadcn: warning: ${warning}\n`);
  process.stdout.write(result.source);
}
process.stdout.on("error", (error) => {
  process.stderr.write(`html-ui-shadcn: ${error.message}\n`);
  process.exitCode = 1;
});
main().catch((error) => {
  process.stderr.write(
    `html-ui-shadcn: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 2;
});
