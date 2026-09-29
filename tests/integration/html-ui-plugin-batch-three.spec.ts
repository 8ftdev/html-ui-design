import {test,expect} from '@playwright/test'
const route='/html-ui-plugin-batch-three-check'
test.beforeEach(async({page})=>{await page.goto(route,{waitUntil:'domcontentloaded'});await expect(page.locator('main')).toHaveAttribute('data-ready','true')})

test('native radios share names, arrow selection, submission and reset',async({page})=>{
 const first=page.getByRole('radio',{name:'Email delivery'}),second=page.getByRole('radio',{name:'Text message'})
 await expect(page.getByRole('group',{name:'Delivery method'})).toBeVisible()
 await expect(first).toBeChecked();await expect(first).toHaveAttribute('name','delivery');await expect(second).toHaveAttribute('name','delivery')
 await first.focus();await page.keyboard.press('ArrowDown');await expect(second).toBeChecked();await expect(first).not.toBeChecked();await expect(second).toBeFocused();await expect(page.getByTestId('delivery-state')).toHaveText('sms')
 await page.getByRole('button',{name:'Save preferences'}).click();expect(JSON.parse(await page.getByTestId('submission').innerText())).toEqual({email:'demo@example.com',delivery:'sms',volume:'40'})
 await page.getByRole('button',{name:'Reset preferences'}).click();await expect(first).toBeChecked();await expect(second).not.toBeChecked();await expect(page.getByTestId('delivery-state')).toHaveText('email')
})
test('range numeric model, bounds, keyboard steps and reset stay native',async({page})=>{
 const range=page.getByRole('slider',{name:'Notification volume'})
 await expect(range).toHaveValue('40');await range.focus();await page.keyboard.press('ArrowRight');await expect(range).toHaveValue('50');await expect(page.getByTestId('volume-state')).toHaveText('50')
 await page.getByRole('button',{name:'Test upper bound'}).click();await expect(range).toHaveValue('100');await expect(page.getByTestId('volume-state')).toHaveText('100')
 await page.getByRole('button',{name:'Reset preferences'}).click();await expect(range).toHaveValue('40');await expect(page.getByTestId('volume-state')).toHaveText('40')
})
test('input group label, interactive addons, constraints, readonly and disabled submission',async({page})=>{
 const input=page.getByRole('textbox',{name:'Email address'}),group=page.getByTestId('email-group')
 await group.locator('label').click();await expect(input).toBeFocused();expect(await group.locator('label button').count()).toBe(0)
 await page.getByRole('button',{name:'Clear',exact:true}).click();await expect(input).toHaveValue('');expect(await input.evaluate((el:HTMLInputElement)=>el.validity.valueMissing)).toBe(true)
 await input.fill('invalid');expect(await input.evaluate((el:HTMLInputElement)=>el.validity.typeMismatch)).toBe(true)
 await input.fill('new@example.com');await page.getByRole('checkbox',{name:'Read-only email'}).check();await expect(input).toHaveAttribute('readonly','');await expect(page.getByRole('button',{name:'Clear',exact:true})).toBeDisabled()
 expect(await input.evaluate((el:HTMLInputElement)=>({validates:el.willValidate,value:new FormData(el.form!).get('email')}))).toEqual({validates:false,value:'new@example.com'})
 await page.getByRole('checkbox',{name:'Disable form controls'}).check();await expect(input).toBeDisabled();await expect(page.getByRole('radio',{name:'Email delivery'})).toBeDisabled();await expect(page.getByRole('slider')).toBeDisabled()
 expect(await page.getByTestId('preferences-form').evaluate((el:HTMLFormElement)=>Array.from(new FormData(el).keys()))).toEqual([])
})
test('content slots, hidden optional parts, item variants and keyboard display are real local anatomy',async({page})=>{
 await expect(page.getByTestId('empty-state').getByRole('heading',{name:'No saved reports'})).toBeVisible();await expect(page.getByRole('button',{name:'Create report'})).toBeVisible()
 for(const part of ['media','description','content'])await expect(page.getByTestId('minimal-empty').locator(`[data-ui-part=${part}]`)).toBeHidden()
 for(const part of ['media','description','actions'])await expect(page.getByTestId('minimal-item').locator(`[data-ui-part=${part}]`)).toBeHidden()
 const item=page.getByTestId('content-item');const before=await item.evaluate(el=>getComputedStyle(el).backgroundColor)
 await page.getByRole('button',{name:'Change item style'}).click();await expect.poll(()=>item.evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(before)
 await expect(page.locator('kbd')).toHaveCount(2);expect(await page.locator('kbd').first().evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)')
})
test('native direction and semantic typography remain themed and keyboard accessible',async({page})=>{
 const direction=page.getByTestId('direction'),prose=page.getByTestId('prose');await expect(direction).toHaveAttribute('dir','ltr')
 await page.getByRole('button',{name:'Toggle writing direction'}).click();await expect(direction).toHaveAttribute('dir','rtl');expect(await prose.evaluate(el=>getComputedStyle(el).direction)).toBe('rtl')
 expect(await prose.locator('h3').evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThan(await prose.locator('p').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize)))
 const link=prose.getByRole('link');await link.focus();await expect(link).toBeFocused()
 const color=await prose.evaluate(el=>getComputedStyle(el).color);await page.getByRole('button',{name:'Switch to dark theme'}).click();await expect.poll(()=>prose.evaluate(el=>getComputedStyle(el).color)).not.toBe(color)
})
test('pagination links preserve destinations/current page and mobile layout stays local',async({page})=>{
 const nav=page.getByRole('navigation',{name:'Report pages'});await expect(nav.locator('ul>li')).toHaveCount(4);await expect(nav.locator('[aria-current=page]')).toHaveText('1')
 const next=nav.getByRole('link',{name:'Next'});await expect(next).toHaveAttribute('href','#page-4');await next.focus();await expect(next).toBeFocused();await next.click();await expect(page).toHaveURL(/#page-4$/)
 await page.setViewportSize({width:375,height:812});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(375)
 const group=await page.getByTestId('email-group').boundingBox();expect(group!.width).toBeLessThanOrEqual(327)
})
test('generated controls hydrate without browser errors or Vue mismatch warnings',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning'&&/hydration|mismatch/i.test(m.text()))errors.push(m.text())});await page.reload({waitUntil:'domcontentloaded'});await expect(page.locator('main')).toHaveAttribute('data-ready','true');await expect(page.getByRole('radio',{name:'Email delivery'})).toBeChecked();expect(errors).toEqual([])
})

test('item image media stays inside its box instead of overlapping adjacent content',async({page})=>{
 await expect.poll(()=>page.getByTestId('image-item').locator('img').evaluate((el:HTMLImageElement)=>el.complete&&el.naturalHeight>0)).toBe(true)
 const boxes=await page.getByTestId('image-item').evaluate(el=>{
  const media=el.querySelector('[data-ui-part=media]')!,image=media.querySelector('img')!,m=media.getBoundingClientRect(),i=image.getBoundingClientRect()
  return {mediaWidth:m.width,mediaHeight:m.height,imageWidth:i.width,imageHeight:i.height,mediaBottom:m.bottom,imageBottom:i.bottom}
 })
 expect(boxes.imageWidth).toBeLessThanOrEqual(boxes.mediaWidth);expect(boxes.imageHeight).toBeLessThanOrEqual(boxes.mediaHeight);expect(boxes.imageBottom).toBeLessThanOrEqual(boxes.mediaBottom)
})
