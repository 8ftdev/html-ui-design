import {test} from 'bun:test';
import {chromium,expect as browserExpect} from '@playwright/test';
const expect=browserExpect.configure({timeout:1000});
import {selectRuntimeSource} from '../../src/interaction/select-source';
import {positionRuntimeSource} from '../../src/interaction/position-source';
const markup=`<form><div data-ui="select-list" data-ui-part="root" data-placeholder="Choose status">
<label for="status">Status</label><select data-ui="select-list" data-ui-part="control" aria-hidden="true" tabindex="-1" name="status" required><option value="">Choose status</option><option value="draft" selected>Draft</option><optgroup label="Other"><option value="blocked" disabled>Blocked</option><option value="published">Published</option><option value="archived">Archived</option></optgroup></select>
<button type="button" id="status" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="choices" popovertarget="choices" data-ui="select-list" data-ui-part="trigger"><span data-ui="select-list" data-ui-part="value"></span></button>
<div role="listbox" id="choices" popover="auto" data-ui="select-list" data-ui-part="popup"><div hidden role="option" data-ui="select-list" data-ui-part="option" class="option-prototype"></div></div></div><button type="reset">Reset</button><button type="submit">Submit</button></form>`;
async function fixture(run:(page:any)=>Promise<void>){
 const browser=await chromium.launch({headless:true});const page=await browser.newPage();
 try{await page.setContent(markup);const code=new Bun.Transpiler({loader:'ts'}).transformSync((positionRuntimeSource+selectRuntimeSource).replace(/^export /gm,'')+`;if(typeof uiSelect==='function')window.controller=uiSelect(document.querySelector('[data-ui-part=root]'));`);await page.addScriptTag({content:code});await run(page)}finally{await browser.close()}
}
test('Select projects options into owned accessible choices and commits native form values',async()=>fixture(async page=>{
 await expect(page.locator('[data-ui-part=value]')).toHaveText('Draft');await page.getByRole('combobox',{name:'Status'}).click();
 await expect(page.getByRole('option',{name:'Published',exact:true})).toBeVisible();await expect(page.getByRole('option',{name:'Blocked',exact:true})).toHaveAttribute('aria-disabled','true');
 await page.getByRole('option',{name:'Published',exact:true}).click();await expect(page.locator('select')).toHaveValue('published');
 expect(await page.locator('form').evaluate((e:HTMLFormElement)=>new FormData(e).get('status'))).toBe('published');await expect(page.getByRole('combobox')).toBeFocused();
 await page.getByRole('button',{name:'Reset',exact:true}).click();await expect(page.locator('[data-ui-part=value]')).toHaveText('Draft');
}));
test('Select keeps focus on the trigger, skips disabled options, cancels and supports typeahead',async()=>fixture(async page=>{
 const trigger=page.getByRole('combobox',{name:'Status'});await trigger.focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowDown');await expect(trigger).toBeFocused();
 const active=await trigger.getAttribute('aria-activedescendant');await expect(page.locator(`[id="${active}"]`)).toContainText('Published');
 await page.keyboard.press('Escape');await expect(page.locator('select')).toHaveValue('draft');await expect(trigger).toHaveAttribute('aria-expanded','false');
 await page.keyboard.press('p');await expect(page.locator('select')).toHaveValue('published');
}));
test('Select reflects dynamic options and recipe styles; disabled fieldsets block activation',async()=>fixture(async page=>{
 await page.locator('select').evaluate((e:HTMLSelectElement)=>e.add(new Option('New status','new')));
 await page.locator('[data-ui-part=option][hidden]').evaluate((e:HTMLElement)=>e.style.color='rgb(255, 0, 0)');await page.getByRole('combobox').click();
 await expect(page.getByRole('option',{name:'New status',exact:true})).toHaveCSS('color','rgb(255, 0, 0)');await page.keyboard.press('Escape');
 await page.evaluate(()=>{const root=document.querySelector('[data-ui-part=root]')!;const set=document.createElement('fieldset');root.before(set);set.append(root);set.disabled=true});
 await expect(page.getByRole('combobox')).toBeDisabled();
}));
test('Select proxies native required validation and releases listeners on dispose',async()=>fixture(async page=>{
 await page.locator('select').evaluate((e:HTMLSelectElement)=>{e.value='';e.dispatchEvent(new Event('change',{bubbles:true}))});
 await page.getByRole('button',{name:'Submit',exact:true}).click();await expect(page.getByRole('combobox')).toHaveAttribute('aria-invalid','true');await expect(page.getByRole('combobox')).toBeFocused();
 await page.evaluate(()=>(window as any).controller.dispose());await page.locator('select').evaluate((e:HTMLSelectElement)=>{e.value='archived';e.dispatchEvent(new Event('change',{bubbles:true}))});
 await expect(page.locator('[data-ui-part=value]')).toHaveText('Choose status');
}));

test('Select preserves explicit validation state and reacts to placement overrides',async()=>fixture(async page=>{
 const trigger=page.getByRole('combobox');await trigger.evaluate((e:HTMLElement)=>e.setAttribute('aria-invalid','true'));
 await page.locator('select').evaluate((e:HTMLSelectElement)=>{e.value='';e.dispatchEvent(new Event('change',{bubbles:true}))});
 await page.getByRole('button',{name:'Submit',exact:true}).click();await trigger.click();await page.getByRole('option',{name:'Published',exact:true}).click();
 await expect(trigger).toHaveAttribute('aria-invalid','true');
 await page.locator('[data-ui-part=root]').evaluate((e:HTMLElement)=>{e.dataset.align='end'});await trigger.click();
 await expect(page.getByRole('listbox',{name:'Status',exact:true})).toHaveAttribute('data-align','end');
}));

test('Select refreshes popup naming when its accessible label changes',async()=>fixture(async page=>{
 const trigger=page.getByRole('combobox');await trigger.evaluate((e:HTMLElement)=>e.setAttribute('aria-label','Updated status'));await trigger.click();await expect(page.getByRole('listbox',{name:'Updated status',exact:true})).toBeVisible();
}));

test('Select follows external Field label text while its popup is open',async()=>fixture(async page=>{
 const trigger=page.getByRole('combobox');await trigger.click();await page.locator('label[for=status]').evaluate((e:HTMLElement)=>e.textContent='Updated field');await expect(page.getByRole('listbox',{name:'Updated field',exact:true})).toBeVisible();
}));
