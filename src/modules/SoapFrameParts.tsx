import type {ThreeEvent} from '@react-three/fiber';
import {memo,useMemo,type ReactNode} from 'react';
import {Shape} from 'three';
import {soapFrameDimensions as d} from '../data/soap-dispenser-frame';
const options={depth:4,bevelEnabled:false,curveSegments:12};
type Extent={readonly min:readonly[number,number,number];readonly max:readonly[number,number,number]};
function SoapFrameParts({selected,choose}:{selected:string;choose:(id:string)=>void}){
 const base=useMemo(()=>{const s=new Shape(),x=-80,y=-140,w=170,h=215,r=9;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);s.closePath();return s;},[]);
 const c=(id:string,normal:string)=>selected===id?'#b78be8':normal;
 const tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 const solid=(id:string,name:string,e:Extent)=><mesh name={name} position={e.min.map((v,i)=>(v+e.max[i])/2) as [number,number,number]}><boxGeometry args={e.max.map((v,i)=>v-e.min[i]) as [number,number,number]}/><meshStandardMaterial color={c(id,'#51436e')} roughness={.42} metalness={.35}/></mesh>;
 return <group name='soap-fixed-stand'>
 {tag('soap-stand-base',<><mesh name='soap-base-plate' position={[0,-4,0]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[base,options]}/><meshStandardMaterial color={c('soap-stand-base','#222e47')} roughness={.45} metalness={.35}/></mesh>{[-65,75].flatMap(x=>[-60,125].map(z=><mesh name={'soap-base-foot-'+x+'-'+z} key={x+'/'+z} position={[x,-5,z]}><cylinderGeometry args={[6,6,2,32]}/><meshStandardMaterial color={c('soap-stand-base','#303344')} roughness={.9}/></mesh>))}</>)}
 {tag('soap-stand-left',<>{solid('soap-stand-left','soap-left-upright',d.leftPost)}{solid('soap-stand-left','soap-left-bridge',d.leftArm)}</>)}
 {tag('soap-stand-right',<>{solid('soap-stand-right','soap-right-upright',d.rightPost)}{solid('soap-stand-right','soap-right-bridge',d.rightArm)}</>)}
 </group>;
}
export default memo(SoapFrameParts);
