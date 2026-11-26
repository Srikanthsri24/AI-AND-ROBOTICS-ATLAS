import {pianoKeys} from './electronic-piano';
export type PianoFlags=readonly [boolean,boolean,boolean,boolean,boolean,boolean,boolean,boolean];
const all=(value:boolean):PianoFlags=>[value,value,value,value,value,value,value,value];
export type PianoWorkshopSettings={usb:boolean;held:PianoFlags;keyConnected:PianoFlags;commonGround:boolean;piezoSignal:boolean;piezoReturn:boolean};
export const pianoWorkshopDefaults:PianoWorkshopSettings={usb:false,held:all(false),keyConnected:all(true),commonGround:true,piezoSignal:true,piezoReturn:true};
export type PianoWorkshopRow=Readonly<{atMs:number;note:number;frequency:number|null}>;
export type PianoWorkshopState={nowMs:number;remainderMs:number;candidates:boolean[];pressed:boolean[];lastChange:number[];note:number;rows:readonly PianoWorkshopRow[]};
export function pianoWorkshopInitial():PianoWorkshopState{return {nowMs:0,remainderMs:0,candidates:Array(8).fill(false),pressed:Array(8).fill(false),lastChange:Array(8).fill(0),note:-1,rows:[]};}
export function pianoWorkshopInputs(settings:PianoWorkshopSettings){return settings.held.map((held,i)=>settings.usb&&held&&settings.keyConnected[i]&&settings.commonGround);}
function validate(s:PianoWorkshopSettings){for(const flags of [s.held,s.keyConnected])if(flags.length!==8||flags.some(v=>typeof v!=='boolean'))throw new TypeError('Piano needs eight boolean key states.');for(const flag of [s.usb,s.commonGround,s.piezoSignal,s.piezoReturn])if(typeof flag!=='boolean')throw new TypeError('Invalid piano connection state.');}
/** Original sketch polling at an authored 1 ms cadence; real USB audio latency is independent. */
export function pianoWorkshopAdvance(previous:PianoWorkshopState,elapsedMs:number,settings:PianoWorkshopSettings):PianoWorkshopState{
 validate(settings);if(!Number.isFinite(elapsedMs)||elapsedMs<0||elapsedMs>60000)throw new RangeError('Piano step must be 0–60000 ms.');
 if(!settings.usb)return pianoWorkshopInitial();
 const s:PianoWorkshopState={...previous,candidates:[...previous.candidates],pressed:[...previous.pressed],lastChange:[...previous.lastChange],rows:[...previous.rows]};
 const down=pianoWorkshopInputs(settings);
 const sample=()=>{const now=s.nowMs>>>0;let next=-1;for(let i=0;i<8;i++){if(down[i]!==s.candidates[i]){s.candidates[i]=down[i];s.lastChange[i]=now;}else if(((now-s.lastChange[i])>>>0)>=15)s.pressed[i]=down[i];if(s.pressed[i]&&next<0)next=i;}if(next!==s.note){s.note=next;s.rows=[...s.rows,Object.freeze({atMs:s.nowMs,note:next,frequency:next<0?null:pianoKeys[next].pitch})].slice(-60);}};
 sample();const total=Math.round((previous.remainderMs+elapsedMs)*1e9)/1e9,ticks=Math.floor(total);for(let n=0;n<ticks;n++){s.nowMs++;sample();}s.remainderMs=Math.round((total-ticks)*1e9)/1e9;return s;
}
export function pianoWorkshopOutput(s:PianoWorkshopState,settings:PianoWorkshopSettings){const frequency=settings.usb&&s.note>=0?pianoKeys[s.note].pitch:null;return {note:frequency===null?null:pianoKeys[s.note].note,frequency,audibleFrequency:frequency!==null&&settings.piezoSignal&&settings.piezoReturn?frequency:null,periodMs:frequency===null?null:1000/frequency,levels:pianoWorkshopInputs(settings).map(down=>!settings.usb?'Unpowered':down?'LOW':'HIGH'),debouncing:s.candidates.some((down,i)=>down!==s.pressed[i])};}
export function pianoWorkshopSerial(row:PianoWorkshopRow){return row.frequency===null?'Released':`Hz: ${row.frequency}`;}
