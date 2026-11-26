import {memo,useMemo,type ReactNode} from 'react';
import {Path,Shape} from 'three';
import {Text} from '@react-three/drei';
import type {ThreeEvent} from '@react-three/fiber';
import {schoolBellRtcPins as pins,schoolBellRtcHeader as d} from '../data/school-bell-rtc-pins';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function SchoolBellRtcHeaderParts({selected,choose}:{selected:string;choose:(id:string)=>void}){
 const housing=useMemo(()=>{const s=new Shape();s.moveTo(1.27,1.27);s.lineTo(21.59,1.27);s.lineTo(21.59,3.81);s.lineTo(1.27,3.81);s.closePath();for(const pin of pins){const h=new Path();h.moveTo(pin.x-.35,pin.y-.35);h.lineTo(pin.x-.35,pin.y+.35);h.lineTo(pin.x+.35,pin.y+.35);h.lineTo(pin.x+.35,pin.y-.35);h.closePath();s.holes.push(h);}return s;},[]),solder=useMemo(()=>{const s=new Shape();s.absarc(0,0,.8,0,Math.PI*2,false);const h=new Path();h.absarc(0,0,.3,0,Math.PI*2,true);s.holes.push(h);return s;},[]);
 const c=(id:string,color:string)=>id===selected?'#b78be8':color,tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 return <group name="school-rtc-header">{tag('school-rtc-header-body',<mesh name="school-rtc-header-housing" position={[0,d.housingBottom,0]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[housing,{depth:2.54,bevelEnabled:false}]}/><meshStandardMaterial color={c('school-rtc-header-body','#29333f')} roughness={.6}/></mesh>)}
 {pins.map(pin=><group key={pin.id}>{tag(pin.id,<><mesh name={pin.id+'-shaft'} position={[pin.x,(d.pinBottom+d.pinTop)/2,-pin.y]}><boxGeometry args={[.64,d.pinTop-d.pinBottom,.64]}/><meshStandardMaterial color={c(pin.id,'#bca879')} metalness={.8} roughness={.3}/></mesh><mesh position={[pin.x,1.6,-pin.y]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[solder,{depth:.3,bevelEnabled:false,curveSegments:24}]}/><meshStandardMaterial color={c(pin.id,'#bdc6cd')} metalness={.8} roughness={.3}/></mesh></>)}<Text name={pin.id+'-print'} position={[pin.x,1.66,-4.3]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={.7} color="#dfe9ed" raycast={()=>null}>{pin.label}</Text></group>)}
 <Text position={[11.43,1.66,-16.6]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={.8} color="#dfe9ed" raycast={()=>null}>RTC · 0x68</Text></group>;
}
export default memo(SchoolBellRtcHeaderParts);
