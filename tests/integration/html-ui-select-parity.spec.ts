import {test,expect} from '@playwright/test'
test.beforeEach(async({page})=>{await page.goto('/html-ui-select-parity')})
test('compact Select commits native form values and resets its model',async({page})=>{
 const trigger=page.getByRole('combobox',{name:'Status',exact:true});await expect(trigger).toHaveText('Draft');await trigger.click();
 const popup=page.getByRole('listbox',{name:'Status',exact:true});await expect(popup).toBeVisible();await expect(popup.getByRole('option')).toHaveCount(4);await expect(popup.getByRole('option',{name:'Blocked',exact:true})).toBeDisabled();
 await popup.getByRole('option',{name:'Published',exact:true}).click();await expect(page.getByTestId('status-model')).toHaveText('published');await expect(trigger).toBeFocused();
 expect(await page.getByTestId('select-form').evaluate((e:HTMLFormElement)=>new FormData(e).get('status'))).toBe('published');
 await page.getByRole('button',{name:'Reset form',exact:true}).click();await expect(page.getByTestId('status-model')).toHaveText('draft');await expect(trigger).toHaveText('Draft');
 await expect(page.getByRole('combobox',{name:'Native alternative',exact:true})).toHaveJSProperty('tagName','SELECT');
})
test('keyboard active-descendant navigation skips disabled choices and cancels',async({page})=>{
 const trigger=page.getByRole('combobox',{name:'Status',exact:true});await trigger.focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowDown');await expect(trigger).toBeFocused();
 await expect(page.locator('#'+await trigger.getAttribute('aria-activedescendant'))).toHaveText('Published');await page.keyboard.press('ArrowDown');await expect(page.locator('#'+await trigger.getAttribute('aria-activedescendant'))).toHaveText('Archived');
 await page.keyboard.press('Escape');await expect(trigger).toHaveText('Draft');await expect(trigger).toHaveAttribute('aria-expanded','false');
 await page.keyboard.press('p');await expect(page.getByTestId('status-model')).toHaveText('published');await page.keyboard.press('ArrowDown');await page.keyboard.press('End');await page.keyboard.press('Tab');await expect(page.getByTestId('status-model')).toHaveText('archived');await expect(trigger).toHaveAttribute('aria-expanded','false');
})
test('external model, dynamic options and placement axes synchronize',async({page})=>{
 const trigger=page.getByRole('combobox',{name:'Status',exact:true});await page.getByRole('button',{name:'Set published',exact:true}).click();await expect(trigger).toHaveText('Published');
 await page.getByRole('button',{name:'Add review option',exact:true}).click();await page.getByRole('button',{name:'Change alignment',exact:true}).click();await trigger.click();await expect(page.getByRole('listbox',{name:'Status',exact:true})).toHaveAttribute('data-align','end');
 await page.getByRole('option',{name:'In review',exact:true}).click();await expect(page.getByTestId('status-model')).toHaveText('review');
})
test('required validation and inherited fieldset disabled reach the actual trigger',async({page})=>{
 const required=page.getByRole('combobox',{name:'Required plan',exact:true});await page.getByRole('button',{name:'Submit form',exact:true}).click();await expect(required).toBeFocused();await expect(required).toHaveAttribute('aria-invalid','true');await required.click();await page.getByRole('option',{name:'Team',exact:true}).click();await expect(required).not.toHaveAttribute('aria-invalid','true');
 const locked=page.getByRole('combobox',{name:'Access',exact:true});await expect(locked).toBeDisabled();await page.getByRole('button',{name:'Enable fieldset',exact:true}).click();await expect(locked).toBeEnabled();await locked.click();await expect(page.getByRole('listbox',{name:'Access',exact:true})).toBeVisible();await page.keyboard.press('Escape');
})
test('local popup and option styles apply and unmount disposes safely',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.getByRole('combobox',{name:'Local overrides',exact:true}).click();const popup=page.getByRole('listbox',{name:'Local overrides',exact:true});
 await expect(popup.getByRole('option',{name:'Workspace 1',exact:true})).toHaveCSS('border-radius','0px');await expect.poll(async()=> (await popup.boundingBox())!.height).toBeLessThanOrEqual(128);
 await page.keyboard.press('Escape');await page.getByRole('button',{name:'Unmount select',exact:true}).click();await expect(page.locator('#cleanup-options')).toHaveCount(0);await page.getByRole('button',{name:'Mount select',exact:true}).click();await page.getByRole('combobox',{name:'Local overrides',exact:true}).click();await expect(page.getByRole('option',{name:'Workspace 2',exact:true})).toBeVisible();expect(errors).toEqual([]);
})
test('RTL, viewport collisions, dark surfaces and mobile avoid clipping',async({page})=>{
 await page.getByRole('button',{name:'Dark theme',exact:true}).click();await page.setViewportSize({width:390,height:600});await page.getByRole('combobox',{name:'اتجاه من اليمين',exact:true}).click();const rtl=page.getByRole('listbox',{name:'اتجاه من اليمين',exact:true});await expect(rtl).toHaveCSS('direction','rtl');await expect(rtl).toHaveCSS('background-color','oklch(0.205 0 0)');await page.keyboard.press('Escape');
 const trigger=page.getByRole('combobox',{name:'Workspace',exact:true});await trigger.scrollIntoViewIfNeeded();await trigger.click();const popup=page.getByRole('listbox',{name:'Workspace',exact:true});await expect(popup).toHaveAttribute('data-side','top');await expect(popup.getByRole('option',{name:'Workspace 30',exact:true})).toBeAttached();
 await expect.poll(async()=>{const box=(await popup.boundingBox())!;return box.x>=7&&box.y>=7&&box.x+box.width<=383&&box.y+box.height<=593}).toBe(true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
})
test('Select inside a native dialog remains usable and forced colors paint the glyph',async({page})=>{
 await page.getByRole('button',{name:'Open dialog',exact:true}).click();await page.getByRole('combobox',{name:'Team',exact:true}).click();await page.getByRole('option',{name:'Engineering',exact:true}).click();await expect(page.getByRole('combobox',{name:'Team',exact:true})).toHaveText('Engineering');await page.getByRole('button',{name:'Close dialog',exact:true}).click();
 await page.emulateMedia({forcedColors:'active'});await page.getByRole('combobox',{name:'Status',exact:true}).click();await expect(page.getByRole('option',{name:'Draft',exact:true}).locator('svg')).toBeVisible();
})

test('viewport-constrained Workspace list scrolls to its final option and commits it',async({page})=>{
 await page.setViewportSize({width:390,height:600});
 const trigger=page.getByRole('combobox',{name:'Workspace',exact:true});await trigger.scrollIntoViewIfNeeded();await trigger.click();
 const popup=page.getByRole('listbox',{name:'Workspace',exact:true});await expect(popup).toBeVisible();
 const box=(await popup.boundingBox())!;await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.wheel(0,2000);
 const last=popup.getByRole('option',{name:'Workspace 30',exact:true});await expect(last).toBeInViewport({ratio:1});
 await last.click();await expect(trigger).toHaveText('Workspace 30');await expect(trigger).toHaveAttribute('aria-expanded','false');await expect(trigger).toBeFocused();
});
