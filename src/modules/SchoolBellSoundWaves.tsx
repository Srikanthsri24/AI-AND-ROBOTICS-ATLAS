import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Group,Mesh,MeshBasicMaterial} from 'three';
/** Teaching overlay in local sounder mm coordinates. Expanding rings indicate
 * sound, not a glowing sounder or a wavelength-to-scale measurement. */
export default function SchoolBellSoundWaves({pitch}:{pitch:number}){const root=useRef<Group>(null);useFrame(({clock})=>{if(!root.current)return;root.current.visible=pitch>0;root.current.children.forEach((o,n)=>{const t=(clock.elapsedTime*1.6+n/3)%1,m=o as Mesh;m.position.y=30+t*14;m.scale.setScalar(1+t*1.6);(m.material as MeshBasicMaterial).opacity=(1-t)*.5;});});return <group ref={root} name="school-sound-illustration" visible={pitch>0}>{[0,1,2].map(n=><mesh key={n} rotation={[-Math.PI/2,0,0]} raycast={()=>null}><ringGeometry args={[5,5.25,64]}/><meshBasicMaterial color={pitch===880?'#8154c3':'#4f70ae'} transparent opacity={.3} depthWrite={false}/></mesh>)}</group>;}
