export type Profile={id:string;idle:number;tickets:number;left:boolean};
export const training:Profile[];
export const heldOut:Profile[];
export const attritionCsv:string;
export function fit():number[];
export function predict(profile:Pick<Profile,'idle'|'tickets'>):number;
export function evaluate(threshold:number):{rows:(Profile&{risk:number;flag:boolean})[];hits:number;missed:number;falseAlerts:number;clear:number};
