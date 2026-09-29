import { parse } from "@babel/parser";
import type { Statement } from "@babel/types";
import type { UIContract } from "../model.js";
function canonical(node: unknown): unknown {
	if (Array.isArray(node)) return node.map(canonical);
	if (node && typeof node === "object")
		return Object.fromEntries(
			Object.entries(node)
				.filter(
					([k]) =>
						![
							"start",
							"end",
							"loc",
							"extra",
							"leadingComments",
							"trailingComments",
							"innerComments",
						].includes(k),
				)
				.map(([k, v]) => [k, canonical(v)]),
		);
	return node;
}
export function validateStyleTypes(body: Statement[], ui: UIContract) {
	const declarations = body.flatMap((n) =>
		n.type === "ExportNamedDeclaration" && n.declaration ? [n.declaration] : [],
	);
	const classes = declarations.filter(
		(n) => n.type === "TSInterfaceDeclaration" && n.id.name.endsWith("Classes"),
	);
	if (classes.length !== 1 || classes[0]!.type !== "TSInterfaceDeclaration")
		throw new Error("expected one generated Classes interface");
	const name = classes[0]!.id.name.slice(0, -7);
	const alias = declarations.find(
		(n) => n.type === "TSTypeAliasDeclaration" && n.id.name === name + "Style",
	);
	if (!alias) throw new Error("missing generated Style type");
	const q = JSON.stringify;
	const expected = `export type ${name}Style<Style = string> = Style | { mode: "replace"; value: Style } | { mode: "omit" };\nexport interface ${name}Classes<Style = string> {${Object.entries(
		ui.parts,
	)
		.map(
			([part, p]) =>
				`${q(part)}?: {base?: ${name}Style<Style>; unstyled?: boolean; ${
					p.state
						? `state?: {${Object.keys(p.state)
								.map((s) => `${q(s)}?: ${name}Style<Style>;`)
								.join("")}};`
						: ""
				}};`,
		)
		.join("")}}`;
	// Property identifiers and quoted keys are equivalent in this constrained type grammar.
	function normalize(n: any): any {
		if (Array.isArray(n)) return n.map(normalize);
		if (n && typeof n === "object") {
			const o: any = {};
			for (const [k, v] of Object.entries(n)) o[k] = normalize(v);
			if (o.type === "TSPropertySignature" && o.key?.type === "Identifier")
				o.key = { type: "StringLiteral", value: o.key.name };
			return o;
		}
		return n;
	}
	const ast = parse(expected, { sourceType: "module", plugins: ["typescript"] })
		.program.body;
	const wanted = ast.map((n) =>
		n.type === "ExportNamedDeclaration" ? n.declaration : null,
	);
	if (
		JSON.stringify(normalize(canonical([alias, classes[0]]))) !==
		JSON.stringify(normalize(canonical(wanted)))
	)
		throw new Error("generated style types do not match UI parts/states");
}
