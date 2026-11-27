import {tapHarnessWires,type TapHarnessPort}from'./tap-harness';
import type{TapPoint}from'./tap-plumbing';
export const tapDryIds=['tap-wire-logic','tap-wire-ground','tap-wire-reference'] as const;
export const tapDryWires=tapDryIds.map(id=>tapHarnessWires.find(w=>w.id===id)!);
const add=(a:TapPoint,b:TapPoint,n:number):TapPoint=>[a[0]+b[0]*n,a[1]+b[1]*n,a[2]+b[2]*n];
function phase(n:number){if(!Number.isFinite(n)||n<0||n>1)throw new RangeError('Invalid tap jumper fitting phase');return n*n*(3-2*n);}
export function tapDryExit(p:TapHarnessPort){if(p.kind!=='socket'&&p.kind!=='female-header')throw new Error('Unsupported dry jumper connector');return add(p.point,p.axis,p.kind==='socket'?8.2:5.2);}
export function tapDryPose(id:string,sourcePhase=1,destinationPhase=1){const w=tapDryWires.find(w=>w.id===id);if(!w)throw new RangeError('Unknown dry tap jumper');const source=add(w.a.point,w.a.axis,10*(1-phase(sourcePhase))),destination=add(w.b.point,w.b.axis,10*(1-phase(destinationPhase))),a=add(tapDryExit(w.a),w.a.axis,10*(1-phase(sourcePhase))),b=add(tapDryExit(w.b),w.b.axis,10*(1-phase(destinationPhase)));let middle:TapPoint[];
 if(id==='tap-wire-logic'){const y=Math.max(260,a[1]+5,b[1]+5);middle=[[a[0],y,a[2]],[218,y,-81],[b[0],y,b[2]]];}
 else if(id==='tap-wire-ground'){const y=Math.max(267,a[1]+5,b[1]+5);middle=[[a[0],y,a[2]],[226,y,-83],[b[0],y,b[2]]];}
 else{const y=Math.max(252,a[1]+5,b[1]+5);middle=[[a[0],y,a[2]],[226.5,y,-58],[b[0],y,b[2]]];}
 return {source,destination,points:[a,...middle,b] as readonly TapPoint[],sourceSeated:sourcePhase===1,destinationSeated:destinationPhase===1};
}
export const tapDryParts=tapDryWires.flatMap(w=>[
 [w.id,w.label,w.why+' Follow the coloured insulation between the two named contacts.'],
 ...([w.a,w.b]as const).map((p,i)=>[w.id+'-end-'+i,p.label+' · '+(p.kind==='socket'?'male jumper pin':'female reference connector'),p.kind==='socket'?'The square male conductor enters this actual socket. Its insulated grip stays above the opening; the pin reaches the spring contact below.':'The open female housing slides over the GND header. Its two metal leaves touch the actual square pin, with the insulated wire leaving from the rear.']),
]);
