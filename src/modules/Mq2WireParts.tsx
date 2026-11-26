import {memo,useMemo,useRef,type RefObject} from 'react';
import {CatmullRomCurve3,Vector3,type Group,type Object3D,type Mesh,type TubeGeometry} from 'three';
import {useFrame,type ThreeEvent} from '@react-three/fiber';
import {mq2Wires,mq2WireRoute,mq2WireSeating,type Mq2Mode} from '../data/mq2-wires';
import {rewriteCubeSatTube} from './cubesat-tube-motion';
function Mq2WireParts({selected,choose,mode,cursor}:{selected:string;choose:(id:string)=>void;mode:Mq2Mode;cursor?:RefObject<number>}){
 const root=useRef<Group>(null),last=useRef(''),poses=useRef<string[]>([]);
 const wires=useMemo(()=>mq2Wires(mode),[mode]),curves=useMemo(()=>wires.map((w,n)=>new CatmullRomCurve3(mq2WireRoute(w,n).map(p=>new Vector3(...p)))),[wires]);
 useFrame(()=>{if(!root.current)return;const t=cursor?.current??22,key=mode+':'+t;if(last.current===key)return;
 wires.forEach((w,n)=>{const pose=mq2WireSeating(n,t),owner=root.current!.getObjectByName(w.id)!;owner.visible=pose.visible;const poseKey=mode+':'+pose.a+':'+pose.b;if(poses.current[n]===poseKey)return;poses.current[n]=poseKey;
 const a=root.current!.getObjectByName(w.id+'-from')!,b=root.current!.getObjectByName(w.id+'-to')!;
 const move=(o:Object3D,kind:string,d:number)=>{o.position.set(kind==='female'?d:0,kind==='pin'?d:0,kind==='clamp'?d:0);};
 move(a,w.fromKind,pose.a);move(b,w.toKind??'pin',pose.b);
 rewriteCubeSatTube((root.current!.getObjectByName(w.id+'-jacket') as Mesh<TubeGeometry>).geometry,new CatmullRomCurve3(mq2WireRoute(w,n,pose.a,pose.b).map(p=>new Vector3(...p))));});last.current=key;
 },-.25);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color;
 return <group ref={root} name="mq2-jumpers">{wires.map((w,n)=><group key={w.id} name={w.id} userData={{partId:w.id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(w.id);}}><mesh name={w.id+'-jacket'} castShadow><tubeGeometry args={[curves[n],128,.45,10,false]}/><meshStandardMaterial color={c(w.id,w.color)} roughness={.55}/></mesh>{[w.from,w.to].map((p,end)=>{const female=end===0&&w.fromKind==='female',clamp=end===0?w.fromKind==='clamp':w.toKind==='clamp';return <group key={end} name={w.id+(end?'-to':'-from')}>{female?<group position={[p[0]+2.5,p[1],p[2]]}><mesh position={[0,.85,0]}><boxGeometry args={[9,1.1,2.1]}/><meshStandardMaterial color={c(w.id,'#29323e')}/></mesh>{[-1,1].map(side=><mesh key={side} position={[0,0,side*.8]}><boxGeometry args={[9,.6,.5]}/><meshStandardMaterial color={c(w.id,'#29323e')}/></mesh>)}<mesh position={[0,-.85,0]}><boxGeometry args={[9,1.1,2.1]}/><meshStandardMaterial color={c(w.id,'#29323e')}/></mesh></group>:clamp?<mesh position={[p[0],p[1],p[2]+4.85]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.3,.3,11.7,12]}/><meshStandardMaterial color={c(w.id,'#bda775')} metalness={.8} roughness={.35}/></mesh>:<><mesh position={[p[0],p[1]-1.75,p[2]]}><boxGeometry args={[.64,6.5,.64]}/><meshStandardMaterial color={c(w.id,'#bdc3c7')} metalness={.8} roughness={.35}/></mesh><mesh position={[p[0],p[1]+3.5,p[2]]}><boxGeometry args={[2.1,6,2.1]}/><meshStandardMaterial color={c(w.id,'#29323e')} roughness={.6}/></mesh><mesh position={[p[0],p[1]+7,p[2]]}><boxGeometry args={[1.25,1.1,1.25]}/><meshStandardMaterial color={c(w.id,w.color)} roughness={.55}/></mesh></>}</group>;})}</group>)}</group>;
}
export default memo(Mq2WireParts);
