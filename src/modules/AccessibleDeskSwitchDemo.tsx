import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {DeskPaddle} from './DeskSwitchParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const parts:{name:string;at:Point;detail:string}[]=[
  {name:'Broad paddle and hinge',at:[-.79,.83,.20],detail:'The large surface pivots on the rear hinge. Press it from the front or either side.'},
  {name:'Roller switch · D2',at:[-.57,.29,.83],detail:'When the paddle lowers, the roller lever closes D2 to ground. Stops protect the switch from excess travel.'},
  {name:'Mode button · D3',at:[.89,.52,-.03],detail:'The separate button changes modes. The lamp clears and a held paddle must be released before the next activation.'},
  {name:'Output lamp · D8',at:[1.47,.44,.50],detail:'Hold follows the paddle. Toggle changes the lamp once at the start of each press.'},
];
type SwitchState={mode:'Hold'|'Toggle';pressed:boolean;lit:boolean};
const initial:SwitchState={mode:'Hold',pressed:false,lit:false};

function Bench({state,selected,select,press,changeMode}:{state:SwitchState;selected:number;select:(i:number)=>void;press:()=>void;changeMode:()=>void}){
  return <>
    <color attach="background" args={['#40535b']}/>
    <hemisphereLight args={['#ecf6ff','#9a8069',2.05]}/><directionalLight position={[-3,6,4]} color="#fff0d8" intensity={2.15}/>
    <Box at={[0,-.095,0]} size={[4.65,.19,3.04]} color="#82918a"/>
    <group position={[-.72,.03,.015]} scale={[1.42,1.38,1.24]}><DeskPaddle pressed={state.pressed} selected={selected===0} onPress={press}/></group>
    <group position={[-.55,.13,.48]} onClick={()=>select(1)}>
      <Box at={[0,0,0]} size={[.25,.16,.15]} color={selected===1?'#dbac77':'#32424b'}/>
      <group rotation={[0,0,state.pressed?0:.25]} position={[0,.094,.022]}>
        <Box at={[.042,0,0]} size={[.31,.031,.065]} color="#a3b5b9" metal={.52}/>
        <mesh position={[.182,.029,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.042,.042,.064,22]}/><meshStandardMaterial color="#b5c2c7" metalness={.53}/></mesh>
      </group>
    </group>
    <group onClick={changeMode}>
      <Box at={[.91,.096,-.08]} size={[.38,.095,.35]} color={selected===2?'#d6a77d':'#435960'}/>
      <mesh position={[.91,.177,-.08]}><cylinderGeometry args={[.071,.079,.082,24]}/><meshPhysicalMaterial color={state.mode==='Hold'?'#6ea3ad':'#cc9264'} clearcoat={.35}/></mesh>
    </group>
    <group onClick={()=>select(3)}>
      <Box at={[1.47,.106,.51]} size={[.57,.12,.49]} color={selected===3?'#dbb38e':'#dedbd1'}/>
      <Box at={[1.39,.181,.51]} size={[.25,.039,.046]} color="#b29569"/>
      <mesh position={[1.57,.24,.53]}><sphereGeometry args={[.065,22,14]}/><meshStandardMaterial color={state.lit?'#ffc26b':'#805737'} emissive="#ffb04e" emissiveIntensity={state.lit?2.65:0}/></mesh>
      {state.lit&&<pointLight position={[1.57,.31,.53]} color="#ffb75d" intensity={1.22} distance={.80}/>}
    </group>
    <Box at={[.64,.10,1.01]} size={[.94,.083,.49]} color="#267b88"/>
    <Box at={[.29,.174,1.09]} size={[.18,.112,.15]} color="#c0c9cc" metal={.61}/>
    <Box at={[.74,.17,1.0]} size={[.25,.057,.105]} color="#28353c"/>
    {[.83,1.19].map(z=><Box key={z} at={[.68,.164,z]} size={[.62,.057,.045]} color="#26343b"/>)}
    <Line points={[[-.42,.15,.50],[-.28,.17,.67],[.26,.18,.78],[.39,.18,.83]]} color="#e6b16b" lineWidth={2.8}/>
    <Line points={[[.92,.145,.02],[1.05,.14,.19],[.97,.16,.61],[.68,.17,.83]]} color="#71b8c9" lineWidth={2.8}/>
    <Line points={[[1.37,.18,.55],[1.16,.16,.63],[.94,.175,.86]]} color="#cd795e" lineWidth={2.8}/>
    {parts.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.34} scale={5.1} far={1.8} resolution={128} frames={1}/>
  </>;
}

export default function AccessibleDeskSwitchDemo(){
  const [state,setState]=useState(initial);
  const [selected,select]=useState(0);
  const [waiting,setWaiting]=useState(false);
  function press(){
    select(0);
    if(state.pressed){
      setState(previous=>({...previous,pressed:false,lit:previous.mode==='Hold'?false:previous.lit}));
      setWaiting(false);
    }else{
      setState(previous=>({...previous,pressed:true,lit:previous.mode==='Hold'||!previous.lit}));
    }
  }
  function changeMode(){
    select(2);
    setState(previous=>({...previous,mode:previous.mode==='Hold'?'Toggle':'Hold',lit:false}));
    setWaiting(state.pressed);
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D accessible desk switch">
        <Canvas camera={{position:[2.10,3.10,6.25],fov:40}} dpr={[1,1.6]} fallback={<p>Use the paddle controls and output readout below.</p>}><Bench {...{state,selected,select,press,changeMode}}/><OrbitControls target={[0,.47,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Desk switch readings"><div><span>Mode</span><strong>{state.mode}</strong></div><div><span>Paddle</span><strong>{state.pressed?'Down':'Released'}</strong></div><div><span>Lamp</span><strong>{state.lit?'On':'Off'}</strong></div></div>
    </div>
    <div className="gp-guide">
      <h3>Compare Hold and Toggle</h3>
      <p>Press and release the paddle in each mode. Then change modes while the paddle is held and check what happens to the lamp.</p>
      <div className="gp-steps"><button className="gp-button" type="button" onClick={press}>{state.pressed?'Release paddle':'Press paddle'}</button><button className="gp-button gp-secondary" type="button" onClick={changeMode}>Change mode</button><button type="button" onClick={()=>{setState(initial);setWaiting(false);select(0);}}>Reset switch</button></div>
      <p role="status">{waiting?'Lamp off. Release the paddle before pressing again.':`${state.mode} mode. Lamp ${state.lit?'on':'off'}.`}</p>
      <ol className="gp-demo-labels">{parts.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{parts[selected].detail}</p>
    </div>
  </div>;
}
