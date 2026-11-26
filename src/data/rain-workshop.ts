import {dryDelayMs,rainServoAngles} from './rain-clothesline';
export type RainReport=Readonly<{now:number;wet:boolean;covered:boolean;commandAngle:number;text:string}>;
export type RainController={lastWet:number;lastReport:number;covered:boolean;commandAngle:number;writes:readonly number[];rows:readonly RainReport[]};
function millis(value:number){if(!Number.isInteger(value)||value<0||value>0xffffffff)throw new RangeError('millis must be a uint32 value');return value;}
/** setup() requests the covered commandAngle before attaching the Servo output. */
export function rainInitial(now=0):RainController{return {lastWet:millis(now),lastReport:0,covered:true,commandAngle:rainServoAngles.covered,writes:[rainServoAngles.covered],rows:[]};}
/** One original loop iteration, including AVR unsigned subtraction at millis rollover.
 * commandAngle is the requested servo target, not an instantaneous mechanical position. */
export function rainStep(previous:RainController,now:number,wet:boolean):RainController{
 millis(now);const lastWet=wet?now:previous.lastWet,covered=wet||((now-lastWet)>>>0)<dryDelayMs,changed=covered!==previous.covered,commandAngle=covered?rainServoAngles.covered:rainServoAngles.outside;
 let rows=previous.rows,lastReport=previous.lastReport;
 if(((now-lastReport)>>>0)>=250){lastReport=now;rows=[...rows,Object.freeze({now,wet,covered,commandAngle,text:`${wet?'WET':'DRY'} | ${covered?'Sheltered':'Extended'}`})].slice(-120);}
 return {lastWet,lastReport,covered,commandAngle,writes:changed?[...previous.writes,commandAngle].slice(-120):previous.writes,rows};
}
