import {BufferGeometry,Float32BufferAttribute} from 'three';
/** Independent two-blade visual surface using the published 47 mm diameter / 17 mm pitch / 0.8 mm shaft. Airfoil thickness and chord are authored approximations. */
export const lidarPropellerSpec={diameter:47,pitch:17,shaftDiameter:.8,hubRadius:2.25,hubHeight:1.5};
export function lidarPropellerBlade(cw:boolean){
 const radii=[2.2,4,8,13,18,22,23.5],chord=[1.5,4,6.8,7,5.5,3,.3],vertices:number[]=[],indices:number[]=[],sections=9;
 for(const side of [-1,1])for(let r=0;r<radii.length;r++)for(let c=0;c<sections;c++){const u=c/(sections-1)*2-1,angle=Math.atan(lidarPropellerSpec.pitch/(2*Math.PI*radii[r]))*(cw?1:-1),x=u*chord[r]/2,y=side*.17*Math.sqrt(Math.max(0,1-u*u))+.04,z=radii[r];vertices.push(x*Math.cos(angle),y+x*Math.sin(angle),Math.min(z,Math.sqrt(23.5**2-x*x)));}
 const layer=radii.length*sections,tri=(a:number,b:number,c:number,reverse=false)=>indices.push(...(reverse?[a,c,b]:[a,b,c]));
 for(let side=0;side<2;side++)for(let r=0;r<radii.length-1;r++)for(let c=0;c<sections-1;c++){const a=side*layer+r*sections+c,b=a+sections;tri(a,b,a+1,side===0);tri(a+1,b,b+1,side===0);}
 for(let r=0;r<radii.length-1;r++)for(const c of [0,sections-1]){const a=r*sections+c,b=a+sections;tri(a,a+layer,b,c===0);tri(b,a+layer,b+layer,c===0);}
 for(const r of [0,radii.length-1])for(let c=0;c<sections-1;c++){const a=r*sections+c;tri(a,a+1,a+layer,r===0);tri(a+1,a+layer+1,a+layer,r===0);}
 const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingBox();return geometry;
}
