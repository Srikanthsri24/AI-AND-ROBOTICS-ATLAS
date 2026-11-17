import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {LibraryCounter} from './LibraryCounterPart';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const parts:{name:string;at:Point;detail:string}[]=[
  {name:'Visitor HELP switch',at:[-.86,1.20,.20],detail:'Press to pull D2 to ground. A new press starts a request and lights the visitor indicator while held.'},
  {name:'Staff ACKNOWLEDGE switch',at:[.39,1.21,.20],detail:'Press to pull D3 to ground. The Arduino clears the waiting request and is ready to receive another.'},
  {name:'Visitor LED · D8',at:[-.34,1.16,-.14],detail:'This LED follows the visitor switch. It turns off when HELP is released.'},
  {name:'Staff LED · D9',at:[.88,1.16,-.15],detail:'This LED shows a waiting request even after the visitor releases HELP.'},
  {name:'Arduino and wiring',at:[1.16,.37,1.04],detail:'The Uno debounces the switches and stores the waiting state. Both indicators have their own 330 Ω resistor.'},
];

function Bench({held,pending,selected,select,onHelp,onAcknowledge}:{held:boolean;pending:boolean;selected:number;select:(i:number)=>void;onHelp:()=>void;onAcknowledge:()=>void}){
  return <>
    <color attach="background" args={['#3e4b58']}/>
    <hemisphereLight args={['#e9f4ff','#9a8069',2.08]}/><directionalLight position={[-3,6,4]} color="#fff0da" intensity={2.1}/>
    <Box at={[0,-.09,0]} size={[4.72,.18,3.06]} color="#788685"/>
    <LibraryCounter/>
    <Box at={[.05,.40,-1.03]} size={[3.36,.80,.23]} color="#887664"/>
    <Box at={[.05,.81,-1.03]} size={[3.42,.08,.34]} color="#a58568"/>
    {Array.from({length:17},(_,i)=><Box key={i} at={[-1.45+i*.184,.965+(i%5)*.023,-1.01]} size={[.13,.24+(i%5)*.046,.19]} color={['#8c543f','#5e7e79','#b29157','#796d8b','#697e9b'][i%5]}/>)}
    {[-.86,.38].map((x,i)=><group key={x} position={[x,0,.10]} onClick={()=>{select(i);if(i===0)onHelp();else onAcknowledge();}}>
      <Box at={[0,.96,0]} size={[.22,.105,.215]} color={selected===i?'#dfb087':'#25363e'}/>
      <mesh position={[0,i===0&&held?.99:1.045,0]}><cylinderGeometry args={[.079,.082,.07,28]}/><meshPhysicalMaterial color={i===0?'#cc6e45':'#648e91'} roughness={.35} clearcoat={.33}/></mesh>
    </group>)}
    {[-.43,.81].map((x,i)=>{
      const lit=i===0?held:pending;
      const color=i===0?'#83e7b0':'#ffb750';
      return <group key={x} onClick={()=>select(i+2)}>
        <Box at={[x,.946,-.08]} size={[.15,.05,.15]} color={selected===i+2?'#eac18e':'#293940'}/>
        <mesh position={[x,.998,-.08]}><sphereGeometry args={[.058,23,16]}/><meshStandardMaterial color={lit?color:i===0?'#437761':'#875837'} emissive={color} emissiveIntensity={lit?2.6:0}/></mesh>
        {lit&&<pointLight position={[x,1.06,-.08]} color={color} intensity={1.3} distance={.76}/>}
      </group>;
    })}
    <group onClick={()=>select(4)}>
      <Box at={[1.23,.12,.98]} size={[.91,.09,.49]} color={selected===4?'#71a7a3':'#297c89'}/>
      <Box at={[.90,.188,1.05]} size={[.18,.107,.141]} color="#b9c8cc" metal={.63}/>
      <Box at={[1.33,.18,.98]} size={[.25,.056,.109]} color="#27353e"/>
      {[.80,1.16].map(z=><Box key={z} at={[1.28,.172,z]} size={[.60,.053,.044]} color="#263538"/>)}
    </group>
    {[-.83,-.43,.40,.81].map((x,i)=><Line key={x} points={[[x,.925,.12],[x,.82,.51],[x,.27,.58],[.42+i*.22,.20,.69],[.97+i*.13,.18,.82]]} color={['#df815f','#79bfa4','#71acc0','#e5b36b'][i]} lineWidth={2.5}/>)}
    {parts.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.32} scale={5.1} far={1.9} resolution={128} frames={1}/>
  </>;
}

type Desk={held:boolean;pending:boolean;events:string[]};
const idle:Desk={held:false,pending:false,events:[]};

export default function LibraryHelpButtonDemo(){
  const [desk,setDesk]=useState(idle);
  const [selected,select]=useState(0);
  const {held,pending,events}=desk;
  function onHelp(){
    select(0);
    setDesk(state=>state.held?{...state,held:false}:{held:true,pending:true,events:state.pending?state.events:[...state.events.slice(-5),'Help requested']});
  }
  function onAcknowledge(){
    select(1);
    setDesk(state=>state.pending?{...state,pending:false,events:[...state.events.slice(-5),'Staff acknowledged']}:state);
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D library help counter">
        <Canvas camera={{position:[2.01,3.20,6.4],fov:41}} dpr={[1,1.6]} fallback={<p>Use the controls to test both indicators.</p>}><Bench {...{held,pending,selected,select,onHelp,onAcknowledge}}/><OrbitControls target={[0,.59,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Library indicator readings">
        <div><span>Visitor button</span><strong>{held?'Held':'Released'}</strong></div><div><span>Visitor LED</span><strong>{held?'On':'Off'}</strong></div><div><span>Staff LED</span><strong>{pending?'On':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Send and acknowledge a request</h3>
      <p>Press HELP and release it. Compare the two lights, then acknowledge the waiting request at the staff station.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={onHelp}>{held?'Release HELP':'Press HELP'}</button>
        <button type="button" className="gp-button gp-secondary" onClick={onAcknowledge}>Acknowledge request</button>
        <button type="button" onClick={()=>{setDesk(idle);select(0);}}>Reset counter</button>
      </div>
      <p role="status">{pending?'A request is waiting for staff.':'Ready for a help request.'}</p>
      {events.length>0&&<ol aria-label="Recent request events">{events.map((event,i)=><li key={i}>{event}</li>)}</ol>}
      <ol className="gp-demo-labels">{parts.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{parts[selected].detail}</p>
    </div>
  </div>;
}
