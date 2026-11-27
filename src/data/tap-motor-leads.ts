import{tapHarnessWires}from'./tap-harness';
import{tapCableSegments,tapCableLength}from'./tap-level-cable';
import type{TapPoint}from'./tap-plumbing';
export const tapMotorLeads=['tap-wire-motor-positive','tap-wire-motor-negative'].map(id=>tapHarnessWires.find(w=>w.id===id)!);
export const tapMotorJacketLength=800;
const phase=(t:number)=>{if(!Number.isFinite(t)||t<0||t>1)throw new RangeError('Invalid motor lead fitting phase');return t*t*(3-2*t);};
export function tapMotorLeadPose(id:string,sourcePhase=1,destinationPhase=1){const i=tapMotorLeads.findIndex(w=>w.id===id);if(i<0)throw new RangeError('Unknown motor lead');const w=tapMotorLeads[i],source:TapPoint=[w.a.point[0]+12*(1-phase(sourcePhase)),w.a.point[1],w.a.point[2]],destination:TapPoint=[w.b.point[0],w.b.point[1],w.b.point[2]-12*(1-phase(destinationPhase))],a:TapPoint=[source[0]+8,source[1],source[2]],b:TapPoint=[destination[0],destination[1],destination[2]-7],right=282+i*4,rear=-164-i*4;
 const span=284+i*4;const points=(h:number):readonly TapPoint[]=>[a,[right,a[1],a[2]],[right,h,a[2]],[right,h,rear],[right,span,rear],[b[0],span,rear],[b[0],b[1],rear],b];let lo=span+4,hi=400;for(let n=0;n<36;n++){const h=(lo+hi)/2;if(tapCableLength(tapCableSegments(points(h)))<tapMotorJacketLength)lo=h;else hi=h;}const p=points((lo+hi)/2);return{source,destination,points:p,length:tapCableLength(tapCableSegments(p)),sourceSeated:sourcePhase===1,destinationSeated:destinationPhase===1};
}
export function tapMotorRelease(t:number){phase(t);return t<=0||t>=1?0:t<.2?t/.2:t<.8?1:(1-t)/.2;}
export const tapMotorLeadParts=tapMotorLeads.flatMap(w=>[
 [w.id,w.label,w.why+' This custom-cut lead has an 800 mm insulated route, with slack behind the frame. It is separate from the Uno sensor wiring.'],
 [w.id+'-end-0',w.a.label+' · stripped conductor','With both supplies off, press the release lever, insert the stripped copper fully into the spring terminal and release. Only metal enters the clamp; insulation stays outside the opening.'],
 [w.id+'-end-1',w.b.label+' · insulated tab connector','Slide the open female contact onto the actual flat motor tab through the protected bracket opening. Its metal leaves grip the two flat faces; the insulated boot leaves toward the rear. This is authored explanatory connector geometry, not a manufacturer CAD assembly.'],
]);
export const tapMotorProtectionParts=[
 ...(['positive','negative']as const).map(p=>['tap-pump-grommet-'+p,'Pump '+p+' lead · protective grommet','This open rubber sleeve lines the bracket bore. The connector and insulated wire pass through its centre rather than through solid bracket metal.']),
 ...(['positive','negative']as const).map(p=>['tap-driver-'+p+'-spring','Driver '+(p==='positive'?'OUT+':'OUT−')+' · spring clamp','The spring presses the bare copper onto the fixed lower contact. Pressing the release lever opens the clamp for insertion; switching off both supplies is required before rewiring.']),
];

export const tapMotorSupportXs=[-120,0,120,200]as const;
export const tapMotorSupportParts=tapMotorSupportXs.map((x,i)=>['tap-motor-guide-'+i,'Motor cable support '+(i+1),'This two-channel bracket sits on the rear rail. Its open 1.8 mm channels keep the two motor leads separated, away from the sensor wiring and moving pump. Support position: '+x+' mm across the frame.']);
