import {carMiniHole} from './bluetooth-mini-breadboard';
import uno from './uno-r3-board-layout.json';
import {trafficParkingLamps} from './traffic-parking-signals';
export type ParkingPoint=readonly[number,number,number];
export const trafficParkingCircuitLayout={uno:[-95,14,75],resistors:[0,2,75],buttons:[85,2,100],supply:[135,0,100],mat:{centre:[0,-1,0],size:[350,2,310]}} as const;
export function trafficParkingBoardHole(board:'resistors'|'buttons',column:number,bank:-1|1,row:number):ParkingPoint{const p=carMiniHole(column,bank,row),at=trafficParkingCircuitLayout[board];return [at[0]+p[0]*50,at[1]+p[1]*50,at[2]+p[2]*50];}
export function trafficParkingUnoContact(name:string):ParkingPoint{const p=uno.headers.find(p=>p.name===name);if(!p)throw new RangeError('Unknown parking Uno port '+name);const at=trafficParkingCircuitLayout.uno;return [at[0]+p.x-34.29,at[1]+9.3,at[2]+26.67-p.y];}
export const trafficParkingUnoProgrammingRotations=Object.fromEntries(uno.elements.filter(e=>['ICSP','ICSP1'].includes(e.name)).map(e=>[e.name,Number((('rot' in e?e.rot:'R0')??'R0').replace('R',''))*Math.PI/180]));
export const trafficParkingResistors=trafficParkingLamps.map((lamp,n)=>({id:'tp-resistor-'+lamp.resistor,label:`R${lamp.resistor} · 220 Ω · ${lamp.head} ${lamp.color.toLowerCase()}`,lamp:lamp.id,pin:lamp.pin,column:n*2,input:trafficParkingBoardHole('resistors',n*2,-1,4),output:trafficParkingBoardHole('resistors',n*2,1,0),bands:['#c24550','#c24550','#825d3e','#c4a657']}));
export const trafficParkingButtons=[{id:'entry',column:4,pin:'A0',label:'Entry request'},{id:'exit',column:12,pin:'A1',label:'Exit confirmation'}] as const;
export function trafficParkingButtonFoot(button:'entry'|'exit',bank:-1|1,side:-1|1):ParkingPoint{const b=trafficParkingButtons.find(b=>b.id===button)!;const p=trafficParkingBoardHole('buttons',b.column+side,bank,bank<0?4:0);return [p[0],p[1]-4.4,p[2]];}
export const trafficParkingCircuitParts=[
 ...(['resistors','buttons'] as const).map(board=>({id:'tp-board-'+board,label:board==='resistors'?'LED resistor breadboard':'Entry / Exit breadboard',what:'A 170-contact mini breadboard has two separate banks of five-contact strips.',connection:'Contacts a–e in one numbered column are linked; f–j in that column form a separate strip. Adjacent columns and opposite banks are not connected. The coloured edge marks are not power rails.'})),
 ...trafficParkingResistors.map(r=>({id:r.id,label:r.label,what:'Limits the current in one LED branch; red–red–brown–gold identifies 220 Ω ±5%.',connection:`Uno D${r.pin} connects to the a–e bank in column ${r.column+1}; the f–j bank in this column feeds the corresponding LED anode. This resistor bridges the centre gap; it does not share a resistor with another LED.`})),
 ...trafficParkingButtons.flatMap(b=>[
  {id:'tp-'+b.id+'-body',label:b.label+' · switch housing',what:'Holds a four-leg momentary tactile switch across the centre gap.',connection:`Its same-side legs are permanently paired. Pressing joins the ${b.pin} side to the ground side; releasing opens that bridge.`},
  {id:'tp-'+b.id+'-cover',label:b.label+' · metal cover',what:'Retains the moving actuator in the switch body.',connection:'This mechanical cover is not used as an electrical terminal. Use the named paired legs.'},
  {id:'tp-'+b.id+'-cap',label:b.label+' · moving actuator',what:b.id==='entry'?'An operator requests one reserved parking space.':'An operator confirms one vehicle has left through the separate exit.',connection:`${b.pin} uses INPUT_PULLUP, so released is HIGH and pressed is LOW. Hold for at least 22 ms; requests made while the gate is already open are not queued. There is no vehicle sensor.`},
  ...([-1,1] as const).map(bank=>({id:'tp-'+b.id+(bank<0?'-signal':'-ground'),label:b.label+(bank<0?' · '+b.pin+' paired legs':' · ground paired legs'),what:'Two legs on this side are internally connected even when the button is released.',connection:bank<0?`Connect ${b.pin} to the a–e strip at column ${b.column}; do not use two same-side legs as opposite switch contacts.`:`Connect the opposite f–j strip at column ${b.column} to the shared ground bus. Pressing connects it to ${b.pin}.`})),
 ]),
];
