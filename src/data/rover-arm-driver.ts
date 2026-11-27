import type {RoverArmWrite} from './rover-arm-session';
/** Board-level teaching model, not an I²C electrical/timing emulator.
 * Transactions are atomic ACK/NACK boundaries. The nominal internal oscillator
 * is 25 MHz; real oscillator/pulse calibration belongs to the physical kit.
 * NXP PCA9685 datasheet and Adafruit writeMicroseconds/setPWMFreq define the
 * retained registers, FULL OFF and nominal tick conversion used here. */
export type RaArmBus={unoPowered:boolean;ground:boolean;sda:boolean;scl:boolean;address40:boolean};
export type RaArmDriver={logicPower:boolean;awake:boolean;prescale:number;ticks:readonly number[];accepted:number;rejected:number};
export type RaServoLead={signal:boolean;power:boolean;ground:boolean};
export type RaArmRails={servoSupply:boolean;outputEnabled:boolean;leads:readonly RaServoLead[]};
export const raArmBusOff:RaArmBus={unoPowered:false,ground:false,sda:false,scl:false,address40:true};
export const raArmDriverInitial=():RaArmDriver=>({logicPower:false,awake:false,prescale:30,ticks:Array(6).fill(0),accepted:0,rejected:0});
/** VCC loss resets chip registers. Losing the independent servo V+ supply does
 * not call this function and therefore does not erase the pulse registers. */
export function raArmDriverPower(s:RaArmDriver,on:boolean):RaArmDriver{if(on===s.logicPower)return s;return{...raArmDriverInitial(),logicPower:on,accepted:s.accepted,rejected:s.rejected};}
export function raArmBusReady(s:RaArmDriver,b:RaArmBus){return s.logicPower&&b.unoPowered&&b.ground&&b.sda&&b.scl&&b.address40;}
export function raArmDriverConfigure50(s:RaArmDriver,b:RaArmBus):RaArmDriver{return raArmBusReady(s,b)?{...s,awake:true,prescale:121,accepted:s.accepted+1}:{...s,rejected:s.rejected+1};}
/** A failed transaction never replays automatically after a wire is restored. */
export function raArmDriverWrite(s:RaArmDriver,b:RaArmBus,w:Extract<RoverArmWrite,{kind:'servo'}>):RaArmDriver{
 if(!Number.isInteger(w.channel)||w.channel<0||w.channel>5||!Number.isInteger(w.pulseUs)||w.pulseUs<0||w.pulseUs>2500)throw new RangeError('Invalid six-channel servo request');
 if(!raArmBusReady(s,b))return{...s,rejected:s.rejected+1};
 const ticks=[...s.ticks];ticks[w.channel]=w.pulseUs===0?4096:Math.trunc(w.pulseUs/((s.prescale+1)*1e6/25e6));
 return{...s,ticks,accepted:s.accepted+1};
}
/** Missing pulses do not promise a particular servo's physical failsafe or
 * gravitational behavior. The workshop must not silently animate home. */
export function raArmDriverOutputs(s:RaArmDriver,r:RaArmRails){
 if(r.leads.length!==6)throw new RangeError('Six servo lead states required');
 return r.leads.map((lead,index)=>{
  const count=s.ticks[index],headerPulseUs=s.logicPower&&s.awake&&r.outputEnabled&&count>0&&count<4096?count*(s.prescale+1)*1e6/25e6:null;
  const pulse=lead.signal&&lead.ground?headerPulseUs:null;
  const powered=r.servoSupply&&lead.power&&lead.ground;
  return{powered,headerPulseUs,pulseUs:pulse,periodUs:s.logicPower&&s.awake?4096*(s.prescale+1)*1e6/25e6:null,status:!r.servoSupply||!lead.power?'no-power':!lead.ground?'no-reference':pulse===null?'no-pulse':'tracking'} as const;
 });
}
