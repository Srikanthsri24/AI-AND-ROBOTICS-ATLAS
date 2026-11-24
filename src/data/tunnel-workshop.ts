export type TunnelLightState={lit:boolean;darkSince:number|null};
export const tunnelInitial:TunnelLightState={lit:false,darkSince:null};
export function tunnelRaw(light:number){return Math.ceil(180+Math.max(0,Math.min(100,light))*6.4);}
export function tunnelRelative(raw:number,dark:number|null,bright:number|null){if(dark===null||bright===null||bright-dark<20)return null;return Math.max(0,Math.min(100,Math.trunc((raw-dark)*100/(bright-dark))));}
export function tunnelUpdate(previous:TunnelLightState,light:number|null,now:number):TunnelLightState{
 if(light===null)return {...tunnelInitial};let {lit,darkSince}=previous;
 if(light>=52)lit=false;
 if(lit||light>42)darkSince=null;
 else if(darkSince===null)darkSince=now;
 else if(now-darkSince>=700){lit=true;darkSince=null;}
 return {lit,darkSince};
}
