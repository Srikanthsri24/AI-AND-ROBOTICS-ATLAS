import {memo,type ReactNode,type RefObject} from 'react';
import {Text} from '@react-three/drei';
import type {ThreeEvent} from '@react-three/fiber';
import {CatmullRomCurve3,Vector3} from 'three';
import BluetoothCarUno from './BluetoothCarUno';
import MiniBoard from './BluetoothMiniBreadboard';
import {streetSensorLead} from '../data/street-system-sockets';
import Jumpers from './StreetSystemJumpers';
import type {StreetSystemSettings} from '../data/street-system-workshop';
import unoLayout from '../data/uno-r3-board-layout.json';
import {streetSystemLayout as layout,streetSystemHole,streetSystemBranches as branches,streetSystemDivider as divider,type StreetPoint as P} from '../data/street-system-layout';

const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
type Props={selected:string;choose:(id:string)=>void;stage:number;powered:boolean;progress?:RefObject<number>;links?:Pick<StreetSystemSettings,'sensorConnected'|'outputs'|'returns'>};
function StreetSystemElectricalParts({selected,choose,stage,powered,links,progress}:Props){
 const c=(id:string,color:string)=>selected===id?'#b78be8':color;
 const owner=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} key={id} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 const box=(id:string,p:P,size:P,color:string,metal=0)=><mesh key={id+p.join(",")} position={p} castShadow><boxGeometry args={[...size]}/><meshStandardMaterial color={c(id,color)} metalness={metal} roughness={metal?.35:.6}/></mesh>;
 const tube=(id:string,points:readonly P[],color:string,r=.3)=><mesh key={id+points[0].join(",")} castShadow><tubeGeometry args={[new CatmullRomCurve3(points.map(p=>new Vector3(...p))),48,r,8,false]}/><meshStandardMaterial color={c(id,color)} metalness={color==='#bac3ca'?.75:0} roughness={.5}/></mesh>;
 const resistor=(id:string,a:P,b:P,bands:readonly string[])=>{
  const x=(a[0]+b[0])/2,z=a[2],y=25;
  return owner(id,<><mesh position={[x,y,z]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[1.1,1.1,6,32]}/><meshStandardMaterial color={c(id,'#cdbd95')} roughness={.65}/></mesh>{bands.map((color,n)=><mesh key={n} position={[x+[-2,-1,0,2][n],y,z]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1.115,1.115,.45,32]}/><meshStandardMaterial color={c(id,color)} roughness={.6}/></mesh>)}{[a,b].map((p,n)=><group key={n}>{tube(id,[[x+(n?3:-3),y,z],[p[0],y,z],[p[0],p[1]+3,z],[p[0],p[1]-5,z]],'#bac3ca',.3)}</group>)}</>);
 };
 return <group name="street-system-electronics">
 {stage>=3&&<>
  <group position={layout.uno} scale={50}><BluetoothCarUno selected={selected} select={choose} powered={powered} partPrefix="street-"/></group>
  {owner('street-uno-supports',<>{unoLayout.holes.map((h,n)=><mesh key={n} position={[layout.uno[0]+Number(h.x)-34.29,12.6,layout.uno[2]+26.67-Number(h.y)]} castShadow><cylinderGeometry args={[2.4,2.4,9.2,20]}/><meshStandardMaterial color={c('street-uno-supports','#d4cdb9')} roughness={.7}/></mesh>)}</>)}
  {owner('street-breadboard',<><group position={layout.breadboard} scale={50}><MiniBoard selected={selected==='street-breadboard'} supplyLabel="" returnLabel=""/></group>{Array.from({length:17},(_,n)=>[61.8,94.2].map(z=><Text key={n+','+z} name={'street-board-column-'+(n+1)+'-'+z} font={font} position={[streetSystemHole(n,1,0)[0],18.05,z]} rotation={[-Math.PI/2,0,0]} fontSize={1.2} color="#35435c" anchorX="center">{n+1}</Text>))}</>)}
 </>}
 {stage>=4&&<>
  {owner('street-sensor-mount',box('street-sensor-mount',[-150,11,-90],[16,6,14],'#b6ad91'))}
  {owner('street-ldr',<><mesh position={layout.sensor} castShadow><cylinderGeometry args={[3.2,3.2,1.5,40]}/><meshStandardMaterial color={c('street-ldr','#d4b78c')} roughness={.65}/></mesh>{Array.from({length:6},(_,n)=>tube('street-ldr',[[-152.3+n*.8,25.8,-91.8],[-152.3+n*.8,25.8,-88.2]],'#85573e',.12))}{[true,false].map(positive=><group key={String(positive)}>{tube('street-ldr',streetSensorLead(positive),'#bac3ca',.3)}</group>)}</>)}
  {resistor('street-divider-resistor',divider.junction,divider.ground,['#805537','#282e34','#dc9046','#c5ad65'])}
 </>}
 {stage>=5&&branches.map(b=>resistor(b.id+'-resistor',b.resistorInput,b.resistorOutput,['#ad424b','#ad424b','#805537','#c5ad65']))}
 <Jumpers selected={selected} choose={choose} links={links} progress={progress}/>
 </group>;
}
export default memo(StreetSystemElectricalParts);
