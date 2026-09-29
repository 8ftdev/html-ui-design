import { test, expect } from "bun:test";
import { mkdtemp, readFile, writeFile, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeLibrary } from "../../src/library/write";
test("writes once, updates only unedited owned files, and previews without writes", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ui-library-"));
  expect(
    (await writeLibrary({ "Button.vue": "first" }, dir, { check: false }))
      .changed,
  ).toEqual(["Button.vue"]);
  expect(
    (await writeLibrary({ "Button.vue": "first" }, dir, { check: false }))
      .changed,
  ).toEqual([]);
  expect(
    (await writeLibrary({ "Button.vue": "second" }, dir, { check: true }))
      .changed,
  ).toEqual(["Button.vue"]);
  expect(await readFile(join(dir, "Button.vue"), "utf8")).toBe("first");
  await writeLibrary({ "Button.vue": "second" }, dir, { check: false });
  await writeFile(join(dir, "Button.vue"), "user edit");
  await expect(
    writeLibrary({ "Button.vue": "third", "Other.vue": "new" }, dir, {
      check: false,
    }),
  ).rejects.toThrow(/edited/);
  expect(await Bun.file(join(dir, "Other.vue")).exists()).toBe(false);
});
test("rejects traversal, existing unrelated files, and symlinks", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ui-library-"));
  await expect(
    writeLibrary({ "../escape.vue": "bad" }, dir, { check: false }),
  ).rejects.toThrow();
  await writeFile(join(dir, "User.vue"), "manual");
  await expect(
    writeLibrary({ "User.vue": "generated" }, dir, { check: false }),
  ).rejects.toThrow();
  await symlink(join(dir, "User.vue"), join(dir, "Link.vue"));
  await expect(
    writeLibrary({ "Link.vue": "generated" }, dir, { check: false }),
  ).rejects.toThrow();
});
