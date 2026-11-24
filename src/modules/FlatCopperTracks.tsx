import {useEffect,useMemo} from 'react';
import {BufferGeometry,Float32BufferAttribute} from 'three';
type Track={x1:string;y1:string;x2:string;y2:string;width:string};
/** All coplanar PCB tracks share one geometry / material, retaining their actual physical paths. */
export default function FlatCopperTracks({tracks,scale,centreX,centreY,height,color}:{tracks:Track[];scale:number;centreX:number;centreY:number;height:number;color:string}){
 const geometry=useMemo(()=>{const positions:number[]=[],indices:number[]=[];for(const t of tracks){const x1=(+t.x1-centreX)*scale,z1=(centreY-+t.y1)*scale,x2=(+t.x2-centreX)*scale,z2=(centreY-+t.y2)*scale,dx=x2-x1,dz=z2-z1,length=Math.hypot(dx,dz);if(length<1e-9)continue;const half=+t.width*scale/2,nx=-dz/length*half,nz=dx/length*half,base=positions.length/3;positions.push(x1-nx,height,z1-nz,x1+nx,height,z1+nz,x2+nx,height,z2+nz,x2-nx,height,z2-nz);indices.push(base,base+1,base+2,base,base+2,base+3);}const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g;},[tracks,scale,centreX,centreY,height]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);return <mesh geometry={geometry}><meshStandardMaterial color={color} roughness={.72}/></mesh>;
}
