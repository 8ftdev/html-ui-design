import { expect, test, type Locator } from "@playwright/test";
async function sameColor(actual: Locator, property: string, probe: Locator, probeProperty = property) {
 const rgba = (locator: Locator, key: string) => locator.evaluate((element, cssProperty) => {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d')!;
  context.fillStyle = getComputedStyle(element).getPropertyValue(cssProperty);
  context.fillRect(0, 0, 1, 1);
  return Array.from(context.getImageData(0, 0, 1, 1).data);
 }, key);
 await expect.poll(async () => {
  const left = await rgba(actual, property), right = await rgba(probe, probeProperty);
  return Math.max(...left.map((v, i) => Math.abs(v - right[i]!)));
 }).toBeLessThanOrEqual(1);
}
const route = "/html-ui-contract-check";
test("all 37 generated primitives render on the production server", async ({
	request,
}) => {
	const response = await request.get(route);
	expect(response.status()).toBe(200);
	const html = await response.text();
	expect(html).toContain('data-testid="catalog"');
	const names = new Set(
		[...html.matchAll(/data-ui="([a-z-]+)"/g)].map((m) => m[1]),
	);
	expect(names.size).toBe(37);
});
test("Vapor hydrates and forwards native events without errors", async ({
	page,
}) => {
	const errors: string[] = [];
	page.on("pageerror", (e) => errors.push(e.message));
	page.on("console", (m) => {
		if (m.type() === "error" || /hydration.*mismatch/i.test(m.text()))
			errors.push(m.text());
	});
	await page.goto(route);
 await expect(page.locator("main")).toHaveAttribute("data-ready", "true");
	await page.getByTestId("enabled-case").getByRole("button").click();
	await expect(page.getByTestId("click-count")).toHaveText("1");
	const details = page.getByTestId("accordion-case").locator("details").first();
	await details.locator(":scope > summary").focus();
	await page.keyboard.press("Enter");
	await expect(details).toHaveAttribute("open", "");
	await expect(page.getByTestId("open-model")).toHaveText("true");
	await expect(page.getByTestId("slot-state")).toHaveText("open");
	await expect(page.getByTestId("toggle-count")).toHaveText("1");
	expect(errors).toEqual([]);
});
test("disabled blocks activation and hover while focus remains visible", async ({
	page,
}) => {
	await page.goto(route);
 await expect(page.locator("main")).toHaveAttribute("data-ready", "true");
	const disabled = page.getByTestId("disabled-case").getByRole("button");
	await expect(disabled).toBeDisabled();
	await disabled.hover();
	await expect(disabled).toHaveCSS("opacity", "0.5");
	await expect(disabled).toHaveCSS("cursor", "not-allowed");
	await expect(page.getByTestId("click-count")).toHaveText("0");
	const enabled = page.getByTestId("enabled-case").getByRole("button");
 await sameColor(disabled, 'background-color', enabled);
 await disabled.click({ force: true });
 await expect(page.getByTestId('click-count')).toHaveText('0');
 // WebKit follows platform Tab preferences and can skip buttons. Establish keyboard modality, then focus the control being tested.
 await page.keyboard.press('Tab');
 await enabled.focus();
 await expect(enabled).toBeFocused();
	await expect(enabled).toHaveCSS("outline-style", "solid");
	await expect(enabled).toHaveCSS("outline-width", "2px");
});
test("an outer expanded accordion cannot activate an inner closed trigger", async ({
	page,
}) => {
	await page.goto(route);
 await expect(page.locator("main")).toHaveAttribute("data-ready", "true");
	const outer = page.getByTestId("nested-case").locator("details").first();
	await outer.locator(":scope > summary").click();
	await page.mouse.move(0, 0);
	const inner = outer.locator("details").first();
	await expect(inner).not.toHaveAttribute("open", "");
	await expect(inner.locator(":scope > summary")).toHaveCSS(
		"background-color",
		"rgba(0, 0, 0, 0)",
	);
	await inner.locator(":scope > summary").click();
	await page.mouse.move(0, 0);
	await expect(inner).toHaveAttribute("open", "");
 await sameColor(inner.locator(':scope > summary'), 'background-color', page.getByTestId('accent-probe'));
});
test("input validity, checked state and models survive styling", async ({
	page,
}) => {
	await page.goto(route);
 await expect(page.locator("main")).toHaveAttribute("data-ready", "true");
	const input = page.getByTestId("input-case").getByRole("textbox");
	expect(
		await input.evaluate((e) => (e as HTMLInputElement).validity.valueMissing),
	).toBe(true);
 await sameColor(input, 'border-top-color', page.getByTestId('destructive-probe'), 'color');
	await input.fill("hello");
	await expect(page.getByTestId("value-model")).toHaveText("hello");
	expect(
		await input.evaluate((e) => (e as HTMLInputElement).validity.valid),
	).toBe(true);
	await page.getByTestId("checkbox-case").getByRole("checkbox").check();
	await expect(page.getByTestId("checked-model")).toHaveText("true");
});
test("dashboard theme and runtime token updates control computed colors", async ({
	page,
}) => {
	await page.goto(route);
 await expect(page.locator("main")).toHaveAttribute("data-ready", "true");
	await page.mouse.move(0, 0);
	const button = page.getByTestId("enabled-case").getByRole("button");
	for (const dark of [false, true]) {
		await page.evaluate(
			(d) => document.documentElement.classList.toggle("dark", d),
			dark,
		);
		const probe = page.getByTestId("primary-probe");
 await sameColor(button, 'background-color', probe);
 await sameColor(button, 'color', probe);
	}
	await page.evaluate(() =>
		document.documentElement.style.setProperty("--primary", "rgb(12, 34, 56)"),
	);
	await expect(button).toHaveCSS("background-color", "rgb(12, 34, 56)");
});
test("compiled overrides are isolated and obey replace omit and unstyled", async ({
	page,
}) => {
	await page.goto(route);
 await expect(page.locator("main")).toHaveAttribute("data-ready", "true");
	const original = page.getByTestId("disabled-case").getByRole("button");
	const replacement = page.getByTestId("replace-case").getByRole("button");
	const omitted = page.getByTestId("omit-case").getByRole("button");
	const unstyled = page.getByTestId("unstyled-case").getByRole("button");
	await expect(original).toHaveCSS("opacity", "0.5");
	await expect(replacement).toHaveCSS("opacity", "0.3");
	await expect(replacement).toHaveCSS("cursor", "pointer");
	await expect(omitted).toHaveCSS("opacity", "1");
	await expect(unstyled).toHaveCSS("opacity", "0.7");
	await expect(unstyled).toHaveCSS("border-radius", "0px");
});

test('existing dashboard still hydrates with the shared theme configuration',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
 await page.goto('/?name=Integration')
 await expect(page.locator('main')).toHaveAttribute('data-ready','true')
 await expect(page.locator('#welcome')).toHaveText('Welcome, Integration.')
 await page.locator('#workspace-name').fill('Verified')
 await expect(page.locator('#welcome')).toHaveText('Welcome, Verified.')
 await page.locator('#counter').click();await expect(page.locator('#counter')).toHaveText('Count: 1')
 expect(errors).toEqual([])
})
