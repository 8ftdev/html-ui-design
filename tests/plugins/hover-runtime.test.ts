import {afterAll,beforeAll,test} from 'bun:test';
import {chromium,expect as browserExpect,type Browser,type Page} from '@playwright/test';
import {inlineInteractionRuntimeSource} from '../../src/interaction/runtime-source';
const expect=browserExpect.configure({timeout:1200});let browser:Browser;
beforeAll(async()=>{browser=await chromium.launch()});afterAll(async()=>{await browser?.close()});
async function fixture(kind:'tooltip'|'hover-card',run:(page:Page)=>Promise<void>,options:Record<string,unknown>={}){
 const page=await browser.newPage({viewport:{width:500,height:400},hasTouch:true}),ui=kind==='tooltip'?'tooltip':'preview-card',part=kind==='tooltip'?'tooltip':'popup';
 try{
 await page.setContent(`<style>body{margin:0}fieldset{border:0;padding:0;margin:0}#clip{position:absolute;left:100px;top:110px;width:80px;height:36px;overflow:hidden}#trigger{width:80px;height:30px}#tip{overflow:visible;box-sizing:border-box;width:180px;height:70px;margin:0;border:0;padding:8px;background:white}#after{position:absolute;top:320px}</style><fieldset><div id="clip"><div data-ui="${ui}" data-ui-part="root"><button id="trigger" type="button" data-ui="${ui}" data-ui-part="trigger" ${kind==='tooltip'?'aria-describedby="tip"':'popovertarget="tip"'}>Explain</button><div id="tip" data-ui="${ui}" data-ui-part="${part}" ${kind==='tooltip'?'role="tooltip" hidden':'popover="auto"'}>${kind==='tooltip'?'Helpful description':'<p>Preview details</p><a href="#profile">View profile</a>'}</div></div></div></fieldset><button id="after">After</button>`);
 await page.addScriptTag({content:new Bun.Transpiler({loader:'ts'}).transformSync(inlineInteractionRuntimeSource+`;window.controller=typeof uiHover==='function'?uiHover(document.querySelector('[data-ui-part=root]'),${JSON.stringify(kind)},${JSON.stringify(options)}):{dispose:uiInteraction(document.querySelector('[data-ui-part=root]'),${JSON.stringify(kind)}),sync:()=>{}};`)});
 await run(page);
 }finally{await page.close()}
}
const visible=(page:Page)=>page.locator('#tip');
const enter=(page:Page,node='#trigger',pointerType='mouse')=>page.locator(node).dispatchEvent('pointerenter',{pointerType});
const leave=(page:Page,node='#trigger')=>page.locator(node).dispatchEvent('pointerleave',{pointerType:'mouse'});
test('Tooltip opens in the top layer outside a clipping wrapper and stays anchored',()=>fixture('tooltip',async page=>{
 await page.locator('#trigger').focus();await expect(visible(page)).toBeVisible();await expect(visible(page)).toHaveAttribute('popover','manual');
 await expect.poll(async()=>page.locator('#tip').evaluate((e:HTMLElement)=>e.getBoundingClientRect().bottom)).toBe(106);
 await expect(page.locator('#trigger')).toBeFocused();await expect(page.locator('#trigger')).toHaveAttribute('aria-describedby','tip');
 await page.locator('#clip').evaluate((e:HTMLElement)=>{e.style.top='160px';window.dispatchEvent(new Event('resize'))});await expect.poll(async()=>page.locator('#tip').evaluate((e:HTMLElement)=>e.getBoundingClientRect().bottom)).toBe(156);
}));
test('Tooltip pointer intent cancels a pending opening when the pointer leaves',()=>fixture('tooltip',async page=>{
 await enter(page);await expect(visible(page)).toBeHidden();await leave(page);await page.waitForTimeout(130);await expect(visible(page)).toBeHidden();await enter(page);await expect(visible(page)).toBeVisible();
},{openDelay:100}));
test('Tooltip close grace allows crossing the popup gap and re-entering',()=>fixture('tooltip',async page=>{
 await enter(page);await expect(visible(page)).toBeVisible();await leave(page);await enter(page,'#tip');await page.waitForTimeout(240);await expect(visible(page)).toBeVisible();await leave(page,'#tip');await expect(visible(page)).toBeHidden();
},{closeDelay:180}));
test('Escape latches Tooltip dismissal until a new interaction without moving focus',()=>fixture('tooltip',async page=>{
 await page.locator('#trigger').focus();await expect(visible(page)).toBeVisible();await page.keyboard.press('Escape');await expect(visible(page)).toBeHidden();await expect(page.locator('#trigger')).toBeFocused();await page.evaluate(()=>window.dispatchEvent(new Event('resize')));await expect(visible(page)).toBeHidden();await page.locator('#after').focus();await page.locator('#trigger').focus();await expect(visible(page)).toBeVisible();
}));
test('HoverCard has delayed hover and immediate keyboard focus without stealing focus',()=>fixture('hover-card',async page=>{
 await enter(page);await expect(visible(page)).toBeHidden();await expect(visible(page)).toBeVisible();await leave(page);await expect(visible(page)).toBeHidden();await page.locator('#trigger').focus();await expect(visible(page)).toBeVisible();await expect(page.locator('#trigger')).toBeFocused();await expect(page.locator('#trigger')).toHaveAttribute('aria-expanded','true');
},{openDelay:100,closeDelay:50}));
test('HoverCard preserves focus within content and returns it on Escape',()=>fixture('hover-card',async page=>{
 await page.locator('#trigger').focus();await expect(visible(page)).toBeVisible();await page.getByRole('link',{name:'View profile'}).focus();await page.waitForTimeout(100);await expect(visible(page)).toBeVisible();await page.keyboard.press('Escape');await expect(visible(page)).toBeHidden();await expect(page.locator('#trigger')).toBeFocused();await page.waitForTimeout(50);await expect(visible(page)).toBeHidden();
},{closeDelay:30}));
test('Touch hover does not open HoverCard while native click remains available',()=>fixture('hover-card',async page=>{
 await enter(page,'#trigger','touch');await page.waitForTimeout(80);await expect(visible(page)).toBeHidden();await page.locator('#trigger').tap();await expect(visible(page)).toBeVisible();await page.locator('#after').click();await expect(visible(page)).toBeHidden();
},{openDelay:0}));
for(const kind of ['tooltip','hover-card'] as const)test(`${kind} follows disabled fieldset and relocated inert ancestry`,()=>fixture(kind,async page=>{
 await page.locator('#trigger').focus();await expect(visible(page)).toBeVisible();await page.locator('fieldset').evaluate((e:HTMLFieldSetElement)=>e.disabled=true);await expect(visible(page)).toBeHidden();
 await enter(page);await expect(visible(page)).toBeHidden();await page.locator('#clip').evaluate((e:HTMLElement)=>{document.body.append(e);e.inert=true});await enter(page);await expect(visible(page)).toBeHidden();await page.locator('#clip').evaluate((e:HTMLElement)=>e.inert=false);await enter(page);await expect(visible(page)).toBeVisible();
},{openDelay:0}));
test('Disposal cancels pending hover and restores Tooltip attributes and geometry',()=>fixture('tooltip',async page=>{
 await enter(page);await page.evaluate(()=>(window as any).controller.dispose());await page.waitForTimeout(120);await expect(visible(page)).toBeHidden();await expect(visible(page)).not.toHaveAttribute('popover');await expect(visible(page)).not.toHaveAttribute('data-side');await expect.poll(async()=>page.locator('#tip').evaluate((e:HTMLElement)=>e.style.position)).toBe('');await page.locator('#trigger').focus();await expect(visible(page)).toBeHidden();
},{openDelay:80}));
test('Changing placement preserves an open popup and caller inline style edits',()=>fixture('tooltip',async page=>{
 await page.locator('#trigger').focus();await expect(visible(page)).toBeVisible();await page.evaluate(()=>(window as any).controller.sync({side:'bottom',align:'end',sideOffset:8}));await expect.poll(async()=>page.locator('#tip').evaluate((e:HTMLElement)=>e.getBoundingClientRect().top)).toBe(148);
 await page.locator('#tip').evaluate((e:HTMLElement)=>e.style.setProperty('color','rgb(255, 0, 0)','important'));await page.evaluate(()=>(window as any).controller.dispose());await expect(visible(page)).toHaveCSS('color','rgb(255, 0, 0)');
}));
for(const kind of ['tooltip','hover-card'] as const)test(`${kind} closes after keyboard focus leaves the root`,()=>fixture(kind,async page=>{
 await page.locator('#trigger').focus();await expect(visible(page)).toBeVisible();await page.locator('#after').focus();await expect(visible(page)).toBeHidden();
},{closeDelay:20}));
test('Tooltip disposal preserves a caller change to its hidden property',()=>fixture('tooltip',async page=>{
 await page.locator('#tip').evaluate((e:HTMLElement)=>e.hidden=false);await page.evaluate(()=>(window as any).controller.dispose());await expect(page.locator('#tip')).not.toHaveAttribute('hidden');
}));
test('HoverCard disposal preserves a caller change to expanded ARIA',()=>fixture('hover-card',async page=>{
 await page.locator('#trigger').evaluate((e:HTMLElement)=>e.setAttribute('aria-expanded','true'));await page.evaluate(()=>(window as any).controller.dispose());await expect(page.locator('#trigger')).toHaveAttribute('aria-expanded','true');
}));
test('HoverCard keeps its controls relationship current after a reactive popup ID change',()=>fixture('hover-card',async page=>{
 await page.locator('#tip').evaluate((e:HTMLElement)=>e.id='renamed-preview');await page.locator('#trigger').evaluate((e:HTMLElement)=>e.setAttribute('popovertarget','renamed-preview'));await page.evaluate(()=>(window as any).controller.sync({}));await expect(page.locator('#trigger')).toHaveAttribute('aria-controls','renamed-preview');
 await page.locator('#trigger').evaluate((e:HTMLElement)=>e.setAttribute('aria-controls','caller-control'));await page.evaluate(()=>(window as any).controller.sync({}));await expect(page.locator('#trigger')).toHaveAttribute('aria-controls','caller-control');await page.evaluate(()=>(window as any).controller.dispose());await expect(page.locator('#trigger')).toHaveAttribute('aria-controls','caller-control');
}));
test('Long Tooltip descriptions scroll within the bounded popup while short descriptions retain an exterior arrow',()=>fixture('tooltip',async page=>{
 await page.locator('#tip').evaluate((e:HTMLElement)=>{e.innerHTML=Array.from({length:30},(_,i)=>'<p>Supplementary description '+i+'</p>').join('')});await page.locator('#trigger').focus();await expect(visible(page)).toBeVisible();await expect(visible(page)).toHaveCSS('overflow-y','auto');await visible(page).hover();await page.mouse.wheel(0,1000);await expect.poll(async()=>visible(page).evaluate((e:HTMLElement)=>e.scrollTop)).toBeGreaterThan(0);
 await visible(page).evaluate((e:HTMLElement)=>{e.textContent='Short description';e.dispatchEvent(new Event('resize'))});await expect(visible(page)).toHaveCSS('overflow-y','visible');
}));
