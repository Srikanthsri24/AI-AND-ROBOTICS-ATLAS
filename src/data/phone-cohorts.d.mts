export type Profile={id:string;group:string;media:number;calls:number};
export const groups:string[];
export const training:Profile[];
export const tests:Profile[];
export function predict(profile:Profile,skewed?:boolean):{group:string;id:string;distance:number};
export function report(skewed?:boolean,minimum?:number):{group:string;count:number;correct:number|null}[];
export const cohortCsv:string;
