import {memo,useMemo,type ReactNode} from 'react';
import type {ThreeEvent} from '@react-three/fiber';
import {CatmullRomCurve3,Vector3} from 'three';
import BluetoothCarUno from './BluetoothCarUno';
import MiniBoard from './BluetoothMiniBreadboard';
import unoLayout from '../data/uno-r3-board-layout.json';
import {streetSystemLayout as layout,streetSystemBranches as branches,streetSystemDivider as divider,streetSystemCables as cables,type StreetPoint as P} from '../data/street-system-layout';

type Props={selected:string;choose:(id:string)=>void;stage:number;powered:boolean};
function StreetSystemElectricalParts({selected,choose,stage,powered}:Props){
 const c=(id:string,color:string)=>selected===id?'#b78be8':color;
 const owner=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} key={id} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 const box=(id:string,p:P,size:P,color:string,metal=0)=><mesh key={id+p.join(",")} position={p} castShadow><boxGeometry args={[...size]}/><meshStandardMaterial color={c(id,color)} metalness={metal} roughness={metal?.35:.6}/></mesh>;
 const tube=(id:string,points:readonly P[],color:string,r=.3)=><mesh key={id+points[0].join(",")} castShadow><tubeGeometry args={[new CatmullRomCurve3(points.map(p=>new Vector3(...p))),48,r,8,false]}/><meshStandardMaterial color={c(id,color)} metalness={color==='#bac3ca'?.75:0} roughness={.5}/></mesh>;
 const resistor=(id:string,a:P,b:P,bands:readonly string[])=>{
  const x=(a[0]+b[0])/2,z=a[2],y=25;
  return owner(id,<><mesh position={[x,y,z]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[1.1,1.1,6,32]}/><meshStandardMaterial color={c(id,'#cdbd95')} roughness={.65}/></mesh>{bands.map((color,n)=><mesh key={n} position={[x+[-2,-1,0,2][n],y,z]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1.115,1.115,.45,32]}/><meshStandardMaterial color={c(id,color)} roughness={.6}/></mesh>)}{[a,b].map((p,n)=><group key={n}>{tube(id,[[x+(n?3:-3),y,z],[p[0],y,z],[p[0],p[1]+3,z],p],'#bac3ca',.25)}</group>)}</>);
 };
 const curves=useMemo(()=>cables.map((w,index)=>{
  const a:P=[w.a[0],w.a[1]+8,w.a[2]],b:P=[w.b[0],w.b[1]+8,w.b[2]];
  return [a,[a[0],Math.max(a[1],35+index*.5),a[2]],...(w.route.length?w.route:[[a[0]+(b[0]-a[0])*.5,40+index*.6,(a[2]+b[2])*.5] as P]),[b[0],Math.max(b[1],35+index*.5),b[2]],b] as P[];
 }),[]);
 return <group name="street-system-electronics">
 {stage>=3&&<>
  <group position={layout.uno} scale={50}><BluetoothCarUno selected={selected} select={choose} powered={powered} partPrefix="street-"/></group>
  {owner('street-uno-supports',<>{unoLayout.holes.map((h,n)=><mesh key={n} position={[layout.uno[0]+Number(h.x)-34.29,12.6,layout.uno[2]+26.67-Number(h.y)]} castShadow><cylinderGeometry args={[2.4,2.4,9.2,20]}/><meshStandardMaterial color={c('street-uno-supports','#d4cdb9')} roughness={.7}/></mesh>)}</>)}
  {owner('street-breadboard',<group position={layout.breadboard} scale={50}><MiniBoard selected={selected==='street-breadboard'} supplyLabel="5-HOLE" returnLabel="NO RAIL"/></group>)}
 </>}
 {stage>=4&&<>
  {owner('street-sensor-mount',<>{box('street-sensor-mount',[-150,11,-90],[16,6,14],'#b6ad91')}{[-1.27,1.27].map(dx=>box('street-sensor-mount',[-150+dx,17,-90],[1.3,6,1.3],'#263847'))}</>)}
  {owner('street-ldr',<><mesh position={layout.sensor} castShadow><cylinderGeometry args={[3.2,3.2,1.5,40]}/><meshStandardMaterial color={c('street-ldr','#d4b78c')} roughness={.65}/></mesh>{Array.from({length:6},(_,n)=>tube('street-ldr',[[-152.3+n*.8,25.8,-91.8],[-152.3+n*.8,25.8,-88.2]],'#85573e',.12))}{[-1.27,1.27].map(dx=>box('street-ldr',[-150+dx,21,-90],[.4,7,.4],'#bac3ca',.8))}</>)}
  {resistor('street-divider-resistor',divider.junction,divider.ground,['#805537','#282e34','#dc9046','#c5ad65'])}
 </>}
 {stage>=5&&branches.map(b=>resistor(b.id+'-resistor',b.resistorInput,b.resistorOutput,['#ad424b','#ad424b','#805537','#c5ad65']))}
 {cables.map((w,index)=>stage>=(index<5?6:7)&&owner(w.id,<>
  {tube(w.id,curves[index],w.color,.45)}
  {[w.a,w.b].map((p,n)=><group key={n}>{box(w.id,[p[0],p[1]+2,p[2]],[.55,5,.55],'#bac3ca',.8)}{box(w.id,[p[0],p[1]+5.9,p[2]],[2.1,5,2.1],'#283745')}{box(w.id,[p[0],p[1]+8.8,p[2]],[1.25,1,1.25],w.color)}</group>)}
 </>))}
 </group>;
}
export default memo(StreetSystemElectricalParts);
