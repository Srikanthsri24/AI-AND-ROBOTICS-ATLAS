import uno from './uno-r3-board-layout.json';
import shield from './pn532-shield-layout.json';
import {pn532Stack,pn532StackPins} from './pn532-stack';
import {carMiniHole} from './bluetooth-mini-breadboard';
export type RfidPoint=readonly[number,number,number];
export const rfidWorkbench={reader:[-120,14,20],door:[65,0,0],breadboard:[-110,8,-100],mat:{centre:[0,-1,-20],size:[380,2,260]},cardRest:[-54.09,30,-48.33],fobRest:[6.91,30,27]} as const;
export const rfidUnoSupports=uno.holes.map(h=>({x:rfidWorkbench.reader[0]+Number(h.x)-34.29,z:rfidWorkbench.reader[2]+26.67-Number(h.y),height:rfidWorkbench.reader[1]-.8}));
/** Only the far antenna mounting holes receive full-height posts. The other two
 * holes lie near the Uno edge; a tall post there would pierce the lower board. */
export const rfidAntennaSupports=shield.holes.filter(h=>Number(h.x)>100).map(h=>({x:rfidWorkbench.reader[0]+pn532Stack.offsetX-34.29+Number(h.x),z:rfidWorkbench.reader[2]+26.67-Number(h.y),height:rfidWorkbench.reader[1]+pn532Stack.baseY}));
export function rfidBreadboardHole(column:number,bank:-1|1,row:number):RfidPoint{const p=carMiniHole(column,bank,row),b=rfidWorkbench.breadboard;return [b[0]+p[0]*50,b[1]+p[1]*50,b[2]+p[2]*50];}
export function rfidShieldContact(name:string):RfidPoint{const p=pn532StackPins.find(p=>p.unoName===name);if(!p)throw new RangeError('Unknown RFID shield contact '+name);const b=rfidWorkbench.reader;return [b[0]+pn532Stack.offsetX-34.29+p.x,b[1]+pn532Stack.baseY+pn532Stack.socketTop,b[2]+26.67-p.y];}
