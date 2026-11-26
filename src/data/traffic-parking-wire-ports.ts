import {trafficParkingBoardHole,trafficParkingUnoContact,type ParkingPoint} from './traffic-parking-circuit-layout';
import {trafficParkingLampTerminal,trafficParkingLamps,trafficParkingSignalHeads} from './traffic-parking-signals';
import {trafficParkingSupplyContact} from './traffic-parking-supply';
import {trafficParkingServoContact} from './traffic-parking-servo-lead';
import {trafficParkingPortLabel} from './traffic-parking-netlist';
export type ParkingWirePort={kind:'male-up'|'female-led'|'male-servo'|'bare-supply';point:ParkingPoint;axis:ParkingPoint;label:string};
/** `point` is the deepest seated conductor tip (or the LED's existing tip
 * inside a female socket). `axis` points out toward the jumper insulation.
 * This avoids mixing header-mouth heights with seated male-pin endpoints. */
export function trafficParkingWirePort(port:string):ParkingWirePort{
 const [device,pin,bank,row]=port.split('.'),label=trafficParkingPortLabel(port);
 if(device==='uno'){const p=trafficParkingUnoContact(pin);return {kind:'male-up',point:[p[0],p[1]-5,p[2]],axis:[0,1,0],label};}
 if(device==='resistors'||device==='buttons'){if(+bank!==-1&&+bank!==1)throw new RangeError('Unknown parking contact bank');const p=trafficParkingBoardHole(device,+pin,+bank as -1|1,+row);return {kind:'male-up',point:[p[0],p[1]-5,p[2]],axis:[0,1,0],label};}
 if(device==='lamp'){if(bank!=='anode'&&bank!=='cathode')throw new RangeError('Unknown LED leg');const lamp=trafficParkingLamps.find(l=>l.id===pin);if(!lamp)throw new RangeError('Unknown parking lamp');const head=trafficParkingSignalHeads.find(h=>h.id===lamp.head)!;return {kind:'female-led',point:trafficParkingLampTerminal(pin,bank),axis:[-Math.sin(head.rotation),0,-Math.cos(head.rotation)],label};}
 if(device==='supply'){if(pin!=='positive'&&pin!=='negative')throw new RangeError('Unknown supply polarity');return {kind:'bare-supply',point:trafficParkingSupplyContact(pin,+bank),axis:[0,0,1],label};}
 if(device==='servo')return {kind:'male-servo',point:trafficParkingServoContact(pin),axis:[0,0,1],label};
 throw new RangeError('Unknown parking wire port');
}
export function trafficParkingWireExit(port:ParkingWirePort):ParkingPoint{const length=port.kind==='male-up'?12.5:port.kind==='male-servo'?13.5:port.kind==='female-led'?4.5:9;return [port.point[0]+port.axis[0]*length,port.point[1]+port.axis[1]*length,port.point[2]+port.axis[2]*length];}
