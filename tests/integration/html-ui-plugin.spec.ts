import { test, expect } from "@playwright/test";
test("local blocks hydrate, submit, reset, and expose native disabled behavior", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/html-ui-plugin-check");
  await expect(page.locator("main")).toHaveAttribute("data-ready", "true");
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  const accordion = page.locator('[data-ui="accordion"][data-ui-part="root"]');
  await expect(accordion).toHaveCount(1);
  await accordion.locator(':scope > summary').focus();
  await page.keyboard.press("Enter");
  await expect(accordion).toHaveAttribute("open", "");
  await expect(page.getByTestId("submit-count")).toBeVisible();
  await page.getByLabel("Email", { exact: true }).fill("person@example.com");
  await page.getByLabel("Password", { exact: true }).fill("example-password");
  await page.getByLabel("Remember me").check();
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page.getByTestId("submit-count")).toHaveText("1");
  await expect(page.getByTestId("model")).toContainText("person@example.com");
  const disabled = page.getByRole("button", { name: "Unavailable" });
  await expect(disabled).toBeDisabled();
  await expect(disabled).toHaveAttribute("data-disabled", "");
  await expect(
    page.getByRole("button", { name: "Login", exact: true }),
  ).not.toHaveAttribute("data-disabled");
  await disabled.click({ force: true });
  await expect(page.getByTestId("submit-count")).toHaveText("1");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Remember me")).not.toBeChecked();
  await page.getByRole("button", { name: "Help" }).click();
  await expect(page.getByTestId("help-count")).toHaveText("1");
  expect(errors).toEqual([]);
});
test("recipes style variants, focus, theme and responsive grid in the host build", async ({
  page,
}) => {
  await page.goto("/html-ui-plugin-check");
  await expect(page.locator("main")).toHaveAttribute("data-ready", "true");
  const login = page.getByRole("button", { name: "Login", exact: true });
  const outline = page.getByRole("button", { name: "Continue with email" });
  expect(
    await login.evaluate((e) => getComputedStyle(e).backgroundColor),
  ).not.toBe(
    await outline.evaluate((e) => getComputedStyle(e).backgroundColor),
  );
  await page.keyboard.press("Tab");
  await login.focus();
  expect(await login.evaluate((e) => e.matches(":focus-visible"))).toBe(true);
  expect(await login.evaluate((e) => getComputedStyle(e).boxShadow)).not.toBe(
    "none",
  );
  const before = await login.evaluate(
    (e) => getComputedStyle(e).backgroundColor,
  );
  await page.evaluate(() =>
    document.documentElement.style.setProperty("--primary", "rgb(12, 34, 56)"),
  );
  await expect
    .poll(() => login.evaluate((e) => getComputedStyle(e).backgroundColor))
    .not.toBe(before);
  const grid = page.getByTestId("responsive-grid").locator('[data-ui="grid"]');
  await page.setViewportSize({ width: 480, height: 900 });
  expect(
    await grid.evaluate(
      (e) => getComputedStyle(e).gridTemplateColumns.split(" ").length,
    ),
  ).toBe(1);
  expect(
    parseFloat(await grid.evaluate((e) => getComputedStyle(e).gap)),
  ).toBeGreaterThan(0);
  await page.setViewportSize({ width: 1000, height: 900 });
  expect(
    await grid.evaluate(
      (e) => getComputedStyle(e).gridTemplateColumns.split(" ").length,
    ),
  ).toBe(2);
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  const input = page.getByLabel("Email", { exact: true });
  await expect
    .poll(() => input.evaluate((e) => getComputedStyle(e).borderTopStyle))
    .toBe("solid");
  expect(await input.evaluate((e) => getComputedStyle(e).borderTopWidth)).toBe(
    "1px",
  );
  const foreground = await page
    .locator("main")
    .evaluate((e) => getComputedStyle(e).color);
  await expect
    .poll(() =>
      page
        .getByRole("button", { name: "Reset", exact: true })
        .evaluate((e) => getComputedStyle(e).color),
    )
    .toBe(foreground);
  const icons = page.locator('[data-ui="icon"] svg');
  expect(await icons.nth(0).evaluate((e) => getComputedStyle(e).width)).toBe(
    await icons.nth(1).evaluate((e) => getComputedStyle(e).width),
  );
});
test("shared Icon sizing updates both direct and composed instances", async ({
  page,
}) => {
  await page.goto("/html-ui-plugin-check");
  await expect(page.locator("main")).toHaveAttribute("data-ready", "true");
  await page.evaluate(() =>
    document.documentElement.style.setProperty("--ui-icon-size", "24px"),
  );
  for (const icon of await page.locator('[data-ui="icon"] svg').all())
    await expect
      .poll(() => icon.evaluate((e) => getComputedStyle(e).width))
      .toBe("24px");
});


test("icons have visible default SVG geometry", async ({ page }) => {
  await page.goto("/html-ui-plugin-check");
  await expect(page.locator("main")).toHaveAttribute("data-ready", "true");
  const icons = page.locator('[data-ui="icon"] svg');
  expect(await icons.count()).toBeGreaterThan(0);
  for (const icon of await icons.all()) {
    await expect(icon).toHaveCSS("width", "16px");
    await expect(icon).toHaveCSS("height", "16px");
    expect(await icon.evaluate(e => e.namespaceURI)).toBe("http://www.w3.org/2000/svg");
    expect(await icon.evaluate(e => (e as SVGGraphicsElement).getBBox().width)).toBeGreaterThan(0);
  }
});

test("button recipes visibly respond to pointer hover", async ({ page }) => {
  await page.goto("/html-ui-plugin-check");
  await expect(page.locator("main")).toHaveAttribute("data-ready", "true");
  for (const dark of [false, true]) {
    if (dark) await page.getByRole("button", { name: "Switch to dark theme" }).click();
    for (const name of ["Login", "Continue with email", "Reset", "Help"]) {
      await page.mouse.move(0, 0);
      const button = page.getByRole("button", { name, exact: true });
      await expect.poll(() => button.evaluate(e => e.getAnimations().filter(a => a.playState === "running").length)).toBe(0);
      const base = await button.evaluate(e => getComputedStyle(e).backgroundColor);
      await button.hover();
      await expect.poll(() => button.evaluate(e => getComputedStyle(e).backgroundColor)).not.toBe(base);
    }
  }
});


test("theme control, leading icon and inline recovery link compose locally", async ({ page }) => {
  await page.goto("/html-ui-plugin-check");
  await expect(page.locator("main")).toHaveAttribute("data-ready", "true");
  const email = page.getByRole("button", { name: "Continue with email", exact: true });
  await expect(email.locator('[data-ui="icon"] svg')).toHaveCSS("width", "16px");
  const link = page.getByRole("link", { name: "Forgot your password?" });
  await expect(link).toHaveCSS("text-decoration-line", "underline");
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await link.click();
  await expect(page.getByRole("status")).toHaveText("Connect this link to your application's password recovery flow.");
  const before = await page.locator("main").evaluate(e => getComputedStyle(e).backgroundColor);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect.poll(() => page.locator("main").evaluate(e => getComputedStyle(e).backgroundColor)).not.toBe(before);
  const login = page.getByRole("button", { name: "Login", exact: true });
  await page.mouse.move(0, 0);
  const darkBase = await login.evaluate(e => getComputedStyle(e).backgroundColor);
  await login.hover();
  await expect.poll(() => login.evaluate(e => getComputedStyle(e).backgroundColor)).not.toBe(darkBase);
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});
