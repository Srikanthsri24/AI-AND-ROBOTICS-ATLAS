import type {RainPoint} from './rain-workbench-layout';
export const rainServoLeads=[
 {id:'rain-servo-signal-lead',name:'Servo signal',color:'#cf9a4e',exitZ:-17.5,socketZ:-32.54},
 {id:'rain-servo-positive-lead',name:'Servo 5 V',color:'#b75162',exitZ:-16,socketZ:-30},
 {id:'rain-servo-ground-lead',name:'Servo ground',color:'#705043',exitZ:-14.5,socketZ:-27.46},
] as const;
export function rainServoLeadRoute(index:number):readonly RainPoint[]{const w=rainServoLeads[index];if(!w)throw new RangeError('Unknown servo lead');return [[-17,10.5,w.exitZ],[-23,11,w.exitZ-3],[-29,12.5,(w.exitZ+w.socketZ)/2],[-34,14,w.socketZ+2],[-39,15,w.socketZ]];}
/** Authored 2.54 mm pitch factory female plug; not a manufacturer connector drawing. */
export function rainServoSocket(index:number):RainPoint{const w=rainServoLeads[index];if(!w)throw new RangeError('Unknown servo socket');return [-44.2,15,w.socketZ];}
