/** Matches accessible_desk_switch.ino; mode changes take priority over paddle edges. */
export type AccessibleInput={raw:boolean;stable:boolean;changedAt:number};
export type AccessibleSwitchState={paddle:AccessibleInput;mode:AccessibleInput;toggleMode:boolean;outputOn:boolean;waitForRelease:boolean;events:{at:number;message:string}[]};
const input=():AccessibleInput=>({raw:false,stable:false,changedAt:0});
export function accessibleSwitchInitial():AccessibleSwitchState{return {paddle:input(),mode:input(),toggleMode:false,outputOn:false,waitForRelease:true,events:[{at:0,message:'Hold mode.'}]};}
function update(previous:AccessibleInput,pressed:boolean,now:number){const s={...previous};if(s.raw!==pressed){s.raw=pressed;s.changedAt=now;}let changed=false;if(s.stable!==s.raw&&((now-s.changedAt)>>>0)>=25){s.stable=s.raw;changed=true;}return {state:s,changed};}
export function accessibleSwitchTick(previous:AccessibleSwitchState,paddlePressed:boolean,modePressed:boolean,now:number):AccessibleSwitchState{now=now>>>0;const paddle=update(previous.paddle,paddlePressed,now),mode=update(previous.mode,modePressed,now),events=[...previous.events];let {toggleMode,outputOn,waitForRelease}=previous;const wasOn=outputOn,event=(message:string)=>events.push({at:now,message});
 if(mode.changed&&mode.state.stable){toggleMode=!toggleMode;outputOn=false;waitForRelease=true;event(toggleMode?'Toggle mode.':'Hold mode.');}
 else if(waitForRelease){if(!paddle.state.raw&&!paddle.state.stable&&((now-paddle.state.changedAt)>>>0)>=25)waitForRelease=false;}
 else if(paddle.changed){if(!toggleMode)outputOn=paddle.state.stable;else if(paddle.state.stable)outputOn=!outputOn;}
 if(outputOn!==wasOn)event(outputOn?'LED on.':'LED off.');
 return {paddle:paddle.state,mode:mode.state,toggleMode,outputOn,waitForRelease,events};
}
// Enlarged teaching-model dimensions. The underside and roller are solved as
// tangent plane / circle geometry, rather than overlapping bounding boxes.
export function accessibleDepression(value:number){return Math.max(0,Math.min(1,value));}
export function accessiblePaddleAngle(value:number){return .16+.08*accessibleDepression(value);}
export function accessibleRollerAngle(value:number){const a=accessiblePaddleAngle(value),s=(.38*Math.cos(a)-.8*Math.sin(a)-.095)/.4;return Math.max(-.2,a-Math.asin(Math.max(-1,Math.min(1,s))));}
export function accessibleContact(value:number){return accessibleRollerAngle(value)+.2>=.12-1e-9;}
export function accessibleStopY(){const a=.24;return 1-1.55*Math.tan(a)-.105/Math.cos(a);}

export function accessiblePlungerCentre(value:number){const a=accessibleRollerAngle(value);return Math.min(.618,.62-.19*Math.tan(a)-.028/Math.cos(a));}
