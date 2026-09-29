import type { VueInput } from "../model.js";
import { object, record } from "./literal.js";
const name = /^[a-z][a-zA-Z0-9]*$/;
const role = /^[a-z][a-z0-9-]*$/;
export function validateContract(input: VueInput) {
	const { ui, nodes } = input;
	object(ui, ["component", "behavior", "parts"]);
	if (typeof ui.component !== "string" || !role.test(ui.component))
		throw new Error("invalid component name");
	object(ui.behavior, ["kind", "requirements"]);
	if (
		!["native", "adapter-required"].includes(ui.behavior.kind) ||
		!Array.isArray(ui.behavior.requirements) ||
		ui.behavior.requirements.some((x) => typeof x !== "string")
	)
		throw new Error("invalid behavior contract");
	record(ui.parts);
	if (ui.parts.root?.node !== "root")
		throw new Error("root part must target root");
	const seen = new Set<string>();
	for (const [part, p] of Object.entries(ui.parts)) {
		object(p, ["node", "styleRole", "state"], ["node", "styleRole"]);
		if (
			!name.test(part) ||
			typeof p.node !== "string" ||
			typeof p.styleRole !== "string" ||
			!role.test(p.styleRole) ||
			seen.has(p.node)
		)
			throw new Error(`invalid or duplicate part ${part}`);
		seen.add(p.node);
		if (!nodes.some((n) => n.node === p.node && n.part === part))
			throw new Error(`missing owned node for ${part}`);
		if (p.state !== undefined) record(p.state);
		for (const [state, binding] of Object.entries(p.state ?? {})) {
			if (!name.test(state)) throw new Error("invalid state name");
			object(binding, ["source"]);
			const s = binding.source;
			object(s, ["node", "pseudo", "attribute", "present", "value"], ["node"]);
			const node = nodes.find((n) => n.node === s.node);
			if (!node) throw new Error(`unknown source node ${s.node}`);
			if ("pseudo" in s === "attribute" in s)
				throw new Error("state needs exactly one pseudo or attribute source");
			if ("pseudo" in s) {
				if ("present" in s || "value" in s || typeof s.pseudo !== "string")
					throw new Error("invalid pseudo source");
				const tag = node.tag,
					type = node.attributes.type;
				const accepted: Record<string, boolean> = {
					hover: true,
					active: true,
					"focus-visible": true,
					"focus-within": true,
					disabled: [
						"button",
						"input",
						"select",
						"textarea",
						"fieldset",
						"option",
						"optgroup",
					].includes(tag),
					checked: tag === "input" && ["checkbox", "radio"].includes(type!),
					required:
						["input", "select", "textarea"].includes(tag) &&
						![
							"range",
							"hidden",
							"button",
							"submit",
							"reset",
							"image",
							"color",
						].includes(type!),
					invalid:
						["input", "select", "textarea"].includes(tag) &&
						![
							"range",
							"hidden",
							"button",
							"submit",
							"reset",
							"image",
							"color",
						].includes(type!),
					indeterminate:
						tag === "progress" ||
						(tag === "input" && ["checkbox", "radio"].includes(type!)),
					"popover-open": Object.hasOwn(node.attributes, "popover"),
				};
				if (!Object.hasOwn(accepted, s.pseudo) || !accepted[s.pseudo])
					throw new Error(`unsupported native pseudo ${s.pseudo} on ${tag}`);
			} else {
				if (
					typeof s.attribute !== "string" ||
					!role.test(s.attribute) ||
					"present" in s === "value" in s
				)
					throw new Error("invalid attribute state source");
				if (
					("present" in s && typeof s.present !== "boolean") ||
					("value" in s && typeof s.value !== "string")
				)
					throw new Error("invalid state comparison");
				if (s.attribute === "open" && !["details", "dialog"].includes(node.tag))
					throw new Error("open requires details or dialog");
			}
			if (
				state === "disabled" &&
				!("pseudo" in s && s.pseudo === "disabled") &&
				!(
					"attribute" in s &&
					s.attribute === "aria-disabled" &&
					"value" in s &&
					s.value === "true"
				)
			)
				throw new Error(
					"disabled must use native disabled or aria-disabled=true",
				);
		}
	}
	if (seen.size !== nodes.length)
		throw new Error("every owned node must have one part");
}
