import type { Declarations, ResolvedPart, Theme, UIPart } from "../model.js";
const roles = new Set([
	"action",
	"checkbox",
	"radio",
	"checkbox-indicator",
	"radio-indicator",
	"switch-track",
	"switch-thumb",
	"select-chevron",
	"field-content",
	"field-error",
	"field-description",
	"combobox",
	"description",
	"dialog",
	"disclosure",
	"disclosure-trigger",
	"field",
	"form",
	"group",
	"group-label",
	"heading",
	"image",
	"input",
	"label",
	"menu",
	"menu-bar",
	"meter",
	"navigation",
	"option-list",
	"options",
	"popover",
	"progress",
	"scroll-area",
	"select",
	"select-value",
	"option",
	"separator",
	"slider",
	"status",
	"surface",
	"switch",
	"tab-list",
	"tabs",
	"toolbar",
	"tooltip",
]);
export function preset(part: UIPart, theme: Theme): ResolvedPart | undefined {
	if (!roles.has(part.styleRole)) return undefined;
	const c = (name: string) => theme.token(name, "color"),
		radius = () => theme.token("radius", "value");
	const role = part.styleRole;
	let base: Declarations = {};
	switch (role) {
		case "action":
			base = {
				display: "inline-flex",
				"align-items": "center",
				"justify-content": "center",
				gap: "0.5rem",
				padding: "0.5rem 1rem",
				"min-height": "2.25rem",
				"font-size": "0.875rem",
				"font-weight": "500",
				"border-radius": radius(),
				border: "1px solid transparent",
				"background-color": c("primary"),
				color: c("primary-foreground"),
				cursor: "pointer",
			};
			break;
		case "input":
		case "combobox":
		case "select":
			base = {
				width: "100%",
				padding: "0.5rem 0.75rem",
				"min-height": "2.25rem",
				"font-size": "0.875rem",
				"border-radius": radius(),
				border: `1px solid ${c("input")}`,
				"background-color": c("background"),
				color: c("foreground"),
			};
			break;
		case "radio":
		case "checkbox":
		case "switch":
		case "slider":
		case "progress":
		case "meter":
			base = { "accent-color": c("primary") };
			break;
		case "disclosure":
			base = {
				"border-bottom": `1px solid ${c("border")}`,
				color: c("foreground"),
			};
			break;
		case "disclosure-trigger":
			base = {
				padding: "1rem",
				"font-size": "0.875rem",
				"font-weight": "500",
				cursor: "pointer",
				"border-radius": radius(),
				color: c("foreground"),
			};
			break;
		case "dialog":
		case "popover":
		case "tooltip":
		case "menu":
			base = {
				padding: "1rem",
				border: `1px solid ${c("border")}`,
				"border-radius": radius(),
				"background-color": c("popover"),
				color: c("popover-foreground"),
			};
			break;
		case "status":
			base = {
				padding: "1rem",
				border: `1px solid ${c("border")}`,
				"border-radius": radius(),
				"background-color": c("background"),
				color: c("foreground"),
			};
			break;
		case "tab-list":
		case "toolbar":
		case "menu-bar":
			base = {
				display: "flex",
				"align-items": "center",
				gap: "0.25rem",
				padding: "0.25rem",
				"border-radius": radius(),
				"background-color": c("muted"),
				color: c("muted-foreground"),
			};
			break;
		case "field-description":
		case "description":
			base = { "font-size": "0.875rem", color: c("muted-foreground") };
			break;
		case "label":
		case "group-label":
			base = {
				"font-size": "0.875rem",
				"font-weight": "500",
				color: c("foreground"),
			};
			break;
		case "heading":
			base = {
				"font-size": "1.125rem",
				"font-weight": "600",
				color: c("foreground"),
			};
			break;
		case "separator":
			base = {
				border: "0",
				"border-top": `1px solid ${c("border")}`,
				margin: "0.75rem 0",
			};
			break;
		// Declaration mode retains the native affordance; the class plugin styles these decorations.
		case "checkbox-indicator":
		case "radio-indicator":
		case "switch-track":
		case "switch-thumb":
		case "select-chevron":
			base = { display: "none" };
			break;
		case "field-content":
			base = { display: "flex", "flex-direction": "column", gap: "0.25rem" };
			break;
		case "field-error":
			base = { "font-size": "0.875rem", color: c("destructive") };
			break;
		case "field":
			base = { display: "flex", gap: "0.5rem", "align-items": "center" };
			break;
		case "form":
			base = { display: "grid", gap: "1rem" };
			break;
		case "image":
			base = { "max-width": "100%", "border-radius": radius() };
			break;
		case "scroll-area":
			base = { overflow: "auto" };
			break;
		// Structural containers retain native layout and visibility.
	}
	const state: Record<string, Declarations> = {};
	for (const key of Object.keys(part.state ?? {}))
		switch (key) {
			case "disabled":
				state[key] = { opacity: "0.5", cursor: "not-allowed" };
				break;
			case "focusVisible":
				state[key] = {
					outline: `2px solid ${c("ring")}`,
					"outline-offset": "2px",
				};
				break;
			case "invalid":
				state[key] = { "border-color": c("destructive") };
				break;
			case "hover":
				if (role === "action")
					state[key] = {
						"background-color": `color-mix(in srgb, ${c("primary")} 90%, transparent)`,
					};
				else if (role === "disclosure-trigger")
					state[key] = {
						"background-color": c("accent"),
						color: c("accent-foreground"),
					};
				break;
			case "active":
				if (role === "action")
					state[key] = {
						"background-color": `color-mix(in srgb, ${c("primary")} 80%, transparent)`,
					};
				break;
			case "expanded":
				if (role === "disclosure-trigger")
					state[key] = {
						"background-color": c("accent"),
						color: c("accent-foreground"),
					};
				break;
			case "pressed":
			case "selected":
				state[key] = {
					"background-color": c("accent"),
					color: c("accent-foreground"),
				};
				break;
		}
	return { base, state };
}
