export type LanternMode='auto'|'on'|'off';
export type LanternState={mode:LanternMode;automatic:boolean;rawPressed:boolean;stablePressed:boolean;changedAt:number};
export const lanternInitial:LanternState={mode:'auto',automatic:false,rawPressed:false,stablePressed:false,changedAt:0};
export function lanternRaw(light:number){return Math.ceil(180+Math.max(0,Math.min(100,light))*6.4);}
export function lanternRelative(raw:number,dark:number|null,bright:number|null){if(dark===null||bright===null||bright-dark<20)return null;return Math.max(0,Math.min(100,Math.trunc((raw-dark)*100/(bright-dark))));}
export function lanternUpdate(previous:LanternState,light:number|null,pressed:boolean,now:number):LanternState{
 let {mode,automatic,rawPressed,stablePressed,changedAt}=previous;
 if(pressed!==rawPressed){rawPressed=pressed;changedAt=now;}
 if(rawPressed!==stablePressed&&now-changedAt>=30){stablePressed=rawPressed;if(stablePressed)mode=mode==='auto'?'on':mode==='on'?'off':'auto';}
 automatic=light===null?false:light<=35?true:light>=45?false:automatic;
 return {mode,automatic,rawPressed,stablePressed,changedAt};
}
export function lanternOutput(state:LanternState){return state.mode==='on'||state.mode==='auto'&&state.automatic;}
