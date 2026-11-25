import {memo,type ReactNode} from 'react';
import {Text} from '@react-three/drei';
import {radarTargetPose,type RadarTargetInput} from '../data/radar-target';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function RadarTargetParts({selected,select,input}:{selected:string;select:(id:string)=>void;input:RadarTargetInput}){
 const pose=radarTargetPose(input),tag=(id:string,node:ReactNode)=><group userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const box=(id:string,at:[number,number,number],size:[number,number,number],color:string)=><mesh position={at} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={selected===id?'#b78be8':color} roughness={.8}/></mesh>;
 return <group name="radar-finite-target" position={pose.position} rotation={[0,pose.yaw,0]} visible={input.targetPresent}>
  {tag('radar-target-card',<>
   {box('radar-target-card',[0,84,1],[pose.halfWidth*2,160,2],'#e9e6da')}
   <group rotation={[0,Math.PI,0]}>
    <Text position={[0,143,.05]} font={font} fontSize={5} color="#4c426c">FLAT TEST TARGET</Text>
    <Text position={[0,129,.05]} font={font} fontSize={3.4} color="#6c6380">Face the ultrasonic head</Text>
    <Text position={[0,38,.05]} font={font} fontSize={3.2} color="#6c6380">Move · rotate · observe the echo</Text>
   </group>
  </>)}
  {tag('radar-target-stand',<>
   {box('radar-target-stand',[0,2,10],[140,4,40],'#aa8b63')}
   {[-2,4].map(z=><group key={z}>{box('radar-target-stand',[0,8,z],[60,8,4],'#b79b76')}</group>)}
  </>)}
  {tag('radar-target-mark',<>
   <mesh position={[0,68,-.03]} rotation={[0,Math.PI,0]}><ringGeometry args={[8,8.6,64]}/><meshStandardMaterial color={selected==='radar-target-mark'?'#b78be8':'#598a81'} roughness={.8}/></mesh>
   {box('radar-target-mark',[0,68,-.04],[22,.5,.02],'#598a81')}
   {box('radar-target-mark',[0,68,-.04],[.5,22,.02],'#598a81')}
  </>)}
 </group>;
}
export default memo(RadarTargetParts);
