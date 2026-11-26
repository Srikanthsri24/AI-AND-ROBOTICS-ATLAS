import uno from './uno-r3-board-layout.json';
import {rainWorkbenchLayout as rainLayout,type RainPoint as P} from './rain-workbench-layout';
const socket=uno.elements.find(e=>e.name==='X2')!;
/** Same millimetre coordinates as the detailed Uno R3 USB-B receptacle. */
export const rainUsbUnoFace:P=[rainLayout.uno[0]+Number(socket.x)-34.29-8,rainLayout.uno[1]+6.3,rainLayout.uno[2]+26.67-Number(socket.y)];
export const rainUsbHostFace:P=[-165,16,-10];
export function rainUsbPose(withdrawal:number,hostWithdrawal=0){
 if(![withdrawal,hostWithdrawal].every(n=>Number.isFinite(n)&&n>=0&&n<=12))throw new RangeError('USB withdrawal must be 0–12 mm.');
 const liftFraction=Math.max(0,Math.min(1,(hostWithdrawal-6)/6)),lift=20*liftFraction*liftFraction*(3-2*liftFraction);
 const uno:P=[rainUsbUnoFace[0]-withdrawal,rainUsbUnoFace[1],rainUsbUnoFace[2]],host:P=[rainUsbHostFace[0]+hostWithdrawal,rainUsbHostFace[1]+lift,rainUsbHostFace[2]];
 const points:readonly P[]=[[uno[0]-24,uno[1],uno[2]],[uno[0]-32,uno[1],uno[2]],[-153,25,50],[-155,23,35],[-151,22,15],[-142,20,-1],[host[0]+32,host[1],host[2]],[host[0]+24,host[1],host[2]]];
 return{uno,host,points};
}
export type RainUsbMotion={unoWithdrawal:number;hostWithdrawal:number};
/** Authored 24 mm/s connector animation; this is not a measured insertion speed. */
export function rainUsbAdvance(pose:RainUsbMotion,elapsedMs:number,unoTarget:number,hostTarget:number):RainUsbMotion{
 rainUsbPose(pose.unoWithdrawal,pose.hostWithdrawal);rainUsbPose(unoTarget,hostTarget);
 if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('USB elapsed time must be finite and nonnegative.');
 const step=elapsedMs*.024,move=(value:number,target:number)=>Math.abs(target-value)<=step+1e-10?target:Math.round((value+Math.sign(target-value)*step)*1e10)/1e10;
 return {unoWithdrawal:move(pose.unoWithdrawal,unoTarget),hostWithdrawal:move(pose.hostWithdrawal,hostTarget)};
}
export function rainUsbMated(requested:boolean,pose:RainUsbMotion){return requested&&pose.unoWithdrawal===0&&pose.hostWithdrawal===0;}
export const rainUsbParts=[
 ['rain-host-platform','Computer worktop','Supports the programming computer beside the dry workbench.','The worktop meets the main mat edge and makes no electrical connection.'],
 ['rain-host-body','Programming computer','Represents the host used to upload Arduino C++ and inspect serial readings.','The frontend does not upload to a real Uno; the actual sketch is downloaded separately.'],
 ['rain-host-input','Keyboard and touchpad','Represent the controls used to edit the sketch and open Serial Monitor.','Choose Arduino Uno and the actual serial port in the Arduino IDE.'],
 ['rain-host-display','Rain Serial Monitor','Displays the sketch’s WET / DRY input and requested shelter state.','Use 115200 baud. Sheltered or Extended is the commanded state; the physical carriage takes time to move.'],
 ['rain-host-port','Computer USB-A receptacle','Its hollow shield receives the host plug.','The four supported contacts carry USB power and data.'],
 ['rain-usb-cable','USB power and data cable','Connects the computer to the Uno USB bridge.','It powers the Uno and water sensor, not the independently supplied servo.'],
 ['rain-usb-b-shield','USB-B plug shield','Fits the Uno USB-B receptacle along its socket axis.','The metal shell enters the socket while the wider grip stays outside.'],
 ['rain-usb-b-grip','USB-B grip and strain relief','Supports the cable at the controller connection.','Connect USB only after checking all circuit wiring with power off.'],
 ['rain-usb-b-contacts','USB-B contact insert','Supports the four mating fingers inside the shield.','Transfers USB power and data; these authored shapes are not a USB pinout reference.'],
 ['rain-usb-a-shield','USB-A plug shield','Fits the open computer port.','Keep the plug aligned; do not force it sideways.'],
 ['rain-usb-a-grip','USB-A grip and strain relief','Supports the cable at the computer connection.','Handle the insulated housing rather than pulling the cable.'],
 ['rain-usb-a-contacts','USB-A contact insert','Supports the computer-end power and data fingers.','Mates with the computer receptacle tongue.'],
] as const;
