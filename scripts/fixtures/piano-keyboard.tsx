import {useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Bench from '../../src/modules/PianoBenchParts';
import Sounder from '../../src/modules/PianoSounderParts';
import Usb from '../../src/modules/PianoUsbParts';
import {pianoUsbAdvance,pianoUsbMated} from '../../src/data/piano-usb';
import Wires from '../../src/modules/PianoWireParts';
import Keyboard from '../../src/modules/PianoKeyboardParts';
import type {PianoFlags} from '../../src/data/piano-workshop';
export function mount(el:HTMLElement){function Scene(){const [held,setHeld]=useState<PianoFlags>([false,false,false,false,false,false,false,false]),[selected,choose]=useState(''),[sounding,setSounding]=useState(false),[withdrawals,setWithdrawals]=useState<number[]>(Array(19).fill(0));const cursor=useRef(19),usb=useRef({unoWithdrawal:12,hostWithdrawal:12}),power=useRef(false);const [target,setTarget]=useState({uno:12,host:12}),[powered,setPowered]=useState(false);(window as any).__pianoUsbTarget=setTarget;(window as any).__pianoUsbMotion=usb;(window as any).__pianoUsbPowered=powered;useFrame((_,dt)=>{usb.current=pianoUsbAdvance(usb.current,Math.min(100,dt*1000),target.uno,target.host);const next=pianoUsbMated(target.uno===0&&target.host===0,usb.current);if(next!==power.current){power.current=next;setPowered(next);}},-3);(window as any).__pianoCursor=cursor;(window as any).__pianoSetWithdrawals=setWithdrawals;(window as any).__pianoSetSounding=setSounding;(window as any).__pianoSelected=selected;(window as any).__pianoHeld=held;(window as any).__pianoSetHeld=setHeld;return <><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.2}/><directionalLight position={[-3,7,4]} intensity={2.5}/><group scale={.01} name="piano-keyboard-fixture"><Bench selected={selected} choose={choose} powered={powered}/><Usb selected={selected} choose={choose} powered={powered} rows={['Hz: 262','Released']} motion={usb}/><Sounder selected={selected} choose={choose} sounding={sounding}/><Wires {...{selected,choose,cursor,withdrawals}}/><Keyboard {...{selected,choose,held}} press={(index,down)=>setHeld(old=>old.map((v,i)=>i===index?down:v) as unknown as PianoFlags)}/></group><OrbitControls makeDefault enabled={!held.some(Boolean)} target={[0,.18,.35]}/></>;}
createRoot(el).render(<Canvas camera={{position:[.8,1.4,1.8],fov:42,near:.001,far:50}} onCreated={s=>{(window as any).__get=s.get;}}><Scene/></Canvas>);}
