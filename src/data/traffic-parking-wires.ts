import {trafficParkingNetlist} from './traffic-parking-netlist';
import {trafficParkingWirePort,trafficParkingWireExit} from './traffic-parking-wire-ports';
import {trafficParkingLampColors,trafficParkingLamps} from './traffic-parking-signals';
import type {ParkingPoint as P} from './traffic-parking-circuit-layout';
export const trafficParkingWires=trafficParkingNetlist.map(w=>{const lamp=w.net.startsWith('LED')?trafficParkingLamps[Number(w.net.slice(3))-1]:trafficParkingLamps.find(l=>'D'+l.pin===w.net);return {...w,a:trafficParkingWirePort(w.from),b:trafficParkingWirePort(w.to),color:w.net==='GND'?'#485364':w.net==='SERVO5V'?'#c45160':w.net==='D9'?'#c9954e':w.net==='A0'?'#8a68b5':w.net==='A1'?'#4d958c':lamp?trafficParkingLampColors[lamp.color]:'#8a78b3',what:w.net==='GND'?'Completes a shared electrical return; the mat and breadboard plastic do not provide this connection.':w.net==='SERVO5V'?'Carries the independent regulated supply to the red servo lead. It is separate from Uno 5 V.':w.net==='D9'?'Carries the servo position command, not the motor supply current.':w.net==='A0'||w.net==='A1'?'Carries the active-low operator request from its tactile switch.':'Carries one LED branch signal. Each lamp has its own 220 Ω resistor.'};});
const step=(p:P,d:P,n:number):P=>[p[0]+d[0]*n,p[1]+d[1]*n,p[2]+d[2]*n];
/** Authored corridors in mm. Ends retain their physical withdrawal axes;
 * rendered jacket/hardware clearance is audited separately from this graph. */
export function trafficParkingWireRoute(index:number):readonly P[]{
 const w=trafficParkingWires[index];if(!w)throw new RangeError('Unknown parking wire');const a=trafficParkingWireExit(w.a),b=trafficParkingWireExit(w.b);let middle:P[]=[];
 if(w.id==='tp-wire-uno-ground')middle=[[a[0],36.75,a[2]],[a[0],36.75,122],[40,36.75,122],[40,36.75,55],[b[0],36.75,55],[b[0],24,b[2]]];
 else if(w.id==='tp-wire-ground-bridge-1'||w.id==='tp-wire-ground-bridge-3'){const h=w.id.endsWith('1')?26:24;middle=[[a[0],h,a[2]],[b[0],h,b[2]]];}
 else if(w.id==='tp-wire-ground-bridge-2')middle=[[a[0],37,a[2]],[27,37,a[2]],[27,37,56],[b[0],37,56],[b[0],24,b[2]]];
 else if(/^tp-wire-d\d+$/.test(w.id)){const n=trafficParkingLamps.findIndex(l=>'D'+l.pin===w.net),h=36+n*3;middle=[[a[0],h,a[2]],[b[0],h,a[2]],[b[0],h,63],[b[0],24,63]];}
 else if(/^tp-wire-led-\d+$/.test(w.id)){const n=Number(w.id.split('-').at(-1))-1;if(n<3){const h=28+n*3,x=-140+n*3;middle=[[a[0],h,a[2]],[a[0],h,110+n*3],[x,h,110+n*3],[x,h,-42],[x,b[1],-42],[b[0],b[1],-42]];}else if(n<6){const k=n-3,h=[37.5,43.5,40.5][k],x=-25+k*3,west=-82-k*3,north=-106-k*3;middle=[[a[0],h,a[2]],[a[0],h,101+k*3],[x,h,101+k*3],[x,h,north],[west,h,north],[west,b[1],north],[west,b[1],-80],[-54,b[1],-80],[-54,b[1],b[2]]];}else middle=[[a[0],27,a[2]],[a[0],27,98],[55,27,98],[55,27,38],[b[0],b[1],38]];}
 else if(w.id.startsWith('tp-wire-led-return-')){const n=Number(w.id.split('-').at(-1))-1;if(n<3){const x=-145+n*3,h=28+n*3,right=30+n*2;middle=[[a[0],a[1],-45-n*3],[x,a[1],-45-n*3],[x,h,-45-n*3],[x,h,124+n*3],[right,h,124+n*3],[right,h,b[2]],[b[0],h,b[2]]];}else if(n<6){const k=n-3,x=-72-k*3,h=29.5+k*3,right=28+k*2;middle=[[x,a[1],a[2]],[x,a[1],-120-k*3],[right,a[1],-120-k*3],[right,h,-120-k*3],[right,h,b[2]],[b[0],h,b[2]]];}else middle=[[a[0],18,36],[101,18,36],[101,26,36],[50,26,36],[50,26,b[2]],[b[0],26,b[2]]];}
 else if(w.id.endsWith('-input')){const n=w.net==='A0'?0:1,h=38.5+n*3,z=134+n*3;middle=[[a[0],h,a[2]],[a[0],h,z],[b[0],h,z],[b[0],h,b[2]]];}
 else if(w.id==='tp-wire-entry-return'||w.id==='tp-wire-exit-return'){const n=w.id.includes('entry')?0:1,h=23+n*3,x=42+n*4,z=115+n*3;middle=[[a[0],h,a[2]],[a[0],h,z],[x,h,z],[x,h,b[2]],[b[0],h,b[2]]];}
 else if(w.id==='tp-wire-servo-signal')middle=[[a[0],34.5,a[2]],[a[0],34.5,43],[a[0],57,43],[58,57,43],[58,40,-8],[102,40,-8],[102,11,-8],[b[0],11,-8],[b[0],11,-4],[b[0],8,-4]];
 else if(w.id==='tp-wire-servo-positive')middle=[[a[0],a[1],151],[168,a[1],151],[168,a[1],-20],[168,27,-20],[96,27,-20],[96,27,-3],[96,8,-3],[b[0],8,-3]];
 else if(w.id==='tp-wire-servo-negative')middle=[[a[0],a[1],147],[a[0],9,147],[172,9,147],[172,9,-26],[172,30,-26],[98,30,-26],[98,30,0],[98,8,0],[b[0],8,0]];
 else if(w.id==='tp-wire-servo-reference')middle=[[a[0],a[1],143],[a[0],14,143],[158,14,143],[158,32.5,130],[50,32.5,130],[50,32.5,b[2]],[b[0],32.5,b[2]]];
 else throw new RangeError('No parking route '+w.id);
 return [a,step(a,w.a.axis,3),...middle,step(b,w.b.axis,3),b];
}
