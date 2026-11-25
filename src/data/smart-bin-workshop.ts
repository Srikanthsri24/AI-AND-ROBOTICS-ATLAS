/** Browser execution model of smart_waste_bin.ino. Echo blocking and the
 * pre-echo millis snapshot are explicit. A 1 ms CPU cadence and setup result
 * stand in for unmeasured processor/UART timing and actual DHCP negotiation.
 */
export type BinInputs={powered:boolean;lidOpen:boolean;gapMm:number;echo:boolean;emptyMm:number;fullMm:number;networkReady:boolean;link:boolean};
export const binWorkshopDefaults:BinInputs={powered:false,lidOpen:true,gapMm:500,echo:true,emptyMm:500,fullMm:120,networkReady:true,link:true};
export type BinStatus='LID_OPEN'|'SETTLING'|'SENSOR_FAULT'|'AVAILABLE'|'COLLECTION_NEEDED';
export type BinClock={nowUs:number;nextUs:number;phase:'loop'|'echo';loopMs:number;closedSince:number;lidWasOpen:boolean;lastSample:number;lastSend:number;pendingGap:number;pendingEmpty:number;pendingFull:number;gap:number;percent:number;collection:boolean;status:BinStatus;booted:boolean;network:boolean;serial:string;packet:string|null;sent:number;samples:number;reports:number;playing:boolean};
const elapsed=(now:number,then:number)=>(now-then)>>>0;
export function binInitial():BinClock{return{nowUs:0,nextUs:0,phase:'loop',loopMs:0,closedSince:0,lidWasOpen:true,lastSample:0,lastSend:0,pendingGap:-1,pendingEmpty:500,pendingFull:120,gap:-1,percent:-1,collection:false,status:'LID_OPEN',booted:false,network:false,serial:'Power the dry station to collect a reading.',packet:null,sent:0,samples:0,reports:0,playing:false};}
export function binReadGap(gapMm:number,emptyMm:number,connected=true){if(!Number.isFinite(gapMm)||gapMm<50||gapMm>1200||!Number.isFinite(emptyMm)||emptyMm<100||emptyMm>1000)throw Error('Use physical gaps 50–1200 mm and empty references 100–1000 mm.');const pulseUs=connected?Math.round(2*gapMm*1000/343):0,received=pulseUs>0&&pulseUs<=6500,measured=received?Math.floor((pulseUs*343+1000)/2000):-1;return{pulseUs:received?pulseUs:0,gap:received&&measured>=100&&measured<=emptyMm+40?measured:-1};}
export function binPercent(gap:number,empty:number,full:number){if(gap<0||full>=empty||full<100)return-1;return Math.max(0,Math.min(100,Math.trunc((100*(empty-gap)+Math.trunc((empty-full)/2))/(empty-full))));}
export function binLed(s:BinClock,i:Pick<BinInputs,'powered'>){return i.powered&&s.booted&&s.percent>=0&&s.collection;}
export function binAdvance(previous:BinClock,seconds:number,i:BinInputs):BinClock{
 binReadGap(i.gapMm,i.emptyMm,i.echo);if(!Number.isFinite(seconds)||seconds<0||seconds>60||!Number.isInteger(i.emptyMm)||!Number.isInteger(i.fullMm))throw Error('Advance 0–60 seconds with integer calibration references.');if(!previous.playing)return previous;if(!i.powered)return{...binInitial(),playing:true};
 const s={...previous};if(!s.booted){s.booted=true;s.network=i.networkReady;s.serial=s.network?'Local network initialised in browser model.':'Network unavailable. Serial and local measurement remain active.';}const end=s.nowUs+Math.round(seconds*1e6);
 const finish=(at:number)=>{if(elapsed(s.loopMs,s.lastSend)>=500){s.lastSend=s.loopMs;s.serial=`${s.loopMs},${s.gap},${s.percent},${s.status}`;s.reports++;s.packet=s.network&&i.link?s.serial:null;if(s.packet)s.sent++;}s.phase='loop';s.nextUs=at+1000;};
 while(s.nextUs<=end){const at=s.nextUs;if(s.phase==='echo'){s.gap=s.pendingGap;s.percent=binPercent(s.gap,s.pendingEmpty,s.pendingFull);s.samples++;if(s.percent<0)s.status='SENSOR_FAULT';else{if(s.percent>=80)s.collection=true;else if(s.percent<=70)s.collection=false;s.status=s.collection?'COLLECTION_NEEDED':'AVAILABLE';}finish(at);}
 else{s.loopMs=Math.floor(at/1000)>>>0;const open=i.lidOpen;if(!open&&s.lidWasOpen)s.closedSince=s.loopMs;s.lidWasOpen=open;if(open||elapsed(s.loopMs,s.closedSince)<500){s.gap=s.percent=-1;s.status=open?'LID_OPEN':'SETTLING';finish(at);}else if(elapsed(s.loopMs,s.lastSample)>=200){s.lastSample=s.loopMs;const e=binReadGap(i.gapMm,i.emptyMm,i.echo);s.pendingGap=e.gap;s.pendingEmpty=i.emptyMm;s.pendingFull=i.fullMm;s.phase='echo';s.nextUs=at+12+(e.pulseUs||6500);}else finish(at);}}
 s.nowUs=end;return s;
}
