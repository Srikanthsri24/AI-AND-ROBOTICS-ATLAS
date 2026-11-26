import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Board from '../../src/modules/BluetoothMiniBreadboard';
import Keyboard from '../../src/modules/PianoKeyboardParts';
import {pianoLayout} from '../../src/data/piano-layout';
import type {PianoFlags} from '../../src/data/piano-workshop';
export function mount(el:HTMLElement){function Scene(){const [held,setHeld]=useState<PianoFlags>([false,false,false,false,false,false,false,false]),[selected,choose]=useState('');(window as any).__pianoSelected=selected;(window as any).__pianoHeld=held;(window as any).__pianoSetHeld=setHeld;return <><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.2}/><directionalLight position={[-3,7,4]} intensity={2.5}/><group scale={.01} name="piano-keyboard-fixture"><mesh position={[0,4,0]} receiveShadow><boxGeometry args={[...pianoLayout.base]}/><meshStandardMaterial color="#b69b78" roughness={.8}/></mesh>{pianoLayout.boards.map((at,i)=><group key={i} name={'piano-board-'+i} userData={{partId:'piano-board-'+i}} position={at} scale={50}><Board selected={false} supplyLabel="" returnLabel=""/></group>)}<Keyboard {...{selected,choose,held}} press={(index,down)=>setHeld(old=>old.map((v,i)=>i===index?down:v) as unknown as PianoFlags)}/></group><OrbitControls makeDefault enabled={!held.some(Boolean)} target={[0,.18,.35]}/></>;}
createRoot(el).render(<Canvas camera={{position:[.8,1.4,1.8],fov:42,near:.001,far:50}} onCreated={s=>{(window as any).__get=s.get;}}><Scene/></Canvas>);}
