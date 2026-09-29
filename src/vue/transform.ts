import { createHash } from "node:crypto";
import MagicString from "magic-string";
import { parse } from "@vue/compiler-sfc";
import {
	baseParse,
	NodeTypes,
	type TemplateChildNode,
} from "@vue/compiler-dom";
import type { VueInput } from "../model.js";
const typeShim = `\n// html-ui-shadcn: marker typing\ndeclare module 'vue' { interface HTMLAttributes { 'data-html-ui-style'?: string } }\n// html-ui-shadcn: end marker typing\n`;
export function digest(value: string): string {
	return createHash("sha256").update(value).digest("hex").slice(0, 20);
}
export function cleanGenerated(source: string): string {
	const { descriptor, errors } = parse(source);
	if (errors.length) throw new Error(String(errors[0]));
	const owned = descriptor.styles.filter((s) =>
		Object.hasOwn(s.attrs, "data-html-ui-shadcn"),
	);
	if (owned.length > 1) throw new Error("multiple generated stylesheets");
	const block = owned[0],
		stamp = block?.attrs["data-html-ui-shadcn"];
	let marker: string | undefined;
	if (block) {
		if (
			typeof stamp !== "string" ||
			!/^v1:[a-f0-9]{20}:[a-f0-9]{20}$/.test(stamp) ||
			!block.scoped
		)
			throw new Error("invalid generated stylesheet ownership");
		marker = stamp.split(":")[1];
		if (digest(block.content) !== stamp.split(":")[2])
			throw new Error(
				"generated stylesheet was edited; use recipe overrides or a separate style block",
			);
	}
	const edits = new MagicString(source);
	const shimAt = source.indexOf(typeShim);
	if (shimAt >= 0) {
		if (!block || source.indexOf(typeShim, shimAt + 1) >= 0)
			throw new Error("reserved marker type declaration collision");
		edits.remove(shimAt, shimAt + typeShim.length);
	}
	let count = 0;
	function visit(children: TemplateChildNode[]) {
		for (const node of children) {
			if (node.type !== NodeTypes.ELEMENT) continue;
			for (const p of node.props)
				if (p.type === NodeTypes.ATTRIBUTE && p.name === "data-html-ui-style") {
					if (!marker || !p.value?.content.startsWith(marker + ":"))
						throw new Error("reserved data-html-ui-style collision");
					const part = node.props.find(
						(p) => p.type === NodeTypes.ATTRIBUTE && p.name === "data-ui-part",
					);
					if (
						part?.type !== NodeTypes.ATTRIBUTE ||
						p.value.content !== marker + ":" + part.value?.content
					)
						throw new Error("generated marker does not match owned part");
					const start =
						descriptor.template!.loc.start.offset + p.loc.start.offset;
					edits.remove(
						source[start - 1] === " " ? start - 1 : start,
						descriptor.template!.loc.start.offset + p.loc.end.offset,
					);
					count++;
				}
			visit(node.children);
		}
	}
	if (descriptor.template)
		visit(baseParse(descriptor.template.content).children);
	if (block) {
		if (!count) throw new Error("generated stylesheet lacks owned markers");
		const start = source.lastIndexOf("<style", block.loc.start.offset),
			end = source.indexOf("</style>", block.loc.end.offset) + 8;
		if (start < 0 || end < 8)
			throw new Error("invalid generated stylesheet block");
		edits.remove(start, end);
	}
	return edits.toString().trimEnd() + "\n";
}
export function transformVue(
	input: VueInput,
	css: string,
	marker: string,
): string {
	const edits = new MagicString(input.source);
	const script = parse(input.source).descriptor.script!;
	edits.appendLeft(script.loc.end.offset, typeShim);
	for (const node of input.nodes)
		edits.appendLeft(
			node.start,
			` data-html-ui-style="${marker}:${node.part}"`,
		);
	const content = "\n" + css;
	return (
		edits.toString().trimEnd() +
		`\n\n<style scoped data-html-ui-shadcn="v1:${marker}:${digest(content)}">${content}</style>\n`
	);
}
