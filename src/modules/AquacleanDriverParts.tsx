import{memo,useMemo,type ReactNode}from'react';
import{Text}from'@react-three/drei';
import{Shape,Path,DoubleSide}from'three';
import cad from'../data/tb6612-board-layout.json';
import FlatCopperTracks from'./FlatCopperTracks';
import{aquaDriverAt as at,aquaDriverPins as pins}from'../data/aquaclean-driver';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
type P=[number,number,number];
function AquacleanDriverParts({selected,select}:{selected:string;select:(id:string)=>void}){
 const shapes=useMemo(()=>{const s=new Shape(),r=2.54,w=19.05,h=26.67;s.moveTo(r,0);s.lineTo(w-r,0);s.absarc(w-r,r,r,-Math.PI/2,0,false);s.lineTo(w,h-r);s.absarc(w-r,h-r,r,0,Math.PI/2,false);s.lineTo(r,h);s.absarc(r,h-r,r,Math.PI/2,Math.PI,false);s.lineTo(0,r);s.absarc(r,r,r,Math.PI,Math.PI*1.5,false);for(const p of pins){const h=new Path();h.absarc(p.x+9.525,13.335-p.z,.5,0,Math.PI*2,true);s.holes.push(h);}const mounts=cad.elements.filter(e=>e.package.startsWith('MOUNTING')).map(e=>({x:+e.x-9.525,z:13.335-+e.y}));for(const p of mounts){const h=new Path();h.absarc(p.x+9.525,13.335-p.z,1.25,0,Math.PI*2,true);s.holes.push(h);}const ring=new Shape();ring.absarc(0,0,2.2,0,Math.PI*2,false);const bore=new Path();bore.absarc(0,0,1,0,Math.PI*2,true);ring.holes.push(bore);return{board:s,mounts,ring};},[]);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color,tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const box=(p:P,size:P,color:string,metal=0)=><mesh position={p} castShadow><boxGeometry args={size}/><meshStandardMaterial color={color} metalness={metal} roughness={metal?.3:.6}/></mesh>;
 return <group position={[...at]}>
 {tag('aqua-driver-pcb',<><mesh position={[-9.525,-.8,13.335]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shapes.board,{depth:1.6,bevelEnabled:false,curveSegments:24}]}/><meshStandardMaterial color={c('aqua-driver-pcb','#215680')} roughness={.65} side={DoubleSide}/></mesh><Text position={[0,.85,8]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={1.5} color="#e8eee8">TB6612</Text></>)}
 {tag('aqua-driver-tracks',<FlatCopperTracks tracks={cad.tracks} scale={1} centreX={9.525} centreY={13.335} height={.83} color={c('aqua-driver-tracks','#347891')}/>)}
 {tag('aqua-driver-chip',<>{box([.381,1.9,-1.651],[5.3,2.2,8.2],c('aqua-driver-chip','#29323c'))}{[-1,1].flatMap(s=>Array.from({length:12},(_,i)=><group key={`${s}/${i}`}>{box([.381+s*3.2,1.1,-1.651+(i-5.5)*.65],[1.2,.5,.4],c('aqua-driver-chip','#b7bfbc'),.7)}</group>))}</>)}
 {tag('aqua-driver-components',<>{cad.elements.filter(e=>['R1','C2','C3','Q1'].includes(e.name)).map(e=><group key={e.name}>{box([+e.x-9.525,1.3,13.335-+e.y],[e.name==='Q1'?3:2,1,e.name==='Q1'?2:1.2],c('aqua-driver-components',e.name.startsWith('C')?'#b1a17f':'#293540'))}</group>)}</>)}
 {pins.map(p=>{const id=`aqua-driver-pin-${p.name}`;return tag(id,<><mesh position={[p.x,.82,p.z]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.5,.96,24]}/><meshStandardMaterial color={c(id,'#c0ae79')} metalness={.7} side={DoubleSide}/></mesh>{box([p.x,2,p.z],[2.17,2.4,2.17],c(id,'#27333f'))}{box([p.x,3,p.z],[.47,6,.47],c(id,'#c2b17e'),.75)}<Text position={[p.x+(p.x<0?2.4:-2.4),.85,p.z]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={.65} color="#ecf0e9">{p.name}</Text></>);})}
 {tag('aqua-driver-feet',<>{shapes.mounts.map((p,i)=><group key={i}><mesh position={[p.x,-12,p.z]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shapes.ring,{depth:11.2,bevelEnabled:false,curveSegments:24}]}/><meshStandardMaterial color={c('aqua-driver-feet','#e1dccb')} roughness={.75}/></mesh><mesh position={[p.x,-5,p.z]}><cylinderGeometry args={[.8,.8,14,16]}/><meshStandardMaterial color={c('aqua-driver-feet','#b6c0c5')} metalness={.7} roughness={.3}/></mesh><mesh position={[p.x,1.5,p.z]}><cylinderGeometry args={[1.8,1.8,1.2,20]}/><meshStandardMaterial color={c('aqua-driver-feet','#b6c0c5')} metalness={.7} roughness={.3}/></mesh></group>)}</>)}
 </group>;
}
export default memo(AquacleanDriverParts);
