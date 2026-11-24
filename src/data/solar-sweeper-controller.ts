/** Frontend inspection of the published solar_sweeper.ino, including branch order.
 * Eight A0 conversions see a 2:1 divider against the Uno's nominal 5 V reference.
 */
export type SolarSweepState='READY'|'SPINNING_UP'|'SWEEPING';
export type SolarSweepController={state:SolarSweepState;since:number;lastChange:number;lastPrint:number;lastReading:boolean;stableButton:boolean;solarMv:number;brushPwm:number;wheelPwm:number;reason:'idle'|'blocked'|'spinning'|'sweeping'|'manual'|'shade'|'complete';serial:{at:number;mv:number}[]};
export const solarSweepInitial=():SolarSweepController=>({state:'READY',since:0,lastChange:0,lastPrint:0,lastReading:true,stableButton:true,solarMv:0,brushPwm:0,wheelPwm:0,reason:'idle',serial:[]});
export const solarSweepTiming={cutoffMv:4400,spinUpMs:700,passMs:3000,debounceMs:30};
export function solarSweepAdcMv(readings:readonly number[]){if(readings.length!==8)throw Error('The sketch samples A0 exactly eight times per loop.');const sum=readings.reduce((n,v)=>n+Math.max(0,Math.min(1023,Math.round(Number.isFinite(v)?v:0))),0);return Math.floor(sum*10000/(8*1023));}
export function solarSweepLoop(previous:SolarSweepController,readings:readonly number[],buttonHigh:boolean,now:number):SolarSweepController{
 now=now>>>0;const s={...previous,solarMv:solarSweepAdcMv(readings)},elapsed=(then:number)=>(now-then)>>>0;
 if(elapsed(s.lastPrint)>=250){s.serial=[...s.serial,{at:now,mv:s.solarMv}].slice(-48);s.lastPrint=now;}
 const stop=(reason:'manual'|'shade'|'complete')=>{s.state='READY';s.brushPwm=0;s.wheelPwm=0;s.reason=reason;};
 if(buttonHigh!==s.lastReading){s.lastReading=buttonHigh;s.lastChange=now;}
 if(buttonHigh!==s.stableButton&&elapsed(s.lastChange)>=30){s.stableButton=buttonHigh;if(!s.stableButton){if(s.state!=='READY')stop('manual');else if(s.solarMv>=4400){s.brushPwm=210;s.state='SPINNING_UP';s.since=now;s.reason='spinning';}else s.reason='blocked';}}
 if(s.state==='SPINNING_UP'&&elapsed(s.since)>=700){if(s.solarMv<4400)stop('shade');else{s.wheelPwm=105;s.since=now;s.state='SWEEPING';s.reason='sweeping';}}
 else if(s.state==='SWEEPING'&&(s.solarMv<4400||elapsed(s.since)>=3000))stop(s.solarMv<4400?'shade':'complete');
 return s;
}
export function solarSweepPins(s:SolarSweepController){return {D3:s.brushPwm,D9:s.brushPwm>0,D5:s.wheelPwm,D6:s.wheelPwm,D12:s.wheelPwm>0,D4:true,D7:false,D8:true,D11:false};}
