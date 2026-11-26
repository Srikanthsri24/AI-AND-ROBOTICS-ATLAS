import {Environment,Lightformer} from '@react-three/drei';
/** Local procedural studio reflections; no network HDR asset is required. */
export default function SchoolBellStudioLight(){return <Environment resolution={128} frames={1}>
 <Lightformer form="rect" intensity={1.4} color="#ffffff" position={[0,4,0]} rotation={[Math.PI/2,0,0]} scale={[5,2,1]}/>
 <Lightformer form="rect" intensity={1} color="#f4f1ff" position={[0,-4,0]} rotation={[-Math.PI/2,0,0]} scale={[5,2,1]}/>
 <Lightformer form="rect" intensity={.8} color="#ffffff" position={[4,0,0]} rotation={[0,-Math.PI/2,0]} scale={[5,2,1]}/>
 <Lightformer form="rect" intensity={.8} color="#e7e4f8" position={[-4,0,0]} rotation={[0,Math.PI/2,0]} scale={[5,2,1]}/>
 <Lightformer form="rect" intensity={.7} color="#ffffff" position={[0,0,4]} rotation={[0,Math.PI,0]} scale={[5,2,1]}/>
 <Lightformer form="rect" intensity={.7} color="#ffffff" position={[0,0,-4]} scale={[5,2,1]}/>
 </Environment>;}
