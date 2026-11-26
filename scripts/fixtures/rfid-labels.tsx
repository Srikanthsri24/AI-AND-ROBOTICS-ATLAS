import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import Scene from '../../src/modules/RfidWorkshopScene';
import {rfidSessionInitial,rfidSessionDefaults} from '../../src/data/rfid-session';
import {rfidConnectionsSeated} from '../../src/data/rfid-connections';
function Probe(){const s=useThree();useFrame(()=>{Object.assign(window,{__rfidLabelsScene:s});});return null;}
function App(){const[selected,choose]=useState(''),[version,setVersion]=useState(0),[tagA,setTagA]=useState(0);Object.assign(window,{__rfidFocus:(id:string)=>{choose(id);setVersion(v=>v+1);},__rfidChooseRaw:choose,__rfidMoveTag:setTagA,__rfidLabelSelected:selected});return <Canvas camera={{position:[3,2.4,3.8],near:.01,far:50,fov:42}}><Probe/><Scene state={{...rfidSessionInitial(),tagA}} settings={{...rfidSessionDefaults,assembled:true,connections:rfidConnectionsSeated()}} cursor={20} doorAngle={0} withdrawal={0} selected={selected} choose={choose} version={version}/></Canvas>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<App/>);return()=>root.unmount();}
