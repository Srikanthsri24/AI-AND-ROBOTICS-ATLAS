import uno from './uno-r3-board-layout.json';
import {carMiniHole} from './bluetooth-mini-breadboard';
export type CranePoint=readonly[number,number,number];
export const craneLayout={uno:[-75,20,-65] as CranePoint,breadboard:[0,10,-65] as CranePoint,driver:[50,18,-58] as CranePoint,adapter:[100,10,-23] as CranePoint,supply:[112,10,-76] as CranePoint,buttonColumn:4};
export function craneHole(column:number,bank:-1|1,row:number):CranePoint{const p=carMiniHole(column,bank,row),b=craneLayout.breadboard;return[b[0]+p[0]*50,b[1]+p[1]*50,b[2]+p[2]*50];}
export function craneUnoContact(name:string):CranePoint{const h=uno.headers.find(h=>h.name===name);if(!h)throw new RangeError('Unknown crane Uno socket');const p=craneLayout.uno;return[p[0]+h.x-34.29,p[1]+9.3,p[2]+26.67-h.y];}
export const craneButtonAt:CranePoint=[craneHole(4,1,0)[0],10,-65];
/** Physical JST contact mating centres, from the left-facing keyed mouth. */
export function craneDriverInput(pin:0|1|2):CranePoint{const p=craneLayout.driver;return[p[0]+2.8,p[1]+4.65,p[2]-8.89+(1-pin)*2];}
export function craneDriverOutput(positive:boolean):CranePoint{const p=craneLayout.driver;return[p[0]+23.6,p[1]+3.65,p[2]-8.89+(positive?2:-2)];}
export const craneAdapterContact={positive:[97,14.8,-20] as CranePoint,negative:[103,14.8,-20] as CranePoint};
export type CraneConnection={id:string;name:string;from:CranePoint;to:CranePoint;node:'D2'|'D9'|'gnd'|'5V';color:string;fromKind:'pin'|'jst'|'clamp';toKind:'pin'|'jst'|'clamp'};
export const craneConnections:readonly CraneConnection[]=[
 {id:'crane-button-input-wire',name:'D2 to button signal strip',from:craneUnoContact('D2'),to:craneHole(3,-1,0),node:'D2',color:'#c4a94e',fromKind:'pin',toKind:'pin'},
 {id:'crane-ground-feed',name:'Uno GND to shared return strip',from:craneUnoContact('GND-P2'),to:craneHole(12,1,0),node:'gnd',color:'#344858',fromKind:'pin',toKind:'pin'},
 {id:'crane-button-return-wire',name:'Shared return to button return strip',from:craneHole(12,1,1),to:craneHole(3,1,3),node:'gnd',color:'#435564',fromKind:'pin',toKind:'pin'},
 {id:'crane-driver-ground-wire',name:'Driver GND to common return',from:craneDriverInput(0),to:craneHole(12,1,2),node:'gnd',color:'#3d4654',fromKind:'jst',toKind:'pin'},
 {id:'crane-driver-power-wire',name:'Independent 5 V to driver V+',from:craneDriverInput(1),to:craneHole(12,-1,1),node:'5V',color:'#b34d63',fromKind:'jst',toKind:'pin'},
 {id:'crane-driver-signal-wire',name:'Uno D9 to driver SIG',from:craneDriverInput(2),to:craneUnoContact('D9'),node:'D9',color:'#c9c7bb',fromKind:'jst',toKind:'pin'},
 {id:'crane-supply-return-wire',name:'Supply negative to common return',from:craneAdapterContact.negative,to:craneHole(12,1,3),node:'gnd',color:'#374853',fromKind:'clamp',toKind:'pin'},
 {id:'crane-supply-positive-wire',name:'Supply positive to separate 5 V strip',from:craneAdapterContact.positive,to:craneHole(12,-1,0),node:'5V',color:'#b55464',fromKind:'clamp',toKind:'pin'},
];
