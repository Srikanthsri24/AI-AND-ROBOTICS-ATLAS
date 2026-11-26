import {trafficParkingBarrierPlacement} from './traffic-parking-barrier';
import type {ParkingPoint} from './traffic-parking-circuit-layout';
export const trafficParkingServoLeadChannels=[
 {role:'negative',color:'#745039',x:4,socketX:17.46,label:'Brown · servo return'},
 {role:'positive',color:'#c45160',x:5.5,socketX:20,label:'Red · separate servo 5 V'},
 {role:'signal',color:'#d29a49',x:7,socketX:22.54,label:'Orange · D9 command'},
] as const;
export function trafficParkingServoLeadRoute(index:number):readonly ParkingPoint[]{const p=trafficParkingServoLeadChannels[index];if(!p)throw new RangeError('Unknown parking servo lead');return [[p.x,-3.8,-21],[p.x,-3.8,-24.5],[p.x,-3.8,-51+index*3],[p.socketX,-15,-51+index*3],[p.socketX,-15,-42],[p.socketX,-10,-42],[p.socketX,-10,-40]];}
/** A future male jumper enters along -Z. This is its seated tip, inside the
 * female contact channel; the connector mouth is six millimetres forward. */
export function trafficParkingServoContact(role:string):ParkingPoint{const p=trafficParkingServoLeadChannels.find(p=>p.role===role);if(!p)throw new RangeError('Unknown parking servo contact');const at=trafficParkingBarrierPlacement;return [at[0]+p.socketX,at[1]-10,at[2]-38];}
export const trafficParkingServoLeadParts=[
 {id:'tp-servo-plug',label:'Servo · three-way female plug',what:'Holds three separate spring contacts on a 2.54 mm pitch.',connection:'Viewed from the wire roles: brown is supply return, red is independent 5 V, orange is the D9 position command. Follow the labels rather than guessing from connector orientation.'},
 ...trafficParkingServoLeadChannels.flatMap(p=>[
  {id:'tp-servo-lead-'+p.role,label:p.label+' lead',what:'An individually insulated conductor runs through a real opening in the rear servo case.',connection:p.role==='negative'?'Joins the servo electronics to supply negative. A separate supply-negative-to-Uno-ground bridge provides the command reference.':p.role==='positive'?'Runs from the regulated servo supply to the servo electronics. Keep it separate from Uno 5 V.':'Carries the D9 position pulses; it does not power the motor. Requires the common-ground reference.'},
  {id:'tp-servo-contact-'+p.role,label:p.label+' · female spring contact',what:'Two spring faces grip the sides of an inserted 0.64 mm square male jumper.',connection:'The rear crimp joins this contact to its own coloured lead. Insert the correctly labelled jumper through the corresponding real plug opening with power off.'},
 ]),
];
