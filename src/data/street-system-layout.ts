import uno from './uno-r3-board-layout.json';
import { carMiniHole } from './bluetooth-mini-breadboard';
export type StreetPoint = readonly [number, number, number];
/** All physical layout values are millimetres. PCB models use scale 50. */
export const streetSystemLayout = {
  base: { width: 380, depth: 240, thickness: 8 },
  uno: [-125, 18, 78] as StreetPoint,
  breadboard: [-35, 8, 78] as StreetPoint,
  lampXs: [-120, 0, 120] as const,
  lampZ: -35,
  lampHeight: 100,
  sensor: [-150, 25, -90] as StreetPoint,
};
export function streetSystemSocket(name: string): StreetPoint {
  const h=uno.headers.find(h=>h.name===name);
  if(!h) throw new Error('Unknown street-system Uno contact '+name);
  const p=streetSystemLayout.uno;
  return [p[0]+h.x-34.29,p[1]+9.3,p[2]+26.67-h.y];
}
export function streetSystemHole(column:number,bank:-1|1,row:number):StreetPoint {
  const p=carMiniHole(column,bank,row),at=streetSystemLayout.breadboard;
  return [at[0]+p[0]*50,at[1]+p[1]*50,at[2]+p[2]*50];
}
export const streetSystemBranches=streetSystemLayout.lampXs.map((x,index)=>({
  id:'street-lamp-'+(index+1),pin:'D'+(index+5),
  // Each resistor spans two independent strips; no LED shares its limiter.
  resistorInput:streetSystemHole(index*5,-1,0),
  resistorOutput:streetSystemHole(index*5+3,-1,0),
  driveContact:streetSystemHole(index*5,-1,4),
  lampContact:streetSystemHole(index*5+3,-1,4),
  returnContact:streetSystemHole(index*5+4,-1,4),
  anode:[x-1.27,streetSystemLayout.lampHeight+1,-12] as StreetPoint,
  cathode:[x+1.27,streetSystemLayout.lampHeight+1,-12] as StreetPoint,
  positiveTail:[x-6,20,streetSystemLayout.lampZ] as StreetPoint,
  returnTail:[x+6,20,streetSystemLayout.lampZ] as StreetPoint,
}));
// Front bank: 5 V column 1, divider junction column 6, ground column 11.
export const streetSystemDivider={
  power:streetSystemHole(0,1,0),junction:streetSystemHole(5,1,0),ground:streetSystemHole(10,1,0),
  sensorPositive:[-151.27,20,-85] as StreetPoint,sensorJunction:[-148.73,20,-85] as StreetPoint,
};
export type StreetCable={id:string;name:string;color:string;node:string;a:StreetPoint;b:StreetPoint;route:readonly StreetPoint[]};
const cable=(id:string,name:string,color:string,node:string,a:StreetPoint,b:StreetPoint,route:readonly StreetPoint[]=[]):StreetCable=>({id,name,color,node,a,b,route});
export const streetSystemCables:readonly StreetCable[]=[
 cable('street-5v','Uno 5 V → divider supply','#b84a5e','5v',streetSystemSocket('5V'),streetSystemHole(0,1,4)),
 cable('street-gnd','Uno GND → common return','#33465c','gnd',streetSystemSocket('GND-P2'),streetSystemHole(10,1,4)),
 cable('street-a0','Divider junction → A0','#bd9550','a0',streetSystemSocket('A0'),streetSystemHole(5,1,4)),
 cable('street-ldr-positive','5 V → photoresistor','#b84a5e','5v',streetSystemHole(0,1,2),streetSystemDivider.sensorPositive,[[-80,24,35],[-170,24,35],[-170,24,-90]]),
 cable('street-ldr-junction','Photoresistor → divider junction','#bd9550','a0',streetSystemHole(5,1,2),streetSystemDivider.sensorJunction,[[-70,28,28],[-163,28,28],[-163,28,-90]]),
 ...streetSystemBranches.flatMap((b,index)=>[
  cable(b.id+'-drive',b.pin+' → lamp '+(index+1)+' resistor',['#9871c3','#5f94ab','#c68e52'][index],b.pin,streetSystemSocket(b.pin),b.driveContact),
  cable(b.id+'-anode','Resistor → lamp '+(index+1)+' anode','#b84a5e','lamp-'+index,b.lampContact,b.positiveTail,[[b.positiveTail[0],24,35]]),
  cable(b.id+'-return','Lamp '+(index+1)+' cathode → return strip','#33465c','gnd',b.returnTail,b.returnContact,[[b.returnTail[0],24,42]]),
  cable(b.id+'-ground-link','Lamp '+(index+1)+' return → common ground','#33465c','gnd',streetSystemHole(index*5+4,-1,2),streetSystemHole(10,1,index)),
 ]),
];
export const streetSystemAssembly=[
 {title:'Prepare the model road',instruction:'Fit the road and pavement to the timber base. Keep the rear electronics area accessible.',check:'All three pole positions are separate from the sensor.'},
 {title:'Install three hollow posts',instruction:'Fit the rear post channels and open hood frames. Leave the removable front covers and roofs off for wiring.',check:'Each lamp has its own labelled head.'},
 {title:'Fit the white LEDs',instruction:'Lower each prewired LED, its two insulated leads and lower sockets together into the open post and hood. Slide the harness back into its channel.',check:'No two bare LED leads touch.'},
 {title:'Mount the controller and breadboard',instruction:'Close the post covers and hood front panels, then lower the reflector roofs. Mount the Uno on insulating supports and fit the 170-point breadboard behind the road.',check:'USB remains disconnected; no underside solder joint touches timber.'},
 {title:'Fit the light divider',instruction:'Place the photoresistor away from the lamps. Fit the 10 kΩ resistor between the A0 junction strip and ground strip.',check:'The junction and ground occupy different five-hole strips.'},
 {title:'Fit three current limiters',instruction:'Bridge each lamp’s input and output strips with its own 220 Ω resistor.',check:'D5, D6 and D7 each reach an LED through a separate resistor.'},
 {title:'Connect power and A0',instruction:'With power off, seat 5 V, GND and A0 jumpers. Connect both photoresistor leads to their named strips.',check:'Covering the sensor will lower the A0 reading.'},
 {title:'Wire the three lamp branches',instruction:'Follow each labelled drive, anode and cathode lead. Join each return strip to common ground.',check:'Check all six LED terminals and three independent resistors.'},
 {title:'Upload and test dusk / dawn',instruction:'Connect USB, upload the supplied Arduino C++ sketch and open Serial Monitor at 115200 baud.',check:'At ≤330 all three turn on; at ≥470 all turn off. Test the hold band from both directions.'},
] as const;
