import uno from './uno-r3-board-layout.json';
import {railwayUnoAt} from './railway-power-layout';
import type {RailwayPoint as P} from './railway-electrical-layout';
const socket=uno.elements.find(e=>e.name==='X2')!;
/** Matches the actual authored Uno receptacle geometry, in native millimetres. */
export const railwayUsbUnoFace:P=[railwayUnoAt[0]+Number(socket.x)-34.29-8,railwayUnoAt[1]+.8+5.5,railwayUnoAt[2]+26.67-Number(socket.y)];
export const railwayUsbHostFace:P=[390,6,255];
export type RailwayUsbMotion={usb:boolean;usbUno:number;usbHost:number};
export const railwayUsbParts=[
 ['railway-host-platform','Computer worktop extension','Supports the workshop host beside the crossing board.','The matching wood extension meets the model base at its front edge; it stays outside the train corridor.'],
 ['railway-computer-base','Workshop computer chassis','An authored computer represents the USB host used to upload the sketch and receive its serial output.','The open right-side receptacle accepts the Type-A cable end. This is a browser teaching model, not a connection to a physical computer.'],
 ['railway-computer-input','Keyboard and touchpad','Represent the host inputs used to edit, upload and inspect the Arduino sketch.','The actual downloadable program remains the original one-way railway-gate sketch; the browser does not pretend to compile or upload to real hardware.'],
 ['railway-computer-hinges','Display hinges','Support the tilted host display above its base.','The display remains with the host computer; it is not part of the crossing model.'],
 ['railway-computer-frame','Host display enclosure','Surrounds the workshop status display.','The physical model shows a simulated host; student controls and serial output stay inside this standalone frontend.'],
 ['railway-computer-screen','Workshop host display','Shows the simulated USB connection state; the workshop can supply a live serial-display texture here.','USB powers the Uno and beam sensors and carries serial data. The separate servo supply still powers the motor.'],
 ['railway-computer-usb-port','Host USB Type-A receptacle','An actual open shield and supported contact tongue accept the cable plug.','The host provides USB logic power and serial communication through the Uno USB bridge.'],
 ['railway-usb-cable','USB data and logic-power cable','A continuous jacket joins the two actual plug housings and flexes when either end moves.','Type A connects to the host; Type B connects to the Uno. It does not power the servo motor.'],
 ['railway-usb-b-shield','Uno-side USB Type-B metal shield','A hollow shield with bevelled upper corners surrounds the plug’s supported mating contacts.','Its front enters the Uno’s actual receptacle. The larger grip remains outside the socket. This authored fit is not a connector pinout reference.'],
 ['railway-usb-b-grip','Uno-side USB grip and strain relief','Supports the shield and bends the cable away from the Uno board edge.','Withdraw along the socket axis, with servo power off during upload or assembly.'],
 ['railway-usb-b-contacts','Uno-side USB contact insert','Four supported contact fingers mate with the contacts around the actual authored receptacle tongue.','They carry USB power, ground and data; the Uno USB bridge handles the computer link. No individual pin numbering is taught by this reference geometry.'],
 ['railway-usb-a-shield','Host-side USB Type-A metal shield','An open rectangular metal shell fits inside the actual host receptacle.','Its four contacts engage the supported socket tongue while the grip remains outside.'],
 ['railway-usb-a-grip','Host-side USB grip and strain relief','Transfers handling force to the cable jacket instead of its inner contacts.','The cable leaves the rear of this housing and continues to the Uno-side grip.'],
 ['railway-usb-a-contacts','Host-side USB contact insert','The supported four-contact insert mates with the host’s actual contact tongue.','This represents a USB data cable, not a power-only lead. The browser simulates its connection state.'],
] as const;
export function railwayUsbPose(unoWithdrawal=0,hostWithdrawal=0){
 for(const n of[unoWithdrawal,hostWithdrawal])if(!Number.isFinite(n)||n<0||n>12)throw Error('USB plug outside 0–12 mm seating travel');
 const uno:P=[railwayUsbUnoFace[0]-unoWithdrawal,railwayUsbUnoFace[1],railwayUsbUnoFace[2]],host:P=[railwayUsbHostFace[0]+hostWithdrawal,railwayUsbHostFace[1],railwayUsbHostFace[2]],start:P=[uno[0]-24,uno[1],uno[2]],end:P=[host[0]+24,host[1],host[2]];
 const points:P[]=[start,[start[0]-8,start[1],start[2]],[125,12,150],[145,10,178],[255,6,205],[430+hostWithdrawal*.2,6,220],[430+hostWithdrawal*.2,6,255],[end[0]+8,end[1],end[2]],end];
 return{uno,host,points};
}
export function railwayUsbConnected(hostOn:boolean,unoWithdrawal=0,hostWithdrawal=0){
 if(typeof hostOn!=='boolean')throw Error('USB host power must be boolean');
 for(const n of[unoWithdrawal,hostWithdrawal])if(!Number.isFinite(n)||n<0||n>12)throw Error('USB plug outside 0–12 mm seating travel');
 return hostOn&&unoWithdrawal===0&&hostWithdrawal===0;
}
