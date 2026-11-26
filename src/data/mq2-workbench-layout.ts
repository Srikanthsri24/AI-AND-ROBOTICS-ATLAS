import uno from './uno-r3-board-layout.json';
import {carMiniHole} from './bluetooth-mini-breadboard';
export type Mq2Point=readonly[number,number,number];
export const mq2WorkbenchLayout={uno:[-72,18,-8],breadboard:[0,8,0],module:[42,12,-26]} as const;
export function mq2Hole(column:number,bank:-1|1,row:number):Mq2Point{
 const p=carMiniHole(column,bank,row),b=mq2WorkbenchLayout.breadboard;
 return [b[0]+p[0]*50,b[1]+p[1]*50,b[2]+p[2]*50];
}
export function mq2UnoContact(name:string):Mq2Point{
 const p=uno.headers.find(p=>p.name===name);if(!p)throw new RangeError('Unknown Uno contact '+name);
 const b=mq2WorkbenchLayout.uno;return [b[0]+p.x-34.29,b[1]+9.3,b[2]+26.67-p.y];
}
export const mq2Resistors=[
 {id:'mq2-divider-upper',name:'Upper 10 kΩ resistor',from:mq2Hole(1,-1,0),to:mq2Hole(5,-1,0),bands:['#74513d','#25272c','#d17439','#c2a04c']},
 {id:'mq2-divider-lower',name:'Lower 10 kΩ resistor',from:mq2Hole(5,-1,2),to:mq2Hole(9,-1,2),bands:['#74513d','#25272c','#d17439','#c2a04c']},
 {id:'mq2-led-resistor',name:'220 Ω LED resistor',from:mq2Hole(6,1,0),to:mq2Hole(10,1,0),bands:['#b94742','#b94742','#74513d','#c2a04c']},
] as const;
export const mq2LedPins={anode:mq2Hole(10,1,2),cathode:mq2Hole(11,1,2)};
export const mq2DialPins=[mq2Hole(13,1,4),mq2Hole(14,1,4),mq2Hole(15,1,4)] as const;
