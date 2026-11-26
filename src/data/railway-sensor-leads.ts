import {railwaySensorConnections,railwaySensorTerminalPoint} from './railway-sensor-wiring';
import {railwaySensorSocketDefinitions,railwaySensorSocketPose} from './railway-sensor-sockets';
import {railwayTranslate,type RailwayJumperEnd,type RailwayWithdrawal} from './railway-control-jumpers';
import type {RailwayPoint as P} from './railway-electrical-layout';
const up:P=[0,1,0];
const definitions=railwaySensorConnections.filter(w=>w.from.type==='sensor');
export const railwaySensorLeads=definitions.map((w,n)=>{const s=railwaySensorSocketPose(n);return{...w,radius:.4,a:{at:s.at,out:s.out,kind:'female',travel:6.5} as RailwayJumperEnd,b:{at:railwaySensorTerminalPoint(w.to),out:up,kind:'male',travel:6.5} as RailwayJumperEnd};});
/** Far-side emitter leads go around the LEFT END of the track, never through the
 * solid base or the rolling train envelope. Coordinates are authored millimetres. */
export function railwaySensorLeadPose(n:number,aWithdrawal=0,bWithdrawal=0,aligned=true){const w=railwaySensorLeads[n],d=railwaySensorSocketDefinitions[n];if(!w||!d)throw Error('Unknown sensor lead');for(const v of[aWithdrawal,bWithdrawal])if(!Number.isFinite(v)||v<0||v>6.5)throw Error('Sensor lead outside mating travel');const s=railwaySensorSocketPose(n,aligned,aWithdrawal),a=s.at,b=railwayTranslate(w.b.at,up,bWithdrawal);let route:P[];
 if(!d.terminal.receiver){const lane=n,x=-567.38-lane*2.54,z=-100-lane*3;route=[[a[0],8,z],[a[0]-15,3,z],[x+22,3,z],[x+3,3,z],[x,3,z+12],[x,3,-45],[x,3,0],[x,3,45],[x,3,130],[x+3,3,147+lane*3],[x+22,3,154+lane*3],[25+lane*3,3,154+lane*3],[48+lane*3,5,150+lane*3],[b[0]-8,20+lane*3,146+lane*3]];}
 else if(d.terminal.station==='a'){const lane=d.terminal.pin;route=[[a[0],8+lane*3,93],[-210-lane*3,8+lane*3,93],[-213-lane*3,6+lane*2,108],[-213-lane*3,6+lane*2,160+lane*3],[-195,6+lane*2,170+lane*3],[40,6+lane*2,170+lane*3],[b[0]-12,24+lane*3,150+lane*3]];}
 else{const lane=d.terminal.pin,x=212-lane*3,y=75-lane*5;route=[[a[0],8+lane*4,91],[x,8+lane*4,91],[x,y,91],[145,y,95],[130,y,150+lane*3]];}
 if(w.to.type==='strip'){if(!d.terminal.receiver||d.terminal.station==='a')route.pop();const pin=d.terminal.pin,row=w.to.row,y=50+pin*10,z=b[2]+(pin?.7:-.7);route.push([25,80+row*16+pin*8,z],[45,80+row*16+pin*8,z],[55,y,z],[b[0],y,z],[b[0],40+pin*8,b[2]]);}
 const anchors:P[]=[railwayTranslate(a,s.out,8.2),railwayTranslate(a,s.out,d.terminal.receiver?10:12),...route,railwayTranslate(b,up,20),railwayTranslate(b,up,14),railwayTranslate(b,up,8.2)];
 // Keep spline tangents local on long extension runs, preventing a large span
 // from pulling a neighbouring low bend through the tabletop.
 const points=anchors.flatMap((p,k)=>{if(!k)return[p];const prev=anchors[k-1],steps=Math.max(1,Math.ceil(Math.hypot(...p.map((v,i)=>v-prev[i]))/12));return Array.from({length:steps},(_,j)=>[prev[0]+(p[0]-prev[0])*(j+1)/steps,prev[1]+(p[1]-prev[1])*(j+1)/steps,prev[2]+(p[2]-prev[2])*(j+1)/steps] as P);});return{a,b,points};}
export function railwaySensorLeadSeating(progress:number):RailwayWithdrawal[]{if(!Number.isFinite(progress)||progress<0||progress>1)throw Error('Sensor seating progress must be 0–1');const withdraw=(step:number)=>{const t=Math.max(0,Math.min(1,progress*20-step));return 6.5*(1-t*t*(3-2*t));};return railwaySensorLeads.map((_,n)=>({a:withdraw(n*2),b:withdraw(n*2+1)}));}
export const railwaySensorLeadParts=railwaySensorLeads.flatMap(w=>[
 {id:w.id,name:w.name,what:'An insulated extension connects this sensor to its dedicated logic contact.',connection:w.node==='logic-5v'?'Uno 5 V powers this sensor; the separate servo-positive node must not be used.':w.node==='common-ground'?'This return joins the Uno-powered sensor ground strip.':'This receiver signal reaches its named Uno input; HIGH means blocked in the original sketch.'},
 {id:w.id+'-a',name:railwaySensorSocketDefinitions.find(d=>d.id===w.id+'-a')!.name,what:'A hollow female contact slides over the actual sensor male pin.',connection:'Switch power off before connecting. Follow the wire to the named supply strip or input.'},
 {id:w.id+'-b',name:w.name.split(' → ')[1]+' male plug',what:'A square male pin enters the named breadboard or Uno contact.',connection:'Seat the insulating housing outside the hole; only the metal pin enters the mating contact.'},
]);
