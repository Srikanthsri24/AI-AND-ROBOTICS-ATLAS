import {memo,useMemo,useRef,type RefObject} from 'react';
import {useFrame,type ThreeEvent} from '@react-three/fiber';
import {CatmullRomCurve3,Group,Vector3,type Mesh,type TubeGeometry} from 'three';
import {streetSystemCables as cables} from '../data/street-system-layout';
import {streetJumperRoute,streetJumperSeating} from '../data/street-system-jumpers';
import {streetCableWithdrawal} from '../data/street-system-faults';
import type {StreetSystemSettings} from '../data/street-system-workshop';
import {rewriteCubeSatTube} from './cubesat-tube-motion';
type Props={selected:string;choose:(id:string)=>void;progress?:RefObject<number>;links?:Pick<StreetSystemSettings,'sensorConnected'|'outputs'|'returns'>};
function Jumpers({selected,choose,progress,links}:Props){
 const root=useRef<Group>(null),last=useRef<string[]>([]),curves=useMemo(()=>cables.map((_,n)=>new CatmullRomCurve3(streetJumperRoute(n).map(p=>new Vector3(...p)))),[]);
 useFrame(()=>{if(!root.current)return;for(let n=0;n<cables.length;n++){const w=cables[n],s=streetJumperSeating(n,progress?.current??8),a=s.aWithdrawal,b=Math.max(s.bWithdrawal,links?streetCableWithdrawal(w.id,links):0),key=a+'/'+b;if(last.current[n]===key)continue;const owner=root.current.getObjectByName(w.id)!;owner.getObjectByName(w.id+'-a')!.position.y=a;owner.getObjectByName(w.id+'-b')!.position.y=b;rewriteCubeSatTube((owner.getObjectByName(w.id+'-tube') as Mesh<TubeGeometry>).geometry,new CatmullRomCurve3(streetJumperRoute(n,a,b).map(p=>new Vector3(...p))));last.current[n]=key;}},-2);
 return <group ref={root} name="street-system-jumpers">{cables.map((w,n)=>{const color=selected===w.id?'#b78be8':w.color,metal=selected===w.id?'#b78be8':'#bac3ca',grip=selected===w.id?'#b78be8':'#283745';return <group name={w.id} key={w.id} userData={{partId:w.id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(w.id);}}><mesh name={w.id+'-tube'} castShadow><tubeGeometry args={[curves[n],48,.45,8,false]}/><meshStandardMaterial color={color} roughness={.5}/></mesh>{[w.a,w.b].map((p,index)=><group name={w.id+(index?'-b':'-a')} key={index}><mesh position={[p[0],p[1]-1.75,p[2]]}><boxGeometry args={[.64,6.5,.64]}/><meshStandardMaterial color={metal} metalness={.75} roughness={.35}/></mesh><mesh position={[p[0],p[1]+3.5,p[2]]} castShadow><boxGeometry args={[2.1,6,2.1]}/><meshStandardMaterial color={grip} roughness={.6}/></mesh><mesh position={[p[0],p[1]+7,p[2]]}><boxGeometry args={[1.25,1,1.25]}/><meshStandardMaterial color={color} roughness={.5}/></mesh></group>)}</group>;})}</group>;
}
export default memo(Jumpers);
