import { access, readFile } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
export async function findTheme(
	theme?: string,
	config?: string,
	cwd = process.cwd(),
): Promise<string> {
	if (theme && config)
		throw new Error("--theme and --config are mutually exclusive");
	if (theme) return resolve(cwd, theme);
	let path = config ? resolve(cwd, config) : undefined;
	if (!path) {
		let current = resolve(cwd);
		for (;;) {
			const candidate = join(current, "components.json");
			try {
				await access(candidate);
				path = candidate;
				break;
			} catch {}
			const parent = dirname(current);
			if (parent === current) break;
			current = parent;
		}
	}
	if (!path)
		throw new Error(
			"no components.json found; pass --theme <css-file> or --config <components.json>",
		);
	const data = JSON.parse(await readFile(path, "utf8"));
	if (data?.tailwind?.cssVariables === false)
		throw new Error(
			"cssVariables:false is unsupported; supply a CSS-variable theme",
		);
	if (typeof data?.tailwind?.css !== "string" || !data.tailwind.css)
		throw new Error(`${path}: missing tailwind.css`);
	return resolve(dirname(path), data.tailwind.css);
}
