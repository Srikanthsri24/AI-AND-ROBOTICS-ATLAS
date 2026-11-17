import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {MailboxModel} from './MailboxFlagParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const parts:{name:string;at:Point;detail:string}[]=[
  {name:'Hinged mailbox flap',at:[-.62,1.43,.10],detail:'Closing the flap presses the roller. Reopening releases it and sets a stored reminder.'},
  {name:'Roller switch · D2',at:[.16,.79,.40],detail:'The flap presses the roller when shut, pulling D2 low. The input returns high when the flap opens.'},
  {name:'Reminder LED · D8',at:[1.25,.48,.20],detail:'The LED records an opening. It stays on when the flap shuts again.'},
  {name:'Reset button · D3',at:[1.41,.43,.99],detail:'The reset button clears the reminder with a closed flap. A reset while open leaves it unchanged.'},
];
type Mailbox={open:boolean;flag:boolean;message:string};
const initial:Mailbox={open:true,flag:false,message:'Close the flap to arm the detector.'};

function Bench({state,selected,select,flip,reset}:{state:Mailbox;selected:number;select:(i:number)=>void;flip:()=>void;reset:()=>void}){
  return <>
    <color attach="background" args={['#3e515e']}/>
    <hemisphereLight args={['#eaf6ff','#988072',2.06]}/><directionalLight position={[-3,6,4]} color="#fff1dc" intensity={2.15}/>
    <Box at={[0,-.094,0]} size={[4.78,.19,3.06]} color="#808f88"/>
    <group position={[-.63,.03,-.22]} scale={[1.20,1.18,1.16]}><MailboxModel open={state.open} selected={selected===0} onFlap={flip}/></group>
    <group position={[.19,.77,.29]} onClick={()=>select(1)}>
      <Box at={[0,0,0]} size={[.19,.24,.18]} color={selected===1?'#daa97a':'#2c3c45'}/>
      <group position={[-.07,-.05,.06]} rotation={[0,0,state.open?.25:0]}>
        <Box at={[-.046,0,0]} size={[.19,.030,.063]} color="#a9b9bf" metal={.54}/>
        <mesh position={[-.151,.011,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.041,.041,.057,24]}/><meshStandardMaterial color="#b8c7ca" metalness={.50}/></mesh>
      </group>
    </group>
    <group onClick={()=>select(2)}>
      <Box at={[1.24,.12,.23]} size={[.54,.12,.46]} color={selected===2?'#deb58d':'#e2dfd3'}/>
      <Box at={[1.16,.218,.23]} size={[.25,.037,.043]} color="#b6976a"/>
      <mesh position={[1.38,.29,.25]}><sphereGeometry args={[.069,24,16]}/><meshStandardMaterial color={state.flag?'#ffb85b':'#805537'} emissive="#ff9b44" emissiveIntensity={state.flag?2.75:0}/></mesh>
      {state.flag&&<pointLight position={[1.38,.35,.25]} color="#ffad58" intensity={1.25} distance={.84}/>}
    </group>
    <group onClick={reset}>
      <Box at={[1.45,.116,1.00]} size={[.32,.105,.35]} color={selected===3?'#d7aa80':'#495b61'}/>
      <mesh position={[1.45,.20,1.00]}><cylinderGeometry args={[.067,.072,.078,24]}/><meshPhysicalMaterial color="#b67968" roughness={.4}/></mesh>
    </group>
    <Box at={[.54,.10,1.03]} size={[.95,.086,.50]} color="#297d8c"/>
    <Box at={[.20,.18,1.09]} size={[.18,.109,.148]} color="#bec9cc" metal={.62}/>
    <Box at={[.65,.178,1.02]} size={[.24,.057,.11]} color="#26343b"/>
    {[.82,1.23].map(z=><Box key={z} at={[.60,.17,z]} size={[.62,.055,.047]} color="#25343c"/>)}
    <Line points={[[.25,.72,.32],[.38,.53,.41],[.33,.19,.66],[.43,.177,.83]]} color="#e8af70" lineWidth={2.7}/>
    <Line points={[[1.13,.20,.24],[.93,.16,.42],[.84,.17,.65],[.72,.177,.83]]} color="#d08468" lineWidth={2.7}/>
    <Line points={[[1.29,.17,1.01],[1.13,.16,1.08],[.88,.175,1.23]]} color="#74bcc9" lineWidth={2.7}/>
    {parts.map(({name,at},i)=><WorldLabel key={name} position={i===0&&state.open?[-.64,.57,.97]:at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.34} scale={5.2} far={1.8} resolution={128} frames={1}/>
  </>;
}

export default function MailboxFlagDemo(){
  const [state,setState]=useState(initial);
  const [selected,select]=useState(0);
  function flip(){
    select(0);
    setState(previous=>previous.open?{...previous,open:false,message:previous.flag?'Flap shut. Reminder still on.':'Flap shut. Detector armed.'}:{open:true,flag:true,message:'Flap opened. Reminder on.'});
  }
  function reset(){
    select(3);
    setState(previous=>previous.open?{...previous,message:'Shut the flap before resetting.'}:{open:false,flag:false,message:'Reminder cleared. Detector armed.'});
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D mailbox test flag">
        <Canvas camera={{position:[2.07,3.1,6.37],fov:40}} dpr={[1,1.6]} fallback={<p>Use the flap and reset controls below.</p>}><Bench {...{state,selected,select,flip,reset}}/><OrbitControls target={[0,.59,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Mailbox readings"><div><span>Flap</span><strong>{state.open?'Open':'Shut'}</strong></div><div><span>Roller switch</span><strong>{state.open?'Released':'Pressed'}</strong></div><div><span>Reminder</span><strong>{state.flag?'On':'Off'}</strong></div></div>
    </div>
    <div className="gp-guide">
      <h3>Open, close and clear the reminder</h3>
      <p>Close the flap, then open it again. Close it once more and check that the light stays on until reset.</p>
      <div className="gp-steps"><button className="gp-button" type="button" onClick={flip}>{state.open?'Close flap':'Open flap'}</button><button className="gp-button gp-secondary" type="button" onClick={reset}>Reset reminder</button><button type="button" onClick={()=>{setState(initial);select(0);}}>Restart model</button></div>
      <p role="status">{state.message}</p>
      <ol className="gp-demo-labels">{parts.map(({name},i)=><li key={name}><button className="gp-part-label" type="button" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{parts[selected].detail}</p>
    </div>
  </div>;
}
