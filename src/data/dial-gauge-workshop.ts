/** The downloadable cardboard_dial_gauge.ino uses AVR 32-bit float arithmetic. */
export type DialGaugeCalibration={zero:number;full:number;reverse:boolean};
export type DialGaugeState={lastSample:number;lastLog:number;raw:number|null;fraction:number|null;command:number;lines:{at:number;text:string}[]};
export const dialGaugeDefault:DialGaugeCalibration={zero:0,full:1023,reverse:false};
export function dialGaugeInitial():DialGaugeState{return {lastSample:0,lastLog:0,raw:null,fraction:null,command:90,lines:[]};}
export function dialGaugeReading(samples:number[],calibration:DialGaugeCalibration){
 if(samples.length!==8||samples.some(v=>!Number.isInteger(v)||v<0||v>1023))throw new Error('Provide eight 10-bit ADC conversions.');
 if(!Number.isInteger(calibration.zero)||!Number.isInteger(calibration.full)||calibration.zero<0||calibration.zero>1023||calibration.full<0||calibration.full>1023||calibration.zero===calibration.full)throw new Error('Calibration needs two different 10-bit endpoints.');
 const raw=Math.floor((samples.reduce((s,v)=>s+v,0)+4)/8),fraction=Math.max(0,Math.min(1,Math.fround(Math.fround(raw-calibration.zero)/(calibration.full-calibration.zero)))),command=30+Math.trunc(Math.fround(Math.fround(120*fraction)+.5));
 return {raw,fraction,command:calibration.reverse?180-command:command};
}
export function dialGaugeTick(previous:DialGaugeState,samples:number[],now:number,calibration:DialGaugeCalibration=dialGaugeDefault):DialGaugeState{
 now=now>>>0;if(((now-previous.lastSample)>>>0)<35)return previous;
 const reading=dialGaugeReading(samples,calibration),next={...previous,...reading,lastSample:now,lines:[...previous.lines]};
 if(((now-next.lastLog)>>>0)>=250){next.lastLog=now;const percent=Math.fround(100*reading.fraction);next.lines.push({at:now,text:'A0='+reading.raw+'  level='+percent.toFixed(1)+'%'});}
 return next;
}
export type DialGaugePoint=[number,number,number];
export function dialGaugeRaw(knob:number){return Math.round(38+Math.max(0,Math.min(1,knob))*944);}
/** Lift the loose assembly, turn it upright above the frame, travel, then insert axially. */
export function dialGaugeFitPose(progress:number){const t=Math.max(0,Math.min(1,progress)),lift=Math.min(1,t/.20),turn=Math.max(0,Math.min(1,(t-.20)/.20)),travel=Math.max(0,Math.min(1,(t-.40)/.20)),lower=Math.max(0,Math.min(1,(t-.60)/.20)),insert=Math.max(0,(t-.80)/.20);return {position:[2.7-1.3*travel,.17+3.43*lift-2*lower,1.9-1.45*travel-.615*insert] as DialGaugePoint,rotationX:-Math.PI/2*(1-turn)};}
