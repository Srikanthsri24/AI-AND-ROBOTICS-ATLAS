import { industrialLimits } from './industrial-monitor';
export type IndustrialStatus='READY'|'RUNNING'|'TRIPPED';
export type IndustrialInputs={powered:boolean;temperatureAdc:number;vibrationAdc:number;stopOpen:boolean;buttonPressed:boolean;networkReady:boolean;link:boolean};
export const industrialDefaults:IndustrialInputs={powered:false,temperatureAdc:205,vibrationAdc:184,stopOpen:false,buttonPressed:false,networkReady:true,link:true};
export type IndustrialClock={playing:boolean;booted:boolean;network:boolean;nowMs:number;nextMs:number;running:boolean;tripped:boolean;rawPressed:boolean;stablePressed:boolean;changed:number;lastSend:number;temperature:number;vibration:number;stopOpen:boolean;reports:number;sent:number;serial:string;packet:string|null};
export const industrialInitial=():IndustrialClock=>({playing:false,booted:false,network:false,nowMs:0,nextMs:0,running:false,tripped:false,rawPressed:false,stablePressed:false,changed:0,lastSend:0,temperature:0,vibration:0,stopOpen:false,reports:0,sent:0,serial:'',packet:null});
const u32=(value:number)=>value>>>0;
export function industrialIndex(adc:number){if(!Number.isInteger(adc)||adc<0||adc>1023)throw Error('A test knob must supply an integer ADC value from 0 to 1023.');return Math.floor((adc*100+511)/1023);}
export function industrialStatus(s:Pick<IndustrialClock,'tripped'|'running'>):IndustrialStatus{return s.tripped?'TRIPPED':s.running?'RUNNING':'READY';}
/** One post-setup Arduino loop, with now captured before the reads, as in the supplied sketch. */
export function industrialLoop(previous:IndustrialClock,now:number,input:IndustrialInputs):IndustrialClock{
 const s={...previous},temperature=industrialIndex(input.temperatureAdc),vibration=industrialIndex(input.vibrationAdc),unsafe=input.stopOpen||temperature>=industrialLimits.temperature||vibration>=industrialLimits.vibration;
 now=u32(now);s.temperature=temperature;s.vibration=vibration;s.stopOpen=input.stopOpen;
 if(unsafe){s.running=false;s.tripped=true;}
 if(input.buttonPressed!==s.rawPressed){s.rawPressed=input.buttonPressed;s.changed=now;}
 if(input.buttonPressed!==s.stablePressed&&u32(now-s.changed)>=30){s.stablePressed=input.buttonPressed;if(input.buttonPressed&&!unsafe){if(s.tripped)s.tripped=false;else s.running=!s.running;}}
 if(u32(now-s.lastSend)>=500){s.lastSend=now;s.reports++;s.serial=`${now},${temperature},${vibration},${input.stopOpen?1:0},${industrialStatus(s)}`;if(s.network&&input.link){s.sent++;s.packet=s.serial;}}
 return s;
}
/** Authored 1 ms browser loop cadence after setup. DHCP setup duration is not simulated. */
export function industrialAdvance(previous:IndustrialClock,elapsedMs:number,input:IndustrialInputs):IndustrialClock{
 if(!Number.isSafeInteger(elapsedMs)||elapsedMs<0||!Number.isSafeInteger(previous.nowMs+elapsedMs))throw Error('Advance by a non-negative safe integer number of model milliseconds.');
 if(!input.powered)return {...industrialInitial(),playing:previous.playing};
 if(!previous.playing)return previous;
 let s={...previous};if(!s.booted){s.booted=true;s.network=input.networkReady;}
 const end=s.nowMs+elapsedMs;
 for(let t=s.nextMs;t<=end;t++){s=industrialLoop(s,u32(t),input);s.nextMs=t+1;}
 s.nowMs=end;return s;
}
export function industrialOutputs(s:IndustrialClock,powered:boolean){return{green:powered&&s.booted&&s.running,red:powered&&s.booted&&s.tripped};}
export type IndustrialRecord={uptimeMs:number;temperature:number;vibration:number;stopOpen:boolean;status:IndustrialStatus};
export function industrialParsePacket(text:string):IndustrialRecord|null{
 if(!/^[\x00-\x7f]*$/.test(text))return null;
 const fields=text.trim().split(',');if(fields.length!==5||!fields.slice(0,4).every(v=>/^\s*\+?\d+\s*$/.test(v)))return null;
 const [uptimeMs,temperature,vibration,stop]=fields.slice(0,4).map(Number),status=fields[4];
 if(![uptimeMs,temperature,vibration,stop].every(Number.isSafeInteger)||uptimeMs<0||temperature>100||vibration>100||stop>1||!['READY','RUNNING','TRIPPED'].includes(status))return null;
 return{uptimeMs,temperature,vibration,stopOpen:stop===1,status:status as IndustrialStatus};
}
export type IndustrialReceiver={record:IndustrialRecord|null;receivedAt:number|null;sequence:number};
export const industrialReceiverInitial=():IndustrialReceiver=>({record:null,receivedAt:null,sequence:0});
/** Freshness is age of the last accepted browser record; the Python monitor uses socket timeout. */
export function industrialReceive(previous:IndustrialReceiver,text:string,sequence:number,nowMs:number):IndustrialReceiver{
 if(!Number.isSafeInteger(nowMs)||nowMs<0||!Number.isSafeInteger(sequence)||sequence<0)throw Error('Invalid receiver clock or sequence.');
 if(sequence<previous.sequence)previous={...previous,sequence:0};
 if(sequence===previous.sequence)return previous;
 const record=industrialParsePacket(text);if(!record)return previous;
 return{record,receivedAt:nowMs,sequence};
}
export function industrialFresh(receiver:IndustrialReceiver,nowMs:number){return receiver.record!==null&&receiver.receivedAt!==null&&nowMs-receiver.receivedAt<industrialLimits.staleMs;}
