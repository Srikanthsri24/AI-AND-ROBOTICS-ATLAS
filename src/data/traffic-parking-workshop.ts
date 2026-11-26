import {phases,gateMs,parkingCapacity} from './traffic-parking';
export type TrafficParkingButton={candidate:boolean;state:boolean;since:number};
export type TrafficParkingController={occupied:number;phase:number;phaseSince:number;gateSince:number;open:boolean;command:number;entry:TrafficParkingButton;exit:TrafficParkingButton;rows:readonly string[];admissions:number;departures:number;denials:number};
export type TrafficParkingInputs={entry:boolean;exit:boolean};
const button=():TrafficParkingButton=>({candidate:false,state:false,since:0});
/** Admissions/departures/denials are frontend trace counters derived from the
 * sketch's reports; they do not alter the firmware's occupancy or timing. */
export function trafficParkingInitial(millis=0):TrafficParkingController{if(!Number.isFinite(millis))throw new RangeError('Invalid controller time');return {occupied:0,phase:0,phaseSince:millis>>>0,gateSince:0,open:false,command:20,entry:button(),exit:button(),rows:['Spaces left: 3'],admissions:0,departures:0,denials:0};}
function sampleButton(previous:TrafficParkingButton,down:boolean,now:number){const s={...previous};if(down!==s.candidate){s.candidate=down;s.since=now;}if(((now-s.since)>>>0)<22||s.state===s.candidate)return {button:s,pressed:false};s.state=s.candidate;return {button:s,pressed:s.state};}
const report=(s:TrafficParkingController,text:string):TrafficParkingController=>({...s,rows:[...s.rows,text].slice(-120)});
/** One exact sketch loop at an unsigned Arduino millis value. Phase advancement
 * happens once per loop, even after a long pause; open-gate button edges are
 * debounced and consumed, not queued for admission when the barrier closes. */
export function trafficParkingLoop(previous:TrafficParkingController,millis:number,input:TrafficParkingInputs):TrafficParkingController{
 if(!Number.isFinite(millis))throw new RangeError('Invalid controller time');const now=millis>>>0;let s={...previous};
 if(((now-s.phaseSince)>>>0)>=phases[s.phase].ms)s={...s,phase:(s.phase+1)%phases.length,phaseSince:now};
 if(s.open&&((now-s.gateSince)>>>0)>=gateMs)s={...s,open:false,command:20};
 const arrive=sampleButton(s.entry,input.entry,now),leave=sampleButton(s.exit,input.exit,now);s={...s,entry:arrive.button,exit:leave.button};
 if(s.open)return s;
 if(leave.pressed&&s.occupied>0){s={...s,occupied:s.occupied-1,departures:s.departures+1};s=report(s,'Spaces left: '+(parkingCapacity-s.occupied));}
 if(arrive.pressed){if(s.occupied===parkingCapacity)return report({...s,denials:s.denials+1},'Entry denied');s={...s,occupied:s.occupied+1,open:true,gateSince:now,command:100,admissions:s.admissions+1};s=report(s,'Spaces left: '+(parkingCapacity-s.occupied));}
 return s;
}
export function trafficParkingControllerOutputs(s:TrafficParkingController){const p=phases[s.phase];return {main:p.main,cross:p.cross,full:s.occupied===parkingCapacity,spaces:parkingCapacity-s.occupied,command:s.command,open:s.open};}
