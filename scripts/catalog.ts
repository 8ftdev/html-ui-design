import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse, compileScript, compileStyle } from "@vue/compiler-sfc";
const root = resolve(import.meta.dir, ".."),
	out = resolve(root, ".test-output");
mkdirSync(out, { recursive: true });
const producer =
	process.env.HTML_UI_SOURCE ?? resolve(root, "../html-ui-cli");
const converter =
	process.env.HTML_UI_VUE_SOURCE ??
	resolve(root, "../html-ui-to-vue-vapor");
const env = {
	...process.env,
	GOCACHE: process.env.GOCACHE ?? "/private/tmp/html-ui-contract-go-cache",
};
execFileSync(
	"go",
	["build", "-trimpath", "-o", resolve(out, "html-ui"), "./cmd/html-ui"],
	{ cwd: producer, env },
);
execFileSync(
	"go",
	[
		"build",
		"-trimpath",
		"-o",
		resolve(out, "html-ui-to-vue-vapor"),
		"./cmd/html-ui-to-vue-vapor",
	],
	{ cwd: converter, env },
);
const names = execFileSync(resolve(out, "html-ui"), ["--list"], {
	encoding: "utf8",
})
	.trim()
	.split("\n");
const target = resolve(out, "catalog");
mkdirSync(target, { recursive: true });
for (const name of names) {
	const input = execFileSync(resolve(out, "html-ui"), [name], {
		encoding: "utf8",
	});
	const vue = execFileSync(resolve(out, "html-ui-to-vue-vapor"), [], {
		input,
		encoding: "utf8",
		stdio: ["pipe", "pipe", "pipe"],
	});
	const result = execFileSync(
		"node",
		[
			resolve(root, "dist/cli.js"),
			"--framework",
			"vue",
			"--theme",
			resolve(root, "tests/fixtures/theme.css"),
		],
		{ input: vue, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
	);
	const filename = resolve(target, name + ".vue");
	writeFileSync(filename, result);
	const { descriptor, errors } = parse(result, { filename });
	if (errors.length) throw new Error(String(errors));
	compileScript(descriptor, { id: "data-v-" + name, inlineTemplate: true });
	for (const style of descriptor.styles) {
		const r = compileStyle({
			source: style.content,
			filename,
			id: "data-v-" + name,
			scoped: true,
		});
		if (r.errors.length) throw new Error(String(r.errors));
	}
	console.log(`compiled ${name}`);
}
writeFileSync(
	resolve(target, "tsconfig.json"),
	JSON.stringify({
		compilerOptions: {
			strict: true,
			target: "ES2022",
			module: "ESNext",
			moduleResolution: "Bundler",
			lib: ["ES2022", "DOM"],
			skipLibCheck: true,
			noEmit: true,
			types: [],
		},
		vueCompilerOptions: { strictTemplates: true },
		include: ["*.vue"],
	}),
);
execFileSync(
	"node",
	[
		resolve(root, "node_modules/vue-tsc/bin/vue-tsc.js"),
		"--project",
		resolve(target, "tsconfig.json"),
		"--pretty",
		"false",
	],
	{ stdio: "inherit" },
);
console.log(
	`PASS: ${names.length} actual pipeline components compile and type-check`,
);
