import {radarPowerConnections} from './radar-power-layout';
import type {RadarHarnessPoint as P} from './radar-harness';
export type RadarJumperEnd=Readonly<{at:P;out:P;kind:'male'|'banana';travel:number}>;
export type RadarPowerWithdrawal=Readonly<{a:number;b:number}>;
const up:P=[0,1,0],front:P=[0,0,1];
export const radarPowerJumpers=radarPowerConnections.map((connection,i)=>({
 id:'radar-jumper-'+connection.id,name:connection.a+' → '+connection.b,node:connection.node,
 color:['#ce944e','#c95767','#795744','#586780','#364454'][i],
 a:{at:connection.from,out:i>0&&i<4?front:up,kind:i>0&&i<4?'banana':'male',travel:i>0&&i<4?8:5} as RadarJumperEnd,
 b:{at:connection.to,out:i<3?front:up,kind:'male',travel:5} as RadarJumperEnd,
}));
export const radarPowerJumperParts=radarPowerJumpers.flatMap(j=>[
 [j.id,j.name,'This removable insulated conductor joins the two labelled actual contacts. Its slack bends follow the plugs as they seat or withdraw.','Fit with both supplies off. '+(j.node==='servo-positive'?'This positive circuit bypasses Uno 5 V.':j.node==='servo-command'?'D9 carries a position request; it does not supply motor current.':'This connection belongs to the common negative reference; it does not join the two positive sources.')],
 [j.id+'-a',j.name.split(' → ')[0]+' plug',j.a.kind==='banana'?'A round male contact seats inside the actual bored supply socket.':'A square male jumper contact enters its actual female socket.','The wire leaves the rear of this housing and continues to the other labelled plug. Disconnect power before fitting or removing it.'],
 [j.id+'-b',j.name.split(' → ')[1]+' plug','A square male jumper pin enters the actual connector opening.','Its metal tip seats 2 mm inside the socket; its housing remains outside. The plug withdraws along the socket axis.'],
] as const);
const translate=(p:P,d:P,n:number):P=>[p[0]+d[0]*n,p[1]+d[1]*n,p[2]+d[2]*n];
export function radarPowerJumperPose(index:number,aWithdrawal=0,bWithdrawal=0){
 const j=radarPowerJumpers[index];if(!j)throw Error('Unknown radar power jumper');
 for(const[value,end]of[[aWithdrawal,j.a],[bWithdrawal,j.b]] as const)if(!Number.isFinite(value)||value<0||value>end.travel)throw Error('Jumper outside seating travel');
 const a=translate(j.a.at,j.a.out,aWithdrawal),b=translate(j.b.at,j.b.out,bWithdrawal);
 const start=translate(a,j.a.out,j.a.kind==='banana'?11:8),end=translate(b,j.b.out,8);
 let points:P[];
 if(index===0)points=[start,[start[0],38+aWithdrawal,start[2]],[-95,42,-138],[-40,42,-150],[35,35,-160],[55,30,-90],[55,30,-25],[b[0],22,-20],[b[0],14,-24+bWithdrawal],end];
 else if(index===1)points=[start,[85,13,-68+aWithdrawal],[89,24,-58],[88,28,-12],[75,28,-8],[75,20,-8],[75,14,-20+bWithdrawal],end];
 else if(index===2)points=[start,[105,13,-68+aWithdrawal],[105,16,-50],[100,16,-18],[77.54,14,-15],[77.54,14,-25+bWithdrawal],end];
 else if(index===3)points=[start,[125,13,-68+aWithdrawal],[122,20,-55],[85,23,-55],[30,23,-75],[10,42,-135],[-5,44+bWithdrawal,b[2]],[-5,35+bWithdrawal,b[2]],end];
 else points=[start,[a[0],35+aWithdrawal,a[2]],[-12,38+aWithdrawal,a[2]],[-25,38,-138],[-55,30,-145],[-85,30,-138],[b[0],30,-85],[b[0],38+bWithdrawal,b[2]],end];
 return{a,b,points};
}
/** Ten actual plugs seat in order. The student chapter keeps both supplies off. */
export function radarPowerSeating(progress:number):RadarPowerWithdrawal[]{
 if(!Number.isFinite(progress)||progress<0||progress>1)throw Error('Power seating progress must be 0–1');
 const withdrawal=(step:number,travel:number)=>{const f=Math.max(0,Math.min(1,progress*10-step));return travel*(1-f*f*(3-2*f));};
 return radarPowerJumpers.map((j,i)=>({a:withdrawal(i*2,j.a.travel),b:withdrawal(i*2+1,j.b.travel)}));
}
