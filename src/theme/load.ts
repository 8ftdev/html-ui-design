import { readFile, realpath, access } from "node:fs/promises";
import { resolve, dirname, join, isAbsolute } from "node:path";
import postcss from "postcss";
import values from "postcss-value-parser";
import type { Theme } from "../model.js";
async function exists(path: string) {
	try {
		await access(path);
		return true;
	} catch {
		return false;
	}
}
function cssExport(value: unknown): string | undefined {
	if (typeof value === "string")
		return value.endsWith(".css") ? value : undefined;
	if (Array.isArray(value)) {
		for (const v of value) {
			const p = cssExport(v);
			if (p) return p;
		}
	}
	if (value && typeof value === "object")
		for (const k of ["style", "sass", "import", "default", "require"]) {
			const p = cssExport((value as Record<string, unknown>)[k]);
			if (p) return p;
		}
	return undefined;
}
async function resolveImport(spec: string, from: string): Promise<string> {
	const local = resolve(dirname(from), spec);
	if (isAbsolute(spec) || spec.startsWith(".") || (await exists(local)))
		return local;
	const segments = spec.split("/"),
		pkg = spec.startsWith("@")
			? segments.splice(0, 2).join("/")
			: segments.shift()!,
		sub = segments.join("/");
	let current = dirname(from);
	for (;;) {
		const root = join(current, "node_modules", pkg),
			manifest = join(root, "package.json");
		if (await exists(manifest)) {
			const data = JSON.parse(await readFile(manifest, "utf8"));
			const key = sub ? "./" + sub : ".";
			const target =
				cssExport(data.exports?.[key] ?? (!sub ? data.exports : undefined)) ??
				(!sub ? data.style : undefined) ??
				(sub.endsWith(".css") ? sub : undefined);
			if (typeof target !== "string")
				throw new Error(`package ${pkg} has no readable CSS entry for ${spec}`);
			const path = resolve(root, target);
			if (!path.startsWith(resolve(root) + "/"))
				throw new Error(`invalid package CSS entry ${spec}`);
			return path;
		}
		const parent = dirname(current);
		if (parent === current) break;
		current = parent;
	}
	throw new Error(`cannot resolve CSS import ${spec} from ${from}`);
}
export async function loadTheme(path: string): Promise<Theme> {
	const definitions = new Map<string, string[]>(),
		files: string[] = [],
		active = new Set<string>(),
		done = new Set<string>(),
		unresolved: string[] = [];
	async function visit(input: string) {
		const file = await realpath(input);
		if (active.has(file)) throw new Error(`CSS import cycle at ${file}`);
		if (done.has(file)) return;
		active.add(file);
		files.push(file);
		const root = postcss.parse(await readFile(file, "utf8"), { from: file });
		const imports: string[] = [];
		root.walkAtRules("import", (at) => {
			const first = values(at.params).nodes.find(
				(n) => n.type !== "space" && n.type !== "comment",
			);
			let spec =
				first?.type === "string"
					? first.value
					: first?.type === "function" && first.value === "url"
						? values.stringify(first.nodes).replace(/^['"]|['"]$/g, "")
						: undefined;
			if (!spec) throw new Error(`${file}: invalid CSS import`);
			if (/^(https?:|data:|\/\/)/i.test(spec)) {
				unresolved.push(spec);
				return;
			}
			imports.push(spec);
		});
		for (const spec of imports) await visit(await resolveImport(spec, file));
		root.walkDecls((decl) => {
			if (/^--[\w-]+$/.test(decl.prop)) {
				const list = definitions.get(decl.prop) ?? [];
				list.push(decl.value);
				definitions.set(decl.prop, list);
			}
		});
		active.delete(file);
		done.add(file);
	}
	await visit(resolve(path));
	const legacy =
		/^[+-]?(?:\d*\.)?\d+(?:deg)?\s+[+-]?(?:\d*\.)?\d+%\s+[+-]?(?:\d*\.)?\d+%(?:\s*\/\s*[\d.]+%?)?$/;
	function checkValue(
		value: string,
		stack: string[],
		color: boolean,
	): Set<string> {
		const modes = new Set<string>();
		const ast = values(value);
		function resolveVar(node: values.FunctionNode, classifyColor = color): Set<string> {
			const comma = node.nodes.findIndex(
				(n) => n.type === "div" && n.value === ",",
			);
			const key = values
				.stringify(comma < 0 ? node.nodes : node.nodes.slice(0, comma))
				.trim();
			if (!/^--[\w-]+$/.test(key))
				throw new Error(`invalid variable reference ${value}`);
			if (!definitions.has(key) && comma >= 0)
				return checkValue(
					values.stringify(node.nodes.slice(comma + 1)),
					stack,
					classifyColor,
				);
			return checkToken(key, stack, classifyColor);
		}
		ast.walk((node) => {
			if (node.type === "function" && node.value === "var") {
				resolveVar(node, false);
				return false;
			}
		});
		if (!color) return modes;
		if (legacy.test(value.trim())) modes.add("legacy");
		else if (
			ast.nodes.length === 1 &&
			ast.nodes[0]?.type === "function" &&
			ast.nodes[0].value === "var"
		)
			for (const m of resolveVar(ast.nodes[0])) modes.add(m);
		else if (
			/^(?:#[\da-f]{3,8}\b|(?:oklch|oklab|rgb|rgba|hsl|hsla|hwb|lab|lch|color|color-mix|light-dark|--alpha)\(|transparent$|currentColor$|[a-z]+$)/i.test(
				value.trim(),
			) &&
			!/^(initial|inherit|unset|revert|revert-layer)$/i.test(value.trim())
		)
			modes.add("modern");
		else
			throw new Error(
				`cannot determine color representation for ${stack.at(-1)}: ${value}`,
			);
		return modes;
	}
	function checkToken(
		name: string,
		stack: string[],
		color: boolean,
	): Set<string> {
		if (stack.includes(name))
			throw new Error(`theme alias cycle: ${[...stack, name].join(" -> ")}`);
		const declarations = definitions.get(name);
		if (!declarations)
			throw new Error(
				`missing theme token ${name}${unresolved.length ? " (remote CSS imports were not fetched)" : ""}`,
			);
		const modes = new Set<string>();
		for (const value of declarations)
			for (const mode of checkValue(value, [...stack, name], color))
				modes.add(mode);
		if (modes.size > 1)
			throw new Error(
				`inconsistent color representation across themes for ${name}`,
			);
		return modes;
	}
	return {
		files,
		token(name, kind) {
			if (!/^[\w-]+$/.test(name)) throw new Error("invalid token name");
			const modes = checkToken("--" + name, [], kind === "color");
			return modes.has("legacy") ? `hsl(var(--${name}))` : `var(--${name})`;
		},
	};
}
