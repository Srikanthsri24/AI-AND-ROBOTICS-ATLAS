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

/** Flexible port leads continue the same inner/outer rings, then recover to the
 * reference 5/3.5 mm tube before fixed connection points below the head. */
export function tapTubeLeadPoint(side:-1|1,t:number,sectionAngle:number,phase:number,inside=false):readonly[number,number,number]{
 if(!Number.isFinite(t)||t<0||t>1||!Number.isFinite(sectionAngle))throw new RangeError('Invalid pump tube lead');
 const theta=side*3*Math.PI/4,s=tapTubeSection(theta,phase),sin=Math.sin(theta),cos=Math.cos(theta);
 const p0=[s.center*sin,s.center*cos],p1=[p0[0]+side*6*cos,p0[1]-side*6*sin],p2=[side*17,-28],p3=[side*17,-42],u=1-t;
 const x=u**3*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t**3*p3[0],y=u**3*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t**3*p3[1];
 const blend=t*t*(3-2*t),a=s.radial+(2.5-s.radial)*blend,b=5-a,wall=inside?.75:0;
 const nx=sin*(1-blend)+side*blend,ny=cos*(1-blend),length=Math.hypot(nx,ny),r=(a-wall)*Math.cos(sectionAngle);
 return [x+nx/length*r,y+ny/length*r,(b-wall)*Math.sin(sectionAngle)];
}
