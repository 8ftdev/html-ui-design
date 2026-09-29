export type Declarations = Record<string, string>;
export type StyleBranch =
	| Declarations
	| { mode: "replace"; value: Declarations }
	| { mode: "omit" };
export interface PartRecipe {
	base?: StyleBranch;
	state?: Record<string, StyleBranch>;
	unstyled?: boolean;
}
export interface RecipeOverrides {
	components?: Record<string, Record<string, PartRecipe>>;
}
export type StateSource = { node: string } & (
	| { pseudo: string }
	| { attribute: string; present: boolean }
	| { attribute: string; value: string }
);
export interface UIPart {
	node: string;
	styleRole: string;
	state?: Record<string, { source: StateSource }>;
}
export interface UIContract {
	component: string;
	behavior: { kind: "native" | "adapter-required"; requirements: string[] };
	parts: Record<string, UIPart>;
}
export interface OwnedNode {
	part: string;
	node: string;
	tag: string;
	parent: string | null;
	attributes: Record<string, string>;
	start: number;
	end: number;
}
export interface VueInput {
	source: string;
	filename: string;
	ui: UIContract;
	nodes: OwnedNode[];
}
export interface Theme {
	token(name: string, kind: "color" | "value"): string;
	files: string[];
}
export interface ResolvedPart {
	base: Declarations;
	state: Record<string, Declarations>;
}
export interface TransformOptions {
	framework: "vue";
	themePath: string;
	recipes?: RecipeOverrides;
	strict: boolean;
}
export interface TransformResult {
	source: string;
	warnings: string[];
}
