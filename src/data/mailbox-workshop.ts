/** Mirrors mailbox_test_flag.ino. Booleans mean LOW: true = shut / reset pressed. */
export type MailboxInput={raw:boolean;stable:boolean;changedAt:number};
export type MailboxState={flap:MailboxInput;reset:MailboxInput;flagged:boolean;events:{at:number;message:string}[]};
export function mailboxInitial():MailboxState{return {flap:{raw:false,stable:false,changedAt:0},reset:{raw:false,stable:false,changedAt:0},flagged:false,events:[{at:0,message:'Close the flap to arm the opening detector.'}]};}
export function mailboxTick(previous:MailboxState,closed:boolean,pressed:boolean,now:number):MailboxState{
 now=now>>>0;const s={...previous,flap:{...previous.flap},reset:{...previous.reset},events:[...previous.events]};
 const update=(input:MailboxInput,value:boolean)=>{if(input.raw!==value){input.raw=value;input.changedAt=now;}if(input.stable===input.raw||((now-input.changedAt)>>>0)<25)return false;input.stable=input.raw;return true;};
 const flapChanged=update(s.flap,closed),resetChanged=update(s.reset,pressed),log=(message:string)=>s.events.push({at:now,message});
 if(flapChanged){if(!s.flap.stable){s.flagged=true;log('Flap opened. Reminder on.');}else log('Flap shut.');}
 if(resetChanged&&s.reset.stable){if(s.flap.raw&&s.flap.stable){s.flagged=false;log('Reminder cleared.');}else log('Shut the flap before resetting.');}
 return s;
}
/** Bottom-hinged flap opens towards +Z. A spring roller follows its rear face until free. */
export function mailboxFlapAngle(open:number){return Math.max(0,Math.min(1,open))*1.12;}
export function mailboxRollerAngle(open:number){
 const a=mailboxFlapAngle(open),closed=Math.asin(.7),free=1.12;
 const gap=(r:number)=>.95*Math.cos(a)-.35*Math.sin(a)-.03-((1.7+.4*Math.cos(r))*(-Math.sin(a))+(.58+.4*Math.sin(r))*Math.cos(a))-.06;
 if(gap(free)>=0)return free;let lo=closed,hi=free;for(let i=0;i<50;i++){const mid=(lo+hi)/2;if(gap(mid)>=0)lo=mid;else hi=mid;}return lo;
}
export function mailboxContact(open:number){return mailboxRollerAngle(open)<.82;}
