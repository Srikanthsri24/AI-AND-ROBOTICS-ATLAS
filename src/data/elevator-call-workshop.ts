/** model_elevator_call_light.ino: the car is hand-moved; there is no motor control. */
export type ElevatorInput={raw:boolean;stable:boolean;changedAt:number};
export type ElevatorCallState={call:ElevatorInput;landing:ElevatorInput;pending:boolean;light:boolean;events:{at:number;message:string}[]};
const input=():ElevatorInput=>({raw:false,stable:false,changedAt:0});
export function elevatorCallInitial():ElevatorCallState{return {call:input(),landing:input(),pending:false,light:false,events:[{at:0,message:'Call panel ready.'}]};}
export function elevatorInput(previous:ElevatorInput,closed:boolean,now:number){const s={...previous};now=now>>>0;if(s.raw!==closed){s.raw=closed;s.changedAt=now;}let changed=false;if(s.raw!==s.stable&&((now-s.changedAt)>>>0)>=25){s.stable=s.raw;changed=true;}return {state:s,changed};}
export function elevatorCallTick(previous:ElevatorCallState,callPressed:boolean,landingClosed:boolean,now:number):ElevatorCallState{now=now>>>0;const call=elevatorInput(previous.call,callPressed,now),landing=elevatorInput(previous.landing,landingClosed,now),events=[...previous.events];let pending=previous.pending;const event=(message:string)=>events.push({at:now,message});
 if(landing.state.stable){pending=false;if(landing.changed)event('Car at landing. Call cleared.');}
 else{if(landing.changed)event('Car away from landing.');if(call.changed&&call.state.stable&&!pending){pending=true;event('Call waiting.');}}
 return {call:call.state,landing:landing.state,pending,light:pending,events};
}
// Geometry of this enlarged teaching model, not universal microswitch dimensions.
export function elevatorPosition(value:number){return Math.max(0,Math.min(1,value));}
export function elevatorCarFloor(value:number){return .5+2.4*elevatorPosition(value);}
export function elevatorRollerDeflection(value:number){return Math.max(0,elevatorCarFloor(value)+.24+.06-3.12);}
export function elevatorLeverAngle(value:number){return -Math.asin(elevatorRollerDeflection(value)/.32);}
export function elevatorLandingContact(value:number){return elevatorRollerDeflection(value)>=.04-1e-9;}
