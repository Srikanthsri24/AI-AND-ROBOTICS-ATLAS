import {coilMaxMs} from './electromagnet-crane';
export type CraneInputs={usb:boolean;held:boolean;buttonSignal:boolean;buttonReturn:boolean;coilSupply:boolean;signalConnected:boolean;commonGround:boolean;coilPositive:boolean;coilReturn:boolean};
export const craneDefaults:CraneInputs={usb:false,held:false,buttonSignal:true,buttonReturn:true,coilSupply:false,signalConnected:true,commonGround:true,coilPositive:true,coilReturn:true};
export type CranePhase='boot'|'idle'|'holding'|'timeout';
export type CraneReport=Readonly<{atMs:number;phase:Exclude<CranePhase,'boot'>}>;
export type CraneController={nowMs:number;remainderMs:number;candidate:boolean;candidateSince:number;wasPressed:boolean;armed:boolean;started:number;command:boolean;phase:CranePhase;limitTripped:boolean;rows:readonly CraneReport[]};
export function craneInitial():CraneController{return{nowMs:0,remainderMs:0,candidate:false,candidateSince:0,wasPressed:false,armed:false,started:0,command:false,phase:'boot',limitTripped:false,rows:[]};}
export function craneRawPressed(i:CraneInputs){return i.usb&&i.held&&i.buttonSignal&&i.buttonReturn;}
export function craneSerial(row:CraneReport){return row.phase==='idle'?'Idle':row.phase==='holding'?'Holding':'Timeout or release to arm';}
/** Authored 1 ms sampling of the downloadable sketch, with AVR-width elapsed subtraction. */
export function craneAdvance(previous:CraneController,elapsedMs:number,i:CraneInputs):CraneController{
 if(!Number.isFinite(elapsedMs)||elapsedMs<0||elapsedMs>60000)throw new RangeError('Crane controller step must be 0–60000 ms');for(const v of Object.values(i))if(typeof v!=='boolean')throw new TypeError('Crane connections must be boolean');if(!i.usb)return craneInitial();
 const s={...previous,rows:[...previous.rows]},raw=craneRawPressed(i),elapsed=(start:number)=>((s.nowMs>>>0)-start)>>>0;
 const report=(phase:Exclude<CranePhase,'boot'>)=>{if(s.phase!==phase){s.phase=phase;s.rows=[...s.rows,Object.freeze({atMs:s.nowMs,phase})].slice(-60);}};
 const sample=()=>{const now=s.nowMs>>>0;if(s.wasPressed&&s.armed&&elapsed(s.started)>=coilMaxMs){s.armed=false;s.command=false;s.limitTripped=true;report('timeout');}
 if(s.candidate!==raw){s.candidate=raw;s.candidateSince=now;}if(elapsed(s.candidateSince)<20)return;
 const pressed=s.candidate;if(!pressed){s.armed=true;s.limitTripped=false;}else if(!s.wasPressed)s.started=now;s.wasPressed=pressed;s.command=pressed&&s.armed&&elapsed(s.started)<coilMaxMs;if(pressed&&!s.command)s.armed=false;report(s.command?'holding':pressed?'timeout':'idle');};
 sample();const total=Math.round((s.remainderMs+elapsedMs)*1e9)/1e9,ticks=Math.floor(total);for(let n=0;n<ticks;n++){s.nowMs++;sample();}s.remainderMs=Math.round((total-ticks)*1e9)/1e9;return s;
}
export function craneOutputs(s:CraneController,i:CraneInputs){const command=i.usb&&s.command,signal:boolean|null=!i.usb||!i.signalConnected?false:!i.commonGround?null:command,coil:boolean|null=!i.coilSupply||!i.coilPositive||!i.coilReturn?false:signal;return{command,raw:!i.usb?'Unpowered':craneRawPressed(i)?'LOW':'HIGH',powerLed:i.coilSupply,signalLed:signal,coilEnergized:coil,coilCurrentMA:coil===null?null:coil?220:0,remainingMs:command?Math.max(0,coilMaxMs-(((s.nowMs>>>0)-s.started)>>>0)):0,debouncing:s.candidate!==s.wasPressed};}
