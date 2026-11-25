import {lightLimits} from './emergency-lighting';
export type EmergencyInputs={powered:boolean;lightAdc:number;alarmPressed:boolean;resetPressed:boolean};
export const emergencyDefaults:EmergencyInputs={powered:false,lightAdc:600,alarmPressed:false,resetPressed:false};
export type EmergencyClock={playing:boolean;booted:boolean;nowMs:number;nextMs:number;brightness:number;dark:boolean;latched:boolean;resetRaw:boolean;resetStable:boolean;lastResetChange:number;started:number;lastPrint:number;reports:number;serial:string;paths:boolean;beacon:boolean;toneHz:number};
export const emergencyInitial=():EmergencyClock=>({playing:false,booted:false,nowMs:0,nextMs:0,brightness:0,dark:false,latched:false,resetRaw:true,resetStable:true,lastResetChange:0,started:0,lastPrint:0,reports:0,serial:'',paths:false,beacon:false,toneHz:0});
const u32=(n:number)=>n>>>0;
export function emergencyIndex(adc:number){if(!Number.isInteger(adc)||adc<0||adc>1023)throw Error('Light input must be an integer ADC count from 0 to 1023');return Math.floor((adc*100+511)/1023);}
export function emergencyStatus(s:Pick<EmergencyClock,'latched'|'dark'>){return s.latched?'ALARM':s.dark?'NIGHT LIGHTING':'STANDBY';}
/** One post-setup sketch loop. Reset raw/stable are the actual HIGH/LOW pin levels. */
export function emergencyLoop(previous:EmergencyClock,now:number,input:EmergencyInputs):EmergencyClock{
 const s={...previous},brightness=emergencyIndex(input.lightAdc);now=u32(now);s.brightness=brightness;
 if(brightness<=lightLimits.darkOn)s.dark=true;else if(brightness>=lightLimits.brightOff)s.dark=false;
 if(input.alarmPressed&&!s.latched){s.latched=true;s.started=now;}
 const reset=!input.resetPressed;
 if(reset!==s.resetRaw){s.resetRaw=reset;s.lastResetChange=now;}
 if(reset!==s.resetStable&&u32(now-s.lastResetChange)>=30){s.resetStable=reset;if(!s.resetStable&&!input.alarmPressed)s.latched=false;}
 const pulse=s.latched&&Math.floor(u32(now-s.started)/lightLimits.pulseMs)%2===0;
 s.paths=s.latched||s.dark;s.beacon=pulse;s.toneHz=pulse?1250:0;
 if(u32(now-s.lastPrint)>=250){s.lastPrint=now;s.reports++;s.serial='Brightness index: '+brightness+'  '+emergencyStatus(s);}
 return s;
}
/** Fixed 1 ms sampling, including the first loop at time zero. USB off resets the board. */
export function emergencyAdvance(previous:EmergencyClock,elapsedMs:number,input:EmergencyInputs):EmergencyClock{
 if(!Number.isSafeInteger(elapsedMs)||elapsedMs<0||!Number.isSafeInteger(previous.nowMs+elapsedMs))throw Error('Advance by a non-negative safe integer number of model milliseconds');
 if(!input.powered)return{...emergencyInitial(),playing:previous.playing};
 if(!previous.playing)return previous;
 let s={...previous,booted:true};const end=s.nowMs+elapsedMs;
 for(let t=s.nextMs;t<=end;t++){s=emergencyLoop(s,u32(t),input);s.nextMs=t+1;}
 s.nowMs=end;return s;
}
export function emergencyOutputs(s:EmergencyClock,powered:boolean){const on=powered&&s.booted;return{paths:on&&s.paths,beacon:on&&s.beacon,toneHz:on?s.toneHz:0};}
