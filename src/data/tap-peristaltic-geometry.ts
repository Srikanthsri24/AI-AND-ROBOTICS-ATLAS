/** Dimensions in mm. External motor envelope and mounting pitch follow product
 * 3910. The three-roller cutaway is an explanatory mechanism, not factory CAD. */
export const tapPumpDimensions={motorDiameter:27.8,totalLength:66.8,mountPitch:50,mountHoleDiameter:3.7,tubeOuterDiameter:5,tubeInnerDiameter:3.5} as const;
export const tapPumpTeaching={trackRadius:20,rollerOrbit:13.5,rollerRadius:5,rollers:3,wall:.75,wrap:3*Math.PI/2} as const;
export function tapRollerCenters(phase:number):readonly (readonly[number,number])[]{
 if(!Number.isFinite(phase))throw new RangeError('Invalid pump rotation');
 return Array.from({length:3},(_,i)=>{const a=phase+i*2*Math.PI/3;return [13.5*Math.sin(a),13.5*Math.cos(a)] as const;});
}
/** Tube outside remains against the track. Roller contact flattens its radial
 * section and widens its axial section; this is geometry, not a pressure solver. */
export function tapTubeSection(theta:number,phase:number){
 if(!Number.isFinite(theta)||!Number.isFinite(phase))throw new RangeError('Invalid tube angle');
 let inner=15;
 for(let i=0;i<3;i++){const delta=theta-phase-i*2*Math.PI/3,disc=25-13.5**2*Math.sin(delta)**2;if(Math.cos(delta)>0&&disc>=0)inner=Math.max(inner,13.5*Math.cos(delta)+Math.sqrt(disc));}
 const radial=Math.max(.75,Math.min(2.5,(20-inner)/2));
 return {center:20-radial,radial,axial:5-radial,innerRadial:Math.max(0,radial-.75),innerAxial:5-radial-.75};
}
export function tapTubePoint(theta:number,sectionAngle:number,phase:number,inside=false):readonly[number,number,number]{
 const s=tapTubeSection(theta,phase),r=s.center+(inside?s.innerRadial:s.radial)*Math.cos(sectionAngle);
 return [r*Math.sin(theta),r*Math.cos(theta),(inside?s.innerAxial:s.axial)*Math.sin(sectionAngle)];
}
