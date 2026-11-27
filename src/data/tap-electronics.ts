import uno from './uno-r3-board-layout.json';
import driver from './tap-mosfet-layout.json';
import {tapDriverPlacement} from './tap-driver';
import {carMiniHole} from './bluetooth-mini-breadboard';
export const tapElectronics={uno:[205,231,-119],breadboard:[238,223,-65],platformTop:223} as const;
export function tapUnoContact(name:string):[number,number,number]{const p=uno.headers.find(p=>p.name===name);if(!p)throw new RangeError('Unknown tap Uno contact');return [205+p.x-34.29,240.3,-119+26.67-p.y];}
export function tapBreadboardContact(column:number,bank:-1|1,row:number):[number,number,number]{const[x,y,z]=carMiniHole(column,bank,row);return [238+50*z,223+50*y,-65-50*x];}
export const tapControlMounts=[...uno.holes.map((h,i)=>({id:'tap-uno-fastener-'+i,x:205+Number(h.x)-34.29,z:-119+26.67-Number(h.y),board:231})),...driver.pads.filter(p=>p.net==='MOUNT').map((p,i)=>({id:'tap-driver-fastener-'+i,x:tapDriverPlacement[0]+p.x-12.7,z:tapDriverPlacement[2]+8.89-p.y,board:tapDriverPlacement[1]}))];
export const tapProgrammingRotations=Object.fromEntries(uno.elements.filter(e=>['ICSP','ICSP1'].includes(e.name)).map(e=>[e.name,Number((('rot'in e?e.rot:'R0')??'R0').replace('R',''))*Math.PI/180]));
export const tapElectronicsParts=[
 ['tap-uno-pcb','Controller · Uno R3 PCB','Holds the real Uno R3 component layout on insulating supports above the dry shelf. USB supplies the controller, while a separate regulated supply powers the pump.'],
 ['tap-uno-mcu','Controller · ATmega328P','Runs the tap sketch: confirm clear, detect a near hand, check the level input and stop on withdrawal, unavailable echo, low water or the four-second run limit.'],
 ['tap-uno-headers','Controller · Uno sockets','Connect D2 to TRIG, D3 to ECHO, D4 to the level output and D9 to driver SIG. The sensor 5 V and GND rails are separate from the motor positive supply.'],
 ['tap-uno-usb','Controller · USB-B port','Accepts the programming cable and logic power. Upload automatic_tap.ino here with the pump supply off, then open Serial Monitor at 115200 baud.'],
 ['tap-uno-bridge','Controller · USB serial interface','Carries uploads and the sketch status messages between the computer and main controller. A FILLING message is a software command, not proof that the pump has power.'],
 ['tap-uno-power','Controller · power conditioning','The regulators, capacitors and unused barrel jack belong to the Uno logic circuit. This project uses USB power; leave the barrel jack unconnected.'],
 ['tap-uno-reset','Controller · reset button','Restarts the sketch with D9 LOW and clear-space confirmation required. Reset does not refill or prime the physical tubing.'],
 ['tap-uno-tracks','Controller · copper routes','Actual board-level copper routes link the Uno components and header sockets. Coloured external wiring supplies the project-specific sensor and motor-control connections.'],
 ['tap-uno-programming','Controller · ICSP headers','The two six-pin headers serve the main and USB-interface AVR controllers. Both remain unconnected in this USB-programmed tap project.'],
 ['tap-uno-leds','Controller · logic power indicators','The ON light follows USB logic power. RX and TX belong to USB serial activity; the unused D13 indicator does not report water flow.'],
 ['tap-control-supports','Electronics · insulating supports','Six hollow posts hold both boards above the dry shelf. Their bonded bases stay on the shelf and their upper faces meet the PCB undersides. Fasteners enter the posts without passing into a wet area.'],
 ...tapControlMounts.map(m=>[m.id,(m.id.startsWith('tap-uno')?'Controller':'Motor driver')+' · mounting screw '+(Number(m.id.at(-1))+1),'A screw and washer retain this board through an actual open mounting bore. The insulating post beneath the board accepts the shaft; it is not an electrical connection.'] as const),
 ['tap-driver-reference-header','Motor driver · GND-only reference header','A single square pin is soldered into the GND breakout bore. The reference jumper connects this pin to the Uno ground strip; VIN, SIG and OUT breakout pads remain unconnected.'],
 ['tap-breadboard','Connections · mini breadboard','Each numbered column has two separate five-contact banks. Opposite banks and adjacent columns are not joined. Use distinct strips for sensor 5 V, sensor ground and the independent motor supply reference.'],
] as const;
