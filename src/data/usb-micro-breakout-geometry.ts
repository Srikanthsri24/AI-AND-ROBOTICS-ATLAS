import cad from './usb-micro-breakout-layout.json';
import {bluetoothPadPosition} from './bluetooth-board-geometry';
import type {CarPoint} from './bluetooth-car-layout';
export const usbMicroCad=cad,usbMicroScale=.02,usbMicroTop=.016;
export function usbMicroPoint(x:number,y:number,height=0):CarPoint{return [(x-10.16)*usbMicroScale,height,(5.08-y)*usbMicroScale];}
export const usbMicroMounts=cad.elements.filter(e=>e.package==='MOUNTINGHOLE_2.5_PLATED').map(e=>usbMicroPoint(+e.x,+e.y,-usbMicroTop));
export function usbMicroHeader(name:string):CarPoint{const e=cad.elements.find(e=>e.name==='JP2')!,pad=e.pads.find(p=>p.net===name);if(!pad)throw Error('Unknown USB breakout header '+name);const [x,y]=bluetoothPadPosition(e,pad);return usbMicroPoint(x,y,.195);}
export const usbMicroSocket={mouth:[0,.0425,-.10124] as CarPoint,width:.152,height:.053,depth:.10};
