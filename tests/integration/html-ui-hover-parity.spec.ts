import {test,expect} from '@playwright/test'
test.beforeEach(async({page})=>{await page.goto('/html-ui-hover-parity')})
test('Tooltip escapes clipping with its connected description and immediate keyboard focus',async({page})=>{
 const trigger=page.getByRole('button',{name:'Publish report',exact:true});await trigger.focus();const tip=page.locator('#help-tip');await expect(tip).toBeVisible();await expect(trigger).toHaveAttribute('aria-describedby','help-tip');await expect(trigger).toBeFocused();await expect(tip).toHaveAttribute('popover','manual');await expect.poll(async()=>tip.evaluate((e:HTMLElement)=>e.getBoundingClientRect().bottom)).toBeLessThan((await trigger.boundingBox())!.y);await page.keyboard.press('Escape');await expect(tip).toBeHidden();await expect(trigger).toBeFocused()
})
test('Tooltip can be hovered across the trigger gap without premature closing',async({page})=>{
 const trigger=page.getByRole('button',{name:'Publish report',exact:true}),tip=page.locator('#help-tip');await trigger.hover();await expect(tip).toBeVisible();await tip.hover();await page.waitForTimeout(250);await expect(tip).toBeVisible();await page.mouse.move(0,0);await expect(tip).toBeHidden()
})
test('Reactive placement and horizontal collision keep tips inside a mobile viewport',async({page})=>{
 await page.setViewportSize({width:390,height:720});const trigger=page.getByRole('button',{name:'Publish report',exact:true});await page.getByRole('button',{name:'Placement: top'}).click();await trigger.focus();await expect(page.locator('#help-tip')).toHaveAttribute('data-side',/right|left/);const box=await page.locator('#help-tip').boundingBox();expect(box!.x).toBeGreaterThanOrEqual(8);expect(box!.x+box!.width).toBeLessThanOrEqual(382);await page.getByRole('button',{name:'Placement: right'}).click();await trigger.focus();await expect(page.locator('#help-tip')).toHaveAttribute('data-side',/top|bottom/)
})
test('HoverCard cancels early hover and opens after intent without stealing focus',async({page})=>{
 const trigger=page.getByRole('button',{name:'@korestack',exact:true}),popup=page.locator('#profile-preview');await trigger.hover();await page.mouse.move(0,0);await page.waitForTimeout(180);await expect(popup).toBeHidden();await trigger.hover();await expect(popup).toBeVisible();await expect(trigger).not.toBeFocused();await popup.hover();await page.waitForTimeout(350);await expect(popup).toBeVisible()
})
test('HoverCard supports native click, focus within content, Escape and light dismissal',async({page})=>{
 const trigger=page.getByRole('button',{name:'@korestack',exact:true}),popup=page.locator('#profile-preview');await trigger.click();await expect(popup).toBeVisible();await page.getByRole('link',{name:'View profile',exact:true}).focus();await page.waitForTimeout(350);await expect(popup).toBeVisible();await page.keyboard.press('Escape');await expect(popup).toBeHidden();await expect(trigger).toBeFocused();await page.keyboard.press('Space');await expect(popup).toBeVisible();await expect(popup).toHaveAttribute('data-side',/top|bottom/);await page.mouse.click(4,4);await expect(popup).toBeHidden()
})
test('Disabling a fieldset dismisses open overlays and blocks later focus/hover',async({page})=>{
 const tip=page.locator('#disabled-tip'),preview=page.locator('#disabled-preview');await page.getByRole('button',{name:'Describe action'}).focus();await expect(tip).toBeVisible();await page.getByRole('button',{name:'Preview workspace',exact:true}).focus();await expect(preview).toBeVisible();await page.getByRole('button',{name:'Disable controls',exact:true}).click();await expect(tip).toBeHidden();await expect(preview).toBeHidden();await expect(page.getByRole('button',{name:'Describe action'})).toBeDisabled();await page.getByRole('button',{name:'Enable controls',exact:true}).click();await page.getByRole('button',{name:'Describe action'}).focus();await expect(tip).toBeVisible()
})
test('Tooltip Escape preserves its surrounding native dialog until the next Escape',async({page})=>{
 await page.getByRole('button',{name:'Open tooltip dialog'}).click();await page.getByRole('button',{name:'Explain setting',exact:true}).focus();await expect(page.locator('#dialog-tip')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('#dialog-tip')).toBeHidden();await expect(page.locator('#hover-dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('#hover-dialog')).toBeHidden();await expect(page.getByRole('button',{name:'Open tooltip dialog'})).toBeFocused()
})
test('Dark and RTL popup themes retain bounded placement',async({page})=>{
 await page.getByRole('button',{name:'Dark theme',exact:true}).click();const trigger=page.getByRole('button',{name:'معاينة الحساب',exact:true});await trigger.focus();const popup=page.locator('#rtl-preview');await expect(popup).toBeVisible();await expect(popup).toHaveCSS('direction','rtl');await expect(popup).toHaveCSS('background-color','oklch(0.205 0 0)');const box=await popup.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(8);expect(box!.y).toBeGreaterThanOrEqual(8)
})
test('Unmount cancels intent and preserves local overrides after remount',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));const trigger=page.getByRole('button',{name:'Local override',exact:true});await trigger.hover();await page.getByRole('button',{name:'Unmount overlay',exact:true}).click();await page.waitForTimeout(180);await expect(page.locator('#override-preview')).toHaveCount(0);await page.getByRole('button',{name:'Mount overlay',exact:true}).click();await trigger.focus();const popup=page.locator('#override-preview');await expect(popup).toBeVisible();await expect(popup).toHaveCSS('border-radius','0px');expect((await popup.boundingBox())!.width).toBeLessThanOrEqual(192);expect(errors).toEqual([])
})
test('An open Tooltip follows page scroll while retaining viewport bounds',async({page})=>{
 await page.setViewportSize({width:800,height:480});const trigger=page.getByRole('button',{name:'Publish report',exact:true});await trigger.focus();const before=(await page.locator('#help-tip').boundingBox())!.y;await page.evaluate(()=>window.scrollBy(0,30));await expect.poll(async()=> (await page.locator('#help-tip').boundingBox())!.y).not.toBe(before);const box=await page.locator('#help-tip').boundingBox();expect(box!.y).toBeGreaterThanOrEqual(8);expect(box!.y+box!.height).toBeLessThanOrEqual(472)
})

test('Reactive HoverCard IDs keep native invocation and ARIA controls connected',async({page})=>{
 const trigger=page.getByRole('button',{name:'@korestack',exact:true});await page.getByRole('button',{name:'Change preview ID',exact:true}).click();await expect(trigger).toHaveAttribute('aria-controls','renamed-profile');await expect(trigger).toHaveAttribute('popovertarget','renamed-profile');await trigger.focus();await expect(page.locator('#renamed-profile')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('#renamed-profile')).toBeHidden()
})

test('Long tooltip text scrolls within the viewport and short text restores its exterior arrow',async({page})=>{
 await page.setViewportSize({width:390,height:600});await page.getByRole('button',{name:'Toggle long description',exact:true}).click();const trigger=page.getByRole('button',{name:'Publish report',exact:true});await trigger.focus();const tip=page.locator('#help-tip');await expect(tip).toBeVisible();await expect(tip).toHaveCSS('overflow-y','auto');await tip.hover();await page.mouse.wheel(0,500);await expect.poll(async()=>tip.evaluate((e:HTMLElement)=>e.scrollTop)).toBeGreaterThan(0);const box=await tip.boundingBox();expect(box!.y).toBeGreaterThanOrEqual(8);expect(box!.y+box!.height).toBeLessThanOrEqual(592);await page.keyboard.press('Escape');await page.getByRole('button',{name:'Toggle long description',exact:true}).click();await trigger.focus();await expect(tip).toHaveCSS('overflow-y','visible')
})
