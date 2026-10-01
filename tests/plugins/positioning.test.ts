import { afterAll, beforeAll, expect, test } from 'bun:test';
import { chromium, type Browser, type Page } from '@playwright/test';
import { positionRuntimeSource } from '../../src/interaction/position-source';

const transpiler = new Bun.Transpiler({ loader: 'ts' });
const script = transpiler.transformSync(positionRuntimeSource.replace(/^export /gm, '')) + '\nwindow.uiPosition = uiPosition;';
let browser: Browser;
beforeAll(async () => { browser = await chromium.launch(); });
afterAll(async () => { await browser?.close(); });

async function fixture(triggerStyle = 'left:100px;top:100px;width:100px;height:30px', popupStyle = 'width:180px;height:100px', direction = 'ltr') {
  const page = await browser.newPage({ viewport: { width: 500, height: 400 } });
  await page.setContent(`<style>body{margin:0;direction:${direction}}#trigger{position:absolute;${triggerStyle}}#popup{box-sizing:border-box;border:0;padding:0;${popupStyle}}</style><button id="trigger">Open</button><div id="popup" popover="manual">Popup</div>`);
  await page.addScriptTag({ content: script });
  return page;
}
async function position(page: Page, options = {}) {
  await page.evaluate(options => {
    const w = window as any;
    w.dispose = w.uiPosition(document.querySelector('#trigger'), document.querySelector('#popup'), options);
    (document.querySelector('#popup') as HTMLElement).showPopover();
  }, options);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function rect(page: Page) {
  return page.evaluate(() => {
    const popup = document.querySelector('#popup') as HTMLElement;
    const { left, right, top, bottom, width, height } = popup.getBoundingClientRect();
    return { left, right, top, bottom, width, height, side: popup.dataset.side, align: popup.dataset.align, anchor: popup.style.getPropertyValue('--ui-anchor-width'), available: popup.style.getPropertyValue('--ui-available-height') };
  });
}

test('places a top-layer popover below its trigger without CSS anchors', async () => {
  const page = await fixture();
  try {
    await position(page, { gap: 6 });
    expect(await rect(page)).toMatchObject({ left: 100, top: 136, width: 180, side: 'bottom', align: 'start', anchor: '100px' });
  } finally { await page.close(); }
});

test('flips at the bottom edge and clamps an oversized popup inside viewport padding', async () => {
  const page = await fixture('left:460px;top:350px;width:30px;height:30px', 'width:700px;height:500px');
  try {
    await position(page, { padding: 10, gap: 5 });
    const box = await rect(page);
    expect(box.side).toBe('top');
    expect(box.left).toBe(10);
    expect(box.right).toBeLessThanOrEqual(490);
    expect(box.top).toBeGreaterThanOrEqual(10);
    expect(box.bottom).toBe(345);
    expect(box.available).toBe('335px');
  } finally { await page.close(); }
});

test('aligns start and end logically in RTL and optionally matches trigger width', async () => {
  const page = await fixture('left:200px;top:100px;width:100px;height:30px', 'width:60px;height:100px', 'rtl');
  try {
    await position(page, { align: 'start' });
    expect((await rect(page)).left).toBe(240);
    await page.evaluate(() => (window as any).dispose());
    await page.evaluate(() => (document.querySelector('#popup') as HTMLElement).hidePopover());
    await position(page, { align: 'end', matchWidth: true });
    expect(await rect(page)).toMatchObject({ left: 200, width: 100, align: 'end' });
  } finally { await page.close(); }
});

test('updates after scrolling, resizing, reopening and trigger resizing', async () => {
  const page = await fixture();
  try {
    await page.evaluate(() => { document.body.style.height = '1400px'; });
    await position(page);
    await page.evaluate(() => window.scrollTo(0, 40));
    await page.waitForFunction(() => (document.querySelector('#popup') as HTMLElement).getBoundingClientRect().top === 94);
    await page.evaluate(() => { (document.querySelector('#trigger') as HTMLElement).style.height = '60px'; });
    await page.waitForFunction(() => (document.querySelector('#popup') as HTMLElement).getBoundingClientRect().top === 124);
    await page.evaluate(() => { (document.querySelector('#popup') as HTMLElement).hidePopover(); (document.querySelector('#trigger') as HTMLElement).style.left = '440px'; });
    await page.setViewportSize({ width: 400, height: 300 });
    await page.evaluate(() => { (document.querySelector('#popup') as HTMLElement).showPopover(); });
    await page.waitForFunction(() => (document.querySelector('#popup') as HTMLElement).getBoundingClientRect().right === 392);
    expect((await rect(page)).right).toBe(392);
  } finally { await page.close(); }
});

test('disposal restores prior values and priorities while preserving caller changes', async () => {
  const page = await fixture();
  try {
    await page.evaluate(() => {
      const popup = document.querySelector('#popup') as HTMLElement;
      popup.style.setProperty('left', '42px', 'important');
      popup.style.setProperty('margin', '7px', 'important');
      popup.dataset.side = 'original';
      popup.dataset.align = 'original-align';
    });
    await position(page);
    await page.evaluate(() => {
      const popup = document.querySelector('#popup') as HTMLElement;
      popup.style.setProperty('top', '55px', 'important');
      popup.style.setProperty('--ui-anchor-width', 'caller');
      popup.dataset.align = 'caller-align';
      (window as any).dispose();
      (window as any).dispose();
    });
    expect(await page.evaluate(() => {
      const popup = document.querySelector('#popup') as HTMLElement;
      return { left: popup.style.left, leftPriority: popup.style.getPropertyPriority('left'), margin: popup.style.margin, marginPriority: popup.style.getPropertyPriority('margin'), top: popup.style.top, topPriority: popup.style.getPropertyPriority('top'), anchor: popup.style.getPropertyValue('--ui-anchor-width'), side: popup.dataset.side, align: popup.dataset.align, position: popup.style.position };
    })).toEqual({ left: '42px', leftPriority: 'important', margin: '7px', marginPriority: 'important', top: '55px', topPriority: 'important', anchor: 'caller', side: 'original', align: 'caller-align', position: '' });
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
    expect(await page.$eval('#popup', node => (node as HTMLElement).style.top)).toBe('55px');
  } finally { await page.close(); }
});


test('uses the visual viewport after pinch zoom and grows again when space returns', async () => {
  const page = await fixture('left:200px;top:140px;width:50px;height:30px', 'width:180px;height:250px');
  try {
    await position(page);
    const client = await page.context().newCDPSession(page);
    await client.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 });
    await page.waitForFunction(() => (document.querySelector('#popup') as HTMLElement).getBoundingClientRect().right === 242);
    const zoomed = await rect(page);
    expect(zoomed.left).toBe(62);
    expect(zoomed.top).toBe(8);
    expect(zoomed.bottom).toBe(136);
    expect(zoomed.side).toBe('top');
    await client.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
    await page.waitForFunction(() => (document.querySelector('#popup') as HTMLElement).getBoundingClientRect().right === 380);
    const restored = await rect(page);
    expect(restored.side).toBe('bottom');
    expect(restored.top).toBe(174);
    expect(restored.height).toBe(218);
  } finally { await page.close(); }
});

test('supports a requested top side and centered alignment, flipping when top space is tight', async () => {
  const page = await fixture('left:100px;top:100px;width:100px;height:30px', 'width:180px;height:50px');
  try {
    await position(page, { side: 'top', align: 'center' });
    expect(await rect(page)).toMatchObject({ top: 46, left: 60, side: 'top', align: 'center' });
    await page.evaluate(() => { (document.querySelector('#trigger') as HTMLElement).style.top = '15px'; window.dispatchEvent(new Event('resize')); });
    await page.waitForFunction(() => (document.querySelector('#popup') as HTMLElement).dataset.side === 'bottom');
    expect((await rect(page)).top).toBe(49);
  } finally { await page.close(); }
});

test('settles after resize and leaves closed popovers and caller edits alone', async () => {
  const page = await fixture();
  try {
    await position(page);
    await page.evaluate(() => { (document.querySelector('#popup') as HTMLElement).style.height = '160px'; });
    await page.waitForFunction(() => (document.querySelector('#popup') as HTMLElement).getBoundingClientRect().height === 160);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const writes = await page.evaluate(async () => {
      let changes = 0;
      const observer = new MutationObserver(records => { changes += records.length; });
      observer.observe(document.querySelector('#popup')!, { attributes: true });
      for (let index = 0; index < 8; index++) await new Promise(resolve => requestAnimationFrame(resolve));
      observer.disconnect(); return changes;
    });
    expect(writes).toBe(0);
    await page.evaluate(() => {
      const popup = document.querySelector('#popup') as HTMLElement;
      popup.style.top = '55px'; popup.dataset.side = 'caller';
      window.dispatchEvent(new Event('resize'));
    });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    expect(await page.$eval('#popup', node => ({ top: (node as HTMLElement).style.top, side: (node as HTMLElement).dataset.side }))).toEqual({ top: '55px', side: 'caller' });
    await page.evaluate(() => { (document.querySelector('#popup') as HTMLElement).hidePopover(); });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const before = await page.$eval('#popup', node => node.getAttribute('style'));
    await page.evaluate(() => { (document.querySelector('#trigger') as HTMLElement).style.width = '200px'; window.dispatchEvent(new Event('resize')); document.dispatchEvent(new Event('scroll')); });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    expect(await page.$eval('#popup', node => node.getAttribute('style'))).toBe(before);
  } finally { await page.close(); }
});

test('respects caller popup size caps present before mounting',async()=>{
 const page=await fixture();try{
 await page.locator('#popup').evaluate((e:HTMLElement)=>{e.style.maxHeight='60px';e.style.maxWidth='120px';e.style.minWidth='90px'});
 await position(page);const box=await rect(page);expect(box.height).toBeLessThanOrEqual(60);expect(box.width).toBeLessThanOrEqual(120);
 }finally{await page.close()}
});

test('retains recipe minimum width when matching a narrower trigger',async()=>{
 const page=await fixture('left:100px;top:100px;width:100px;height:30px','width:auto;min-width:144px;height:100px');try{await position(page,{matchWidth:true});expect((await rect(page)).width).toBeGreaterThanOrEqual(144)}finally{await page.close()}
});

test('keeps the popup scroll position through internal scrolling and viewport measurement', async () => {
 const page=await fixture('left:100px;top:100px;width:100px;height:30px','width:180px;overflow:auto');
 try {
  await page.locator('#popup').evaluate((e:HTMLElement)=>{const content=document.createElement('div');content.style.height='1000px';content.textContent='Long list';e.append(content)});
  await position(page);
  await page.locator('#popup').evaluate((e:HTMLElement)=>e.scrollTop=200);
  await page.evaluate(async()=>{for(let i=0;i<6;i++)await new Promise(resolve=>requestAnimationFrame(resolve))});
  expect(await page.locator('#popup').evaluate((e:HTMLElement)=>e.scrollTop)).toBe(200);
  await page.evaluate(()=>window.dispatchEvent(new Event('resize')));
  await page.evaluate(async()=>{for(let i=0;i<6;i++)await new Promise(resolve=>requestAnimationFrame(resolve))});
  expect(await page.locator('#popup').evaluate((e:HTMLElement)=>e.scrollTop)).toBe(200);
  const writes=await page.evaluate(async()=>{let writes=0;const observer=new MutationObserver(records=>writes+=records.length);observer.observe(document.querySelector('#popup')!,{attributes:true});for(let i=0;i<6;i++)await new Promise(resolve=>requestAnimationFrame(resolve));observer.disconnect();return writes});
  expect(writes).toBe(0);
 }finally{await page.close()}
});

test('places and flips horizontal sides while constraining width to the available space',async()=>{
 const page=await fixture('left:220px;top:150px;width:60px;height:30px','width:180px;height:70px');
 try{
 await position(page,{side:'left',align:'center',gap:6});expect(await rect(page)).toMatchObject({left:34,top:130,side:'left'});
 await page.locator('#trigger').evaluate((e:HTMLElement)=>{e.style.left='15px';window.dispatchEvent(new Event('resize'))});await page.waitForFunction(()=>document.querySelector<HTMLElement>('#popup')!.dataset.side==='right');expect((await rect(page)).left).toBe(81);
 await page.evaluate(()=>(window as any).dispose());await page.locator('#popup').evaluate((e:HTMLElement)=>e.hidePopover());
 await page.locator('#trigger').evaluate((e:HTMLElement)=>e.style.left='240px');await page.locator('#popup').evaluate((e:HTMLElement)=>e.style.width='700px');await position(page,{side:'right',align:'end',gap:6});const box=await rect(page);expect(box.side).toBe('left');expect(box.left).toBeGreaterThanOrEqual(8);expect(box.right).toBe(234);expect(box.bottom).toBe(180);
 }finally{await page.close()}
});
