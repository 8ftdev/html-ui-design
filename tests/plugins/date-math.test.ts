import {test,expect} from 'bun:test';
import {inlineInteractionRuntimeSource} from '../../src/interaction/runtime-source';
const js=new Bun.Transpiler({loader:'ts'}).transformSync(inlineInteractionRuntimeSource);
const math=new Function(js+';return {parse:typeof uiDateParse === "function"?uiDateParse:null,iso:typeof uiDateISO === "function"?uiDateISO:null,month:typeof uiDateMonth === "function"?uiDateMonth:null,day:typeof uiDateDay === "function"?uiDateDay:null}')();
test('date-only arithmetic validates leap dates and keeps years below 100',()=>{
 expect(math.parse).toBeFunction();
 for(const value of ['2024-02-29','0099-12-31','0001-01-01','9999-12-31'])expect(math.iso(math.parse(value))).toBe(value);
 for(const value of ['2023-02-29','2026-13-01','2026-00-10','2026-01-00','0000-01-01','2026-2-1','garbage'])expect(math.parse(value)).toBeNull();
 expect(math.iso(math.month(math.parse('2024-01-31'),1))).toBe('2024-02-29');
 expect(math.iso(math.month(math.parse('2024-02-29'),12))).toBe('2025-02-28');
 expect(math.iso(math.day(math.parse('0099-12-31'),1))).toBe('0100-01-01');
});
