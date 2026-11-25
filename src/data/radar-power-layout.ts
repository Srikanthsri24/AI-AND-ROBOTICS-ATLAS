import {carMiniHole} from './bluetooth-mini-breadboard';
import {radarUnoSocket,type RadarHarnessPoint as P} from './radar-harness';
export const radarReferenceBoardAt=[-5,0,-105] as const;
export const radarSupplyPorts=[
 {id:'radar-supply-positive',name:'SERVO +5 V',x:85,color:'#c95767',node:'servo-positive'},
 {id:'radar-supply-negative',name:'MOTOR −',x:105,color:'#364454',node:'common-ground'},
 {id:'radar-supply-reference',name:'LOGIC REF',x:125,color:'#586780',node:'common-ground'},
] as const;
export const radarServoContacts=[
 {id:'radar-servo-signal-contact',wireId:'radar-servo-signal-tail',name:'Servo signal · orange',x:72.46,color:'#ce944e',node:'servo-command'},
 {id:'radar-servo-positive-contact',wireId:'radar-servo-positive-tail',name:'Servo power · red',x:75,color:'#c95767',node:'servo-positive'},
 {id:'radar-servo-ground-contact',wireId:'radar-servo-ground-tail',name:'Servo ground · brown',x:77.54,color:'#795744',node:'common-ground'},
] as const;
export function radarReferenceContact(row:number):P{
 const p=carMiniHole(8,-1,row);return[p[0]*50+radarReferenceBoardAt[0],p[1]*50,p[2]*50+radarReferenceBoardAt[2]];
}
export function radarServoContact(index:number):P{const c=radarServoContacts[index];if(!c)throw Error('Unknown radar servo contact');return[c.x,14,-40];}
export function radarServoTail(index:number):P[]{
 const c=radarServoContacts[index];if(!c)throw Error('Unknown radar servo lead');const z=(index-1)*1.5;
 return[[17.9,12,z],[26,12+index*2,z],[46,18+index*2,z],[60+index*2,20+index*2,-25],[c.x,14,-52],[c.x,14,-46]];
}
export function radarSupplyContact(id:string):P{const p=radarSupplyPorts.find(p=>p.id===id);if(!p)throw Error('Unknown radar supply port');return[p.x,13,-91];}
/** The two positive sources stay separate; only the negative references join. */
export const radarPowerConnections=[
 {id:'servo-command',a:'Uno D9',b:'Servo orange contact',from:radarUnoSocket('D9'),to:radarServoContact(0),node:'servo-command'},
 {id:'servo-positive',a:'Regulated +5 V',b:'Servo red contact',from:radarSupplyContact('radar-supply-positive'),to:radarServoContact(1),node:'servo-positive'},
 {id:'servo-return',a:'Supply motor negative',b:'Servo brown contact',from:radarSupplyContact('radar-supply-negative'),to:radarServoContact(2),node:'common-ground'},
 {id:'logic-reference',a:'Supply logic reference',b:'Breadboard column 9, bank −, row 1',from:radarSupplyContact('radar-supply-reference'),to:radarReferenceContact(0),node:'common-ground'},
 {id:'uno-reference',a:'Breadboard column 9, bank −, row 2',b:'Uno GND-P2',from:radarReferenceContact(1),to:radarUnoSocket('GND-P2'),node:'common-ground'},
] as const;
export const radarPowerParts=[
 ['radar-supply-case','Independent regulated servo supply','An authored enclosed DC supply represents a regulated 5 V source chosen for the servo’s stall current. No current capability or mains circuitry is simulated.','Its positive output feeds only the servo motor. The Uno and sensor retain their USB-powered logic rail.'],
 ['radar-supply-feet','Supply feet','Support the enclosed source above the table.','Four non-slip pads leave the lower enclosure clear of the work surface.'],
 ['radar-supply-display','Servo supply voltage display','Shows the workshop’s enabled 5.00 V source or OFF. It is a teaching display, not a measured bench voltage.','The switch controls servo motor power independently of the Uno USB supply.'],
 ['radar-supply-switch','Servo supply output switch','Enables the separate servo motor supply.','Keep this output off while uploading or seating plugs. Switching it off holds the head even though the Uno can continue printing commanded angles.'],
 ['radar-supply-positive','Regulated servo +5 V socket','Supplies the red servo lead directly, bypassing the Uno and breadboard.','Do not join this positive terminal to Uno 5 V; they are separate positive sources.'],
 ['radar-supply-negative','Servo motor return socket','Returns servo motor current directly to the independent source.','The adjacent logic-reference socket shares this negative node inside the enclosure.'],
 ['radar-supply-reference','Shared logic-reference socket and bus','A separate negative socket joins the same internal negative bus without routing motor current through the breadboard.','Connect through the real five-contact strip to Uno GND. Common ground is required for a meaningful D9 signal reference.'],
 ['radar-reference-board','Common-ground reference breadboard','A 170-contact board has separate five-hole strips, not continuous edge power rails.','Only column 9 of the negative-side bank joins the supply reference and Uno GND. Servo motor power and return bypass this board.'],
 ['radar-servo-connector','Servo three-contact connector body','A single keyed-by-colour group separates signal, motor positive and motor return.','The three permanently attached servo wires enter the rear; external male jumpers enter the three real open front sockets.'],
 ['radar-servo-rest','Insulating connector rest','Supports the three-contact connector above the table so its openings and wire colours remain visible.','The rest carries no current and does not join the three electrical contacts.'],
 ...radarServoContacts.flatMap(c=>[
  [c.id,c.name+' socket','An actual open female cavity accepts its own male jumper contact.','Orange receives D9; red receives separate regulated +5 V; brown returns directly to the servo supply negative.'],
  [c.wireId,c.name+' fixed lead','A continuous insulated lead emerges from the servo’s real cable-exit grommet.','It terminates at the rear of its matching connector contact; the tail remains stationary with the servo housing.'],
 ]),
] as const;
