import type {ThreeEvent} from '@react-three/fiber';
import {memo,useMemo,type ReactNode} from 'react';
import {CurvePath,LineCurve3,QuadraticBezierCurve3,Vector3,Path,Shape} from 'three';
import {soapServoLeadChannels as channels,soapServoLeadRoute} from '../data/soap-servo-lead';
function SoapServoLeadParts({selected,choose}:{selected:string;choose:(id:string)=>void}){
 const profiles=useMemo(()=>{const plug=new Shape();plug.moveTo(-4.1,-1.3);plug.lineTo(4.1,-1.3);plug.lineTo(4.1,1.3);plug.lineTo(-4.1,1.3);plug.closePath();for(const x of [-2.54,0,2.54]){const p=new Path();p.moveTo(x-.55,-.55);p.lineTo(x-.55,.55);p.lineTo(x+.55,.55);p.lineTo(x+.55,-.55);p.closePath();plug.holes.push(p);}return plug;},[]);
 const curves=useMemo(()=>channels.map((_,i)=>{const points=soapServoLeadRoute(i).map(p=>new Vector3(...p)),path=new CurvePath<Vector3>();let last=points[0];for(let n=1;n<points.length-1;n++){const a=points[n-1],b=points[n],c=points[n+1],r=Math.min(2.5,a.distanceTo(b)/3,b.distanceTo(c)/3),enter=b.clone().addScaledVector(a.clone().sub(b).normalize(),r),leave=b.clone().addScaledVector(c.clone().sub(b).normalize(),r);path.add(new LineCurve3(last,enter));path.add(new QuadraticBezierCurve3(enter,b,leave));last=leave;}path.add(new LineCurve3(last,points[points.length-1]));return path;}),[]);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color,tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 return <group name="soap-servo-lead">
 {tag('soap-servo-plug',<mesh name="soap-servo-plug-housing" position={[20,-10,-40]}><extrudeGeometry args={[profiles,{depth:8,bevelEnabled:false,curveSegments:24}]}/><meshStandardMaterial color={c('soap-servo-plug','#303744')} roughness={.6}/></mesh>)}
 {channels.map((p,n)=>{const wire='soap-servo-lead-'+p.role,contact='soap-servo-contact-'+p.role;return <group key={p.role}>
 {tag(wire,<><mesh name={wire+'-jacket'}><tubeGeometry args={[curves[n],128,.45,12,false]}/><meshStandardMaterial color={c(wire,p.color)} roughness={.5}/></mesh><mesh name={wire+'-crimp-core'} position={[p.socketX,-10,-39.25]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.22,.22,1.5,24]}/><meshStandardMaterial color={c(wire,'#b6a077')} metalness={.8} roughness={.3}/></mesh><mesh name={wire+'-solder-core'} position={[p.x,-4.075,-20.5]} rotation={[-Math.atan2(1,.55),0,0]}><cylinderGeometry args={[.22,.22,Math.hypot(1,.55),24]}/><meshStandardMaterial color={c(wire,'#b8bfc7')} metalness={.8} roughness={.3}/></mesh><mesh name={wire+'-solder'} position={[p.x,-4.35,-20]}><sphereGeometry args={[.32,20,12]}/><meshStandardMaterial color={c(wire,'#b8bfc7')} metalness={.8} roughness={.3}/></mesh></>)}
 {tag(contact,<>{[-1,1].map(side=><mesh key={side} name={contact+'-spring-'+side} position={[p.socketX+side*.38,-10,-35.75]}><boxGeometry args={[.12,.75,5.5]}/><meshStandardMaterial color={c(contact,'#bba87a')} metalness={.8} roughness={.3}/></mesh>)}<mesh name={contact+'-rear-crimp'} position={[p.socketX,-10,-38.55]}><boxGeometry args={[.88,.75,.12]}/><meshStandardMaterial color={c(contact,'#bba87a')} metalness={.8} roughness={.3}/></mesh></>)}
 </group>;})}
 </group>;
}
export default memo(SoapServoLeadParts);
