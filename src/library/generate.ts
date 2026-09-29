import { notice } from "../plugins/builtin/notice.js";
import { execFileSync } from "node:child_process";
import { loadPlugin } from "../plugins/load.js";
import { applyClassPlugin } from "../vue/class-plugin.js";
import { loadTheme } from "../theme/load.js";
import { splitCompanions } from "./companions.js";
import { parseVue } from "../vue/parse.js";
import { iconButtonSource } from "./icon-button.js";
export async function generateLibrary(options: {
  producer: string;
  converter: string;
  plugin: string;
  themePath: string;
}): Promise<Record<string, string>> {
  const plugin = await loadPlugin(options.plugin),
    theme = await loadTheme(options.themePath);
  for (const token of plugin.tokens) theme.token(token, "value");
  const files: Record<string, string> = {},
    contracts: Record<string, unknown> = {};
  const names = new Map<string, string>();
  const occupied = new Map<string, string>();
  for (const component of Object.keys(plugin.components)) {
    const name = component
      .split("-")
      .map((x) => x[0].toUpperCase() + x.slice(1))
      .join("");
    const canonical = name.toLowerCase();
    if (occupied.has(canonical))
      throw new Error(
        `component output collision: ${occupied.get(canonical)} and ${component} both produce ${name}.vue`,
      );
    occupied.set(canonical, component);
    names.set(component, name);
  }
  for (const [component, mapping] of Object.entries(plugin.components)) {
    const primitive = execFileSync(options.producer, [mapping.primitive], {
      encoding: "utf8",
    });
    const vue = execFileSync(options.converter, [], {
      input: primitive,
      encoding: "utf8",
    });
    const name = names.get(component)!;
    contracts[component] = parseVue(vue, `${name}.vue`).ui;
    const output = splitCompanions(
      applyClassPlugin(vue, plugin, { component, filename: `${name}.vue` })
        .source,
      name,
    );
    files[`${name}.vue`] = output.component;
    files[`${name}.recipe.ts`] = output.recipe;
  }
  const button = plugin.components.button,
    icon = plugin.components.icon;
  const compatible =
    button?.primitive === "button" &&
    icon?.primitive === "icon" &&
    button.slots.label === "default" &&
    icon.slots.default === "default" &&
    Boolean(button.parts.root?.variants.variant) &&
    Object.hasOwn(button.parts.root?.variants.size ?? {}, "icon");
  const explicit = occupied.has("iconbutton");
  const compositions = {
    iconButton: {
      available: Boolean(compatible && !explicit),
      reason: explicit
        ? "explicit component mapping preserved"
        : compatible
          ? "local Button and Icon contract satisfied"
          : "automatic IconButton requires Button variant and size=icon axes and compatible default slots",
    },
  };
  if (compatible && !explicit) files["IconButton.vue"] = iconButtonSource();
  if (plugin.name === "shadcn-ui") files["THIRD-PARTY-NOTICES.md"] = notice;
  files["index.ts"] =
    Object.keys(files)
      .filter((x) => x.endsWith(".vue"))
      .map((x) => `export { default as ${x.slice(0, -4)} } from './${x}'`)
      .join("\n") + "\n";
  files["ui-library.json"] =
    JSON.stringify(
      {
        plugin: plugin.name,
        revision: plugin.provenance.revision,
        components: Object.keys(plugin.components),
        contracts,
        compositions,
        styling: ["class-variance-authority", "Tailwind CSS 4"],
        implementation: "local html-ui",
      },
      null,
      2,
    ) + "\n";
  return files;
}
