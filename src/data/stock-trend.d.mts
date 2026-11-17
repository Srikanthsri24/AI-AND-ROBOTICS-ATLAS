export type Day={day:number;split:'fit'|'test';positive:number;negative:number;close:number;nextClose:number};
export type CompareDay=Day&{score:number;actual:'Up'|'Down';predicted:'Up'|'Down';correct:boolean};
export const days:Day[];
export function score(day:Day):number;
export function fitRule():'follow'|'reverse';
export function evaluate(split:'fit'|'test'):{rows:CompareDay[];rule:'follow'|'reverse';baseline:'Up'|'Down';correct:number;baselineCorrect:number};
export const stockCsv:string;
