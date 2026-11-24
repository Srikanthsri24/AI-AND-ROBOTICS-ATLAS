import {espCarLayout as d,espCarUsbMouth} from './esp32-car-layout';
import type {CarPoint} from './bluetooth-car-layout';
export const espCarUsb={id:'esp-wire-usb',name:'USB-A bank → Micro USB-B',step:13,from:'USB power bank · type A',to:'ESP32 · Micro USB-B',bank:[d.usb.at[0],d.usb.at[1]-.01,d.usb.at[2]-.837] as CarPoint,controller:espCarUsbMouth,why:'Supplies the ESP32 through its Micro USB socket. The onboard regulator supplies 3.3 V logic; the AA pack independently supplies motor VM.'};
export function espCarUsbPoints():CarPoint[]{const a=espCarUsb.bank,b=espCarUsb.controller;return [[a[0],a[1],a[2]-.35],[a[0],a[1],a[2]-.43],[1.38,1.43,-.16],[1.35,1.52,-.78],[.34,1.52,-.91],[-.50,1.44,-.93],[b[0],b[1],b[2]+.34],[b[0],b[1],b[2]+.26]];}
