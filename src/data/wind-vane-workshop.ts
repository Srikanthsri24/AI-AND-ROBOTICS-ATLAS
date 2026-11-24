/** One AS5600 sample per completed 200 ms loop; recognized serial commands wait in the input buffer. */
export type WindVaneState={north:number;orientation:number;raw:number|null;heading:number|null;valid:boolean;lastRead:number;started:boolean;pending:''|'n'|'e';lines:{at:number;text:string}[]};
export type WindVaneInput={status:number;raw:number;statusReadOk?:boolean;angleReadOk?:boolean};
export function windVaneInitial():WindVaneState{return {north:-1,orientation:0,raw:null,heading:null,valid:false,lastRead:0,started:false,pending:'',lines:[{at:0,text:'Point at N and send n. Point at E and send e.'}]};}
export const windVaneWrap=(count:number)=>(count+4096)%4096;
export function windVaneTick(previous:WindVaneState,text:string,input:WindVaneInput,now:number):WindVaneState{
 now=now>>>0;const s:WindVaneState={...previous,lines:[...previous.lines]};for(const c of text)if(c==='n'||c==='e')s.pending=c;
 if(s.started&&((now-s.lastRead)>>>0)<200)return s;s.started=true;s.lastRead=now;const command=s.pending;s.pending='';const log=(text:string)=>s.lines.push({at:now,text});s.valid=false;s.raw=null;s.heading=null;
 if(input.statusReadOk===false||input.angleReadOk===false){log('I2C read failed. Check wiring.');return s;}
 if(!(input.status&0x20)||(input.status&0x18)){log('Adjust the magnet alignment or gap.');return s;}
 const raw=input.raw&0xFFF;s.raw=raw;s.valid=true;if(command==='n'){s.north=raw;s.orientation=0;log('North saved.');}else if(command==='e'&&s.north>=0){const delta=windVaneWrap(raw-s.north+2048)-2048;if(Math.abs(Math.abs(delta)-1024)<=256){s.orientation=delta>0?1:-1;log('East saved.');}else log('East must be near a quarter turn from north.');}
 if(s.orientation)s.heading=windVaneWrap((raw-s.north)*s.orientation)*360/4096;
 log('Raw '+raw+(s.orientation?' | Heading '+s.heading!.toFixed(1)+' deg':' | Capture N then E.'));return s;
}
