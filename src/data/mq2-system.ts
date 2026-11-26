import {mq2Initial,mq2Step,type Mq2Controller} from './mq2-workshop';

export type Mq2Inputs=Readonly<{usb:boolean;ground:boolean;signalConnected:boolean;reading:number}>;
export type Mq2System=Readonly<{
  controller:Mq2Controller;
  powered:boolean;
  controllerKnown:boolean;
  elapsedMs:number;
  nextSampleMs:number;
  pendingCommands:string;
  led:boolean|null;
}>;
export function mq2SystemInitial():Mq2System{
  return {controller:mq2Initial(),powered:false,controllerKnown:true,elapsedMs:0,nextSampleMs:0,pendingCommands:'',led:null};
}
/** USB serial bytes wait until the sketch's next loop. Unpowered boards cannot receive them. */
export function mq2QueueCommand(state:Mq2System,command:string):Mq2System{
  return state.powered?{...state,pendingCommands:state.pendingCommands+command}:state;
}
/** A connected, powered Uno samples immediately on boot, then once per nominal 100 ms loop.
 * Disconnected analogue wiring is unknown, never a fabricated zero / clean-air reading.
 * Removing USB resets volatile RAM and discards queued serial bytes. */
export function mq2Advance(previous:Mq2System,inputs:Mq2Inputs,durationMs:number):Mq2System{
  if(!Number.isFinite(durationMs)||durationMs<0)throw new RangeError('Duration must be finite and nonnegative');
  if(!Number.isInteger(inputs.reading)||inputs.reading<0||inputs.reading>1023)throw new RangeError('A0 must be an integer ADC count from 0 to 1023');
  if(!inputs.usb)return mq2SystemInitial();
  let state=previous.powered?previous:{...mq2SystemInitial(),powered:true};
  const end=state.elapsedMs+durationMs;
  if(!inputs.ground||!inputs.signalConnected||!state.controllerKnown){
    // Floating A0 still runs on hardware, but its samples and resulting RAM are
    // unknowable. Keep that uncertainty until a sketch reset or USB power cycle resets RAM.
    return {...state,controllerKnown:false,elapsedMs:end,nextSampleMs:end,pendingCommands:'',led:null};
  }
  let controller=state.controller,commands=state.pendingCommands,next=state.nextSampleMs;
  while(next<=end){
    controller=mq2Step(controller,inputs.reading,commands);
    commands='';
    next+=100;
  }
  return {controller,powered:true,controllerKnown:true,elapsedMs:end,nextSampleMs:next,pendingCommands:commands,led:controller.alert};
}
