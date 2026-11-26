import {rainWorkbenchLayout,rainUnoContact,rainBreadboardHole,rainSupplyContacts,type RainPoint} from './rain-workbench-layout';
import {rainWaterSensor} from './rain-water-sensor';
import {rainServoSocket} from './rain-servo-leads';
export type RainConnection={id:string;name:string;from:RainPoint;to:RainPoint;fromPort:string;toPort:string;net:'sensor-5V'|'ground'|'servo-5V'|'D2'|'D9';color:string;fromKind:'grove'|'pin'|'clamp';toKind:'pin'|'servo'};
export function rainGroveContact(pin:'GND'|'VCC'|'NC'|'SIG'):RainPoint{const n=rainWaterSensor.pins.indexOf(pin),p=rainWorkbenchLayout.sensor;return [p[0]+4,p[1]+4.3,p[2]-rainWaterSensor.pinZ[n]];}
export const rainConnections:readonly RainConnection[]=[
 {id:'rain-sensor-power-wire',name:'Uno 5 V to water sensor VCC',from:rainGroveContact('VCC'),to:rainUnoContact('5V'),fromPort:'sensor.VCC',toPort:'uno.5V',net:'sensor-5V',color:'#ba5362',fromKind:'grove',toKind:'pin'},
 {id:'rain-sensor-ground-wire',name:'Water sensor common ground',from:rainGroveContact('GND'),to:rainBreadboardHole(12,1,3),fromPort:'sensor.GND',toPort:'return.3',net:'ground',color:'#394b56',fromKind:'grove',toKind:'pin'},
 {id:'rain-sensor-signal-wire',name:'Water sensor SIG to D2',from:rainGroveContact('SIG'),to:rainUnoContact('D2'),fromPort:'sensor.SIG',toPort:'uno.D2',net:'D2',color:'#bfa44b',fromKind:'grove',toKind:'pin'},
 {id:'rain-uno-ground-wire',name:'Uno shared reference',from:rainUnoContact('GND-P2'),to:rainBreadboardHole(12,1,0),fromPort:'uno.GND',toPort:'return.0',net:'ground',color:'#3d4a55',fromKind:'pin',toKind:'pin'},
 {id:'rain-servo-command-wire',name:'D9 to servo signal socket',from:rainUnoContact('D9'),to:rainServoSocket(0),fromPort:'uno.D9',toPort:'servo.SIG',net:'D9',color:'#bd9d56',fromKind:'pin',toKind:'servo'},
 {id:'rain-servo-power-wire',name:'Independent supply strip to servo',from:rainBreadboardHole(12,-1,1),to:rainServoSocket(1),fromPort:'motor-power.1',toPort:'servo.VCC',net:'servo-5V',color:'#b95061',fromKind:'pin',toKind:'servo'},
 {id:'rain-servo-return-wire',name:'Servo ground to shared return',from:rainBreadboardHole(12,1,1),to:rainServoSocket(2),fromPort:'return.1',toPort:'servo.GND',net:'ground',color:'#6d5147',fromKind:'pin',toKind:'servo'},
 {id:'rain-supply-positive-wire',name:'Supply positive to isolated servo strip',from:rainSupplyContacts.positive,to:rainBreadboardHole(12,-1,0),fromPort:'supply.positive',toPort:'motor-power.0',net:'servo-5V',color:'#bc5366',fromKind:'clamp',toKind:'pin'},
 {id:'rain-supply-negative-wire',name:'Supply negative to common return',from:rainSupplyContacts.negative,to:rainBreadboardHole(12,1,2),fromPort:'supply.negative',toPort:'return.2',net:'ground',color:'#3c4b57',fromKind:'clamp',toKind:'pin'},
];

/** Seated routing draft. Individual fitting motion and clearance sweeps are separate. */
export function rainWireRoute(index:number):readonly RainPoint[]{
 const w=rainConnections[index];if(!w)throw new RangeError('Unknown rain circuit wire');
 const a:RainPoint=w.fromKind==='grove'?[w.from[0],w.from[1]+7.5,w.from[2]]:w.fromKind==='clamp'?[w.from[0],w.from[1],w.from[2]+10.7]:[w.from[0],w.from[1]+7.5,w.from[2]];
 const b:RainPoint=w.toKind==='servo'?[w.to[0]-9.8,w.to[1],w.to[2]]:[w.to[0],w.to[1]+7.5,w.to[2]];
 if(w.fromKind==='grove')return [a,[a[0],a[1]+8,a[2]],[-20-index*4,36+index*2,100+index*3],[-48-index*4,42+index*2,70],[b[0],45+index*2,b[2]+12],[b[0],b[1]+12,b[2]],b];
 if(w.fromKind==='clamp')return [a,[a[0]+12,a[1]+5,a[2]+6],[a[0]+18,55+(index-7)*8,a[2]+12],[b[0]+14,55+(index-7)*8,b[2]+10],[b[0]+8,b[1]+9,b[2]],[b[0],b[1]+5,b[2]],b];
 const first:RainPoint=[a[0],a[1]+10,a[2]],height=40+index*2;
 return [a,first,[a[0],height,a[2]-10],[b[0]-4,height,b[2]-12],w.toKind==='servo'?[b[0]-6,b[1],b[2]]:[b[0],b[1]+12,b[2]],b];
}
