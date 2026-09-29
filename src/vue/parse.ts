import { parse as parseSFC } from "@vue/compiler-sfc";
import {
	baseParse,
	NodeTypes,
	ElementTypes,
	type TemplateChildNode,
} from "@vue/compiler-dom";
import { parse as parseTS } from "@babel/parser";
import { literal } from "../contract/literal.js";
import { validateContract } from "../contract/validate.js";
import { validateStyleTypes } from "../contract/style-types.js";
import type { VueInput, UIContract, OwnedNode } from "../model.js";
export function parseVue(source: string, filename = "Component.vue"): VueInput {
	const { descriptor, errors } = parseSFC(source, { filename });
	if (errors.length) throw new Error(`${filename}: ${String(errors[0])}`);
	if (
		!descriptor.script ||
		descriptor.script.lang !== "ts" ||
		!descriptor.scriptSetup ||
		descriptor.scriptSetup.lang !== "ts" ||
		!descriptor.template ||
		descriptor.template.lang
	)
		throw new Error(
			"expected generated Vue profile: regular TS script, TS setup script and HTML template",
		);
	for (const block of [
		descriptor.script,
		descriptor.scriptSetup,
		descriptor.template,
		...descriptor.styles,
	])
		if (block.src) throw new Error("external SFC blocks are not supported");
	const body = parseTS(descriptor.script.content, {
		sourceType: "module",
		plugins: ["typescript"],
	}).program.body;
	const exported = new Map<string, unknown>();
	for (const stmt of body)
		if (
			stmt.type === "ExportNamedDeclaration" &&
			stmt.declaration?.type === "VariableDeclaration"
		)
			for (const d of stmt.declaration.declarations)
				if (
					d.id.type === "Identifier" &&
					["ui", "contractVersion"].includes(d.id.name)
				) {
					if (exported.has(d.id.name))
						throw new Error("duplicate contract export");
					exported.set(d.id.name, literal(d.init));
				}
	if (exported.get("contractVersion") !== 2)
		throw new Error("expected contractVersion 2");
	const ui = exported.get("ui") as UIContract;
	if (!ui || typeof ui !== "object" || !ui.parts)
		throw new Error("missing literal UI contract");
	const tree = baseParse(descriptor.template.content);
	const nodes: OwnedNode[] = [];
	function visit(children: TemplateChildNode[], parent: string | null) {
		for (const child of children) {
			if (child.type !== NodeTypes.ELEMENT) continue;
			if (child.tag === "slot") {
				if (child.children.length)
					throw new Error("slot fallbacks outside generated profile");
				continue;
			}
			if (child.tagType !== ElementTypes.ELEMENT)
				throw new Error(`unsupported owned anatomy ${child.tag}`);
			const attributes: Record<string, string> = Object.create(null);
			for (const p of child.props) {
				if (p.type === NodeTypes.ATTRIBUTE) {
					if (Object.hasOwn(attributes, p.name))
						throw new Error(`duplicate attribute ${p.name}`);
					attributes[p.name] = p.value?.content ?? "";
				} else if (
					["if", "else", "else-if", "for", "html", "text"].includes(p.name) ||
					(p.name === "bind" &&
						(!p.arg ||
							p.arg.type !== NodeTypes.SIMPLE_EXPRESSION ||
							!p.arg.isStatic ||
							["data-ui", "data-ui-part", "data-html-ui-style"].includes(
								p.arg.content,
							)))
				)
					throw new Error(
						"dynamic or structural owned node binding is unsupported",
					);
			}
			const part = attributes["data-ui-part"]!,
				p = ui.parts[part];
			if (attributes["data-ui"] !== ui.component || !p)
				throw new Error("owned node markers do not match UI contract");
			if (nodes.some((n) => n.part === part))
				throw new Error("duplicate owned part");
			const offset = descriptor.template!.loc.start.offset;
			const insert = child.props.length
				? child.props[child.props.length - 1]!.loc.end.offset
				: child.loc.start.offset + 1 + child.tag.length;
			nodes.push({
				part,
				node: p.node,
				tag: child.tag,
				parent,
				attributes,
				start: offset + insert,
				end: offset + child.loc.end.offset,
			});
			visit(child.children, p.node);
		}
	}
	visit(tree.children, null);
	if (
		nodes.filter((n) => n.parent === null).length !== 1 ||
		nodes.find((n) => n.parent === null)?.node !== "root"
	)
		throw new Error("expected one owned root");
	const input = { source, filename, ui, nodes };
	validateContract(input);
	validateStyleTypes(body, ui);
	return input;
}
