/** Gregorian date-only arithmetic. UTC is an internal calculation frame, never a user timezone. */
export const dateMathRuntimeSource = String.raw`
function uiDateMake(year:number,month:number,day:number) {const date=new Date(0);date.setUTCHours(12,0,0,0);date.setUTCFullYear(year,month,day);return date}
function uiDateParse(value:string|undefined):Date|null {
 if(!value||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const [year,month,day]=value.split('-').map(Number),date=uiDateMake(year!,month!-1,day!);
 return year!>=1&&year!<=9999&&date.getUTCFullYear()===year&&date.getUTCMonth()===month!-1&&date.getUTCDate()===day?date:null;
}
function uiDateISO(date:Date) {return String(date.getUTCFullYear()).padStart(4,'0')+'-'+String(date.getUTCMonth()+1).padStart(2,'0')+'-'+String(date.getUTCDate()).padStart(2,'0')}
function uiDateDay(date:Date,amount:number) {return uiDateMake(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()+amount)}
function uiDateMonth(date:Date,amount:number) {const first=uiDateMake(date.getUTCFullYear(),date.getUTCMonth()+amount,1),last=uiDateMake(first.getUTCFullYear(),first.getUTCMonth()+1,0);return uiDateMake(first.getUTCFullYear(),first.getUTCMonth(),Math.min(date.getUTCDate(),last.getUTCDate()))}
`;
