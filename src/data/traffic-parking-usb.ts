import uno from './uno-r3-board-layout.json';
import {trafficParkingCircuitLayout as layout,type ParkingPoint as P} from './traffic-parking-circuit-layout';
const socket=uno.elements.find(e=>e.name==='X2')!;
export const trafficParkingUsbUnoFace:P=[layout.uno[0]+Number(socket.x)-34.29-8,layout.uno[1]+6.3,layout.uno[2]+26.67-Number(socket.y)];
export const trafficParkingUsbHostFace:P=[-200,16,-10];
/** Authored connector travel, millimetres. The raised free host plug clears
 * the computer platform before sliding along the receptacle axis. */
export function trafficParkingUsbPose(withdrawal:number,hostWithdrawal=0){if(![withdrawal,hostWithdrawal].every(n=>Number.isFinite(n)&&n>=0&&n<=12))throw new RangeError('USB withdrawal must be 0–12 mm.');const f=Math.max(0,Math.min(1,(hostWithdrawal-6)/6)),lift=20*f*f*(3-2*f),a:P=[trafficParkingUsbUnoFace[0]-withdrawal,trafficParkingUsbUnoFace[1],trafficParkingUsbUnoFace[2]],b:P=[trafficParkingUsbHostFace[0]+hostWithdrawal,trafficParkingUsbHostFace[1]+lift,trafficParkingUsbHostFace[2]],points:readonly P[]=[[a[0]-24,a[1],a[2]],[a[0]-32,a[1],a[2]],[-175,28,100],[-160,25,75],[-155,22,30],[-160,20,-10],[b[0]+32,b[1],b[2]],[b[0]+24,b[1],b[2]]];return {uno:a,host:b,points};}
export type TrafficParkingUsbMotion={unoWithdrawal:number;hostWithdrawal:number};
export function trafficParkingUsbAdvance(pose:TrafficParkingUsbMotion,elapsedMs:number,unoTarget:number,hostTarget:number):TrafficParkingUsbMotion{trafficParkingUsbPose(pose.unoWithdrawal,pose.hostWithdrawal);trafficParkingUsbPose(unoTarget,hostTarget);if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid USB elapsed time');const step=elapsedMs*.024,move=(v:number,t:number)=>Math.abs(t-v)<=step+1e-10?t:Math.round((v+Math.sign(t-v)*step)*1e10)/1e10;return {unoWithdrawal:move(pose.unoWithdrawal,unoTarget),hostWithdrawal:move(pose.hostWithdrawal,hostTarget)};}
export function trafficParkingUsbMated(requested:boolean,pose:TrafficParkingUsbMotion){return requested&&pose.unoWithdrawal===0&&pose.hostWithdrawal===0;}
export const trafficParkingUsbParts=[
 {id:'tp-host-platform',label:'Computer worktop',what:'Supports the programming computer beside the circuit.',connection:'Meets the main mat edge. This support is mechanical and carries no electrical supply.'},
 {id:'tp-host-body',label:'Programming computer',what:'Represents the computer used to upload the sketch and inspect serial messages.',connection:'The browser simulates the Uno. Download traffic_parking.ino for actual Arduino IDE upload to a physical board.'},
 {id:'tp-host-input',label:'Keyboard and touchpad',what:'Represent the controls used to edit code and inspect serial messages.',connection:'Select Arduino Uno and the correct serial port in Arduino IDE. Use 115200 baud to inspect parking request messages. Calibration is a separate sketch.'},
 {id:'tp-host-display',label:'Traffic and parking Serial Monitor',what:'Shows the sketch’s spaces-left and entry-denied messages.',connection:'Messages describe operator requests; no vehicle sensor or remote server is connected.'},
 {id:'tp-host-port',label:'Computer USB-A socket',what:'Receives the computer-end plug in an open metal shield.',connection:'Its four contacts carry USB supply and data. Seat this end before the Uno end to power the simulation.'},
 {id:'tp-usb-cable',label:'USB power and data cable',what:'Carries computer power and programming data to the Uno.',connection:'USB powers the Uno and the seven LED branches. The servo uses a separate regulated 5 V source with common ground; USB does not replace that supply.'},
 {id:'tp-usb-b-shield',label:'USB-B plug shield',what:'Fits inside the Uno USB-B receptacle along its socket axis.',connection:'The metal shell enters the socket while the insulated grip remains outside. Do not insert it sideways.'},
 {id:'tp-usb-b-grip',label:'Uno-end grip and strain relief',what:'Supports the cable where it enters the Uno plug.',connection:'Seat both USB ends after checking the unpowered circuit. Power starts only once the visible plug movement completes.'},
 {id:'tp-usb-b-contacts',label:'USB-B contact insert',what:'Supports the four mating power and data fingers.',connection:'These authored contact shapes illustrate mating with the Uno socket, not a USB pinout or fabrication reference.'},
 {id:'tp-usb-a-shield',label:'USB-A plug shield',what:'Fits the hollow computer receptacle.',connection:'Align its tongue and shield with the host port. The plug lifts clear of the worktop when removed.'},
 {id:'tp-usb-a-grip',label:'Computer-end grip and strain relief',what:'Supports the cable at the host connection.',connection:'Handle the insulated grip instead of pulling the cable. This end visibly seats before the Uno plug.'},
 {id:'tp-usb-a-contacts',label:'USB-A contact insert',what:'Supports four computer-end conductive fingers.',connection:'The fingers meet the receptacle contacts as the plug seats. The browser does not connect to a real USB device.'},
] as const;
/** Consume leftover frame time across the two phases, so frame partitioning
 * cannot change insertion duration. Connect host first; disconnect Uno first. */
export function trafficParkingUsbRequestedAdvance(pose:TrafficParkingUsbMotion,elapsedMs:number,requested:boolean):TrafficParkingUsbMotion{
 trafficParkingUsbPose(pose.unoWithdrawal,pose.hostWithdrawal);if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid USB elapsed time');
 const firstDistance=requested?pose.hostWithdrawal:12-pose.unoWithdrawal,firstMs=Math.min(elapsedMs,firstDistance/.024),a=trafficParkingUsbAdvance(pose,firstMs,requested?pose.unoWithdrawal:12,requested?0:pose.hostWithdrawal),left=elapsedMs-firstMs;
 return trafficParkingUsbAdvance(a,left,requested?0:12,requested?0:12);
}
