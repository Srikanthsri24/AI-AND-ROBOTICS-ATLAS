export type TrafficLampColor='Red'|'Amber'|'Green';
export type TrafficPoint=readonly[number,number,number];
/** Authored classroom craft-stick/card dimensions, millimetres. LED envelope
 * represents a 5 mm through-hole package with 2.54 mm lead pitch. */
export const trafficParkingSignalHeads=[
 {id:'main',label:'Main street',at:[-112,0,-20] as TrafficPoint,rotation:0,pins:[2,3,4]},
 {id:'cross',label:'Cross street',at:[-35,0,-88] as TrafficPoint,rotation:Math.PI/2,pins:[5,6,7]},
 {id:'full',label:'Parking lot',at:[95,0,60] as TrafficPoint,rotation:0,pins:[10]},
] as const;
export const trafficParkingLampColors={Red:'#e84451',Amber:'#efb446',Green:'#43b984'};
export const trafficParkingLamps=trafficParkingSignalHeads.flatMap(head=>(head.id==='full'?['Red'] as const:['Red','Amber','Green'] as const).map((color,n)=>({id:'tp-'+head.id+'-'+color.toLowerCase(),head:head.id,color,pin:head.pins[n],height:head.id==='full'?18:68-n*10,resistor:head.id==='main'?n+1:head.id==='cross'?n+4:7})));
export function trafficParkingSignalPoint(headId:string,p:TrafficPoint):TrafficPoint{const h=trafficParkingSignalHeads.find(h=>h.id===headId);if(!h)throw new RangeError('Unknown signal head');const c=Math.cos(h.rotation),s=Math.sin(h.rotation);return [h.at[0]+p[0]*c+p[2]*s,h.at[1]+p[1],h.at[2]-p[0]*s+p[2]*c];}
export function trafficParkingLampTerminal(id:string,kind:'anode'|'cathode'):TrafficPoint{const lamp=trafficParkingLamps.find(p=>p.id===id);if(!lamp)throw new RangeError('Unknown traffic lamp');return trafficParkingSignalPoint(lamp.head,[kind==='anode'?-1.27:1.27,lamp.height,kind==='anode'?-9:-8]);}
export const trafficParkingSignalParts=trafficParkingSignalHeads.flatMap(head=>[
 {id:'tp-'+head.id+'-plate',label:head.label+' · LED card',what:'Holds the LED packages in separate real holes.',connection:head.id==='full'?'The FULL label belongs to the D10 capacity lamp. It is not a vehicle sensor.':'The upper red, middle amber and lower green lamps have separate anode/cathode leads behind this card.'},
 {id:'tp-'+head.id+'-mast',label:head.label+' · craft-stick mount',what:'Supports the card by its lower edge without covering the rear LED pins.',connection:'This wooden support carries no electrical signal. Route insulated leads behind it; do not use it as a ground connection.'},
 {id:'tp-'+head.id+'-base',label:head.label+' · stable foot',what:'Keeps the signal upright on the tabletop.',connection:'Faces the appropriate approach. The parking-lot lamp stands beside the separate gate, away from the junction.'},
 ...trafficParkingLamps.filter(l=>l.head===head.id).flatMap(l=>[
  {id:l.id,label:head.label+' · '+l.color+' LED · D'+l.pin,what:head.id==='full'?'Lights when the operator counter reserves all three spaces.':'One of the three independently commanded signal lamps.',connection:`Uno D${l.pin} → its own 220 Ω resistor R${l.resistor} → anode. Cathode returns to Uno GND. ${head.id==='full'?'The counter tracks button requests, not detected vehicles.':'The other head has independent outputs; the program inserts an all-red interval.'}`},
  {id:l.id+'-anode',label:head.label+' · '+l.color+' anode',what:'The longer lead supplies current to the LED package.',connection:`Connect through resistor R${l.resistor} to D${l.pin}. It must stay separate from the cathode and from the other lamp outputs.`},
  {id:l.id+'-cathode',label:head.label+' · '+l.color+' cathode',what:'The shorter lead sits on the package’s flat-edge side.',connection:'Returns to common Uno GND. The card holes and wooden mast do not make this connection.'},
  {id:l.id+'-visor',label:head.label+' · '+l.color+' visor',what:'Shades the upper part of the lens while leaving the light opening clear.',connection:'A mechanical card hood around the LED; it has no electrical connection and does not glow.'},
 ]),
]);
