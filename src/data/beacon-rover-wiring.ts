import routedPoints from './beacon-rover-wire-routes.json';
import {bluetoothCarUnoPoint,bluetoothCarBreakoutPoint,type CarPoint} from './bluetooth-car-layout';
import {carMiniBreadboard,carMiniHole} from './bluetooth-mini-breadboard';
import {carCableExit,bluetoothCarWires,type CarTerminal,type CarWire} from './bluetooth-car-wiring';
import {beaconCellTerminals} from './beacon-rover-layout';
export const beaconTiePoint=(col:number,bank:-1|1,row:number):CarPoint=>carMiniHole(col,bank,row).map((v,i)=>v+carMiniBreadboard.at[i]) as CarPoint;
const overrides:Record<string,CarPoint[]>=Object.fromEntries(Object.entries(routedPoints).map(([id,points])=>[id,points.map(([x,y,z])=>[x,y,z] as CarPoint)]));
const route=(w:CarWire):CarWire=>({...w,points:[carCableExit(w.ends[0]),...(overrides[w.id]??w.points.slice(1,-1)),carCableExit(w.ends[1])]});
const up:CarPoint=[0,1,0],u=(pin:string):CarTerminal=>({at:bluetoothCarUnoPoint(pin),axis:up,type:'male-jumper',insertion:.11}),tie=(col:number,bank:-1|1,row:number):CarTerminal=>({at:beaconTiePoint(col,bank,row),axis:up,type:'male-jumper',insertion:.11}),driver=(pin:string):CarTerminal=>({at:bluetoothCarBreakoutPoint('tb6612',pin).map((v,i)=>v-(i===1?.016:0)) as CarPoint,axis:up,type:'female-jumper'});
function wire(id:string,name:string,from:string,to:string,color:string,ends:[CarTerminal,CarTerminal],height:number,why:string):CarWire{
 const [a,b]=ends.map(carCableExit);return route({id,name,from,to,color,step:10,why,ends,points:[a,[a[0],height,a[2]],[b[0],height,b[2]],b]});
}
/** Low-current circuit only. Motor/AA routes are added separately, never through breadboard ties. */
export function beaconSignalWires():CarWire[]{
 const wires=[wire('beacon-5v','5 V divider supply','Uno 5V','Supply tie / 1','#b95452',[u('5V'),tie(0,-1,0)],1.63,'Feeds both CdS dividers and driver logic; this is separate from motor VM.'),wire('beacon-gnd','Common logic reference','Uno GND-P1','Ground tie / 1','#37434e',[u('GND-P1'),tie(16,1,0)],1.55,'Completes the divider return and establishes the ADC reference.'),wire('beacon-vcc','Driver logic supply','Supply tie / 2','TB6612 VCC','#bd6158',[tie(0,-1,1),driver('VCC')],1.61,'TB6612 VCC uses 5 V; the motor battery connects to VM.'),wire('beacon-driver-gnd','Driver logic ground','Ground tie / 2','TB6612 GND','#37434e',[tie(16,1,1),driver('GND')],1.53,'The digital motor signals need the same ground reference as the Uno.')];
 for(const i of [0,1] as const){const side=i?'right':'left',label=i?'Right':'Left',col=i?10:5,pin=i?'A1':'A0',sensor=beaconCellTerminals(i),supply:CarTerminal={at:sensor.supply,axis:[0,0,1],type:'solder'},signal:CarTerminal={at:sensor.signal,axis:[0,0,1],type:'solder'};
 wires.push(wire(`beacon-${side}-supply`,`${label} CdS supply`,'Supply tie / '+(i+3),`${label} CdS outer lead`,'#b45b51',[tie(0,-1,i+2),supply],1.81+i*.08,'Light lowers the CdS resistance between 5 V and the analog sensing node.'),wire(`beacon-${side}-node`,`${label} light-dependent node`,`${label} CdS inner lead`,`${label} divider node`,'#c29c4f',[signal,tie(col,-1,0)],1.87+i*.08,'This tie joins the sensor, analog input and upper end of its 10 kΩ ground resistor.'),wire(`beacon-${side}-adc`,`${label} analog input`,`${label} divider node`,`Uno ${pin}`,'#729d9d',[tie(col,-1,1),u(pin)],1.72+i*.08,'The Uno samples this node from 0 to 1023. Brighter light produces a higher voltage.'),wire(`beacon-${side}-return`,`${label} 10 kΩ return`,`${label} resistor lower tie`,'Common ground tie','#45505c',[tie(col,1,0),tie(16,1,i+2)],1.48+i*.06,'Grounds the lower resistor lead without joining the two independent analog nodes.'));
 }
 wires.push(wire('beacon-led-drive','Arrival LED drive','Uno D10','220 Ω input tie','#a36bb2',[u('D10'),tie(0,1,0)],2.05,'D10 goes HIGH only on arrival; the series 220 Ω resistor limits LED current.'),wire('beacon-led-return','LED cathode return','LED cathode tie','Common ground tie','#434e59',[tie(7,1,0),tie(16,1,4)],1.46,'Returns current from the flat-edged cathode to ground.'));
 return wires;
}

/** Same physical motor hardware and Uno pin assignment; no Bluetooth radio is fitted. */
export function beaconMotorWires():CarWire[]{
 const names=new Set(['wire-pwma','wire-pwmb','wire-ain1','wire-ain2','wire-bin1','wire-bin2','wire-stby','wire-a01','wire-a02','wire-b01','wire-b02','wire-aa-switch','wire-vm','wire-aa-return']);
 return bluetoothCarWires().filter(w=>names.has(w.id)).map(w=>{
  const ends=w.ends.map(t=>({...t,at:[...t.at] as CarPoint} )) as [CarTerminal,CarTerminal];
  for(const t of ends)if(t.type==='female-jumper')t.at[1]-=.016;
  return route({...w,id:'beacon-'+w.id,step:w.step===9?11:w.step===10?12:13,ends,points:[carCableExit(ends[0]),...w.points.slice(1,-1),carCableExit(ends[1])]});
 });
}
