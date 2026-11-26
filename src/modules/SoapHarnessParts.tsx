import type {ThreeEvent} from '@react-three/fiber';
import {memo,useMemo} from 'react';
import {Shape,Path,LineCurve3,Vector3} from 'three';
import {soapHarnessGuides} from '../data/soap-dispenser-harness';
const options={depth:2,bevelEnabled:false,curveSegments:32};
function SoapHarnessParts({selected,choose}:{selected:string;choose:(id:string)=>void}){
 const shape=useMemo(()=>{const length=12*Math.SQRT2,s=new Shape(),r=4.5;s.moveTo(0,r);s.lineTo(length,r);s.absarc(length,0,r,Math.PI/2,-Math.PI/2,true);s.lineTo(0,-r);s.absarc(0,0,r,-Math.PI/2,Math.PI/2,true);s.closePath();const h=new Path(),bore=3;h.moveTo(0,bore);h.absarc(0,0,bore,Math.PI/2,-Math.PI/2,false);h.lineTo(length,-bore);h.absarc(length,0,bore,-Math.PI/2,Math.PI/2,false);h.lineTo(0,bore);h.closePath();s.holes.push(h);return s;},[]);
 const arms=useMemo(()=>soapHarnessGuides.map(({y})=>new LineCurve3(new Vector3(-41.5,y+1,-26.5),new Vector3(-55+4.5/Math.SQRT2,y+1,-45+4.5/Math.SQRT2))),[]);
 return <group name='soap-harness-guides'>{soapHarnessGuides.map(({id,y},i)=>{const color=selected===id?'#b78be8':'#574573';return <group key={id} name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}><group position={[-55,y,-45]} rotation={[-Math.PI/2,0,0]}><mesh name={id+'-slot'} rotation={[0,0,Math.PI*3/4]}><extrudeGeometry args={[shape,options]}/><meshStandardMaterial color={color} roughness={.45} metalness={.3}/></mesh></group><mesh name={id+'-arm'}><tubeGeometry args={[arms[i],1,.8,16,false]}/><meshStandardMaterial color={color} roughness={.45} metalness={.3}/></mesh></group>;})}</group>;
}
export default memo(SoapHarnessParts);
