import type { VueInput, StateSource, OwnedNode } from "../model.js";
export function quote(value: string): string {
	return (
		'"' +
		value.replace(
			/["\\\n\r\f<>]/g,
			(c) => "\\" + c.codePointAt(0)!.toString(16) + " ",
		) +
		'"'
	);
}
export function condition(source: StateSource): string {
	if ("pseudo" in source) return ":" + source.pseudo;
	if ("value" in source) return `[${source.attribute}=${quote(source.value)}]`;
	return source.present
		? `[${source.attribute}]`
		: `:not([${source.attribute}])`;
}
export function selector(
	input: VueInput,
	part: string,
	marker: string,
	sources: Array<{ source: StateSource; negate?: boolean }> = [],
): string {
	const map = new Map(input.nodes.map((n) => [n.node, n]));
	function path(id: string): OwnedNode[] {
		const out: OwnedNode[] = [];
		let node = map.get(id);
		while (node) {
			out.unshift(node);
			node = node.parent ? map.get(node.parent) : undefined;
		}
		return out;
	}
	const target = path(input.ui.parts[part]!.node);
	const mark = (n: OwnedNode) =>
		`[data-html-ui-style=${quote(marker + ":" + n.part)}]`;
	const segments = target.map(mark);
	for (const { source, negate } of sources) {
		const from = path(source.node);
		let shared = 0;
		while (
			shared < Math.min(from.length, target.length) &&
			from[shared]!.node === target[shared]!.node
		)
			shared++;
		if (shared === 0) throw new Error("state source outside owned root");
		let predicate = condition(source);
		if (from.length === shared)
			segments[shared - 1] += negate ? `:not(${predicate})` : predicate;
		else {
			const branch = from.slice(shared).map(mark);
			branch[branch.length - 1] += predicate;
			const has = `:has(> ${branch.join(" > ")})`;
			segments[shared - 1] += negate ? `:not(${has})` : has;
		}
	}
	return `:where(${segments.join(" > ")})`;
}
