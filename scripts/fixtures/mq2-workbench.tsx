import {useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Module from '../../src/modules/Mq2WorkbenchParts';
import SurfaceLabel from '../../src/modules/CraneSurfaceLabel';
import {floodSurfaceAnchor,type FloodAnchor} from '../../src/data/flood-surface';
import {mq2ModuleParts} from '../../src/data/mq2-module-parts';
function Scene(){const [led,setLed]=useState(false),[dial,setDial]=useState(.2);Object.assign(window,{__mq2SetLed:setLed,__mq2SetDial:setDial});const anchor=useRef<FloodAnchor|null>(null);const state=useThree(),[selected,choose]=useState('');useFrame(()=>{Object.assign(window,{__mq2State:state,__mq2Selected:selected,__mq2Parts:mq2ModuleParts,__mq2Anchor:anchor});});return <><ambientLight intensity={1.5}/><directionalLight position={[1,3,2]} intensity={3}/><group scale={.01} onPointerDown={e=>{e.stopPropagation();anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}}><Module selected={selected} choose={choose} usb modulePower led={led} dial={dial}/></group><SurfaceLabel anchor={anchor} selected={selected} name={mq2ModuleParts.find(p=>p.id===selected)?.name??selected}/><OrbitControls makeDefault target={[-.1,.2,-.1]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[1.6,1.7,1.8],near:.001,fov:40}}><Scene/></Canvas>);return()=>root.unmount();}
