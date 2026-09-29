import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
function run(args: string[], input = "") {
	return spawnSync("bun", ["src/cli.ts", ...args], { input, encoding: "utf8" });
}
test("help exits successfully without reading a component", () => {
	const r = run(["--help"]);
	expect(r.status).toBe(0);
	expect(r.stdout).toContain("--framework");
});
for (const args of [
	["--framework", "react"],
	["--framework", "vue", "--theme", "a.css", "--config", "b.json"],
	["--framework", "vue", "--theme"],
	["--framework", "vue", "--framework", "vue"],
	["--unknown"],
]) {
	test(`rejects arguments ${args.join(" ")}`, () => {
		const r = run(args);
		expect(r.status).toBe(2);
		expect(r.stdout).toBe("");
		expect(r.stderr).toContain("html-ui-shadcn:");
	});
}

test('conversion buffers source and produces a complete component',()=>{
 const source=require('node:fs').readFileSync('tests/fixtures/button.vue','utf8')
 const r=run(['--framework','vue','--theme','tests/fixtures/theme.css'],source)
 expect(r.status).toBe(0);expect(r.stderr).toBe('');expect(r.stdout).toContain('<style scoped');expect(r.stdout.trimEnd().endsWith('</style>')).toBe(true)
})
test('invalid contract writes only a diagnostic',()=>{
 const r=run(['--framework','vue','--theme','tests/fixtures/theme.css'],'<template><button /></template>')
 expect(r.status).toBe(2);expect(r.stdout).toBe('');expect(r.stderr).toContain('profile')
})
