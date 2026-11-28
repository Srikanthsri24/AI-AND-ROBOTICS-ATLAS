import{CatmullRomCurve3,Vector3}from'three';
import{pickUnoPin,pickDriverPin,pickPcaLogicPin}from'./pick-rover-electronics';
import{pickDistributionHole,type PickDistributionHole}from'./pick-rover-distribution';
export type PickLogicEndpoint={kind:'uno'|'driver'|'pca'|'tie';at:readonly[number,number,number];label:string;hole?:PickDistributionHole};
const uno=(name:string):PickLogicEndpoint=>({kind:'uno',at:pickUnoPin(name),label:'Uno '+name});
const driver=(name:string):PickLogicEndpoint=>({kind:'driver',at:pickDriverPin(name),label:'TB6612 '+name});
const pca=(name:'vcc'|'gnd'):PickLogicEndpoint=>({kind:'pca',at:pickPcaLogicPin(name),label:'PCA9685 '+name.toUpperCase()});
const tie=(ground:boolean,row:number):PickLogicEndpoint=>{const hole:PickDistributionHole={column:ground?16:0,bank:ground?1:-1,row};return{kind:'tie',at:pickDistributionHole(hole),label:(ground?'GND':'5V')+' tie · contact '+(row+1),hole};};
export const pickLogicLinks=[
 {id:'uno-five',from:uno('5V'),to:tie(false,0),ground:false,why:'Uno 5V feeds the five-contact logic tie. USB powers this logic circuit; this conductor never supplies wheel VM or servo V+.'},
 {id:'driver-five',from:tie(false,1),to:driver('VCC'),ground:false,why:'The same isolated 5V bank feeds TB6612 logic VCC. Its separate VM input needs the matched wheel supply.'},
 {id:'pca-five',from:tie(false,2),to:pca('vcc'),ground:false,why:'The 5V tie powers PCA9685 logic VCC, allowing I²C commands. Servo current uses the separate V+ terminal.'},
 {id:'uno-ground',from:uno('GND-P1'),to:tie(true,0),ground:true,why:'Uno ground establishes the common logic reference at this five-contact bank. It is not a high-current motor return path.'},
 {id:'driver-ground',from:tie(true,1),to:driver('GND'),ground:true,why:'The motor driver and Uno need the same signal reference. The wheel supply return must also connect directly to the driver through its dedicated power path.'},
 {id:'pca-ground',from:tie(true,2),to:pca('gnd'),ground:true,why:'The PWM controller shares the Uno logic reference. Servo supply return connects directly to the PWM board; it must not pass through this small jumper.'},
]as const;
/** Plug body starts just above a socket, or around a projecting header pin. */
export function pickLogicSeat(e:PickLogicEndpoint){return e.at[1]+(e.kind==='driver'?-2.75:e.kind==='pca'?-3.85:.001);}
export function pickLogicRoute(index:number){const link=pickLogicLinks[index];if(!link)throw new RangeError('Unknown logic supply lead');const start=new Vector3(link.from.at[0],pickLogicSeat(link.from)+8.05,link.from.at[2]),end=new Vector3(link.to.at[0],pickLogicSeat(link.to)+8.05,link.to.at[2]),height=94+index*4;
const escape=(e:PickLogicEndpoint,p:Vector3)=>{const q=p.clone().add(new Vector3(0,5,0));if(e.kind==='tie')q.x+=link.ground?10+index*3:-10-index*3;else if(e.kind==='uno')q.z+=10+index*2;else if(e.kind==='pca')q.x-=link.ground?12.5:16.5;else q.x+=10+index*2;return q;};
const a=escape(link.from,start),b=escape(link.to,end),rear=174+index*4;
return{link,start,end,curve:new CatmullRomCurve3([start,start.clone().add(new Vector3(0,2,0)),a,new Vector3(a.x,height,a.z),new Vector3(a.x,height,rear),new Vector3(b.x,height,rear),new Vector3(b.x,height,b.z),b,end.clone().add(new Vector3(0,2,0)),end],false,'catmullrom',.04)};}

export const pickLogicParts=pickLogicLinks.flatMap(l=>(['wire','from','to']as const).map(end=>({id:`pick-logic-${l.id}-${end}`,label:end==='wire'?`${l.from.label} → ${l.to.label}`:(end==='from'?l.from:l.to).label+' · jumper plug',description:l.why})));
