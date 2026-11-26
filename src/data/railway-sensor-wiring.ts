import {carMiniHole} from './bluetooth-mini-breadboard';
import {railwayWarningBoardAt,type RailwayPoint as P} from './railway-electrical-layout';
import {railwayUnoSocket} from './railway-power-layout';
import {railwaySensorContact,type RailwayBeamStation} from './railway-beam-layout';
export const railwaySensorDevices=[{station:'a',receiver:false,row:1},{station:'b',receiver:false,row:2},{station:'a',receiver:true,row:3},{station:'b',receiver:true,row:4}] as const;
/** Front bank only; each of its two assigned columns is one isolated five-hole strip. */
export function railwaySensorPowerHole(node:'logic-5v'|'common-ground',row:number):P{const p=carMiniHole(node==='logic-5v'?0:1,1,row);return[p[0]*50+railwayWarningBoardAt[0],p[1]*50,p[2]*50+railwayWarningBoardAt[2]];}
export type RailwaySensorTerminal={type:'uno';name:string}|{type:'strip';node:'logic-5v'|'common-ground';row:number}|{type:'sensor';station:RailwayBeamStation;receiver:boolean;pin:number};
export function railwaySensorTerminalPoint(end:RailwaySensorTerminal,aligned=true):P{if(end.type==='uno')return railwayUnoSocket(end.name);if(end.type==='strip')return railwaySensorPowerHole(end.node,end.row);return railwaySensorContact(end.station,end.receiver,end.pin,aligned);}
export const railwaySensorConnections:{id:string;name:string;node:string;from:RailwaySensorTerminal;to:RailwaySensorTerminal;color:string}[]=[
 {id:'railway-sensor-feed-vcc',name:'Uno 5 V → sensor supply strip',node:'logic-5v',from:{type:'uno',name:'5V'},to:{type:'strip',node:'logic-5v',row:0},color:'#c34b60'},
 {id:'railway-sensor-feed-ground',name:'Uno GND → sensor return strip',node:'common-ground',from:{type:'uno',name:'GND-P1'},to:{type:'strip',node:'common-ground',row:0},color:'#3e5065'},
 ...railwaySensorDevices.flatMap(d=>(['logic-5v','common-ground'] as const).map((node,pin)=>({id:`railway-sensor-${d.station}-${d.receiver?'receiver':'emitter'}-${pin?'ground':'vcc'}`,name:`Beam ${d.station.toUpperCase()} ${d.receiver?'receiver':'emitter'} ${pin?'GND':'5 V'} → sensor ${pin?'return':'supply'} strip`,node,from:{type:'sensor' as const,station:d.station,receiver:d.receiver,pin},to:{type:'strip' as const,node,row:d.row},color:pin?'#3e5065':'#c34b60'}))),
 ...(['a','b'] as const).map(station=>({id:`railway-sensor-${station}-signal`,name:`Beam ${station.toUpperCase()} receiver → Uno ${station==='a'?'D2':'D3'}`,node:station==='a'?'uno-d2':'uno-d3',from:{type:'sensor' as const,station,receiver:true,pin:2},to:{type:'uno' as const,name:station==='a'?'D2':'D3'},color:station==='a'?'#5b91bd':'#6aab9e'})),
];
/** Node names are logical nets. Physical strip identifiers include their bank so the
 * warning circuit's rear-bank columns can never accidentally become power buses. */
export function railwaySensorTerminalNode(end:RailwaySensorTerminal){if(end.type==='strip')return end.node;if(end.type==='uno')return end.name==='5V'?'logic-5v':end.name.startsWith('GND')?'common-ground':'uno-'+end.name.toLowerCase();return end.pin===0?'logic-5v':end.pin===1?'common-ground':end.station==='a'?'uno-d2':'uno-d3';}
export function railwaySensorStripUsage(){return(['logic-5v','common-ground'] as const).map(node=>({node,holes:railwaySensorConnections.flatMap(w=>[w.from,w.to].filter((end):end is Extract<RailwaySensorTerminal,{type:'strip'}>=>end.type==='strip'&&end.node===node))}));}
export const railwaySensorConnectionParts=railwaySensorConnections.map(w=>({id:w.id,name:w.name,what:'An insulated sensor connection follows its two named physical contacts.',connection:w.node==='logic-5v'?'Use the Uno-powered front-bank supply strip, not the independent servo-positive socket.':w.node==='common-ground'?'The front-bank ground strip returns the sensor current to Uno GND. Servo current uses its separate motor-return cable.':`The receiver drives ${w.node==='uno-d2'?'D2 for approach A':'D3 for exit B'}. The original sketch interprets HIGH as blocked.`}));
