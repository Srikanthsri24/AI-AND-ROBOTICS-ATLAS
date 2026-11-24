export type SchoolZones={path:boolean;classroom:boolean};
export const schoolInitial:SchoolZones={path:false,classroom:false};
export function schoolRaw(light:number){return Math.ceil(180+Math.max(0,Math.min(100,light))*6.4);}
export function schoolRelative(raw:number,dark:number|null,bright:number|null){if(dark===null||bright===null||bright-dark<20)return null;return Math.max(0,Math.min(100,Math.trunc((raw-dark)*100/(bright-dark))));}
export function schoolNext(previous:SchoolZones,light:number|null):SchoolZones{if(light===null)return {...schoolInitial};return {path:light<=45?true:light>=55?false:previous.path,classroom:light<=28?true:light>=38?false:previous.classroom};}
