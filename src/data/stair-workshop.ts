export type StairLightState={active:boolean;startedAt:number|null};
export const stairInitialState:StairLightState={active:false,startedAt:null};
export function stairRaw(light:number){return Math.ceil(180+Math.max(0,Math.min(100,light))*6.4);}
export function stairRelative(raw:number,dark:number|null,bright:number|null){if(dark===null||bright===null||bright-dark<20)return null;return Math.max(0,Math.min(100,Math.trunc((raw-dark)*100/(bright-dark))));}
/** Match the sketch: start only on an inactive→active transition; daylight clears all outputs. */
export function stairUpdate(previous:StairLightState,light:number|null,now:number):StairLightState{if(light===null||light>=55)return {...stairInitialState};if(!previous.active&&light<=45)return {active:true,startedAt:now};return previous;}
export function stairOutputs(state:StairLightState,now:number):[boolean,boolean,boolean]{const elapsed=Math.max(0,now-(state.startedAt??now));return [0,250,500].map(delay=>state.active&&state.startedAt!==null&&elapsed>=delay) as [boolean,boolean,boolean];}
