import { expect, test, afterAll } from "bun:test";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadTheme } from "../src/theme/load";
import { findTheme } from "../src/theme/config";
const dir = mkdtempSync(join(tmpdir(), "html-ui-theme-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));
function file(name: string, content: string) {
	const p = join(dir, name);
	writeFileSync(p, content);
	return p;
}
test("legacy channel colors need an hsl wrapper", async () => {
	expect(
		(
			await loadTheme(
				file(
					"legacy.css",
					":root{--primary:220 40% 30%}.dark{--primary:220 40% 80%}",
				),
			)
		).token("primary", "color"),
	).toBe("hsl(var(--primary))");
});
test("modern aliases keep live semantic reference", async () => {
	expect(
		(
			await loadTheme(
				file(
					"alias.css",
					":root{--primary:var(--palette);--palette:oklch(.5 .2 250)}",
				),
			)
		).token("primary", "color"),
	).toBe("var(--primary)");
});
test("config stylesheet path is relative to config", async () => {
	const p = file(
		"components.json",
		JSON.stringify({ tailwind: { css: "alias.css", cssVariables: true } }),
	);
	expect(await findTheme(undefined, p)).toBe(join(dir, "alias.css"));
});
test("local package style export supplies required palette", async () => {
	const p = join(dir, "node_modules/palette");
	mkdirSync(p, { recursive: true });
	writeFileSync(
		join(p, "package.json"),
		JSON.stringify({
			exports: { ".": { style: "./colors.css", default: "./bad.js" } },
		}),
	);
	writeFileSync(join(p, "colors.css"), "@theme{--color-brand:#123456}");
	expect(
		(
			await loadTheme(
				file(
					"package.css",
					'@import "palette";:root{--primary:var(--color-brand)}',
				),
			)
		).token("primary", "color"),
	).toBe("var(--primary)");
});
for (const [name, css] of Object.entries({
	missing: ":root{--primary:var(--absent)}",
	cycle: ":root{--primary:var(--a);--a:var(--primary)}",
	mixed: ":root{--primary:220 40% 30%}.dark{--primary:#fff}",
	nullcolor: ":root{--primary:initial}",
}))
	test(`rejects ${name}`, async () => {
		const t = await loadTheme(file(name + ".css", css));
		expect(() => t.token("primary", "color")).toThrow();
	});
test("var fallback resolves only when required dependency absent", async () => {
	expect(
		(
			await loadTheme(
				file("fallback.css", ":root{--primary:var(--missing, #fff)}"),
			)
		).token("primary", "color"),
	).toBe("var(--primary)");
});
test("import cycles fail clearly", async () => {
	file("a.css", '@import "b.css";');
	file("b.css", '@import "a.css";');
	expect(loadTheme(join(dir, "a.css"))).rejects.toThrow(/cycle/);
});
test("host Tailwind expressions and remote fonts do not break semantic tokens", async () => {
	expect(
		(
			await loadTheme(
				file(
					"host.css",
					'@import url("https://example.com/font.css");@theme{--color-brand:#abc}:root{--primary:--alpha(var(--color-brand) / 50%)}',
				),
			)
		).token("primary", "color"),
	).toBe("var(--primary)");
});

for (const [name, css] of Object.entries({
 channels: ':root{--primary:rgb(var(--channels));--channels:12 34 56}',
 alpha: ':root{--primary:oklch(.5 .1 250 / var(--opacity));--opacity:.5}',
 nestedFallback: ':root{--primary:rgb(var(--missing,12 34 56))}'
})) test(`full color function accepts ${name} dependency`, async()=>{
 expect((await loadTheme(file(name+'.css',css))).token('primary','color')).toBe('var(--primary)')
})
