import {memo,type ReactNode} from 'react';
import {Text} from '@react-three/drei';
import type {ThreeEvent} from '@react-three/fiber';
import {CatmullRomCurve3,Vector3} from 'three';
import Uno from './BluetoothCarUno';
import Board from './BluetoothMiniBreadboard';
import unoLayout from '../data/uno-r3-board-layout.json';
import {pianoLayout,pianoResistor,type PianoPoint as P} from '../data/piano-layout';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function PianoBenchParts({selected,choose,powered=false}:{selected:string;choose:(id:string)=>void;powered?:boolean}){
 const c=(id:string,color:string)=>id===selected?'#b78be8':color,tag=(id:string,children:ReactNode)=><group key={id} name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{children}</group>,box=(id:string,at:P,size:P,color:string)=><mesh position={at} castShadow receiveShadow><boxGeometry args={[...size]}/><meshStandardMaterial color={c(id,color)} roughness={.7}/></mesh>;
 const a=pianoResistor.a,b=pianoResistor.b,mid=(a[0]+b[0])/2,y=25;
 return <group name="piano-workbench-foundation">
 {tag('piano-base',<>{box('piano-base',[0,4,0],pianoLayout.base,'#b69b78')}{[-65,-20,25,70].map(z=><group key={z}>{box('piano-base',[0,8.02,z],[236,.04,.3],'#9c805e')}</group>)}</>)}
 <group position={pianoLayout.uno} scale={50}><Uno selected={selected} select={choose} powered={powered} partPrefix="piano-"/></group>
 {tag('piano-uno-supports',<>{unoLayout.holes.map((h,n)=><mesh key={n} position={[pianoLayout.uno[0]+Number(h.x)-34.29,12.6,pianoLayout.uno[2]+26.67-Number(h.y)]} castShadow><cylinderGeometry args={[2.4,2.4,9.2,24]}/><meshStandardMaterial color={c('piano-uno-supports','#d7d1c2')} roughness={.7}/></mesh>)}</>)}
 {pianoLayout.boards.map((at,i)=>tag('piano-board-'+i,<group position={at}><group scale={50}><Board selected={selected==='piano-board-'+i} supplyLabel="" returnLabel=""/></group><Text position={[0,10.06,-16]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={1.6} color="#514269">{i===0?'C4 · D4 · E4 · F4':'G4 · A4 · B4 · C5'} · NO RAILS</Text></group>))}
 {tag('piano-series-resistor',<><mesh position={[mid,y,a[2]]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[1.1,1.1,6,32]}/><meshStandardMaterial color={c('piano-series-resistor','#cdbd95')} roughness={.6}/></mesh>{['#ad424b','#ad424b','#805537','#c5ad65'].map((color,n)=><mesh key={n} position={[mid+[-2,-1,0,2][n],y,a[2]]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1.115,1.115,.45,32]}/><meshStandardMaterial color={c('piano-series-resistor',color)} roughness={.6}/></mesh>)}{[a,b].map((p,n)=><mesh key={n}><tubeGeometry args={[new CatmullRomCurve3([[mid+(n?3:-3),y,a[2]],[p[0],y,p[2]],[p[0],p[1]+3,p[2]],[p[0],p[1]-5,p[2]]].map(p=>new Vector3(...p))),48,.3,16,false]}/><meshStandardMaterial color={c('piano-series-resistor','#bac3ca')} metalness={.7} roughness={.4}/></mesh>)}</>)}
 </group>;
}
export default memo(PianoBenchParts);
