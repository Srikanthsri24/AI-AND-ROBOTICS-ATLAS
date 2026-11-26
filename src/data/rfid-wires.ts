import {rfidBreadboardHole as hole,rfidShieldContact as pin,rfidSupplyContacts,type RfidPoint} from './rfid-workbench-layout';
import {rfidServoSocket} from './rfid-servo-harness';
export type RfidWire={id:string;name:string;from:RfidPoint;to:RfidPoint;fromPort:string;toPort:string;fromKind:'pin'|'clamp';toKind:'pin'|'servo';net:'D6'|'D7'|'D9'|'ground'|'servo-5V';color:string};
export const rfidWires:readonly RfidWire[]=[
 {id:'rfid-red-drive-wire',name:'D6 to red series resistor',from:pin('D6'),to:hole(0,1,0),fromPort:'shield.D6',toPort:'red-drive.0',fromKind:'pin',toKind:'pin',net:'D6',color:'#c75968'},
 {id:'rfid-green-drive-wire',name:'D7 to green series resistor',from:pin('D7'),to:hole(6,1,0),fromPort:'shield.D7',toPort:'green-drive.0',fromKind:'pin',toKind:'pin',net:'D7',color:'#53a87c'},
 {id:'rfid-red-return-wire',name:'Red LED cathode return',from:hole(5,1,4),to:hole(16,1,0),fromPort:'red-cathode.4',toPort:'common.0',fromKind:'pin',toKind:'pin',net:'ground',color:'#4b5562'},
 {id:'rfid-green-return-wire',name:'Green LED cathode return',from:hole(11,1,4),to:hole(16,1,1),fromPort:'green-cathode.4',toPort:'common.1',fromKind:'pin',toKind:'pin',net:'ground',color:'#4b5562'},
 {id:'rfid-uno-return-wire',name:'Uno shared reference',from:pin('GND-P1'),to:hole(16,1,2),fromPort:'shield.GND',toPort:'common.2',fromKind:'pin',toKind:'pin',net:'ground',color:'#485360'},
 {id:'rfid-servo-command-wire',name:'D9 to servo signal',from:pin('D9'),to:rfidServoSocket(0),fromPort:'shield.D9',toPort:'servo.SIG',fromKind:'pin',toKind:'servo',net:'D9',color:'#c29e53'},
 {id:'rfid-servo-return-wire',name:'Servo common ground',from:hole(16,1,3),to:rfidServoSocket(2),fromPort:'common.3',toPort:'servo.GND',fromKind:'pin',toKind:'servo',net:'ground',color:'#79584a'},
 {id:'rfid-servo-positive-wire',name:'Independent 5 V to servo',from:hole(16,-1,1),to:rfidServoSocket(1),fromPort:'servo-positive.1',toPort:'servo.VCC',fromKind:'pin',toKind:'servo',net:'servo-5V',color:'#bb5364'},
 {id:'rfid-supply-positive-wire',name:'Supply positive to isolated strip',from:rfidSupplyContacts.positive,to:hole(16,-1,0),fromPort:'supply.positive',toPort:'servo-positive.0',fromKind:'clamp',toKind:'pin',net:'servo-5V',color:'#bb5364'},
 {id:'rfid-supply-return-wire',name:'Supply negative to common return',from:rfidSupplyContacts.negative,to:hole(16,1,4),fromPort:'supply.negative',toPort:'common.4',fromKind:'clamp',toKind:'pin',net:'ground',color:'#485360'},
];
/** Seated cable routes in workbench mm; fitting motion is authored separately. */
export function rfidWireRoute(index:number):readonly RfidPoint[]{
 const w=rfidWires[index];if(!w)throw new RangeError('Unknown RFID jumper');
 const a:RfidPoint=w.fromKind==='clamp'?[w.from[0],w.from[1],w.from[2]+10.7]:[w.from[0],w.from[1]+7.5,w.from[2]];
 const b:RfidPoint=w.toKind==='servo'?[w.to[0]-9.8,w.to[1],w.to[2]]:[w.to[0],w.to[1]+7.5,w.to[2]];
 if(w.toKind==='servo'){const channel=index===5?0:index===7?1:2,lane=-141+channel*3,entryX=88-channel*5;return [a,[a[0],a[1]+12,a[2]],...(index>=6?[[a[0],85+(index-6)*8,a[2]],[a[0]+14,85+(index-6)*8,a[2]],[a[0]+20,85+(index-6)*8,lane]] as RfidPoint[]:[[a[0]+8,52+(index-5)*3,lane]] as RfidPoint[]),[25,42+(index-5)*3,lane],[entryX,22,lane],[entryX,7.4,b[2]-12],[entryX,7.4,b[2]],[b[0]-8,b[1],b[2]],[b[0]-3,b[1],b[2]],b];}
 if(index===2)return [a,[a[0],a[1]+8,a[2]],[a[0]+8,50,a[2]],[b[0]-8,50,b[2]],[b[0],40,b[2]],[b[0],b[1]+8,b[2]],b];
 if(index===4)return [a,[a[0],a[1]+12,a[2]],[a[0]-16,76,-36],[b[0]-16,70,b[2]],[b[0],50,b[2]],[b[0],b[1]+10,b[2]],b];
 if(index===3)return [a,[a[0],a[1]+10,a[2]],[a[0]+10,64,a[2]+12],[b[0]+12,64,b[2]],[b[0],45,b[2]],[b[0],b[1]+12,b[2]],b];
 if(w.fromKind==='clamp')return [a,[a[0]+8,a[1]+8,a[2]+10],[-45,45+(index-8)*8,-132],[-72,45+(index-8)*8,-130],[b[0]+12,b[1]+14,b[2]],[b[0],b[1]+7,b[2]],b];
 if(w.fromPort.startsWith('shield.'))return [a,[a[0],a[1]+12,a[2]],[a[0]-16,58+index*3,-36],[b[0]-10,48+index*3,b[2]-18],[b[0],b[1]+10,b[2]],b];
 return [a,[a[0],a[1]+8,a[2]],[a[0]+8,42+index*4,a[2]+8],[b[0]+4,42+index*4,b[2]+8],[b[0],b[1]+8,b[2]],b];
}
