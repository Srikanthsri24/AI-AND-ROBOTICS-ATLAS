/** Browser execution model of aquaclean_skimmer.ino.
 * Explicit echo blocking and millis() snapshots are preserved. Between loops
 * an authored 1 ms CPU cadence replaces unmeasured instruction / UART timing.
 * DHCP setup is represented by networkReady at boot, not simulated packets.
 */
export type AquaInputs={powered:boolean;motorPower:boolean;gapMm:number;echo:boolean;button:boolean;networkReady:boolean;link:boolean};
export const aquaDefaults:AquaInputs={powered:false,motorPower:false,gapMm:200,echo:true,button:false,networkReady:true,link:true};
export type AquaStatus='SENSOR_FAULT'|'FULL'|'RUNNING'|'STOPPED';
export type AquaClock={nowUs:number;nextUs:number;phase:'loop'|'echo';loopMs:number;pendingGap:number;lastSample:number;lastSend:number;gap:number;running:boolean;rawButton:boolean;stableButton:boolean;buttonChanged:number;network:boolean;booted:boolean;serial:string;packet:string|null;sent:number;samples:number;reports:number;rotorDegrees:number;playing:boolean};
export function aquaInitial(rotorDegrees=0):AquaClock{return{nowUs:0,nextUs:0,phase:'loop',loopMs:0,pendingGap:-1,lastSample:0,lastSend:0,gap:-1,running:false,rawButton:false,stableButton:false,buttonChanged:0,network:false,booted:false,serial:'Power the dry station to collect a basket reading.',packet:null,sent:0,samples:0,reports:0,rotorDegrees,playing:false};}
export function aquaEcho(gapMm:number,connected=true){if(!Number.isFinite(gapMm)||gapMm<50||gapMm>300)throw Error('Use physical target gaps 50–300 mm.');const pulseUs=connected?Math.round(2*gapMm*1000/343):0,mm=Math.floor((pulseUs*343+1000)/2000);return{pulseUs,gap:pulseUs&&mm>=100&&mm<=260?mm:-1};}
export function aquaStatus(s:Pick<AquaClock,'gap'|'running'>):AquaStatus{return s.gap<0?'SENSOR_FAULT':s.gap<=115?'FULL':s.running?'RUNNING':'STOPPED';}
export function aquaOutputs(s:AquaClock,i:AquaInputs){const enabled=i.powered&&s.booted&&s.running;return{enable:enabled,pwm:enabled?105:0,direction:i.powered,motorMoving:enabled&&i.motorPower,sdDeselected:i.powered};}
export function aquaAdvance(previous:AquaClock,seconds:number,i:AquaInputs):AquaClock{
 aquaEcho(i.gapMm,i.echo);if(!Number.isFinite(seconds)||seconds<0||seconds>60)throw Error('Advance by 0–60 seconds.');if(!previous.playing)return previous;
 if(!i.powered)return{...aquaInitial(previous.rotorDegrees),playing:true};
 let s={...previous};if(!s.booted){s.booted=true;s.network=i.networkReady;s.serial=s.network?'Local network initialised in browser model.':'Local network unavailable. Serial readings remain active.';}
 const end=s.nowUs+Math.round(seconds*1e6);let time=s.nowUs;
 const rotate=(until:number)=>{if(aquaOutputs(s,i).motorMoving)s.rotorDegrees=(s.rotorDegrees+(until-time)*216/1e6)%360;time=until;}; // Authored 36 rpm, not a motor rating.
 const finishLoop=()=>{const now=s.loopMs;if(i.button!==s.rawButton){s.rawButton=i.button;s.buttonChanged=now;}if(i.button!==s.stableButton&&now-s.buttonChanged>=30){s.stableButton=i.button;if(i.button)s.running=!s.running&&s.gap>115;}
 if(now-s.lastSend>=500){s.lastSend=now;s.serial=`${now},${s.gap},${aquaStatus(s)}`;s.reports++;s.packet=s.network&&i.link?s.serial:null;if(s.packet)s.sent++;}s.phase='loop';s.nextUs=time+1000;};
 while(s.nextUs<=end){rotate(s.nextUs);if(s.phase==='echo'){s.gap=s.pendingGap;s.samples++;if(s.gap<0||s.gap<=115)s.running=false;finishLoop();}
 else{s.loopMs=Math.floor(time/1000);if(s.loopMs-s.lastSample>=100){s.lastSample=s.loopMs;const e=aquaEcho(i.gapMm,i.echo);s.pendingGap=e.gap;s.phase='echo';s.nextUs=time+12+(e.pulseUs||5000);}else finishLoop();}}
 rotate(end);s.nowUs=end;return s;
}
