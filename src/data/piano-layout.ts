import uno from './uno-r3-board-layout.json';
import {carMiniHole} from './bluetooth-mini-breadboard';
import {pianoKeys} from './electronic-piano';
export type PianoPoint=readonly [number,number,number];
/** Actual authored geometry in millimetres; shared Uno / breadboard meshes use 50 mm per model unit. */
export const pianoLayout={base:[240,8,180] as PianoPoint,uno:[-65,18,-40] as PianoPoint,boards:[[-28,8,35],[28,8,35]] as readonly PianoPoint[],piezo:[65,16,-40] as PianoPoint};
export function pianoHole(board:number,column:number,bank:-1|1,row:number):PianoPoint{const at=pianoLayout.boards[board];if(!at)throw new RangeError('Unknown piano breadboard');const p=carMiniHole(column,bank,row);return [at[0]+p[0]*50,at[1]+p[1]*50,at[2]+p[2]*50];}
export function pianoUnoContact(name:string):PianoPoint{const h=uno.headers.find(p=>p.name===name);if(!h)throw new RangeError('Unknown piano Uno contact');return [pianoLayout.uno[0]+h.x-34.29,pianoLayout.uno[1]+9.3,pianoLayout.uno[2]+26.67-h.y];}
export const pianoSwitches=pianoKeys.map((key,index)=>{const board=Math.floor(index/4),column=2+(index%4)*4,at=pianoHole(board,column,1,0);return {...key,id:'piano-key-'+index,board,column,at:[at[0],8,pianoLayout.boards[board][2]] as PianoPoint,feet:([-1,1] as const).flatMap(bank=>[-1,1].map(side=>pianoHole(board,column+side,bank,bank<0?4:0))),signal:pianoHole(board,column-1,-1,0),ground:pianoHole(board,column-1,1,4),input:pianoUnoContact('D'+key.pin)};});
export const pianoResistor={a:pianoHole(0,0,-1,1),b:pianoHole(0,4,-1,1),drive:pianoUnoContact('D10')};
export type PianoHardwarePart={id:string;name:string;what:string;connection:string};
export const pianoKeyboardParts:PianoHardwarePart[]=pianoSwitches.flatMap(key=>[
 {id:key.id+'-body',name:key.note+' switch body',what:'Insulates the two separate switch contacts and guides the actuator.',connection:'The four feet form two internally joined pairs. Only a press joins the signal pair to the ground pair.'},
 {id:key.id+'-cover',name:key.note+' retaining cover',what:'Holds the actuator above the switch body. Its centre opening is a real clearance hole.',connection:'This metal cover is mechanical; do not use it as a signal or ground contact.'},
 {id:key.id+'-cap',name:key.note+' key actuator',what:`Press and hold to request ${key.pitch} Hz. Keyboard shortcut: ${key.shortcut}.`,connection:`Closes D${key.pin} to ground. The sketch accepts a stable change after 15 ms; the lowest held note wins.`},
 {id:key.id+'-signal',name:key.note+' signal contact pair',what:'Both feet on this side are permanently joined, even when the button is released.',connection:`Connect one free hole in this rear-bank strip to Uno D${key.pin}. Its internal pull-up keeps an unpressed input HIGH.`},
 {id:key.id+'-ground',name:key.note+' return contact pair',what:'The opposite pair forms the ground side of this momentary switch.',connection:'Join this front-bank strip to the other key returns and Uno GND. Adjacent breadboard columns do not connect by themselves.'},
]);
export const pianoPiezoTerminals={signal:[61.2,14,-22] as PianoPoint,ground:[68.8,14,-22] as PianoPoint};
export type PianoConnection={id:string;name:string;from:PianoPoint;to:PianoPoint;node:string};
export const pianoConnections:readonly PianoConnection[]=[
 ...pianoSwitches.map(key=>({id:key.id+'-input-wire',name:`D${key.pin} to ${key.note}`,from:key.input,to:key.signal,node:'D'+key.pin})),
 {id:'piano-ground-feed',name:'Uno GND to first key return',from:pianoUnoContact('GND-P2'),to:pianoSwitches[0].ground,node:'gnd'},
 ...pianoSwitches.slice(0,-1).map((key,i)=>({id:'piano-ground-bridge-'+i,name:`${key.note} return to ${pianoSwitches[i+1].note} return`,from:pianoHole(key.board,key.column-1,1,3),to:pianoSwitches[i+1].ground,node:'gnd'})),
 {id:'piano-tone-wire',name:'D10 to series resistor input',from:pianoResistor.drive,to:pianoHole(0,0,-1,0),node:'D10'},
 {id:'piano-piezo-signal-wire',name:'Series resistor output to passive piezo',from:pianoHole(0,4,-1,0),to:pianoPiezoTerminals.signal,node:'piezo'},
 {id:'piano-piezo-ground-wire',name:'Piezo return to common key ground',from:pianoPiezoTerminals.ground,to:pianoHole(1,pianoSwitches[7].column-1,1,3),node:'gnd'},
];
