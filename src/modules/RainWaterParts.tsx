import {memo,type ReactNode} from 'react';
import {Vector2} from 'three';
import type {ThreeEvent} from '@react-three/fiber';
import Sensor from './RainWaterSensorParts';
import type {RainWaterDrop} from '../data/rain-water-sensor';
/** Separate shallow tray, kept clear of the carriage and the future electronics area. */
function RainWaterParts({drops,selected,choose}:{drops:readonly RainWaterDrop[];selected:string;choose:(id:string)=>void}){
 const tag=(id:string,children:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{children}</group>,c=(id:string,color:string)=>selected===id?'#b78be8':color;
 const box=(id:string,p:[number,number,number],size:[number,number,number])=><mesh position={p} receiveShadow castShadow><boxGeometry args={size}/><meshStandardMaterial color={c(id,'#cbd3dc')} roughness={.5}/></mesh>;
 return <group name="rain-wet-area">
 {tag('rain-water-tray',<>{box('rain-water-tray',[20,3,85],[58,6,38])}{[-9,49].map(x=><group key={x}>{box('rain-water-tray',[x,11,85],[2,10,38])}</group>)}{[66,104].map(z=><group key={z}>{box('rain-water-tray',[20,11,z],[58,10,2])}</group>)}</>)}
 {tag('rain-water-stands',<>{[[10,95],[10,75],[40,85]].map(([x,z],n)=><mesh key={n} position={[x,8,z]}><cylinderGeometry args={[1.7,1.7,4,20]}/><meshStandardMaterial color={c('rain-water-stands','#d9d7ce')} roughness={.7}/></mesh>)}</>)}
 <group position={[0,10,95]}><Sensor selected={selected} choose={choose}/>{drops.map((drop,n)=>{const id='rain-water-drop-'+n,r=drop.radius,h=r*.55,R=(r*r+h*h)/(2*h),cy=h-R,profile=[new Vector2(0,0),new Vector2(r,0),...Array.from({length:16},(_,i)=>{const y=h*(i+1)/16;return new Vector2(Math.sqrt(Math.max(0,R*R-(y-cy)**2)),y);})];return <group key={n}>{tag(id,<group position={[drop.x,1.7,-drop.z]}><mesh name={id+'-cap'}><latheGeometry args={[profile,40]}/><meshPhysicalMaterial color={c(id,'#8bc7db')} transmission={selected===id ? .25 : .8} roughness={.08} thickness={.8} ior={1.333} clearcoat={1}/></mesh><mesh position={[0,-.05,0]}><cylinderGeometry args={[r,r,.1,40]}/><meshPhysicalMaterial color={c(id,'#8bc7db')} transmission={.8} roughness={.08} thickness={.1} ior={1.333}/></mesh></group>)}</group>;})}</group>
 </group>;
}
export default memo(RainWaterParts);
