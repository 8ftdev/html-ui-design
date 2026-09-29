import type { VueInput, ResolvedPart, Declarations } from "../model.js";
import { selector } from "./selectors.js";
export const stateOrder = [
	"required",
	"expanded",
	"open",
	"checked",
	"indeterminate",
	"pressed",
	"selected",
	"hover",
	"active",
	"invalid",
	"readOnly",
	"disabled",
	"focusWithin",
	"focusVisible",
];
export function emitCSS(
	input: VueInput,
	parts: Record<string, ResolvedPart>,
	marker: string,
): string {
 for (const part of Object.values(input.ui.parts)) {
  for (const name of Object.keys(part.state ?? {})) {
   if (!stateOrder.includes(name)) throw new Error(`state ${name} has no cascade ordering rule`);
  }
 }
	const layers = ["base", ...stateOrder];
	const lines = ["@layer theme, base, html-ui, components, utilities;", `@layer html-ui {`, `  @layer ${layers.join(", ")};`];
	const rule = (select: string, d: Declarations) =>
		`${select} {\n${Object.entries(d)
			.map(([k, v]) => `      ${k}: ${v};`)
			.join("\n")}\n    }`;
	for (const layer of layers) {
		const rules: string[] = [];
		for (const [part, p] of Object.entries(parts)) {
			for (const name of Object.keys(p.state))
				if (!stateOrder.includes(name))
					throw new Error(`state ${name} has no cascade ordering rule`);
			const d = layer === "base" ? p.base : p.state[layer];
			if (!d || !Object.keys(d).length) continue;
			const sources =
				layer === "base"
					? []
					: [
							{
								source: input.ui.parts[part]!.state![layer]!.source,
								negate: false,
							},
						];
			const disabled = input.ui.parts[part]!.state?.disabled;
			if ((layer === "hover" || layer === "active") && disabled)
				sources.push({ source: disabled.source, negate: true });
			rules.push(rule(selector(input, part, marker, sources), d));
		}
		if (rules.length)
			lines.push(
				`  @layer ${layer} {\n${layer === "hover" ? "    @media (hover: hover) {\n" : ""}    ${rules.join("\n    ")}${layer === "hover" ? "\n    }" : ""}\n  }`,
			);
	}
	lines.push("}");
	return lines.join("\n") + "\n";
}
