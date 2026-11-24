/** Mirrors model_doorbell_panel.ino. tone(...,duration) expires independently of loop(). */
export type DoorbellPhase='idle'|'high'|'gap'|'low';
export type DoorbellState={phase:DoorbellPhase;phaseStarted:number;raw:boolean;stable:boolean;changedAt:number;light:boolean;toneHz:0|660|880;toneStarted:number;toneDuration:number;events:{at:number;message:string}[]};
export function doorbellInitial():DoorbellState{return {phase:'idle',phaseStarted:0,raw:false,stable:false,changedAt:0,light:false,toneHz:0,toneStarted:0,toneDuration:0,events:[{at:0,message:'Doorbell ready.'}]};}
export function doorbellTone(state:DoorbellState,now:number):0|660|880{return state.toneHz&&(((now>>>0)-state.toneStarted)>>>0)<state.toneDuration?state.toneHz:0;}
export function doorbellTick(previous:DoorbellState,held:boolean,now:number):DoorbellState{now=now>>>0;const s={...previous,events:[...previous.events]};let pressed=false;if(s.raw!==held){s.raw=held;s.changedAt=now;}if(s.raw!==s.stable&&((now-s.changedAt)>>>0)>=25){s.stable=s.raw;pressed=s.stable;}const elapsed=(now-s.phaseStarted)>>>0,event=(message:string)=>s.events.push({at:now,message});
 switch(s.phase){
 case 'idle':if(pressed){s.light=true;s.toneHz=880;s.toneStarted=now;s.toneDuration=180;s.phaseStarted=now;s.phase='high';event('880 Hz');}break;
 case 'high':if(elapsed>=180){s.toneHz=0;s.toneDuration=0;s.phaseStarted=now;s.phase='gap';}break;
 case 'gap':if(elapsed>=90){s.toneHz=660;s.toneStarted=now;s.toneDuration=300;s.phaseStarted=now;s.phase='low';event('660 Hz');}break;
 case 'low':if(elapsed>=300){s.toneHz=0;s.toneDuration=0;s.light=false;s.phase='idle';event('Doorbell ready.');}break;
 }
 return s;
}
