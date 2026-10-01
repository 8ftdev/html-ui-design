import {test} from 'bun:test';
import {chromium,expect as browserExpect} from '@playwright/test';
import {inlineInteractionRuntimeSource} from '../../src/interaction/runtime-source';
const expect=browserExpect.configure({timeout:1200});
async function fixture(mode:'combobox'|'command',run:(page:any)=>Promise<void>){
 const browser=await chromium.launch({headless:true}),page=await browser.newPage();
 const kind=mode+'-list';
 try{
  await page.setContent(`<form><fieldset><div data-ui="${kind}" data-ui-part="root">
  <label for="search">${mode==='combobox'?'Framework':'Actions'}</label>
  <select data-ui="${kind}" data-ui-part="control" aria-hidden="true" tabindex="-1" ${mode==='combobox'?'name="framework" required':''}><option value="" hidden>Select framework</option><option value="nuxt" selected>Nuxt</option><optgroup label="Others"><option value="disabled" disabled>Next disabled</option><option value="astro" data-keywords="stars">Astro</option><option value="svelte">Svelte</option></optgroup></select>
  <div data-ui="${kind}" data-ui-part="surface"><input id="search" type="text" role="combobox" aria-autocomplete="list" aria-controls="choices" aria-expanded="${mode==='command'}" data-ui="${kind}" data-ui-part="input"></div>
  <div id="choices" role="listbox" ${mode==='combobox'?'popover="auto"':''} data-ui="${kind}" data-ui-part="popup" style="overflow:auto;max-height:100px"><div hidden role="option" data-ui="${kind}" data-ui-part="option" class="prototype" style="padding:6px"></div><div hidden role="status" data-ui="${kind}" data-ui-part="empty">No results found.</div></div>
  </div></fieldset><button type="reset">Reset</button><button type="submit">Submit</button><button type="button">After</button></form>`);
  await page.addScriptTag({content:new Bun.Transpiler({loader:'ts'}).transformSync(inlineInteractionRuntimeSource+`;window.actions=[];if(typeof uiSearch==='function')window.controller=uiSearch(document.querySelector('[data-ui-part=root]'),'${mode}',value=>window.actions.push(value));`)});
  await run(page);
 }finally{await browser.close()}
}
test('Combobox filters visible labels and keywords without changing the native value',()=>fixture('combobox',async page=>{
 const input=page.getByRole('combobox',{name:'Framework'});await input.fill('stars');
 await expect(page.getByRole('option',{name:'Astro',exact:true})).toBeVisible();await expect(page.getByRole('option',{name:'Nuxt',exact:true})).toBeHidden();await expect(page.locator('select')).toHaveValue('nuxt');
 await page.keyboard.press('Enter');await expect(input).toHaveValue('Astro');await expect(input).toHaveAttribute('aria-expanded','false');expect(await page.locator('form').evaluate((e:HTMLFormElement)=>new FormData(e).get('framework'))).toBe('astro');
}));
test('Combobox cancels edits on Escape and Tab without committing the highlight',()=>fixture('combobox',async page=>{
 const input=page.getByRole('combobox');await input.fill('sv');await page.keyboard.press('Escape');await expect(input).toHaveValue('Nuxt');await expect(page.locator('select')).toHaveValue('nuxt');
 await input.fill('astro');await page.keyboard.press('Tab');await expect(input).toHaveValue('Nuxt');await expect(page.locator('select')).toHaveValue('nuxt');await expect(input).not.toBeFocused();
}));
test('Combobox empty state and disabled groups cannot commit values',()=>fixture('combobox',async page=>{
 const input=page.getByRole('combobox');await input.fill('nothing');await expect(page.getByRole('status')).toBeVisible();await expect(input).not.toHaveAttribute('aria-activedescendant',/.+/);await page.keyboard.press('Enter');await expect(page.locator('select')).toHaveValue('nuxt');
 await page.locator('optgroup').evaluate((e:HTMLOptGroupElement)=>e.disabled=true);await input.fill('astro');await expect(page.getByRole('option',{name:'Astro',exact:true})).toHaveAttribute('aria-disabled','true');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await expect(page.locator('select')).toHaveValue('nuxt');
}));
test('Combobox redirects native validation and restores the initial model on form reset',()=>fixture('combobox',async page=>{
 const input=page.getByRole('combobox');await input.fill('astro');await page.keyboard.press('Enter');await page.getByRole('button',{name:'Reset',exact:true}).click();await expect(input).toHaveValue('Nuxt');
 await page.locator('select').evaluate((e:HTMLSelectElement)=>{e.value='';e.dispatchEvent(new Event('change',{bubbles:true}))});await page.getByRole('button',{name:'Submit',exact:true}).click();await expect(input).toBeFocused();await expect(input).toHaveAttribute('aria-invalid','true');
}));
test('Command emits repeated action activation while keeping text editing native',()=>fixture('command',async page=>{
 const input=page.getByRole('combobox',{name:'Actions'});await input.fill('astro');await page.keyboard.press('Enter');await page.keyboard.press('Enter');expect(await page.evaluate(()=>(window as any).actions)).toEqual(['astro','astro']);await expect(input).toHaveValue('astro');
 await input.fill('sv');await page.keyboard.press('Home');expect(await input.evaluate((e:HTMLInputElement)=>e.selectionStart)).toBe(0);await expect(page.getByRole('option',{name:'Svelte',exact:true})).toBeVisible();
}));
test('Search adapters preserve IME and never dispatch an action during composition',()=>fixture('command',async page=>{
 const input=page.getByRole('combobox');await input.fill('astro');await input.evaluate((e:HTMLInputElement)=>{e.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));e.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,isComposing:true}))});expect(await page.evaluate(()=>(window as any).actions)).toEqual([]);await input.evaluate((e:HTMLInputElement)=>e.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true})));await page.keyboard.press('Enter');expect(await page.evaluate(()=>(window as any).actions)).toEqual(['astro']);
}));
test('Search choices inherit prototype overrides and synchronize dynamic options',()=>fixture('combobox',async page=>{
 const input=page.getByRole('combobox');await input.fill('');await page.locator('select').evaluate((e:HTMLSelectElement)=>e.add(new Option('Qwik','qwik')));await page.locator('[data-ui-part=option][hidden]').evaluate((e:HTMLElement)=>e.style.color='rgb(255, 0, 0)');await input.fill('qw');const item=page.getByRole('option',{name:'Qwik',exact:true});await expect(item).toHaveCSS('color','rgb(255, 0, 0)');await item.click();await expect(input).toHaveValue('Qwik');
}));
test('Disabled fieldsets and disposed adapters block further search activation',()=>fixture('combobox',async page=>{
 const input=page.getByRole('combobox');await page.locator('fieldset').evaluate((e:HTMLFieldSetElement)=>e.disabled=true);await expect(input).toBeDisabled();await page.locator('fieldset').evaluate((e:HTMLFieldSetElement)=>e.disabled=false);await expect(input).toBeEnabled();
 await page.evaluate(()=>(window as any).controller.dispose());await input.fill('astro');await expect(input).toHaveAttribute('aria-expanded','false');await expect(page.locator('select')).toHaveValue('nuxt');
}));
test('External committed values reset the query and restore the full option list',()=>fixture('combobox',async page=>{
 const input=page.getByRole('combobox');await input.fill('astro');await page.locator('select').evaluate((e:HTMLSelectElement)=>{e.value='svelte';e.dispatchEvent(new Event('change',{bubbles:true}))});await expect(input).toHaveValue('Svelte');await expect(page.getByRole('option',{name:'Nuxt',exact:true})).toBeVisible();await page.keyboard.press('Enter');await expect(page.locator('select')).toHaveValue('svelte');
}));
test('Combobox popup matches the complete input surface rather than its inner text field',()=>fixture('combobox',async page=>{
 await page.locator('[data-ui-part=surface]').evaluate((e:HTMLElement)=>{e.style.width='400px';e.style.display='flex';const icon=document.createElement('span');icon.style.width='40px';e.append(icon);(e.querySelector('input') as HTMLElement).style.width='360px'});
 await page.getByRole('combobox').click();await expect.poll(async()=> (await page.locator('[data-ui-part=popup]').boundingBox())!.width).toBeCloseTo(400,0);
}));
for(const mode of ['combobox','command'] as const)test(`${mode} follows native disabled state when relocated between fieldsets`,()=>fixture(mode,async page=>{
 const input=page.getByRole('combobox');await page.locator('fieldset').evaluate((e:HTMLFieldSetElement)=>e.disabled=true);await expect(input).toBeDisabled();await page.locator('[data-ui-part=root]').evaluate((e:HTMLElement)=>{const other=document.createElement('fieldset');e.closest('fieldset')!.after(other);other.append(e)});await expect(input).toBeEnabled();
}));
test('Search popup naming follows a reassociated external label',()=>fixture('combobox',async page=>{
 await page.locator('form').evaluate((e:HTMLFormElement)=>{const label=document.createElement('label');label.htmlFor='replacement';label.textContent='Replacement';e.append(label)});await page.locator('input').evaluate((e:HTMLInputElement)=>e.id='replacement');const input=page.getByRole('combobox',{name:'Replacement'});await input.click();await expect(page.getByRole('listbox')).toHaveAttribute('aria-label','Replacement');await page.getByText('Replacement',{exact:true}).evaluate((e:HTMLElement)=>e.textContent='Changed name');await expect(page.getByRole('listbox')).toHaveAttribute('aria-label','Changed name');
}));
test('Reopening Combobox keeps the committed option active before further typing',()=>fixture('combobox',async page=>{
 const input=page.getByRole('combobox');await input.fill('astro');await page.keyboard.press('Enter');await page.getByRole('button',{name:'After',exact:true}).click();await input.click();const active=await input.getAttribute('aria-activedescendant');await expect(page.locator('[id="'+active+'"]')).toHaveText('Astro');await page.keyboard.press('Enter');await expect(page.locator('select')).toHaveValue('astro');
}));
