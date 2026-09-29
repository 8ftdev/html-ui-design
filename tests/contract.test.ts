import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { parseVue } from "../src/vue/parse";
const accordion = readFileSync("tests/fixtures/accordion.vue", "utf8");
for (const name of ["accordion", "button", "input", "checkbox", "autocomplete"])
	test(`accepts ${name} emitted v2`, () => {
		expect(
			parseVue(readFileSync(`tests/fixtures/${name}.vue`, "utf8"), name).ui
				.component,
		).toBe(name);
	});
test("summary state resolves through symbolic root node", () => {
	expect(
		parseVue(accordion, "a.vue").ui.parts.trigger.state?.expanded.source,
	).toEqual({ node: "root", attribute: "open", present: true });
});
for (const [name, mutate] of Object.entries({
	executable: (s: string) =>
		s.replace("export const ui = {", "export const ui = (() => ({}))() || {"),
	null: (s: string) => s.replace('"present": true', '"present": null'),
	duplicate: (s: string) =>
		s.replace(
			'"component": "accordion",',
			'"component": "accordion", "component": "button",',
		),
	unknown: (s: string) =>
		s.replace(
			'"component": "accordion",',
			'"component": "accordion", "extra": true,',
		),
	coverage: (s: string) =>
		s.replace('data-ui-part="trigger"', 'data-ui-part="missing"'),
	dynamic: (s: string) =>
		s.replace('data-ui-part="trigger"', ':data-ui-part="part"'),
	anatomy: (s: string) => s.replace("<summary ", '<summary v-if="true" '),
	types: (s: string) =>
		s.replace(
			"expanded?: AccordionStyle<Style>;",
			"disabled?: AccordionStyle<Style>;",
		),
	disabled: (s: string) => s.replace('"hover": {', '"disabled": {'),
	version: (s: string) =>
		s.replace("contractVersion = 2", "contractVersion = 1"),
})) {
	test(`rejects invalid ${name}`, () =>
		expect(() => parseVue(mutate(accordion), "a.vue")).toThrow());
}
