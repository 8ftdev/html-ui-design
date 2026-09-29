import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { parseVue } from "../src/vue/parse";
import { resolveRecipes } from "../src/recipes/resolve";
import { emitCSS } from "../src/css/emit";
import type { Theme } from "../src/model";
const input = parseVue(
	readFileSync("tests/fixtures/button.vue", "utf8"),
	"Button.vue",
);
const theme: Theme = { files: [], token: (n) => `var(--${n})` };
test("merge preserves disabled cursor, replace discards it", () => {
	const merged = resolveRecipes(
		input,
		theme,
		{
			components: {
				button: { root: { state: { disabled: { opacity: "0.4" } } } },
			},
		},
		true,
	);
	expect(merged.parts.root.state.disabled).toMatchObject({
		opacity: "0.4",
		cursor: "not-allowed",
	});
	const replaced = resolveRecipes(
		input,
		theme,
		{
			components: {
				button: {
					root: {
						state: { disabled: { mode: "replace", value: { opacity: "0.4" } } },
					},
				},
			},
		},
		true,
	);
	expect(replaced.parts.root.state.disabled).toEqual({ opacity: "0.4" });
});
test("omit removes branch while unstyled retains only explicit declarations", () => {
	const r = resolveRecipes(
		input,
		theme,
		{
			components: {
				button: {
					root: {
						unstyled: true,
						base: { color: "red" },
						state: { disabled: { mode: "omit" } },
					},
				},
			},
		},
		true,
	);
	expect(r.parts.root.base).toEqual({ color: "red" });
	expect(r.parts.root.state.disabled).toBeUndefined();
});
test("unknown state paths are errors", () =>
	expect(() =>
		resolveRecipes(
			input,
			theme,
			{
				components: {
					button: { root: { state: { invented: { opacity: "0" } } } },
				},
			},
			true,
		),
	).toThrow());
test("declaration injection is rejected", () =>
	expect(() =>
		resolveRecipes(
			input,
			theme,
			{
				components: {
					button: { root: { base: { color: "red;} body {display:none" } } },
				},
			},
			true,
		),
	).toThrow());
test("compiled hover excludes the real native disabled source", () => {
	const r = resolveRecipes(input, theme, {}, true);
	const css = emitCSS(input, r.parts, "test");
	expect(css).toContain(":hover:not(:disabled)");
	expect(css).toContain("@media (hover: hover)");
});
test("accordion expanded condition uses a direct parent source", () => {
	const a = parseVue(
		readFileSync("tests/fixtures/accordion.vue", "utf8"),
		"Accordion.vue",
	);
	const css = emitCSS(a, resolveRecipes(a, theme, {}, true).parts, "test");
	expect(css).toContain(
		'[data-html-ui-style="test:root"][open] > [data-html-ui-style="test:trigger"]',
	);
});

test('replacement does not require tokens belonging only to removed recipes', () => {
 const sparse: Theme = {files:[],token(name){if(name==='primary'||name==='primary-foreground')throw new Error('absent');return `var(--${name})`}}
 const result=resolveRecipes(input,sparse,{components:{button:{root:{base:{mode:'replace',value:{color:'red'}},state:{hover:{mode:'omit'},active:{mode:'omit'}}}}}},true)
 expect(result.parts.root.base).toEqual({color:'red'})
})

test('metadata states without a cascade order are diagnosed even with no defaults',()=>{
 const custom=structuredClone(input)
 custom.ui.parts.root.state!.busy={source:{node:'root',attribute:'aria-busy',value:'true'}}
 expect(()=>emitCSS(custom,resolveRecipes(custom,theme,{},true).parts,'test')).toThrow(/order/)
})
