import {test,expect} from '@playwright/test'

const route='/html-ui-plugin-batch-check'
test.beforeEach(async({page})=>{await page.goto(route);await expect(page.locator('main')).toHaveAttribute('data-ready','true')})

test('native multiline model, validation, readonly, disabled and reset compose with local buttons',async({page})=>{
 const notes=page.getByRole('textbox',{name:'Notes',exact:true})
 await expect(notes).toHaveValue('Initial note')
 await notes.fill('A new note')
 await expect(page.getByTestId('notes-state')).toHaveText('A new note')
 await page.getByRole('button',{name:'Save notes',exact:true}).click()
 await expect(page.getByTestId('save-count')).toHaveText('1')
 await notes.fill('')
 await page.getByRole('button',{name:'Save notes',exact:true}).click()
 await expect(page.getByTestId('save-count')).toHaveText('1')
 expect(await notes.evaluate((el:HTMLTextAreaElement)=>el.validity.valueMissing)).toBe(true)
 await page.getByRole('checkbox',{name:'Read-only notes'}).check()
 await expect(notes).toHaveAttribute('readonly','')
 await notes.focus(); await page.keyboard.type('Ignored')
 await expect(notes).toHaveValue('')
 await page.getByRole('checkbox',{name:'Read-only notes'}).uncheck()
 await page.getByRole('button',{name:'Reset notes'}).click()
 await expect(notes).toHaveValue('Initial note')
 await expect(page.getByTestId('notes-state')).toHaveText('Initial note')
 await page.getByRole('checkbox',{name:'Disable notes'}).check()
 await expect(notes).toBeDisabled()
 await expect(notes).toHaveAttribute('minlength','2')
 await expect(notes).toHaveAttribute('maxlength','100')
 await expect(notes).toHaveAttribute('rows','3')
})

test('label, breadcrumb, alerts and named table preserve native semantics after hydration',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='warning' && /hydration|mismatch/i.test(m.text()))errors.push(m.text())})
 await page.reload();await expect(page.locator('main')).toHaveAttribute('data-ready','true')
 await page.getByText('External native label',{exact:true}).click()
 await expect(page.getByRole('textbox',{name:'External native label'})).toBeFocused()
 const nav=page.getByRole('navigation',{name:'Preview location'})
 await expect(nav.locator('ol>li')).toHaveCount(2)
 await expect(nav.locator('[aria-current=page]')).toHaveText('Contract batches')
 await expect(nav.getByRole('link',{name:'Primitives'})).toHaveAttribute('href','/html-ui-plugin-check')
 const alert=page.getByTestId('normal-alert');await expect(alert).toHaveAttribute('role','alert')
 await expect(alert.locator('[data-ui-part=icon]')).toHaveAttribute('aria-hidden','true')
 await expect(page.getByTestId('title-only-alert').locator('[data-ui-part=icon]')).toBeHidden()
 await expect(page.getByTestId('title-only-alert').locator('[data-ui-part=description]')).toBeHidden()
 const table=page.getByRole('table',{name:'Example invoices'})
 await expect(table.locator('thead>tr')).toHaveCount(1)
 await expect(table.locator('tbody>tr')).toHaveCount(2)
 await expect(table.locator('tfoot>tr')).toHaveCount(1)
 await expect(table.getByRole('columnheader',{name:'Invoice'})).toHaveAttribute('scope','col')
 await expect(table.getByRole('rowheader',{name:'INV-001'})).toHaveAttribute('scope','row')
 expect(errors).toEqual([])
})

test('groups share local button recipes, preserve focus and adapt orientation',async({page,browserName})=>{
 const horizontal=page.getByRole('group',{name:'History actions'})
 await expect(horizontal.getByRole('button')).toHaveCount(3)
 const first=horizontal.getByRole('button',{name:'Undo'}),next=horizontal.getByRole('button',{name:'Redo'})
 expect(await first.evaluate(el=>getComputedStyle(el).borderTopRightRadius)).toBe('0px')
 expect(await next.evaluate(el=>getComputedStyle(el).borderTopLeftRadius)).toBe('0px')
 await first.focus();await page.keyboard.press(browserName==='webkit' ? 'Alt+Tab' : 'Tab');await expect(next).toBeFocused()
 await first.click();await expect(page.getByTestId('save-count')).toHaveText('1')
 const vertical=page.getByRole('group',{name:'View options'})
 expect(await vertical.evaluate(el=>getComputedStyle(el).flexDirection)).toBe('column')
 const a=await vertical.getByRole('button',{name:'Overview'}).boundingBox(),b=await vertical.getByRole('button',{name:'Details'}).boundingBox()
 expect(b!.y).toBeGreaterThan(a!.y)
 const normal=await first.evaluate(el=>getComputedStyle(el).backgroundColor)
 await first.hover();await expect.poll(()=>first.evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(normal)
})

test('theme variants and ratio recipes resolve visually; loading motion respects preference',async({page})=>{
 const badge=page.getByTestId('outline-badge')
 expect(await badge.evaluate(el=>getComputedStyle(el).borderTopColor)).not.toBe('rgba(0, 0, 0, 0)')
 const before=await badge.evaluate(el=>getComputedStyle(el).backgroundColor)
 await page.getByRole('button',{name:'Change badge variant'}).click()
 await expect.poll(()=>badge.evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(before)
 const alert=page.getByTestId('error-alert'),description=alert.locator('[data-ui-part=description]')
 expect(await description.evaluate(el=>getComputedStyle(el).color)).not.toBe(await page.getByTestId('normal-alert').locator('[data-ui-part=description]').evaluate(el=>getComputedStyle(el).color))
 for(const [id,ratio] of [['video-ratio',16/9],['square-ratio',1],['photo-ratio',4/3]] as const){const box=await page.getByTestId(id).boundingBox();expect(box!.width/box!.height).toBeCloseTo(ratio,1)}
 const spinner=page.getByTestId('loading-spinner'),indicator=spinner.locator('[data-ui-part=indicator]'),skeleton=page.getByTestId('loading-skeleton')
 await expect(spinner).toHaveAttribute('role','status');await expect(spinner).toHaveAttribute('aria-label','Loading preview');await expect(skeleton).toHaveAttribute('aria-hidden','true')
 expect(await indicator.evaluate(el=>getComputedStyle(el).animationName)).not.toBe('none')
 await page.emulateMedia({reducedMotion:'reduce'})
 await expect.poll(()=>indicator.evaluate(el=>getComputedStyle(el).animationName)).toBe('none')
 await expect.poll(()=>skeleton.evaluate(el=>getComputedStyle(el).animationName)).toBe('none')
 const bg=await alert.evaluate(el=>getComputedStyle(el).backgroundColor)
 const theme=page.getByRole('button',{name:/Switch to (light|dark) theme/})
 await theme.click();await expect.poll(()=>alert.evaluate(el=>getComputedStyle(el).backgroundColor)).not.toBe(bg)
})

test('mobile page stays within the viewport while table scroll remains local',async({page,browserName})=>{
 await page.setViewportSize({width:375,height:812})
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(375)
 const scroll=page.getByTestId('invoice-table')
 expect(await scroll.evaluate(el=>el.scrollWidth)).toBeGreaterThan(await scroll.evaluate(el=>el.clientWidth))
 await scroll.scrollIntoViewIfNeeded();await scroll.focus();await expect(scroll).toBeFocused();if(browserName==='webkit'){await scroll.hover();await page.mouse.wheel(150,0)}else{await page.keyboard.press('ArrowRight')}
 await expect.poll(()=>scroll.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0)
})

test('icon and title alert has one content row when its optional description is empty',async({page})=>{
 const alert=page.getByTestId('icon-title-only-alert')
 const sizes=await alert.evaluate(el=>{
  const css=getComputedStyle(el),title=el.querySelector('[data-ui-part=title]')!,icon=el.querySelector('[data-ui-part=icon]')!
  return {inner:el.getBoundingClientRect().height-parseFloat(css.paddingTop)-parseFloat(css.paddingBottom)-parseFloat(css.borderTopWidth)-parseFloat(css.borderBottomWidth),content:Math.max(title.getBoundingClientRect().height,icon.getBoundingClientRect().height)}
 })
 expect(sizes.inner).toBeCloseTo(sizes.content,1)
});

test('native lengths and readonly/disabled submission use browser form semantics',async({page})=>{
 const notes=page.getByRole('textbox',{name:'Notes',exact:true})
 await notes.fill('');await notes.pressSequentially('x')
 expect(await notes.evaluate((el:HTMLTextAreaElement)=>el.validity.tooShort)).toBe(true)
 await page.getByRole('checkbox',{name:'Read-only notes'}).check()
 expect(await notes.evaluate((el:HTMLTextAreaElement)=>({validates:el.willValidate,value:new FormData(el.form!).get('notes')}))).toEqual({validates:false,value:'x'})
 await page.getByRole('checkbox',{name:'Read-only notes'}).uncheck()
 await notes.fill('');await notes.pressSequentially('x'.repeat(120))
 expect(await notes.inputValue()).toHaveLength(100)
 await page.getByRole('checkbox',{name:'Disable notes'}).check()
 expect(await notes.evaluate((el:HTMLTextAreaElement)=>new FormData(el.form!).has('notes'))).toBe(false)
});

test('destructive alert and badge text keep readable contrast in both host themes',async({page})=>{
 const ratios=()=>page.evaluate(()=>{
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d')!
  const rgba=(color:string)=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return Array.from(ctx.getImageData(0,0,1,1).data)}
  const mix=(front:number[],back:number[])=>front.slice(0,3).map((v,i)=>v*(front[3]!/255)+back[i]!*(1-front[3]!/255))
  const lum=(rgb:number[])=>rgb.map(v=>{v/=255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[0.2126,0.7152,0.0722][i]!,0)
  const main=rgba(getComputedStyle(document.querySelector('main')!).backgroundColor)
  const alert=document.querySelector('[data-testid="error-alert"]')!,badge=Array.from(document.querySelectorAll('[data-testid="badge-variants"] [data-ui="badge"]')).find(el=>el.textContent==='Destructive')!
  return [alert,alert.querySelector('[data-ui-part="description"]')!,badge].map(el=>{
   const owner=el===badge?badge:alert,bg=mix(rgba(getComputedStyle(owner).backgroundColor),main),fg=mix(rgba(getComputedStyle(el).color),[...bg,255]),a=lum(fg),b=lum(bg)
   return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05)
  })
 })
 await expect.poll(async()=>Math.min(...await ratios())).toBeGreaterThanOrEqual(4.5)
 await page.getByRole('button',{name:'Switch to dark theme',exact:true}).click()
 await expect.poll(async()=>Math.min(...await ratios())).toBeGreaterThanOrEqual(4.5)
});

test('alert icon wrapper is square and centers with the title line',async({page})=>{
 for(const id of ['icon-title-only-alert','normal-alert']){
  const boxes=await page.getByTestId(id).evaluate(el=>{
   const icon=el.querySelector('[data-ui-part="icon"]')!,title=el.querySelector('[data-ui-part="title"]')!,svg=icon.querySelector('svg')!
   const box=icon.getBoundingClientRect(),line=title.getBoundingClientRect(),glyph=svg.getBoundingClientRect()
   return {width:box.width,height:box.height,center:box.y+box.height/2,titleCenter:line.y+line.height/2,glyphCenter:glyph.y+glyph.height/2}
  })
  expect(boxes.width).toBeCloseTo(boxes.height,1)
  expect(boxes.center).toBeCloseTo(boxes.titleCenter,1)
  expect(boxes.glyphCenter).toBeCloseTo(boxes.center,1)
 }
});
