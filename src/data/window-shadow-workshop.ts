export type WindowShadowState={baseline:number;shadow:boolean;events:number;sampledAt:number};
export function windowShadowInitial(raw:number):WindowShadowState{return {baseline:raw,shadow:false,events:0,sampledAt:0};}
/** One sample at most, matching the sketch's 50 ms gate rather than replaying missed samples. */
export function windowShadowSample(previous:WindowShadowState,raw:number,now:number):WindowShadowState{
 if(now-previous.sampledAt<50)return previous;
 let {baseline,shadow,events}=previous;const drop=baseline-raw;
 if(shadow){if(drop<=90)shadow=false;}else if(baseline>=260&&drop>=180){shadow=true;events++;}
 if(!shadow)baseline+=Math.trunc((raw-baseline)/8);
 return {baseline,shadow,events,sampledAt:now};
}
