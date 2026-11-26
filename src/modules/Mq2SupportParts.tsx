import {memo,type ReactNode} from 'react';
import type {ThreeEvent} from '@react-three/fiber';
import uno from '../data/uno-r3-board-layout.json';
import {mq2WorkbenchLayout as layout} from '../data/mq2-workbench-layout';
import {mq2ModuleLayout} from '../data/mq2-module-layout';
function Mq2SupportParts({selected,choose}:{selected:string;choose:(id:string)=>void}){
 const c=(id:string,color:string)=>selected===id?'#b78be8':color;
 const tag=(id:string,children:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{children}</group>;
 return <group name="mq2-supports">
 {tag('mq2-work-mat',<mesh position={[20,-1,-33]} receiveShadow><boxGeometry args={[300,2,152]}/><meshStandardMaterial color={c('mq2-work-mat','#44405f')} roughness={.9}/></mesh>)}
 {tag('mq2-uno-supports',<>{uno.holes.map((h,n)=><mesh key={n} position={[layout.uno[0]+Number(h.x)-34.29,8.6,layout.uno[2]+26.67-Number(h.y)]} castShadow><cylinderGeometry args={[2.4,2.4,17.2,24]}/><meshStandardMaterial color={c('mq2-uno-supports','#ddd8ca')} roughness={.7}/></mesh>)}</>)}
 {tag('mq2-breadboard-support',<mesh position={[layout.breadboard[0],4,layout.breadboard[2]]} castShadow><boxGeometry args={[45,8,33]}/><meshStandardMaterial color={c('mq2-breadboard-support','#d9d6d0')} roughness={.8}/></mesh>)}
 {tag('mq2-ceramic-stand',<><mesh position={[layout.module[0]+20,1,layout.module[2]-10.5]} receiveShadow><boxGeometry args={[46,2,27]}/><meshStandardMaterial color={c('mq2-ceramic-stand','#d7d9df')} roughness={.5}/></mesh>{mq2ModuleLayout.holes.map(([x,z],n)=><mesh key={n} position={[layout.module[0]+x,7,layout.module[2]-z]} castShadow><cylinderGeometry args={[1.8,1.8,10,24]}/><meshStandardMaterial color={c('mq2-ceramic-stand','#d7d9df')} roughness={.5}/></mesh>)}</>)}
 </group>;
}
export default memo(Mq2SupportParts);
