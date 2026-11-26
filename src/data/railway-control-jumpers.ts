import {railwayUnoSocket,railwaySupplySocket} from './railway-power-layout';
import {railwayServoContact,railwayWarningPins,type RailwayPoint as P} from './railway-electrical-layout';
export type RailwayJumperEnd={at:P;out:P;kind:'male'|'banana'|'female';travel:number};
export type RailwayWithdrawal={a:number;b:number};
const up:P=[0,1,0],front:P=[0,0,1];
function male(at:P,out:P=up):RailwayJumperEnd{return{at,out,kind:'male',travel:6.5};}
function source(n:number):RailwayJumperEnd{return{at:railwaySupplySocket(n),out:front,kind:'banana',travel:10};}
function servo(n:number):RailwayJumperEnd{const p=railwayServoContact(n);return male([p[0],p[1],p[2]+1],front);}
export const railwayControlJumpers=[
 {id:'railway-wire-servo-signal',name:'Uno D9 → servo signal',node:'uno-d9',color:'#d39146',a:male(railwayUnoSocket('D9')),b:servo(0),radius:.45},
 {id:'railway-wire-servo-positive',name:'Separate +5 V → servo red',node:'servo-5v',color:'#c84556',a:source(0),b:servo(1),radius:.6},
 {id:'railway-wire-servo-return',name:'MOTOR − → servo brown',node:'common-ground',color:'#745340',a:source(1),b:servo(2),radius:.6},
 {id:'railway-wire-reference',name:'LOGIC REF → Uno GND (power header)',node:'common-ground',color:'#65768a',a:source(2),b:male(railwayUnoSocket('GND-P2')),radius:.55},
 {id:'railway-wire-warning-drive',name:'Uno D6 → resistor input strip',node:'uno-d6',color:'#a06bc6',a:male(railwayUnoSocket('D6')),b:male(railwayWarningPins.d6),radius:.45},
 {id:'railway-wire-warning-return',name:'Uno GND (digital header) → LED cathode strip',node:'common-ground',color:'#364859',a:male(railwayUnoSocket('GND-D')),b:male(railwayWarningPins.ground),radius:.45},
] as const;
export function railwayTranslate(p:P,d:P,n:number):P{return[p[0]+d[0]*n,p[1]+d[1]*n,p[2]+d[2]*n];}
export function railwayControlJumperPose(index:number,aWithdrawal=0,bWithdrawal=0){const j=railwayControlJumpers[index];if(!j)throw Error('Unknown railway control jumper');for(const[v,end]of[[aWithdrawal,j.a],[bWithdrawal,j.b]] as const)if(!Number.isFinite(v)||v<0||v>end.travel)throw Error('Plug outside mating travel');const a=railwayTranslate(j.a.at,j.a.out,aWithdrawal),b=railwayTranslate(j.b.at,j.b.out,bWithdrawal),start=railwayTranslate(a,j.a.out,j.a.kind==='banana'?10:8.2),end=railwayTranslate(b,j.b.out,8.2);let route:P[];
 if(index===0)route=[[165,42,80],[40,42,90],[-50,35,110],[-118,30,130],[-112,22,133]];
 else if(index===1)route=[[-155,20,170],[-130,26,160],[-115,26,140],[-100,20,133]];
 else if(index===2)route=[[-145,5,166],[-120,5,155],[-108,6,137],[-97.46,6,130]];
 else if(index===3)route=[[-95,18,169],[-5,18,162],[70,20,158],[130,24,158],[180,42,158]];
 else if(index===4)route=[[165,40,105],[130,40,103],[87.38,40,103]];
 else route=[[175,30,75],[145,24,75],[115,24,95],[110,28,132],[100.08,38,131]];
 return{a,b,points:[start,railwayTranslate(a,j.a.out,j.a.kind==='banana'?18:16),...route,railwayTranslate(b,j.b.out,20),railwayTranslate(b,j.b.out,14),end] as P[]};}
export function railwayControlSeating(progress:number):RailwayWithdrawal[]{if(!Number.isFinite(progress)||progress<0||progress>1)throw Error('Seating progress must be 0–1');const withdraw=(step:number,travel:number)=>{const f=Math.max(0,Math.min(1,progress*12-step));return travel*(1-f*f*(3-2*f));};return railwayControlJumpers.map((j,n)=>({a:withdraw(n*2,j.a.travel),b:withdraw(n*2+1,j.b.travel)}));}
export const railwayControlJumperParts=railwayControlJumpers.flatMap(j=>[
 {id:j.id,name:j.name,what:'A removable insulated conductor joins these two actual contacts.',connection:j.node==='servo-5v'?'Servo positive stays separate from Uno 5 V. Seat both ends with power off.':j.id==='railway-wire-reference'?'This separate link shares the signal reference; servo return current uses the MOTOR − cable directly.':j.node==='uno-d9'?'D9 sends an angle request; it does not provide motor current.':j.node==='uno-d6'?'D6 reaches the LED only through the 220 Ω resistor.':'This cable completes its named ground return. It does not join the two positive rails.'},
 ...(['a','b'] as const).map(end=>({id:j.id+'-'+end,name:j.name.split(' → ')[end==='a'?0:1]+' plug',what:j[end].kind==='banana'?'A round contact enters the actual source socket; its insulated grip remains outside.':'A square pin enters its actual socket or breadboard strip, with the housing outside.',connection:'Power off before seating. Follow the attached cable to its other labelled plug. The wire bend follows this plug during insertion.'})),
]);
