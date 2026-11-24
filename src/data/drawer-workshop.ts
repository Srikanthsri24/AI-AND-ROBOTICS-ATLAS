/** Matches drawer_closed_indicator.ino; true is an active-low seated contact. */
export type DrawerState={raw:boolean;stable:boolean;changedAt:number;outputOn:boolean;events:{at:number;message:string}[]};
export function drawerInitial():DrawerState{return {raw:false,stable:false,changedAt:0,outputOn:false,events:[{at:0,message:'Open or ajar | D2 HIGH | LED off'}]};}
export function drawerTick(previous:DrawerState,seated:boolean,now:number):DrawerState{
 now=now>>>0;const s={...previous,events:[...previous.events]};if(seated!==s.raw){s.raw=seated;s.changedAt=now;}
 if(s.raw===s.stable||((now-s.changedAt)>>>0)<25)return s;
 s.stable=s.raw;s.outputOn=s.stable;s.events.push({at:now,message:s.stable?'Seated | D2 LOW | LED on':'Open or ajar | D2 HIGH | LED off'});return s;
}
/** Position is 0=open, 1=seated. The end stop prevents travel below zero. */
export function drawerTravel(position:number){return 1.35*(1-Math.max(0,Math.min(1,position)));}
export function drawerRollerAngle(position:number){return Math.asin(Math.min(Math.sin(1.12),(.28+drawerTravel(position))/.4));}
// Closed tab rear = -.96; pivot Z = -1.30; roller radius = .06 => centre offset .28.
export function drawerContact(position:number){return drawerRollerAngle(position)<.82;}
/** Horizontal actuator under the standing lever: the rounded end stays tangent to its rear face. */
export function drawerPlungerEnd(position:number){const r=drawerRollerAngle(position);return -1.30+.15*Math.tan(r)-(.006+.014)/Math.cos(r);}
