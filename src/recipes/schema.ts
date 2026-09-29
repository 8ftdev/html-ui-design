import postcss from "postcss";
import type { Declarations, StyleBranch, RecipeOverrides } from "../model.js";
import { object, record } from "../contract/literal.js";
export function declarations(value: unknown): Declarations {
	record(value);
	const out: Declarations = {};
	for (const [key, v] of Object.entries(value)) {
		if (
			!/^(?:--[a-zA-Z][\w-]*|[a-z][a-z-]*)$/.test(key) ||
			typeof v !== "string" ||
			!v.trim() ||
			/[{};<>]/.test(v) ||
			/!\s*important/i.test(v)
		)
			throw new Error(`invalid CSS declaration ${key}`);
		const root = postcss.parse(`x{${key}:${v}}`),
			rule = root.first;
		if (
			rule?.type !== "rule" ||
			rule.nodes.length !== 1 ||
			rule.first?.type !== "decl"
		)
			throw new Error(`invalid CSS declaration ${key}`);
		out[key] = v;
	}
	return out;
}
export function branch(value: unknown): StyleBranch {
	record(value);
	if (Object.hasOwn(value, "mode")) {
		if (value.mode === "omit") {
			object(value, ["mode"]);
			return { mode: "omit" };
		}
		if (value.mode === "replace") {
			object(value, ["mode", "value"]);
			return { mode: "replace", value: declarations(value.value) };
		}
		throw new Error("unknown recipe branch mode");
	}
	return declarations(value);
}
export function validateOverrides(
	value: unknown,
): asserts value is RecipeOverrides {
	object(value, ["components"], []);
	if (value.components === undefined) return;
	record(value.components);
	for (const [component, parts] of Object.entries(value.components)) {
		if (!/^[a-z][a-z0-9-]*$/.test(component))
			throw new Error("invalid override component");
		record(parts);
		for (const [part, p] of Object.entries(parts)) {
			if (!/^[a-z][a-zA-Z0-9]*$/.test(part))
				throw new Error("invalid override part");
			object(p, ["base", "state", "unstyled"], []);
			if (p.unstyled !== undefined && typeof p.unstyled !== "boolean")
				throw new Error("unstyled must be boolean");
			if (p.base !== undefined) branch(p.base);
			if (p.state !== undefined) {
				record(p.state);
				for (const b of Object.values(p.state)) branch(b);
			}
		}
	}
}
