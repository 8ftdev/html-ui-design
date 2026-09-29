import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { parse, compileStyle, compileScript } from "@vue/compiler-sfc";
import { transform } from "../src/transform";
const source = readFileSync("tests/fixtures/accordion.vue", "utf8");
const options = {
	framework: "vue" as const,
	themePath: "tests/fixtures/theme.css",
	strict: true,
};
test("repeat transform is byte stable and preserves scripts", async () => {
	const first = await transform(source, options),
		second = await transform(first.source, options);
	expect(second.source).toBe(first.source);
	const a = parse(source).descriptor,
		b = parse(first.source).descriptor;
	expect(b.script?.content.startsWith(a.script!.content)).toBe(true);
	expect(b.scriptSetup?.content).toBe(a.scriptSetup?.content);
	expect(b.styles).toHaveLength(1);
	const style = compileStyle({
		source: b.styles[0]!.content,
		filename: "Accordion.vue",
		id: "data-v-test",
		scoped: true,
	});
	expect(style.errors).toEqual([]);
	expect(() =>
		compileScript(b, { id: "data-v-test", inlineTemplate: true }),
	).not.toThrow();
});
test("reconfiguration replaces tool owned styles and keeps user styles", async () => {
	const original = source + "\n<style>.consumer { color: red }</style>\n";
	const first = await transform(original, options);
	const next = await transform(first.source, {
		...options,
		recipes: {
			components: { accordion: { trigger: { base: { color: "blue" } } } },
		},
	});
	expect(parse(next.source).descriptor.styles).toHaveLength(2);
	expect(next.source).toContain(".consumer { color: red }");
	expect(next.source).toContain("color: blue");
});
test("reserved marker without owned style block is rejected", async () => {
	expect(
		transform(
			source.replace("<summary ", '<summary data-html-ui-style="forged" '),
			options,
		),
	).rejects.toThrow();
});

test('ordinary Vue setup output also compiles',async()=>{
 const plain=source.replace('lang="ts" vapor','lang="ts"')
 const result=await transform(plain,options)
 const descriptor=parse(result.source).descriptor
 expect(descriptor.scriptSetup?.attrs.vapor).toBeUndefined()
 expect(()=>compileScript(descriptor,{id:'data-v-vdom',inlineTemplate:true})).not.toThrow()
})
