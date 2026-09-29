import { readFile } from "node:fs/promises";
import builtin from "./builtin/shadcn-ui.json";
import { parsePlugin } from "./schema.js";
export async function loadPlugin(path: string) {
  return parsePlugin(
    path === "shadcn-ui" ? builtin : JSON.parse(await readFile(path, "utf8")),
  );
}
