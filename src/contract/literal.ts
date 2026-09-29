import type { Node } from "@babel/types";
export function literal(node: Node | null | undefined): unknown {
	if (!node) throw new Error("missing literal");
	switch (node.type) {
		case "TSAsExpression":
			if (
				node.typeAnnotation.type !== "TSTypeReference" ||
				node.typeAnnotation.typeName.type !== "Identifier" ||
				node.typeAnnotation.typeName.name !== "const"
			)
				throw new Error("only as const is allowed in metadata");
			return literal(node.expression);
		case "StringLiteral":
		case "BooleanLiteral":
		case "NumericLiteral":
			return node.value;
		case "ArrayExpression":
			return node.elements.map((n) => literal(n));
		case "ObjectExpression": {
			const out: Record<string, unknown> = Object.create(null);
			for (const p of node.properties) {
				if (p.type !== "ObjectProperty" || p.computed || p.shorthand)
					throw new Error("metadata must contain literal properties");
				const k =
					p.key.type === "Identifier"
						? p.key.name
						: p.key.type === "StringLiteral"
							? p.key.value
							: undefined;
				if (
					!k ||
					Object.hasOwn(out, k) ||
					["__proto__", "constructor", "prototype"].includes(k)
				)
					throw new Error(`duplicate or unsafe metadata key ${k}`);
				out[k] = literal(p.value);
			}
			return out;
		}
		default:
			throw new Error(`metadata must be literal; received ${node.type}`);
	}
}
export function object(
	value: unknown,
	fields: string[],
	required: string[] = fields,
): asserts value is Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value))
		throw new Error("expected metadata object");
	for (const k of Object.keys(value))
		if (!fields.includes(k)) throw new Error(`unknown field ${k}`);
	for (const k of required)
		if (!Object.hasOwn(value, k)) throw new Error(`missing field ${k}`);
}
export function record(
	value: unknown,
): asserts value is Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value))
		throw new Error("expected metadata map");
}
