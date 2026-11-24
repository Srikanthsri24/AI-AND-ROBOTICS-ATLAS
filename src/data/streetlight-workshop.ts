export type StreetlightState={lit:boolean;since:number|null;progress:number};
export const initialStreetlight:StreetlightState={lit:false,since:null,progress:0};
export function streetlightRaw(level:number,shaded:boolean,feedback:boolean){const seen=Math.max(0,Math.min(100,shaded?0:level+(feedback?30:0)));return Math.ceil(180+seen*6.4);}
export function streetlightPercent(raw:number,dark:number|null,bright:number|null){if(dark===null||bright===null||bright-dark<20)return null;return Math.max(0,Math.min(100,Math.floor((raw-dark)*100/(bright-dark))));}
export function advanceStreetlight(state:StreetlightState,percent:number|null,now:number):StreetlightState{
 if(percent===null)return {...initialStreetlight};
 const qualifies=state.lit?percent>=55:percent<=40;
 if(!qualifies)return {lit:state.lit,since:null,progress:0};
 const since=state.since??now,elapsed=Math.max(0,now-since);
 if(elapsed>=1000)return {lit:!state.lit,since:null,progress:0};
 return {lit:state.lit,since,progress:elapsed/1000};
}
