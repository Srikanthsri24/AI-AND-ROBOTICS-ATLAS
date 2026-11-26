import type {RfidPoint} from './rfid-workbench-layout';
/** Fixed-servo factory loom. Routes behind the door to clear its opening sweep. */
export const rfidServoLeads=[{id:'rfid-servo-signal-lead',name:'Servo signal',color:'#cc9b54',exitZ:9,socketZ:-22.54},{id:'rfid-servo-positive-lead',name:'Servo 5 V',color:'#bc5965',exitZ:11,socketZ:-20},{id:'rfid-servo-ground-lead',name:'Servo ground',color:'#725549',exitZ:13,socketZ:-17.46}] as const;
export function rfidServoSocket(n:number):RfidPoint{const p=rfidServoLeads[n];if(!p)throw new RangeError('Unknown RFID servo socket');return [106.8,7.4,p.socketZ];}
export function rfidServoLeadRoute(n:number):readonly RfidPoint[]{const p=rfidServoLeads[n];if(!p)throw new RangeError('Unknown RFID servo lead');return [[141,52,p.exitZ],[138,49,p.exitZ+1],[137,43,p.exitZ+2],[137,30,-12+n*2.54],[126,17,p.socketZ],[116,7.4,p.socketZ],[112,7.4,p.socketZ]];}
