import {test,expect} from '@playwright/test'

test.beforeEach(async ({page})=>{await page.goto('/html-ui-plugin-gallery')})
const card=(page:any,name:string)=>page.locator(`[data-gallery-component="${name}"] [data-gallery-preview]`)

test('native controls match Nova text and switch geometry',async({page})=>{
  await expect(card(page,'input').locator('input')).toHaveCSS('font-weight','400')
  await expect(card(page,'textarea').locator('textarea')).toHaveCSS('font-weight','400')
  const track=card(page,'switch').locator('[data-ui-part="track"]')
  await expect(track).toHaveCSS('width','32px')
  const box=await track.boundingBox();expect(box!.height).toBeCloseTo(18.4,1)
  await expect(card(page,'switch').locator('[data-ui-part="thumb"]')).toHaveCSS('width','16px')
})
test('checkbox and radio retain native selection with a styled indicator',async({page})=>{
  for(const name of ['checkbox','radio']){
    const preview=card(page,name),control=preview.locator('input')
    await expect(control).toHaveCSS('appearance','none')
    await expect(preview.locator('[data-ui-part="indicator"]')).toHaveAttribute('aria-hidden','true')
    await control.check();await expect(control).toBeChecked()
    await expect(preview.locator('[data-ui-part="indicator"]')).toHaveCSS('opacity','1')
  }
})
test('caller width overrides and native select presentation survive generation',async({page})=>{
  await expect(card(page,'skeleton').locator('[data-ui-part="root"]')).toHaveCSS('width','160px')
  await expect(card(page,'native-select').locator('select')).toHaveCSS('appearance','none')
  await expect(card(page,'native-select').locator('[data-ui-part="chevron"]')).toBeVisible()
})


test('neutral preview paints actual icons and dark checked switch surfaces',async({page})=>{
  await page.goto('/html-ui-form-parity')
  const chevron=page.locator('[data-ui-part="chevron"]')
  expect(await chevron.evaluate(e=>getComputedStyle(e).maskImage)).not.toBe('none')
  await page.getByRole('checkbox',{name:'Product updates',exact:true}).check()
  expect(await page.locator('input[name="updates"] + [data-ui-part="indicator"]').evaluate(e=>getComputedStyle(e).maskImage)).not.toBe('none')
  await page.getByRole('button',{name:'Dark theme',exact:true}).click()
  const track=page.locator('input[name="compact"] + [data-ui-part="track"]')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect.poll(async()=>({track:await track.evaluate(e=>getComputedStyle(e).backgroundColor),primary:await page.getByRole('button',{name:'Continue',exact:true}).evaluate(e=>getComputedStyle(e).backgroundColor)})).toEqual({track:'oklch(0.922 0 0)',primary:'oklch(0.922 0 0)'})
})

test('Field connects validation and labels to generated controls; native reset and range fill work',async({page})=>{
  await page.goto('/html-ui-form-parity')
  const email=page.getByRole('textbox',{name:'Email address',exact:true})
  await expect(email).toHaveAttribute('aria-invalid','true')
  await expect(email).toHaveAttribute('aria-describedby','parity-email-error')
  const project=page.getByRole('textbox',{name:'Project',exact:true})
  await expect(project).toHaveAttribute('aria-describedby','parity-help')
  await project.fill('Changed')
  const updates=page.getByRole('checkbox',{name:'Product updates',exact:true});await updates.check()
  await expect(page.getByRole('checkbox',{name:'Inherited disabled',exact:true})).toBeDisabled()
  const range=page.getByRole('slider',{name:/Volume/});await range.focus();await page.keyboard.press('ArrowRight')
  await expect(range).toHaveValue('41')
  expect(await range.evaluate(e=>(e as HTMLElement).style.getPropertyValue('--ui-slider-fill'))).toBe('41%')
  await page.getByRole('button',{name:'Reset form',exact:true}).click()
  await expect(project).toHaveValue('Atlas');await expect(updates).not.toBeChecked();await expect(range).toHaveValue('40')
  await expect.poll(()=>range.evaluate(e=>(e as HTMLElement).style.getPropertyValue('--ui-slider-fill'))).toBe('40%')
  const mixed=page.getByRole('checkbox',{name:'Mixed selection',exact:true});expect(await mixed.evaluate(e=>(e as HTMLInputElement).indeterminate)).toBe(true)
  await mixed.click();expect(await mixed.evaluate(e=>(e as HTMLInputElement).indeterminate)).toBe(false)
  await page.setViewportSize({width:390,height:844})
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

test('forced colors retain native select and binary affordances',async({page})=>{
  await page.emulateMedia({forcedColors:'active'})
  await page.goto('/html-ui-form-parity')
  test.skip(!await page.evaluate(()=>matchMedia('(forced-colors: active)').matches),'Browser does not emulate forced colors')
  await expect(page.getByRole('combobox',{name:'Status',exact:true})).toHaveCSS('appearance','auto')
  await expect(page.locator('[data-ui-part="chevron"]')).toBeHidden()
  const checkbox=page.getByRole('checkbox',{name:'Product updates',exact:true})
  await expect(checkbox).toHaveCSS('appearance','auto')
  await checkbox.check();await expect(checkbox).toBeChecked()
  await expect(page.locator('input[name="compact"] + [data-ui-part="track"]')).toBeHidden()
})
