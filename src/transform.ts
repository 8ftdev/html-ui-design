import type { TransformOptions, TransformResult } from "./model.js";
import { parseVue } from "./vue/parse.js";
import { loadTheme } from "./theme/load.js";
import { resolveRecipes } from "./recipes/resolve.js";
import { emitCSS } from "./css/emit.js";
import { cleanGenerated, digest, transformVue } from "./vue/transform.js";
export async function transform(
	source: string,
	options: TransformOptions,
): Promise<TransformResult> {
	if (options.framework !== "vue") throw new Error("unsupported framework");
	const input = parseVue(cleanGenerated(source), "Component.vue");
	const theme = await loadTheme(options.themePath);
	const { parts, warnings } = resolveRecipes(
		input,
		theme,
		options.recipes ?? {},
		options.strict,
	);
	const marker = digest(
		JSON.stringify({
			ui: input.ui,
			nodes: input.nodes.map(({ part, node, parent, tag }) => ({
				part,
				node,
				parent,
				tag,
			})),
			parts,
		}),
	);
	const css = emitCSS(input, parts, marker);
	if (input.ui.behavior.kind === "adapter-required")
		warnings.push(
			`${input.ui.component} requires an interaction adapter; styling does not implement it`,
		);
	return { source: transformVue(input, css, marker), warnings };
}
