import {useEffect,useMemo} from 'react';
import type {ThreeEvent} from '@react-three/fiber';
import {CurvePath,LineCurve3,QuadraticBezierCurve3,Vector3,Shape,Path,ExtrudeGeometry} from 'three';
import {tapIntakePath,tapOutletPath,tapSpoutSleeve,tapReturnPath,tapWaterHeight,type TapPoint} from '../data/tap-plumbing';
type Props={selected:string;choose:(id:string)=>void;volumeMl?:number};
function roundedPath(points:readonly TapPoint[],radius=8){const path=new CurvePath<Vector3>(),p=points.map(v=>new Vector3(...v));let last=p[0];for(let i=1;i<p.length-1;i++){const before=p[i-1],corner=p[i],after=p[i+1],r=Math.min(radius,corner.distanceTo(before)/3,corner.distanceTo(after)/3),a=corner.clone().add(before.clone().sub(corner).normalize().multiplyScalar(r)),b=corner.clone().add(after.clone().sub(corner).normalize().multiplyScalar(r));path.add(new LineCurve3(last,a));path.add(new QuadraticBezierCurve3(a,corner,b));last=b;}path.add(new LineCurve3(last,p[p.length-1]));return path;}
function Tube({points,outer,inner,color,selected,id,choose,metalness=0}:{points:readonly TapPoint[];outer:number;inner:number;color:string;selected:string;id:string;choose:(id:string)=>void;metalness?:number}){const geometry=useMemo(()=>{const shape=new Shape();shape.absarc(0,0,outer,0,Math.PI*2,false);const hole=new Path();hole.absarc(0,0,inner,0,Math.PI*2,true);shape.holes.push(hole);return new ExtrudeGeometry(shape,{steps:160,curveSegments:12,bevelEnabled:false,extrudePath:roundedPath(points)});},[points,outer,inner]);useEffect(()=>()=>geometry.dispose(),[geometry]);return <mesh name={id} userData={{partId:id}} geometry={geometry} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}><meshStandardMaterial color={selected===id?'#c4a2ff':color} roughness={metalness?.25:.38} metalness={metalness} emissive={selected===id?'#6e3ab5':'#000000'} emissiveIntensity={.25}/></mesh>;}
function drainFloor(){const s=new Shape();s.moveTo(-145,-105);s.lineTo(145,-105);s.lineTo(145,105);s.lineTo(-145,105);s.closePath();const h=new Path();h.absarc(tapReturnPath[0][0],-tapReturnPath[0][2],8,0,2*Math.PI,true);s.holes.push(h);return s;}
export default function TapPlumbingParts({selected,choose,volumeMl=2600}:Props){
 const floor=useMemo(drainFloor,[]),height=tapWaterHeight(volumeMl)-18;
 const event=(id:string)=>(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);};
 const material=(id:string,color:string,metalness=0)=>({color:selected===id?'#c4a2ff':color,emissive:selected===id?'#6e3ab5':'#000000',emissiveIntensity:.25,roughness:.38,metalness});
 const box=(id:string,key:string,position:[number,number,number],size:[number,number,number],color:string,metalness=0)=><mesh key={key} position={position} onClick={event(id)}><boxGeometry args={size}/><meshStandardMaterial {...material(id,color,metalness)}/></mesh>;
 return <group name="tap-plumbing">
  <group name="tap-base" userData={{partId:'tap-base'}}>{box('tap-base','deck',[0,6,0],[620,12,440],'#252c48')}{[-1,1].flatMap(x=>[-1,1].map(z=>box('tap-base',`${x}${z}`,[x*280,-3,z*190],[24,6,24],'#151b28')))}</group>
  <group name="tap-frame" userData={{partId:'tap-frame'}}>{[-270,270].map(x=>box('tap-frame',String(x),[x,230,-145],[16,436,16],'#929ba8',.8))}{box('tap-frame','top',[0,440,-145],[556,16,16],'#929ba8',.8)}{box('tap-frame','pump-rail',[0,260,-145],[540,12,12],'#929ba8',.8)}{box('tap-frame','spout-post',[0,350,-145],[16,180,16],'#929ba8',.8)}{box('tap-frame','shelf',[205,220,-95],[110,6,110],'#303953')}</group>
  <group name="tap-pump-bracket" userData={{partId:'tap-pump-bracket'}}>{box('tap-pump-bracket','support',[-205,243.5,-110],[70,4,70],'#838d9c',.8)}{box('tap-pump-bracket','rear-attachment',[-205,252,-137.5],[70,21,3],'#838d9c',.8)}{box('tap-pump-bracket','back',[-205,260,-83.5],[70,34,3],'#838d9c',.8)}</group>
  <group name="tap-tank" userData={{partId:'tap-tank'}} onClick={event('tap-tank')}>
   {[[[0,16.5,0],[250,3,170]], [[-123.5,66.5,0],[3,97,170]],[[123.5,66.5,0],[3,97,170]],[[0,66.5,-83.5],[244,97,3]],[[0,66.5,83.5],[244,97,3]]].map(([position,size],i)=><mesh key={i} position={position as [number,number,number]}><boxGeometry args={size as [number,number,number]}/><meshPhysicalMaterial {...material('tap-tank','#cddfe7')} transparent opacity={selected==='tap-tank'?.7:.23} depthWrite={false} roughness={.12}/></mesh>)}
  </group>
  {height>0&&<mesh name="tap-water" userData={{partId:'tap-water'}} position={[0,18+height/2,0]} onClick={event('tap-water')}><boxGeometry args={[243.6,height,163.6]}/><meshPhysicalMaterial {...material('tap-water','#47b9e2')} transparent opacity={.52} roughness={.15}/></mesh>}
  <group name="tap-basin" userData={{partId:'tap-basin'}} onClick={event('tap-basin')}>
   <mesh position={[0,135,0]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[floor,{depth:3,bevelEnabled:false}]}/><meshStandardMaterial {...material('tap-basin','#e9ecf2')}/></mesh>
   {box('tap-basin','left',[-143.5,150,0],[3,24,210],'#e9ecf2')}{box('tap-basin','right',[143.5,150,0],[3,24,210],'#e9ecf2')}{box('tap-basin','back',[0,150,-103.5],[284,24,3],'#e9ecf2')}{box('tap-basin','front',[0,150,103.5],[284,24,3],'#e9ecf2')}
  </group>
  <group name="tap-basin-legs" userData={{partId:'tap-basin-legs'}}>{[-1,1].flatMap(x=>[-1,1].map(z=>box('tap-basin-legs',`${x}${z}`,[x*138,73.5,z*98],[10,123,10],'#979fae',.7)))}</group>
  <Tube points={tapReturnPath} outer={10} inner={8} color="#d8e8ec" id="tap-return" {...{selected,choose}}/>
  <Tube points={tapIntakePath} outer={2.5} inner={1.75} color="#e2eceb" id="tap-intake" {...{selected,choose}}/>
  <Tube points={tapOutletPath} outer={2.5} inner={1.75} color="#e2eceb" id="tap-outlet" {...{selected,choose}}/>
  <Tube points={tapSpoutSleeve} outer={5} inner={3} color="#aeb9c4" metalness={.8} id="tap-spout" {...{selected,choose}}/>
  <group name="tap-spout-clamps" userData={{partId:'tap-spout-clamps'}}>{[370,405].map(y=><group key={y}>{box('tap-spout-clamps',`arm${y}`,[0,y,-108],[16,8,74],'#939dac',.8)}<mesh position={[0,y,-70]} rotation={[Math.PI/2,0,0]} onClick={event('tap-spout-clamps')}><torusGeometry args={[6,1.5,10,32]}/><meshStandardMaterial {...material('tap-spout-clamps','#939dac',.8)}/></mesh></group>)}</group>
  <group name="tap-echo-target" userData={{partId:'tap-echo-target'}}>{box('tap-echo-target','plate',[45,139,40],[48,2,45],'#c9b9e9')}{box('tap-echo-target','foot',[45,138,40],[12,2,12],'#bbc1ce')}</group>
 </group>;
}
