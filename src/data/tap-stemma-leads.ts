import{tapHarnessWires}from'./tap-harness';
import{tapDryExit}from'./tap-dry-jumpers';
import{tapStemmaTail}from'./tap-stemma-plug';
import{tapCableSegments,tapCableLength}from'./tap-level-cable';
import type{TapPoint}from'./tap-plumbing';
export const tapStemmaLeadIds=['tap-wire-driver-signal','tap-wire-driver-vin','tap-wire-driver-ground']as const;
export const tapStemmaLeads=tapStemmaLeadIds.map(id=>tapHarnessWires.find(w=>w.id===id)!);
/** Approximate stock 200 mm envelope, including the two connector ends. */
export const tapStemmaJacketLength=174.6;
export function tapStemmaLeadPose(id:string,destinationPhase=1,plugPhase=1){const i=tapStemmaLeadIds.indexOf(id as typeof tapStemmaLeadIds[number]),w=tapStemmaLeads[i];if(!w)throw new RangeError('Unknown STEMMA lead');if(!Number.isFinite(destinationPhase)||destinationPhase<0||destinationPhase>1)throw new RangeError('Invalid STEMMA header fitting');const name=(['signal','vin','ground']as const)[i],source=tapStemmaTail(name,plugPhase),lift=10*(1-destinationPhase*destinationPhase*(3-2*destinationPhase)),destination:TapPoint=w.b.point.map((v,n)=>v+w.b.axis[n]*lift)as unknown as TapPoint,b=tapDryExit(w.b).map((v,n)=>v+w.b.axis[n]*lift)as unknown as TapPoint,side=Math.min(181,source[0]-3);
 const points=(height:number):readonly TapPoint[]=>{if(name==='signal'){const escape=Math.max(252,b[1]+3.5);return[source,[side,source[1],source[2]],[side,height,source[2]],[b[0],height,-122],[b[0],escape,-122],[b[0],escape,b[2]],b];}const ground=name==='ground',far=ground?167:170,front=ground?-41:-45,column=ground?210:206;return[source,[side,source[1],source[2]],[side,height,source[2]],[far,height,source[2]],[far,height,front],[column,height,front],[column,b[1],front],[column,b[1],b[2]],b];};
 let lo=Math.max(source[1]+6,b[1]+6,name==='signal'?Math.max(252,b[1]+3.5)+4:0),hi=360;for(let n=0;n<36;n++){const h=(lo+hi)/2;if(tapCableLength(tapCableSegments(points(h)))<tapStemmaJacketLength)lo=h;else hi=h;}const p=points((lo+hi)/2);return{source,destination,points:p,length:tapCableLength(tapCableSegments(p)),destinationSeated:destinationPhase===1};
}
export function tapStemmaClamps(fitting:Readonly<Record<string,number>>){return Object.fromEntries(tapStemmaLeads.filter(w=>w.b.kind==='header-clamp').map(w=>{const t=fitting[w.id]??1;const open=t<=0||t>=1?0:t<.2?t/.2:t<.8?1:(1-t)/.2;return['tap-supply-'+(w.id.endsWith('vin')?'positive':'negative'),open];}));}
export const tapStemmaLeadParts=tapStemmaLeads.flatMap(w=>[[w.id,w.label,w.why+' The supplied male-header end remains intact.'],[w.id+'-end-1',w.b.label+' · factory male header',w.b.kind==='header-clamp'?'Open the screw clamp, seat the conductive square pin through its opening and tighten onto the metal. The insulated factory grip stays outside the terminal block.':'Fit the factory square male pin into Uno D9. The white wire carries the control signal and does not carry pump current.']]);
