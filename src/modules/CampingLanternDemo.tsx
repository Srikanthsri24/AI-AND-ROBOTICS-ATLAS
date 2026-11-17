import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Lantern diffuser',at:[1.10,1.88,.19],detail:'D8 turns on the white LED through a 220 Ω resistor. The diffuser spreads one LED’s light around the model.'},
  {name:'Mode button',at:[1.49,.68,.94],detail:'The button pulls D2 low. A debounced press advances the mode once, even if held.'},
  {name:'Ambient sensor',at:[-1.55,.56,.42],detail:'A0 reads room light outside the lantern beam. Auto turns on at 35% or below and clears at 45% or above.'},
  {name:'Arduino and resistors',at:[-.88,.46,1.02],detail:'The Uno remembers the Auto state while manual mode controls the visible lamp. Returning to Auto uses the current sensor state.'},
];

function Campsite({light,lit,selected,select,pressMode}:{light:number;lit:boolean;selected:number;select:(i:number)=>void;pressMode:()=>void}){
  const ambient=.36+light*.024;
  return <>
    <color attach="background" args={[light<45?'#16293e':'#3e5368']}/>
    <hemisphereLight args={['#e3efff','#756c54',ambient]}/>
    <directionalLight position={[-3,5,4]} intensity={ambient} color="#fff0d6"/>
    <Box at={[0,-.095,0]} size={[4.9,.19,2.95]} color="#5c6a76"/>
    <Box at={[.49,.07,-.22]} size={[3.53,.14,2.36]} color="#7b836a"/>
    <mesh position={[-.38,.60,-.67]} rotation={[-Math.PI/2,0,0]}><cylinderGeometry args={[.79,.79,.93,3,1,true]}/><meshStandardMaterial color="#688177" side={2} roughness={.85}/></mesh>
    <mesh position={[-.38,.60,-.193]} rotation={[0,0,Math.PI/2]}><circleGeometry args={[.79,3]}/><meshStandardMaterial color="#405d55" side={2}/></mesh>
    <Line points={[[-.40,1.39,-.20],[-.80,.17,-.14]]} color="#c2b698" lineWidth={1.5}/>
    <Line points={[[-.40,1.39,-.20],[.04,.17,-.14]]} color="#b7ab8e" lineWidth={1.5}/>
    <Box at={[1.06,.20,.11]} size={[.96,.14,.88]} color="#8a7663"/>
    <group position={[1.06,.27,.11]} onClick={()=>select(0)}>
      <mesh position={[0,.095,0]}><cylinderGeometry args={[.34,.37,.19,32]}/><meshStandardMaterial color={selected===0?'#bb8c54':'#4f645e'} metalness={.46}/></mesh>
      <mesh position={[0,.50,0]}><cylinderGeometry args={[.279,.29,.67,40]}/><meshStandardMaterial color={lit?'#f1d9a2':'#cfcebb'} emissive="#ffbc70" emissiveIntensity={lit?1.62:0} roughness={.64}/></mesh>
      {lit&&<pointLight position={[0,.74,.05]} color="#ffcd87" intensity={7.2} distance={3}/>}
      <mesh position={[0,.875,0]}><cylinderGeometry args={[.24,.34,.13,32]}/><meshStandardMaterial color="#435a57" metalness={.47}/></mesh>
      <Line points={[[-.23,.906,.012],[-.23,1.13,.012],[-.12,1.24,.012],[.12,1.24,.012],[.23,1.13,.012],[.23,.906,.012]]} color="#9eacac" lineWidth={3}/>
      {[-.238,.238].map(x=><Box key={x} at={[x,.50,.145]} size={[.034,.67,.04]} color="#637772" metal={.53}/>)}
    </group>
    <group onClick={()=>{select(1);pressMode();}}>
      <Box at={[1.45,.208,.93]} size={[.328,.13,.30]} color="#687582"/>
      <Box at={[1.45,.29,.93]} size={[.163,.056,.147]} color={selected===1?'#edac61':'#b76e4e'}/>
    </group>
    <group onClick={()=>select(2)}>
      <Box at={[-1.52,.121,.32]} size={[.38,.14,.34]} color="#e1dacc"/>
      <mesh position={[-1.52,.226,.32]}><cylinderGeometry args={[.071,.071,.037,24]}/><meshStandardMaterial color={selected===2?'#efb777':'#bf9e78'}/></mesh>
      <Line points={[[-1.56,.25,.29],[-1.48,.25,.29],[-1.48,.25,.32],[-1.56,.25,.32],[-1.56,.25,.35],[-1.48,.25,.35]]} color="#824f39" lineWidth={2}/>
    </group>
    <group onClick={()=>select(3)}>
      <Box at={[-1.27,.126,1.05]} size={[.82,.077,.49]} color={selected===3?'#bd8650':'#28738c'}/>
      <Box at={[-1.52,.196,1.11]} size={[.177,.11,.149]} color="#adb8c3" metal={.69}/>
      <Box at={[-1.19,.190,1.06]} size={[.235,.058,.125]} color="#29333e"/>
      {[.89,1.21].map(z=><Box key={z} at={[-1.15,.185,z]} size={[.5,.052,.056]} color="#27343c"/>)}
      <Box at={[-.53,.116,1.04]} size={[.55,.091,.46]} color="#dedace"/>
      {[.96,1.12].map(z=><group key={z} position={[-.53,.194,z]}><Box at={[0,0,0]} size={[.37,.02,.021]} color="#aeb9bd" metal={.68}/><Box at={[0,.006,0]} size={[.15,.049,.047]} color="#c0a47a"/></group>)}
    </group>
    <Line points={[[-1.52,.19,.47],[-1.45,.216,.59],[-1.29,.20,.73],[-.70,.191,.96]]} color="#d2a457" lineWidth={3}/>
    <Line points={[[1.03,.28,.40],[.88,.24,.58],[.38,.20,1.03],[-.35,.195,1.12]]} color="#638ab1" lineWidth={3}/>
    <Line points={[[1.46,.21,1.05],[1.25,.21,1.19],[.55,.17,1.23],[-1.03,.194,1.20]]} color="#b36555" lineWidth={2}/>
    <Line points={[[1.14,.23,.43],[1.00,.19,.73],[.73,.19,1.33],[-1.15,.194,1.21]]} color="#333b43" lineWidth={2}/>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.008,0]} opacity={.34} scale={5.1} far={1.3} resolution={128} frames={1}/>
  </>;
}

const modes=['Auto','On override','Off override'] as const;

export default function CampingLanternDemo(){
  const [{light,automatic},setAmbient]=useState({light:75,automatic:false});
  const [mode,setMode]=useState(0);
  const [selected,select]=useState(0);
  const lit=mode===1||(mode===0&&automatic);
  function pressMode(){setMode(value=>(value+1)%modes.length);}
  function change(light:number){setAmbient(previous=>({light,automatic:light<=35||(light<45&&previous.automatic)}));}
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D camping model lantern">
        <Canvas camera={{position:[2.55,3.2,6.03],fov:41}} dpr={[1,1.6]} fallback={<p>Compare the lamp readings below.</p>}>
          <Campsite {...{light,lit,selected,select,pressMode}}/><OrbitControls target={[0,.58,0]} enablePan={false} minDistance={3.4} maxDistance={9.8}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Camping lantern readings"><div><span>Ambient light</span><strong>{light}%</strong></div><div><span>Mode</span><strong>{modes[mode]}</strong></div><div><span>Lamp D8</span><strong>{lit?'On':'Off'}</strong></div></div>
    </div>
    <div className="gp-guide">
      <h3>Try Auto and manual override</h3>
      <label className="gp-home-light">Room light <output>{light}%</output><input aria-label="Room light" type="range" min="0" max="100" value={light} onChange={e=>change(e.target.valueAsNumber)}/></label>
      <div className="gp-steps">
        <button type="button" onClick={()=>change(75)}>Daylight</button>
        <button type="button" onClick={()=>change(24)}>Dusk</button>
        <button type="button" className="gp-button" onClick={pressMode}>Press mode button</button>
      </div>
      <p role="status">{modes[mode]} · Lamp {lit?'on':'off'}.</p>
      <p>Each press advances Auto → On override → Off override → Auto.</p>
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected].detail}</p>
    </div>
  </div>;
}
