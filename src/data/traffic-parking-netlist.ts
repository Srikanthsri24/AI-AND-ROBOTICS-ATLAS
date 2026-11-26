import {trafficParkingResistors,trafficParkingButtons} from './traffic-parking-circuit-layout';
import {trafficParkingLamps} from './traffic-parking-signals';
export type TrafficParkingWire={id:string;from:string;to:string;net:string;label:string;connection:string};
export function trafficParkingBoardPort(board:'resistors'|'buttons',column:number,bank:-1|1,row:number){if(!Number.isInteger(column)||column<0||column>16||!Number.isInteger(row)||row<0||row>4)throw new RangeError('Invalid traffic/parking breadboard port');return `${board}.${column}.${bank}.${row}`;}
export function trafficParkingPortLabel(port:string){const [device,pin,bank,row]=port.split('.');if(device==='resistors'||device==='buttons')return `${device==='resistors'?'LED':'Switch'} board ${+pin+1}${String.fromCharCode((+bank<0?97:102)+ +row)}`;if(device==='uno')return 'Uno '+pin;if(device==='supply')return '5 V servo supply '+(pin==='positive'?'+':'−')+' terminal '+(+bank+1);if(device==='servo')return 'Servo '+pin;if(device==='lamp')return pin.replace('tp-','').replaceAll('-',' ')+' '+bank;throw new RangeError('Unknown parking port '+port);}
const p=trafficParkingBoardPort;
const ground=(col:number,bank:-1|1,row:number)=>p('resistors',col,bank,row);
export const trafficParkingGroundStrips=[[14,-1],[14,1],[16,-1],[16,1]] as const;
const returnPorts=[ground(14,-1,1),ground(14,-1,2),ground(14,-1,3),ground(14,1,1),ground(14,1,2),ground(14,1,3),ground(16,-1,1)];
const wire=(id:string,from:string,to:string,net:string,label:string):TrafficParkingWire=>({id,from,to,net,label,connection:trafficParkingPortLabel(from)+' → '+trafficParkingPortLabel(to)+'.'});
/** Logical contact graph for the physical harness. Separate source/output
 * strips are joined by resistors, never treated as direct copper continuity. */
export const trafficParkingNetlist:TrafficParkingWire[]=[
 wire('tp-wire-uno-ground','uno.GND-P1',ground(14,-1,0),'GND','Uno common return'),
 wire('tp-wire-ground-bridge-1',ground(14,-1,4),ground(14,1,0),'GND','Ground bridge · across first gap'),
 wire('tp-wire-ground-bridge-2',ground(14,1,4),ground(16,-1,0),'GND','Ground bridge · adjacent strips'),
 wire('tp-wire-ground-bridge-3',ground(16,-1,4),ground(16,1,0),'GND','Ground bridge · across second gap'),
 ...trafficParkingResistors.flatMap((r,n)=>[
  wire('tp-wire-d'+r.pin,'uno.D'+r.pin,p('resistors',r.column,-1,3),'D'+r.pin,'D'+r.pin+' → R'+(n+1)+' input'),
  wire('tp-wire-led-'+(n+1),p('resistors',r.column,1,1),'lamp.'+r.lamp+'.anode','LED'+(n+1),'R'+(n+1)+' → LED anode'),
  wire('tp-wire-led-return-'+(n+1),'lamp.'+r.lamp+'.cathode',returnPorts[n],'GND','LED '+(n+1)+' common return'),
 ]),
 ...trafficParkingButtons.flatMap((b,n)=>[
  wire('tp-wire-'+b.id+'-input','uno.'+b.pin,p('buttons',b.column-1,-1,3),b.pin,b.label+' · '+b.pin),
  wire('tp-wire-'+b.id+'-return',p('buttons',b.column-1,1,1),ground(16,-1,n+2),'GND',b.label+' · return'),
 ]),
 wire('tp-wire-servo-signal','uno.D9','servo.signal','D9','D9 → orange servo command'),
 wire('tp-wire-servo-positive','supply.positive.0','servo.positive','SERVO5V','Independent 5 V → red servo lead'),
 wire('tp-wire-servo-negative','supply.negative.0','servo.negative','GND','Supply return → brown servo lead'),
 wire('tp-wire-servo-reference','supply.negative.1',ground(16,1,1),'GND','Supply return → Uno ground reference'),
];
/** Permanent copper/paired-contact ties, not active components. */
export const trafficParkingFixedTies:readonly (readonly[string,string])[]=[
 ...(['resistors','buttons'] as const).flatMap(board=>Array.from({length:17},(_,column)=>([-1,1] as const).flatMap(bank=>Array.from({length:4},(_,row)=>[p(board,column,bank,row),p(board,column,bank,row+1)] as const))).flat()),
 ...trafficParkingButtons.flatMap(b=>([-1,1] as const).map(bank=>[p('buttons',b.column-1,bank,bank<0?4:0),p('buttons',b.column+1,bank,bank<0?4:0)] as const)),
 ['supply.negative.0','supply.negative.1'],
];
export const trafficParkingResistiveBranches=trafficParkingResistors.map(r=>({id:r.id,ohms:220,input:p('resistors',r.column,-1,4),output:p('resistors',r.column,1,0),source:'uno.D'+r.pin,anode:'lamp.'+r.lamp+'.anode',cathode:'lamp.'+r.lamp+'.cathode'}));
export const trafficParkingLampPorts=trafficParkingLamps.flatMap(l=>['lamp.'+l.id+'.anode','lamp.'+l.id+'.cathode']);
