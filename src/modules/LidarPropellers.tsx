import {useEffect,useMemo} from 'react';
import {DoubleSide,Path,Shape} from 'three';
import {lidarPropellerBlade,lidarPropellerSpec as spec} from '../data/lidar-propeller-geometry';
import {lidarMotorStations} from './LidarAirframe';
export const lidarPropellerParts=lidarMotorStations.map(m=>[`cf-propeller-${m.n}`,`M${m.n} ${m.cw?'CW':'CCW'} propeller`,`${m.cw?'47-17R clockwise':'47-17 counterclockwise'} two-blade propeller on a 0.8 mm shaft. These appear only in the separate virtual approach scene; remove all four for the real Python bench experiment.`] as const);
export default function LidarPropellers({selected,select,angle=0}:{selected:string;select:(id:string)=>void;angle?:number}){
 const blades=useMemo(()=>[lidarPropellerBlade(false),lidarPropellerBlade(true)],[]),hub=useMemo(()=>{const s=new Shape();s.absarc(0,0,spec.hubRadius,0,Math.PI*2,false);const p=new Path();p.absarc(0,0,spec.shaftDiameter/2,0,Math.PI*2,true);s.holes.push(p);return s;},[]);useEffect(()=>()=>blades.forEach(g=>g.dispose()),[blades]);
 return <>{lidarMotorStations.map(m=>{const id='cf-propeller-'+m.n,color=selected===id?'#b78be8':m.z<0?'#53635a':'#313c3a';return <group key={id} name={`lidar-propeller-${m.n}`} userData={{partId:id}} position={[m.x,8,m.z]} rotation={[0,(m.cw?1:-1)*angle,0]} onClick={e=>{e.stopPropagation();select(id);}}><mesh position={[0,-.75,0]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[hub,{depth:spec.hubHeight,bevelEnabled:false,curveSegments:40}]}/><meshStandardMaterial color={color} roughness={.42} side={DoubleSide}/></mesh>{[0,Math.PI].map(a=><mesh key={a} geometry={blades[m.cw?1:0]} rotation={[0,a,0]} castShadow><meshPhysicalMaterial color={color} roughness={.4} clearcoat={.3} side={DoubleSide}/></mesh>)}</group>;})}</>;
}
