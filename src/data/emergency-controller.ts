import {CurvePath,LineCurve3,QuadraticBezierCurve3,Vector3} from 'three';
import uno from './uno-r3-board-layout.json';
import type {EmergencyPoint} from './emergency-corridor';
export const emergencyUnoAt:EmergencyPoint=[-190,9,110];
export const emergencyUnoContactY=18.3;
export function emergencyUnoContact(name:string):EmergencyPoint{const h=uno.headers.find(h=>h.name===name);if(!h)throw Error('Unknown emergency Uno socket '+name);return[emergencyUnoAt[0]+Number(h.x)-34.29,emergencyUnoContactY,emergencyUnoAt[2]+26.67-Number(h.y)];}
export const emergencyUnoFeet=uno.holes.map(h=>[emergencyUnoAt[0]+Number(h.x)-34.29,0,emergencyUnoAt[2]+26.67-Number(h.y)] as EmergencyPoint);
const usb=uno.elements.find(e=>e.name==='X2')!;
export const emergencyUsbCentre:EmergencyPoint=[emergencyUnoAt[0]+Number(usb.x)-34.29,emergencyUnoAt[1]+6.3,emergencyUnoAt[2]+26.67-Number(usb.y)];
export const emergencyUsbHost:EmergencyPoint=[-280,10,150];
export function emergencyUsbPath(withdrawal:number):EmergencyPoint[]{if(!Number.isFinite(withdrawal)||withdrawal<0||withdrawal>18)throw Error('USB withdrawal must be 0–18 mm');const u=emergencyUsbCentre;return[[u[0]-31-withdrawal,u[1],u[2]],[-292,u[1],u[2]],[-292,7,118],[-258,7,118],[-255,7,145],[-236,10,140],[-232,10,150],[-244,10,150]];}
/** Rounded, tangent-continuous USB routing; corner cuts never overlap on a shared span. */
export function emergencyUsbCurve(withdrawal:number){const points=emergencyUsbPath(withdrawal).map(p=>new Vector3(...p)),path=new CurvePath<Vector3>();let cursor=points[0];for(let i=1;i<points.length-1;i++){const previous=points[i].clone().sub(points[i-1]),next=points[i+1].clone().sub(points[i]),cut=.48*Math.min(previous.length(),next.length()),entry=points[i].clone().addScaledVector(previous.normalize(),-cut),exit=points[i].clone().addScaledVector(next.normalize(),cut);path.add(new LineCurve3(cursor,entry));path.add(new QuadraticBezierCurve3(entry,points[i],exit));cursor=exit;}path.add(new LineCurve3(cursor,points.at(-1)!));return path;}
export const emergencyControllerParts=[
 ['emergency-uno-pcb','Uno R3 · corridor controller','The original R3 board outline, mounting axes and component placement support the source sketch.','A0 reads light; D2 Alarm and D3 Reset are active-low. D5–D7 drive the three white branches, D8 the red branch and D9 the series-limited piezo.'],
 ['emergency-uno-mcu','ATmega328P · lighting and alarm logic','The main AVR retains the 30/42 brightness hysteresis and the manually latched alarm.','Alarm acts immediately. Reset qualifies for 30 ms and only clears when Alarm is released. The red beacon and 1250 Hz command share a 500 ms pulse envelope.'],
 ['emergency-uno-headers','Uno R3 · open connection sockets','The actual original socket axes expose power, analogue and digital contacts without an added shield.','Use 5 V, common GND, A0, D2, D3 and D5–D9. D0/D1 stay free for the USB serial interface.'],
 ['emergency-uno-usb','Uno USB-B · supply and upload','The real open metal port receives a hollow USB sleeve around its internal contact tongue.','USB supplies this low-voltage model and uploads the sketch. Removing it powers the model off; this circuit has no backup battery.'],
 ['emergency-uno-bridge','USB serial interface','The separate USB-interface AVR connects the computer to the main controller.','Upload emergency_warning_lighting.ino and open Serial Monitor at 9600 baud. The browser never uploads firmware or opens a physical port.'],
 ['emergency-uno-power','Uno power conditioning','Regulators and capacitors support the controller supply. The barrel connector is unused.','This model uses low-current LEDs and a passive piezo. There is no mains-powered corridor circuit or motor supply.'],
 ['emergency-uno-reset','Uno reset switch','Restarts the sketch with dark mode and the latch cleared before the first new input sample.','A currently held Alarm immediately latches again on the first loop; a new dark reading also restores night lighting.'],
 ['emergency-uno-tracks','Original Uno copper routes','The original top-layer routes connect the controller and its board-level support circuitry.','These tracks are separate from the 25 external student conductors in this project.'],
 ['emergency-uno-programming','AVR ICSP headers','The main and USB-interface six-pin programming headers remain part of the original board.','Both are unused by this USB-uploaded classroom sketch; do not confuse them with the LED output sockets.'],
 ['emergency-uno-leds','Uno power and activity lamps','ON illustrates the supplied logic rail. RX/TX belong to the USB serial interface.','Read the actual three white path LEDs and the separate red beacon for the project output; the unused L indicator is not the warning beacon.'],
 ['emergency-uno-feet','Insulating Uno mounting feet','Four bored supports meet the original board-hole axes and separate solder joints from the base.','Seat the board on these feet before inserting the separate screws. The feet are mechanical supports, not ground connections.'],
 ['emergency-uno-screws','Uno retaining screws','Separate metal shafts and heads hold the board on its insulating supports.','Each shaft passes through a genuine PCB mounting hole and the matching open support bore.'],
 ['emergency-usb-cable','USB programming and supply lead','The hollow B plug, moulded body, strain relief and insulated cable form one traceable connection.','The Uno end withdraws 18 mm when disconnected. Its path stays outside the board and host housing.'],
 ['emergency-usb-host','Illustrated computer USB interface','This authored connector block represents the off-bench computer providing USB power and running Arduino IDE.','The model is an illustration of the host connection; it performs no real USB access or firmware upload.'],
];
