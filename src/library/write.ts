import {
  readFile,
  writeFile,
  mkdir,
  lstat,
  rename,
  rm,
} from "node:fs/promises";
import { resolve, join, dirname, basename } from "node:path";
import { randomUUID } from "node:crypto";
import { digest } from "../vue/transform.js";
async function exists(path: string) {
  try {
    return await lstat(path);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw e;
  }
}
export async function writeLibrary(
  files: Record<string, string>,
  outDir: string,
  options: { check: boolean },
): Promise<{ changed: string[] }> {
  const root = resolve(outDir),
    manifest = join(root, ".html-ui-library.json");
  if ((await exists(root))?.isSymbolicLink())
    throw new Error("symlink output directory");
  const m = await exists(manifest);
  if (m?.isSymbolicLink()) throw new Error("symlink manifest");
  const old: Record<string, string> = m
    ? JSON.parse(await readFile(manifest, "utf8"))
    : {};
  if (
    !old ||
    typeof old !== "object" ||
    Array.isArray(old) ||
    Object.values(old).some((v) => typeof v !== "string")
  )
    throw new Error("invalid library manifest");
  const next = { ...old },
    changed: string[] = [];
  for (const [name, source] of Object.entries(files)) {
    if (
      name !== basename(name) ||
      !/^[a-zA-Z][.\w-]*\.(vue|ts|json|md)$/.test(name)
    )
      throw new Error(`invalid output filename ${name}`);
    const path = join(root, name),
      stat = await exists(path);
    if (stat?.isSymbolicLink() || (stat && !stat.isFile()))
      throw new Error(`not a regular file: ${name}`);
    const current = stat ? await readFile(path, "utf8") : undefined;
    if (
      current !== undefined &&
      (!Object.hasOwn(old, name) || digest(current) !== old[name])
    )
      throw new Error(`refusing edited or unowned file ${name}`);
    next[name] = digest(source);
    if (current !== source) changed.push(name);
  }
  if (!options.check && changed.length) {
    await mkdir(root, { recursive: true });
    const stage = join(root, `.html-ui-stage-${randomUUID()}`);
    await mkdir(stage);
    try {
      for (const name of changed)
        await writeFile(join(stage, name), files[name]);
      await writeFile(
        join(stage, "manifest"),
        JSON.stringify(next, null, 2) + "\n",
      );
      for (const name of changed)
        await rename(join(stage, name), join(root, name));
      await rename(join(stage, "manifest"), manifest);
    } finally {
      await rm(stage, { recursive: true, force: true });
    }
  }
  return { changed };
}
