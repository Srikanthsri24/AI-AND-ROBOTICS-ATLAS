import layout from './tap-mosfet-layout.json';
export const tapDriverPlacement=[207,231,-66] as const;
export function tapDriverPoint(x:number,y:number,h:number):[number,number,number]{return [tapDriverPlacement[0]+x-12.7,tapDriverPlacement[1]+h,tapDriverPlacement[2]+8.89-y];}
export function tapDriverPad(element:string,name:string){const p=layout.pads.find(p=>p.element===element&&p.name===name);if(!p)throw new RangeError('Unknown tap driver pad');return {...p,point:tapDriverPoint(p.x,p.y,.85)};}
export const tapDriverParts=[
 ['tap-driver-pcb','Motor driver · PCB','The black 25.4 × 17.78 mm board carries the low-side MOSFET circuit. The mounting bores, component positions and surface routes follow the official Adafruit PCB file.'],
 ['tap-driver-tracks','Motor driver · copper routes','These actual top-layer paths connect the input, output and switching circuit. VIN goes to OUT+; the MOSFET switches OUT− to ground.'],
 ['tap-driver-mosfet','Motor driver · AO3406 MOSFET','Uno D9 drives the gate through SIG. The MOSFET carries the pump current between the switched output and ground, keeping motor current out of the Uno GPIO.'],
 ['tap-driver-diode','Motor driver · flyback diode','The diode gives motor current a path when the MOSFET turns off. Its cathode connects to VIN and its anode to switched OUT−; it is not in series with the motor.'],
 ['tap-driver-passives','Motor driver · resistors and capacitor','Includes the gate pull-down, indicator resistors and supply capacitor at the reference PCB positions. The pull-down keeps the MOSFET off when its signal is not actively driven.'],
 ['tap-driver-on','Motor driver · supply indicator','The green ON indicator follows the separate driver VIN supply. A lit indicator is not a measurement of water flow or pump rotation.'],
 ['tap-driver-signal-led','Motor driver · signal indicator','The red SIG indicator follows the control input. The Uno can request pumping while an absent motor supply prevents physical rotation.'],
 ['tap-driver-socket','Motor driver · three-pin STEMMA socket','The keyed JST PH socket accepts GND, VIN and SIG. The connector is separate from the motor output block; its signal comes from Uno D9.'],
 ['tap-driver-ground','Motor driver · GND contact','Join this actual contact to the pump supply negative and Uno GND. The shared reference is required for a valid D9 control signal.'],
 ['tap-driver-vin','Motor driver · VIN contact','Connect this actual contact to the separate regulated 5 V pump supply. It powers OUT+ and the pump; do not connect it to the Uno 5 V output.'],
 ['tap-driver-signal','Motor driver · SIG contact','Connect this actual contact to Uno D9. A HIGH enables the low-side MOSFET, while LOW stops the motor if the rest of its circuit is connected.'],
 ['tap-driver-terminal-block','Motor driver · output terminal block','The two spring terminals accept the pump leads. Each opening leads to its own electrical contact; the positive terminal is VIN and the negative terminal is switched.'],
 ['tap-driver-positive','Motor driver · OUT+ contact','Connect the pump positive lead to this actual contact. It is connected to the independent VIN rail and is not switched by the MOSFET.'],
 ['tap-driver-negative','Motor driver · switched OUT− contact','Connect the pump negative lead to this actual contact. The MOSFET completes the path to common ground while SIG is HIGH.'],
 ['tap-driver-positive-lever','Motor driver · OUT+ release lever','Press this lever to release the positive motor wire, with both supplies disconnected. It operates the clamp for the VIN-connected output contact.'],
 ['tap-driver-negative-lever','Motor driver · OUT− release lever','Press this lever to release the negative motor wire, with both supplies disconnected. It operates the separate switched-return output clamp.'],
 ['tap-driver-breakout','Motor driver · optional breakout pads','The four open pads expose GND, VIN, SIG and OUT. This build adds a single GND reference header alongside the STEMMA input and spring outputs. Leave VIN, SIG and OUT breakout pads unconnected.'],
] as const;
