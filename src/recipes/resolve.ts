import type {
	VueInput,
	Theme,
	RecipeOverrides,
	ResolvedPart,
	StyleBranch,
	Declarations,
} from "../model.js";
import { preset } from "./preset.js";
import { branch, validateOverrides } from "./schema.js";
function merge(
	base: Declarations,
	value: StyleBranch,
): Declarations | undefined {
	if ("mode" in value) {
		if (value.mode === "omit") return undefined;
		if (value.mode === "replace")
			return (value as { value: Declarations }).value;
	}
	const out = { ...base };
	for (const [key, v] of Object.entries(value)) {
		delete out[key];
		out[key] = v as string;
	}
	return out;
}
export function resolveRecipes(
	input: VueInput,
	theme: Theme,
	overrides: RecipeOverrides = {},
	strict = false,
): { parts: Record<string, ResolvedPart>; warnings: string[] } {
	validateOverrides(overrides);
	const custom = overrides.components?.[input.ui.component] ?? {},
		parts: Record<string, ResolvedPart> = {},
		warnings: string[] = [];
	for (const key of Object.keys(custom))
		if (!Object.hasOwn(input.ui.parts, key))
			throw new Error(`unknown part ${input.ui.component}.${key}`);
	for (const [name, p] of Object.entries(input.ui.parts)) {
		const override = custom[name];
		const defaults = override?.unstyled
			? { base: {}, state: {} }
			: preset(p, { files: [], token: (name, kind) => `__HTML_UI_TOKEN_${kind}_${name}__` });
		if (!defaults) {
			const message = `unknown style role ${p.styleRole}; using neutral styles`;
			if (strict) throw new Error(message);
			warnings.push(message);
		}
		const resolved = defaults ?? { base: {}, state: {} };
		if (override?.base !== undefined)
			resolved.base = merge(resolved.base, branch(override.base)) ?? {};
		for (const [state, v] of Object.entries(override?.state ?? {})) {
			if (!Object.hasOwn(p.state ?? {}, state))
				throw new Error(`unknown state ${input.ui.component}.${name}.${state}`);
			const result = merge(resolved.state[state] ?? {}, branch(v));
			if (result) resolved.state[state] = result;
			else delete resolved.state[state];
		}
		for (const declarations of [resolved.base, ...Object.values(resolved.state)]) {
            for (const [property, value] of Object.entries(declarations)) {
                declarations[property] = value.replace(/__HTML_UI_TOKEN_(color|value)_([\w-]+)__/g, (_, kind, token) => theme.token(token, kind));
            }
        }
        parts[name] = resolved;
	}
	return { parts, warnings };
}
