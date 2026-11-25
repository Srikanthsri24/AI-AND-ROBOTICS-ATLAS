import type {} from '@react-three/fiber';
import {useLayoutEffect,useMemo,useRef,type ReactNode} from 'react';
import {Text} from '@react-three/drei';
import {DoubleSide,InstancedMesh,Object3D,Path,Shape} from 'three';
import {emergencyBoard as d,emergencyBoardHole,emergencyRailHole,emergencyRails,type EmergencyRail} from '../data/emergency-board';
type P=[number,number,number];
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
const local=(p:P):P=>[p[0]-d.at[0],p[1],p[2]-d.at[2]];
function Contacts({rail,active}:{rail?:EmergencyRail;active:boolean}){
 const bars=useRef<InstancedMesh>(null),rings=useRef<InstancedMesh>(null),clips=useRef<InstancedMesh>(null);
 const holes=useMemo(()=>rail?Array.from({length:25},(_,i)=>local(emergencyRailHole(rail,i))):Array.from({length:30},(_,col)=>([-1,1]as const).flatMap(bank=>Array.from({length:5},(_,row)=>local(emergencyBoardHole(col,bank,row))))).flat(),[rail]);
 const representative=useMemo(()=>rail?local(emergencyRailHole(rail,12)):local(emergencyBoardHole(14,1,0)),[rail]);
 const rest=useMemo(()=>holes.filter(p=>p[0]!==representative[0]||p[2]!==representative[2]),[holes,representative]);
 useLayoutEffect(()=>{const object=new Object3D();let count=0;const add=(ref:InstancedMesh,p:P,rotation:P=[0,0,0],i:number)=>{object.position.set(...p);object.rotation.set(...rotation);object.updateMatrix();ref.setMatrixAt(i,object.matrix);};
  if(rail)add(bars.current!,[0,4.1,holes[0][2]],[0,0,0],0);else for(let col=0;col<30;col++)for(const bank of[-1,1])add(bars.current!,[(col-14.5)*2.54,4.1,bank*8.89],[0,0,0],count++);
  rest.forEach((p,i)=>add(rings.current!,[p[0],8.5,p[2]],[-Math.PI/2,0,0],i));
  holes.forEach((p,i)=>{for(const side of[-1,1])add(clips.current!,[p[0]+side*.55,6.5,p[2]],[0,0,0],i*2+(side===1?1:0));});
  for(const ref of[bars,rings,clips]){ref.current!.instanceMatrix.needsUpdate=true;ref.current!.computeBoundingBox();ref.current!.computeBoundingSphere();}
 },[rail,holes,rest]);
 const color=active?'#b48bec':'#b4a77f';
 return <><instancedMesh ref={bars} args={[undefined,undefined,rail?1:60]}><boxGeometry args={rail?[72.52,.8,1]:[1,.8,11.56]}/><meshStandardMaterial color={color} metalness={.7} roughness={.4}/></instancedMesh><instancedMesh ref={rings} args={[undefined,undefined,rest.length]}><ringGeometry args={[.5,.65,16]}/><meshStandardMaterial color={color} metalness={.7} roughness={.35} side={DoubleSide}/></instancedMesh><instancedMesh ref={clips} args={[undefined,undefined,holes.length*2]}><boxGeometry args={[.15,4,.32]}/><meshStandardMaterial color={color} metalness={.7} roughness={.35}/></instancedMesh><mesh name={rail?'emergency-'+rail+'-visible-mouth':'emergency-main-visible-mouth'} position={[representative[0],8.5,representative[2]]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.5,.65,16]}/><meshStandardMaterial color={color} metalness={.7} roughness={.35} side={DoubleSide}/></mesh></>;
}
export default function EmergencyBreadboard({selected='',select=()=>{}}:{selected?:string;select?:(id:string)=>void}){
 const shapes=useMemo(()=>{const rectangle=(w:number,h:number)=>{const s=new Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2);s.closePath();return s;},slot=(s:Shape,x:number,z:number,w:number,h:number)=>{const p=new Path();p.moveTo(x-w/2,-z-h/2);p.lineTo(x-w/2,-z+h/2);p.lineTo(x+w/2,-z+h/2);p.lineTo(x+w/2,-z-h/2);p.closePath();s.holes.push(p);},top=rectangle(83,55),lower=rectangle(83,55);
  const holes=[...Array.from({length:30},(_,c)=>([-1,1]as const).flatMap(b=>Array.from({length:5},(_,r)=>local(emergencyBoardHole(c,b,r))))).flat(),...emergencyRails.flatMap(r=>Array.from({length:25},(_,i)=>local(emergencyRailHole(r.key,i))))];
  for(const [x,,z]of holes){const p=new Path();p.absarc(x,-z,.7,0,Math.PI*2,true);top.holes.push(p);}slot(top,0,0,77,2.4);slot(lower,0,0,77,2.4);
  for(let c=0;c<30;c++)for(const bank of[-1,1])slot(lower,(c-14.5)*2.54,bank*8.89,1.6,11.8);
  for(const rail of emergencyRails)slot(lower,0,rail.z,73,1.6);
  return{top,lower,topSettings:{depth:3,bevelEnabled:false,curveSegments:12},lowerSettings:{depth:3.3,bevelEnabled:false,curveSegments:12}};
 },[]);
 const color=(id:string,c:string)=>id===selected?'#b48bec':c,owner=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const box=(p:P,size:P,c:string)=><mesh position={p} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={c} roughness={.7}/></mesh>;
 return <group name="emergency-breadboard-mm" position={d.at}>
 {owner('emergency-board-shell',<>{box([0,1.85,0],[83,3.7,55],color('emergency-board-shell','#dedfd8'))}<mesh name="emergency-board-lower-cavities" position={[0,3.7,0]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[shapes.lower,shapes.lowerSettings]}/><meshStandardMaterial color={color('emergency-board-shell','#e8e7dd')} roughness={.7}/></mesh><mesh name="emergency-board-400-openings" position={[0,7,0]} rotation={[-Math.PI/2,0,0]} castShadow receiveShadow><extrudeGeometry args={[shapes.top,shapes.topSettings]}/><meshStandardMaterial color={color('emergency-board-shell','#eae9e0')} roughness={.65}/></mesh>{box([0,7.45,0],[77,.5,2.4],color('emergency-board-shell','#dadbd4'))}
 {Array.from({length:30},(_,c)=>[-16.6,16.6].map(z=><Text key={c+'/'+z} position={[(c-14.5)*2.54,10.025,z]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={1.2} color="#6b6c76" raycast={()=>null}>{c+1}</Text>))}
 {([-1,1]as const).flatMap(bank=>Array.from({length:5},(_,r)=>{const p=local(emergencyBoardHole(0,bank,r));return <Text key={bank+'/'+r} position={[-39.5,10.025,p[2]]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={1.4} color="#6b6c76" raycast={()=>null}>{(bank<0?'ABCDE':'FGHIJ')[r]}</Text>}))}
 {emergencyRails.map(r=><group key={r.key}>{box([0,10.025,r.z+(r.z>0?1.25:-1.25)],[73,.05,.3],r.color)}<Text position={[-39.5,10.05,r.z]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={2} color={r.color} raycast={()=>null}>{r.key.includes('positive')?'+':'−'}</Text><Text position={[38.9,10.05,r.z]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={r.used?1.5:2} color={r.color} raycast={()=>null}>{r.used?r.label:'—'}</Text></group>)}
 </>)}
 {owner('emergency-board-ties',<Contacts active={selected==='emergency-board-ties'}/>)}
 {emergencyRails.map(r=>owner('emergency-rail-'+r.key,<Contacts rail={r.key} active={selected==='emergency-rail-'+r.key}/>))}
 </group>;
}
