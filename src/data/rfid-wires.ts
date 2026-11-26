import {rfidBreadboardHole as hole,rfidShieldContact as pin,rfidSupplyContacts,type RfidPoint} from './rfid-workbench-layout';
import {rfidServoSocket} from './rfid-servo-harness';
export type RfidWire={id:string;name:string;from:RfidPoint;to:RfidPoint;fromPort:string;toPort:string;fromKind:'pin'|'clamp';toKind:'pin'|'servo';net:'D6'|'D7'|'D9'|'ground'|'servo-5V';color:string};
export const rfidWires:readonly RfidWire[]=[
 {id:'rfid-red-drive-wire',name:'D6 to red series resistor',from:pin('D6'),to:hole(0,1,0),fromPort:'shield.D6',toPort:'red-drive.0',fromKind:'pin',toKind:'pin',net:'D6',color:'#c75968'},
 {id:'rfid-green-drive-wire',name:'D7 to green series resistor',from:pin('D7'),to:hole(6,1,0),fromPort:'shield.D7',toPort:'green-drive.0',fromKind:'pin',toKind:'pin',net:'D7',color:'#53a87c'},
 {id:'rfid-red-return-wire',name:'Red LED cathode return',from:hole(5,1,1),to:hole(16,1,0),fromPort:'red-cathode.1',toPort:'common.0',fromKind:'pin',toKind:'pin',net:'ground',color:'#4b5562'},
 {id:'rfid-green-return-wire',name:'Green LED cathode return',from:hole(11,1,1),to:hole(16,1,1),fromPort:'green-cathode.1',toPort:'common.1',fromKind:'pin',toKind:'pin',net:'ground',color:'#4b5562'},
 {id:'rfid-uno-return-wire',name:'Uno shared reference',from:pin('GND-P1'),to:hole(16,1,2),fromPort:'shield.GND',toPort:'common.2',fromKind:'pin',toKind:'pin',net:'ground',color:'#485360'},
 {id:'rfid-servo-command-wire',name:'D9 to servo signal',from:pin('D9'),to:rfidServoSocket(0),fromPort:'shield.D9',toPort:'servo.SIG',fromKind:'pin',toKind:'servo',net:'D9',color:'#c29e53'},
 {id:'rfid-servo-return-wire',name:'Servo common ground',from:hole(16,1,3),to:rfidServoSocket(2),fromPort:'common.3',toPort:'servo.GND',fromKind:'pin',toKind:'servo',net:'ground',color:'#79584a'},
 {id:'rfid-servo-positive-wire',name:'Independent 5 V to servo',from:hole(16,-1,1),to:rfidServoSocket(1),fromPort:'servo-positive.1',toPort:'servo.VCC',fromKind:'pin',toKind:'servo',net:'servo-5V',color:'#bb5364'},
 {id:'rfid-supply-positive-wire',name:'Supply positive to isolated strip',from:rfidSupplyContacts.positive,to:hole(16,-1,0),fromPort:'supply.positive',toPort:'servo-positive.0',fromKind:'clamp',toKind:'pin',net:'servo-5V',color:'#bb5364'},
 {id:'rfid-supply-return-wire',name:'Supply negative to common return',from:rfidSupplyContacts.negative,to:hole(16,1,4),fromPort:'supply.negative',toPort:'common.4',fromKind:'clamp',toKind:'pin',net:'ground',color:'#485360'},
];
