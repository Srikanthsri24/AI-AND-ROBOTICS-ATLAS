import {useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Bench from '../../src/modules/PianoBenchParts';
import Sounder from '../../src/modules/PianoSounderParts';
import Wires from '../../src/modules/PianoWireParts';
import Keyboard from '../../src/modules/PianoKeyboardParts';
import type {PianoFlags} from '../../src/data/piano-workshop';
export function mount(el:HTMLElement){function Scene(){const [held,setHeld]=useState<PianoFlags>([false,false,false,false,false,false,false,false]),[selected,choose]=useState(''),[sounding,setSounding]=useState(false),[withdrawals,setWithdrawals]=useState<number[]>(Array(19).fill(0));const cursor=useRef(19);(window as any).__pianoCursor=cursor;(window as any).__pianoSetWithdrawals=setWithdrawals;(window as any).__pianoSetSounding=setSounding;(window as any).__pianoSelected=selected;(window as any).__pianoHeld=held;(window as any).__pianoSetHeld=setHeld;return <><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.2}/><directionalLight position={[-3,7,4]} intensity={2.5}/><group scale={.01} name="piano-keyboard-fixture"><Bench selected={selected} choose={choose}/><Sounder selected={selected} choose={choose} sounding={sounding}/><Wires {...{selected,choose,cursor,withdrawals}}/><Keyboard {...{selected,choose,held}} press={(index,down)=>setHeld(old=>old.map((v,i)=>i===index?down:v) as unknown as PianoFlags)}/></group><OrbitControls makeDefault enabled={!held.some(Boolean)} target={[0,.18,.35]}/></>;}
createRoot(el).render(<Canvas camera={{position:[.8,1.4,1.8],fov:42,near:.001,far:50}} onCreated={s=>{(window as any).__get=s.get;}}><Scene/></Canvas>);}
