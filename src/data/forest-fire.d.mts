export type Tile={id:string;heat:number;dry:number;cloud:number;laterFire:boolean};
export type Screening={score:number|null;state:'Cloud masked'|'Review'|'Below threshold'};
export const tiles:Tile[];
export const forestCsv:string;
export function screen(tile:Tile,threshold?:number):Screening;
export function evaluate(threshold:number):{rows:(Tile&Screening)[];hits:number;falseAlerts:number;missed:number;masked:number};
