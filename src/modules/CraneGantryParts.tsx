import {memo,useMemo,useRef,type ReactNode,type RefObject} from 'react';
import {useFrame,type ThreeEvent} from '@react-three/fiber';
import {Text} from '@react-three/drei';
import {Group,Path,Quaternion,Shape,Vector3} from 'three';
import type {CraneMotion} from '../data/crane-motion';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
type P=[number,number,number];
function Beam({a,b,width=8,color}:{a:P;b:P;width?:number;color:string}){const axis=new Vector3(...b).sub(new Vector3(...a));return <mesh position={new Vector3(...a).add(new Vector3(...b)).multiplyScalar(.5)} quaternion={new Quaternion().setFromUnitVectors(new Vector3(0,1,0),axis.clone().normalize())} castShadow receiveShadow><boxGeometry args={[width,axis.length(),width]}/><meshStandardMaterial color={color} roughness={.78}/></mesh>;}
function Annulus({outer,inner,depth,color}:{outer:number;inner:number;depth:number;color:string}){const shape=useMemo(()=>{const s=new Shape();s.absarc(0,0,outer,0,Math.PI*2,false);const hole=new Path();hole.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(hole);return s;},[outer,inner]);return <mesh rotation={[-Math.PI/2,0,0]} castShadow receiveShadow><extrudeGeometry args={[shape,{depth,bevelEnabled:false,curveSegments:48}]}/><meshStandardMaterial color={color} metalness={.85} roughness={.32}/></mesh>;}
function CraneGantryParts({motion,selected,choose,energized=false}:{motion:RefObject<CraneMotion>;selected:string;choose:(id:string)=>void;energized?:boolean}){
 const saddle=useRef<Group>(null),magnet=useRef<Group>(null),washer=useRef<Group>(null),cord=useRef<Group>(null);
 useFrame(()=>{const s=motion.current;saddle.current?.position.set(s.x,0,0);magnet.current?.position.set(s.x,s.faceY,35);washer.current?.position.set(s.washerX,s.washerY,35);if(cord.current){const bottom=s.faceY+29,length=180-bottom;cord.current.position.set(s.x,bottom+length/2,35);cord.current.scale.set(1,length,1);}});
 const c=(id:string,color:string)=>id===selected?'#b78be8':color;
 const tag=(id:string,children:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{children}</group>;
 const box=(id:string,at:P,size:P,color:string)=><mesh position={at} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={c(id,color)} roughness={.7}/></mesh>;
 const cylinder=(id:string,at:P,r:number,h:number,color:string)=><mesh position={at} castShadow><cylinderGeometry args={[r,r,h,48]}/><meshStandardMaterial color={c(id,color)} metalness={.78} roughness={.35}/></mesh>;
 return <group name="crane-native-gantry">
 {tag('crane-base',<>{box('crane-base',[0,5,0],[300,10,220],'#bca27d')}{[-90,-60,-30,0,30,60,90].map(z=><group key={z}>{box('crane-base',[0,10.01,z],[295,.02,.16],'#967c59')}</group>)}</>)}
 {[-110,110].map((x,n)=><group key={x}>{tag(`crane-upright-${n}`,<>{box(`crane-upright-${n}`,[x,98,35],[12,176,12],'#bf9d70')}{box(`crane-upright-${n}`,[x,14,35],[35,8,78],'#ad8a60')}{[-1,1].map(side=><Beam key={side} a={[x,18,35+side*30]} b={[x,72,35+side*6]} width={6} color={c(`crane-upright-${n}`,'#c9ab81')}/>)}</>)}</group>)}
 {tag('crane-crossbar',<>{box('crane-crossbar',[0,190,35],[240,12,12],'#d1b387')}{[-110,110].map(x=><group key={x}>{cylinder('crane-crossbar',[x,196.5,35],2.4,1,'#a0a6ae')}</group>)}</>)}
 <group ref={saddle}>
 {tag('crane-saddle',<>{box('crane-saddle',[0,199,35],[23,3,23],'#7b6697')}{box('crane-saddle',[0,181,35],[23,3,23],'#7b6697')}{[-10,10].map(x=><group key={x}>{box('crane-saddle',[0,190,35+x],[23,15,3],'#806a9c')}</group>)}{box('crane-saddle',[0,180,35],[10,1,10],'#b9bcc3')}</>)}
 </group>
 <group ref={cord}>{tag('crane-cord',<mesh><cylinderGeometry args={[.55,.55,1,12]}/><meshStandardMaterial color={c('crane-cord','#d8caab')} roughness={1}/></mesh>)}</group>
 <group ref={magnet}>
 {tag('crane-coil-housing',<><group position={[0,.15,0]}><Annulus outer={10} inner={8.7} depth={14.85} color={c('crane-coil-housing','#777f88')}/></group>{cylinder('crane-coil-housing',[0,14.5,0],9.95,1,'#818994')}</>)}
 {tag('crane-pole-face',<>{cylinder('crane-pole-face',[0,7.3,0],6.8,14.6,'#a6afb6')}<group position={[0,.02,0]}><Annulus outer={8.68} inner={6.85} depth={.45} color={c('crane-pole-face','#413c38')}/></group></>)}
 {tag('crane-mount-bracket',<>{box('crane-mount-bracket',[0,17,0],[15,2,12],'#a8aeb5')}{[-6,6].map(x=><group key={x}>{box('crane-mount-bracket',[x,21,0],[2,8,12],'#a8aeb5')}</group>)}{box('crane-mount-bracket',[0,26,0],[14,2,12],'#a8aeb5')}{cylinder('crane-mount-bracket',[0,17,0],2,8,'#9fa6ae')}{cylinder('crane-mount-bracket',[0,18.6,0],3.4,1.2,'#adb4bc')}<mesh position={[0,28.2,0]}><torusGeometry args={[1.6,.55,10,24]}/><meshStandardMaterial color={c('crane-mount-bracket','#aeb4bd')} metalness={.85} roughness={.3}/></mesh></>)}
 {tag('crane-coil-field',<mesh position={[0,-.18,0]} rotation={[-Math.PI/2,0,0]} visible={energized}><ringGeometry args={[7.4,9.6,48]}/><meshStandardMaterial color="#bd9aff" emissive="#8e53e0" emissiveIntensity={.45} transparent opacity={.42} depthWrite={false}/></mesh>)}
 </group>
 <group ref={washer}>{tag('crane-washer',<Annulus outer={9} inner={3} depth={1} color={c('crane-washer','#969fa9')}/>)}</group>
 {tag('crane-pickup-pad',<>{box('crane-pickup-pad',[-65,11,35],[42,2,42],'#797083')}<Text position={[-65,12.05,15]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={2.1} color="#fff">PICKUP</Text></>)}
 {tag('crane-receiver',<>{box('crane-receiver',[65,11,35],[48,2,48],'#d3d6e1')}{[-1,1].map(side=><group key={side}>{box('crane-receiver',[65+side*23,14,35],[2,4,48],'#a5adbf')}{box('crane-receiver',[65,14,35+side*23],[44,4,2],'#a5adbf')}</group>)}<Text position={[65,12.05,15]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={2.1} color="#403758">RECEIVING TRAY</Text></>)}
 </group>;
}
export default memo(CraneGantryParts);
