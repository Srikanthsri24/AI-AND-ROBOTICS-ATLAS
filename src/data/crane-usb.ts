import uno from './uno-r3-board-layout.json';
import {craneLayout,type CranePoint as P} from './crane-layout';
const socket=uno.elements.find(e=>e.name==='X2')!;
/** Same millimetre coordinates as the detailed Uno R3 USB-B receptacle. */
export const craneUsbUnoFace:P=[craneLayout.uno[0]+Number(socket.x)-34.29-8,craneLayout.uno[1]+6.3,craneLayout.uno[2]+26.67-Number(socket.y)];
export const craneUsbHostFace:P=[-165,16,-10];
export function craneUsbPose(withdrawal:number,hostWithdrawal=0){
 if(![withdrawal,hostWithdrawal].every(n=>Number.isFinite(n)&&n>=0&&n<=12))throw new RangeError('USB withdrawal must be 0–12 mm.');
 const liftFraction=Math.max(0,Math.min(1,(hostWithdrawal-6)/6)),lift=20*liftFraction*liftFraction*(3-2*liftFraction);
 const uno:P=[craneUsbUnoFace[0]-withdrawal,craneUsbUnoFace[1],craneUsbUnoFace[2]],host:P=[craneUsbHostFace[0]+hostWithdrawal,craneUsbHostFace[1]+lift,craneUsbHostFace[2]];
 const points:readonly P[]=[[uno[0]-24,uno[1],uno[2]],[uno[0]-34,uno[1],uno[2]],[-155,24,-96],[-145,22,-108],[-125,20,-96],[-120,18,-40],[-120,17,-10],[host[0]+32,host[1],host[2]],[host[0]+24,host[1],host[2]]];
 return{uno,host,points};
}
export const craneUsbParts=[
 ['crane-host-platform','Computer worktop extension','Supports the computer beside the model without covering the keyboard.','The worktop meets the main base at its left edge. It has no electrical connection.'],
 ['crane-host-body','Workshop computer chassis','An authored laptop represents the host used to upload the Arduino sketch and inspect serial readings.','The open Type-A port supplies USB power and data. This browser model does not connect to real hardware.'],
 ['crane-host-input','Keyboard and touchpad','Represent the computer controls used to edit the program and open Serial Monitor.','Download the actual Arduino C++ sketch from the program section; the frontend does not pretend to upload it to a real Uno.'],
 ['crane-host-display','Workshop serial display','Shows the model host connection and the sketch’s original serial text.','Use 115200 baud on real hardware. The rows are simulated event messages (Idle, Holding, Timeout or release to arm), not a measurement of lifting force.'],
 ['crane-host-port','Open USB Type-A host port','A hollow shield and supported contact tongue receive the host-side plug.','Normally the Type-A end stays seated. With USB disconnected, the inspection control withdraws the host plug clear of the port, then lifts it for viewing. Reseating lowers it before final insertion; power stays off.'],
 ['crane-usb-cable','USB power and data cable','A continuous insulated cable joins the two supported plugs.','Carries power, return and serial data through the Uno USB bridge. It stays separate from the button, gate-command and independent coil-power circuits.'],
 ['crane-usb-b-shield','USB-B plug metal shield','A hollow shell with bevelled upper corners fits the actual authored Uno socket.','Its tip enters the socket; its grip stays outside. These authored contact shapes are not a USB pinout reference.'],
 ['crane-usb-b-grip','USB-B grip and strain relief','Supports the cable where it leaves the Uno-side plug.','Disconnect by the housing along the socket axis. The open pose withdraws the plug by 12 mm.'],
 ['crane-usb-b-contacts','USB-B contact insert','Insulation supports the four mating metal fingers inside the plug shield.','Transfers power and data to the Uno receptacle. Keep all contacts disconnected while assembling the circuit.'],
 ['crane-usb-a-shield','USB-A plug metal shield','An open rectangular shell mates with the computer’s actual open port.','The shell enters the port while the larger grip remains outside.'],
 ['crane-usb-a-grip','USB-A grip and strain relief','Transfers handling force to the insulated cable jacket.','The host-side grip stays outside its port and joins the continuous cable.'],
 ['crane-usb-a-contacts','USB-A contact insert','Four metal fingers sit on a supported insulating insert.','Mates with the host tongue. This represents a data cable, rather than a power-only cable.'],
] as const;

export type CraneUsbMotion={unoWithdrawal:number;hostWithdrawal:number};
/** Authored 24 mm/s connector animation; this is not a measured insertion speed. */
export function craneUsbAdvance(pose:CraneUsbMotion,elapsedMs:number,unoTarget:number,hostTarget:number):CraneUsbMotion{
 craneUsbPose(pose.unoWithdrawal,pose.hostWithdrawal);craneUsbPose(unoTarget,hostTarget);
 if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('USB elapsed time must be finite and nonnegative.');
 const step=elapsedMs*.024,move=(value:number,target:number)=>Math.abs(target-value)<=step+1e-10?target:Math.round((value+Math.sign(target-value)*step)*1e10)/1e10;
 return {unoWithdrawal:move(pose.unoWithdrawal,unoTarget),hostWithdrawal:move(pose.hostWithdrawal,hostTarget)};
}
export function craneUsbMated(requested:boolean,pose:CraneUsbMotion){return requested&&pose.unoWithdrawal===0&&pose.hostWithdrawal===0;}
