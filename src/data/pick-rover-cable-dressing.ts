import{pickMotorCableHoles}from'./pick-rover-motor-leads';
const smooth=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
export const pickCableProtectors=pickMotorCableHoles.map((hole,i)=>({...hole,index:i,partId:'pick-cable-protector-'+hole.id,label:(i<2?'Left':'Right')+' motor cable '+(i%2+1)+' · split rubber protector'}));
export const pickCableProtectorGeometry={bore:1.8,stem:2.04,lip:2.9,compressedLip:2.0,lipThickness:.7,upperThickness:.3,stemBottom:35,stemTop:38};
/** Two soft halves close above the deck. Compress only the lower lip, seat
 * through the bore, then release it below the plate. This is an illustrative
 * elastic shape change, not a stress/material calculation or pull restraint. */
export function pickCableProtectorPose(progress:number){if(!Number.isFinite(progress)||progress<0||progress>1)throw new RangeError('Invalid cable protector position');const s=(a:number,b:number)=>smooth((progress-a)/(b-a));return{gap:2*(1-s(0,.3)),lift:4.5*(1-s(.4,.85)),lipScale:1-(1-pickCableProtectorGeometry.compressedLip/pickCableProtectorGeometry.lip)*s(.3,.4)*(1-s(.85,1))};}
export const pickCableProtectorParts=pickCableProtectors.map(p=>({id:p.partId,label:p.label,description:'Two split rubber halves close around the already connected motor lead above the deck. The lower lip compresses while passing through the actual 4.2 mm bore, then opens beneath the plate. The upper lip seats above the deck. The centre passage protects insulation from the acrylic edge; it does not clamp the lead or provide certified strain relief. The moving servo loops must remain free.'}));
