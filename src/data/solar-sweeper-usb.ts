import {solarUsbMouth} from './solar-sweeper-layout';
import {carUsbCable} from './bluetooth-car-usb';
import type {CarPoint} from './bluetooth-car-layout';
export const solarLogicUsb={...carUsbCable,step:11,why:'The separate bank supplies the Uno and both driver VCC logic inputs. Solar VBUS powers only the cleaning motor.'};
export const solarPigtail={id:'solar-pigtail',name:'Attached panel lead and USB-A outlet',step:13,why:'The factory-attached lead carries regulated panel power to a female USB-A outlet. It is not the Uno power-bank lead.',box:[0,2.697,-1.23] as CarPoint,outlet:[1.15,2.46,-1.625] as CarPoint};
export function solarPigtailPoints():CarPoint[]{return [[0,2.697,-1.185],[0,2.697,-1.10],[.20,2.45,-.90],[.65,2.42,-.85],[1.02,2.48,-1.10],[1.15,2.46,-1.80],[1.15,2.46,-2.25],[1.15,2.46,-2.175]];}
export const solarLinkUsb={id:'solar-usb-link',name:'Panel USB-A → Micro-B power cable',step:14,why:'This distinct cable links the regulated panel outlet to the Micro-B breakout. Its VBUS feeds the brush VM and sensing divider, with a direct motor-current ground return.',from:'Panel female USB-A outlet',to:'Solar Micro-B breakout',a:solarPigtail.outlet,micro:solarUsbMouth};
export function solarLinkUsbPoints():CarPoint[]{const a=solarLinkUsb.a,m=solarLinkUsb.micro;return [[a[0],a[1],a[2]+.35],[a[0],a[1],a[2]+.42],[1.35,2.25,-.95],[1.40,1.60,-.20],[1.05,1.45,-.23],[m[0],m[1],m[2]-.30],[m[0],m[1],m[2]-.265]];}
export function solarBankUsbPoints():CarPoint[]{const a=carUsbCable.bank,b=carUsbCable.uno;return [[a[0],a[1],a[2]-.35],[a[0],a[1],a[2]-.42],[.40,1.50,.02],[-1.15,1.55,.45],[-1.50,1.60,-.60],[-1.25,1.65,-1.45],[-.50,1.55,-2.35],[b[0],b[1],b[2]-.41],[b[0],b[1],b[2]-.34]];}
