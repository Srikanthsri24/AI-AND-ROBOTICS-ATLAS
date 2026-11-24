/** Mirrors beacon_response_rover.ino. Serial output continues after parking.
 * The 35 ms delay applies only after a motion decision; early returns do not delay.
 */
export type BeaconConfig={detect:number;arrival:number;balance:number;limitMs:number};
export const beaconDefaultConfig:BeaconConfig={detect:480,arrival:820,balance:45,limitMs:8000};
export type BeaconController={started:boolean;parked:boolean;firstMotion:number;lastPrint:number;lastLoop:number|null;delayed:boolean;leftPwm:number;rightPwm:number;alert:boolean;rawLeft:number;rawRight:number;reason:'startup'|'dark'|'left'|'right'|'forward'|'arrival'|'limit';serial:{at:number;left:number;right:number}[]};
export function beaconInitial():BeaconController{return {started:false,parked:false,firstMotion:0,lastPrint:0,lastLoop:null,delayed:false,leftPwm:0,rightPwm:0,alert:false,rawLeft:0,rawRight:0,reason:'startup',serial:[]};}
const adc=(n:number)=>Math.max(0,Math.min(1023,Math.round(Number.isFinite(n)?n:0)));
export function beaconLoop(previous:BeaconController,left:number,right:number,now:number,c:BeaconConfig=beaconDefaultConfig):BeaconController{
 now=now>>>0;if(previous.delayed&&previous.lastLoop!==null&&((now-previous.lastLoop)>>>0)<35)return previous;
 const s:BeaconController={...previous,lastLoop:now,delayed:false,rawLeft:adc(left),rawRight:adc(right),serial:previous.serial};
 if(((now-s.lastPrint)>>>0)>=250){s.serial=[...s.serial,{at:now,left:s.rawLeft,right:s.rawRight}].slice(-48);s.lastPrint=now;}
 if(s.parked)return s;
 const stop=(reason:'dark'|'arrival'|'limit')=>{s.leftPwm=0;s.rightPwm=0;s.reason=reason;};
 if(s.started&&((now-s.firstMotion)>>>0)>=c.limitMs){stop('limit');s.parked=true;return s;}
 if(s.rawLeft>=c.arrival&&s.rawRight>=c.arrival){stop('arrival');s.alert=true;s.parked=true;return s;}
 if(Math.max(s.rawLeft,s.rawRight)<c.detect){stop('dark');return s;}
 if(!s.started){s.started=true;s.firstMotion=now;}
 if(s.rawLeft-s.rawRight>c.balance){s.leftPwm=0;s.rightPwm=115;s.reason='left';}
 else if(s.rawRight-s.rawLeft>c.balance){s.leftPwm=115;s.rightPwm=0;s.reason='right';}
 else{s.leftPwm=105;s.rightPwm=105;s.reason='forward';}
 s.delayed=true;return s;
}
export function beaconPins(s:BeaconController){return {D5:s.leftPwm,D6:s.rightPwm,D4:true,D7:false,D8:true,D11:false,D12:s.leftPwm>0||s.rightPwm>0,D10:s.alert};}
/** Calibration edits the constants before a new upload / reset; it is not firmware auto-calibration. */
export function beaconCalibration(room:[number,number],start:[number,number],near:[number,number]){
 const background=Math.max(...room),detected=Math.max(...start),close=Math.min(...near);
 if(![...room,...start,...near].every(n=>Number.isInteger(n)&&n>=0&&n<=1023))return {valid:false,why:'Capture valid ADC readings from both sensors.',detect:0,arrival:0};
 if(detected-background<40)return {valid:false,why:'The start beacon needs a clear margin above both room-light readings.',detect:0,arrival:0};
 if(close-detected<40)return {valid:false,why:'Both stopping-point readings must clearly exceed the stronger start reading.',detect:0,arrival:0};
 return {valid:true,why:'Use the proposed constants in a fresh upload, then reset before the next trial.',detect:Math.round((background+detected)/2),arrival:Math.round((detected+close)/2)};
}
