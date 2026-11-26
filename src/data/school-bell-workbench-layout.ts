import uno from './uno-r3-board-layout.json';
import rtc from './ds3231-rtc-layout.json';
import display from './ht16k33-sevenseg-layout.json';
import {carMiniHole} from './bluetooth-mini-breadboard';
export type BellPoint=readonly[number,number,number];
export const schoolBellWorkbench={uno:[-90,14,25],rtc:[-20,22,-35],display:[65,38,-60],breadboard:[35,2,35],sounder:[85,0,35],mat:{centre:[0,-1,0],size:[330,2,230]}} as const;
export function schoolBellUnoContact(name:string):BellPoint{const p=uno.headers.find(p=>p.name===name);if(!p)throw Error('Unknown bell Uno contact '+name);const b=schoolBellWorkbench.uno;return [b[0]+p.x-34.29,b[1]+9.3,b[2]+26.67-p.y];}
export function schoolBellRtcContact(name:string):BellPoint{const index=['VIN','GND','SCL','SDA','BAT','32K','SQW','RST'].indexOf(name),p=rtc.pads.filter(p=>p.element==='JP1')[index];if(!p)throw Error('Unknown bell RTC contact '+name);const b=schoolBellWorkbench.rtc;return [b[0]+p.x,b[1]-8.54,b[2]-p.y];}
/** Display's populated side faces backwards. X and Z flip after the upright
 * rotations used by the scene; CAD Y becomes workbench height. */
export function schoolBellDisplayContact(net:string):BellPoint{const p=display.pads.find(p=>p.element==='CN1'&&p.net===net);if(!p)throw Error('Unknown bell display contact '+net);const b=schoolBellWorkbench.display;return [b[0]-p.x,b[1]+p.y,b[2]-9];}
export function schoolBellBreadboardHole(column:number,bank:-1|1,row:number):BellPoint{const p=carMiniHole(column,bank,row),b=schoolBellWorkbench.breadboard;return [b[0]+p[0]*50,b[1]+p[1]*50,b[2]+p[2]*50];}
export const schoolBellBusColumns={'5V':8,GND:10,SDA:12,SCL:14} as const;
export function schoolBellBusHole(net:keyof typeof schoolBellBusColumns,row:number){return schoolBellBreadboardHole(schoolBellBusColumns[net],-1,row);}
export function schoolBellPiezoContact(signal:boolean):BellPoint{const b=schoolBellWorkbench.sounder;return [b[0]+(signal?-3.81:3.81),b[1]+12,b[2]];}
export const schoolBellUnoSupports=uno.holes.map(p=>({x:schoolBellWorkbench.uno[0]+ +p.x-34.29,z:schoolBellWorkbench.uno[2]+26.67- +p.y,height:schoolBellWorkbench.uno[1]-.8}));
export const schoolBellRtcSupports=rtc.pads.filter(p=>p.element!=='JP1').map(p=>({x:schoolBellWorkbench.rtc[0]+p.x,z:schoolBellWorkbench.rtc[2]-p.y,height:schoolBellWorkbench.rtc[1]}));
