import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {ControllerStick} from './ControllerInputParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
type Key='Stick click'|'Button A'|'Button B';
type Inputs=Record<Key,boolean>;
const keys:Key[]=['Stick click','Button A','Button B'];
const released:Inputs={'Stick click':false,'Button A':false,'Button B':false};
const middle=[512,512] as const;
const parts:{name:string;at:Point;detail:string}[]=[
  {name:'Joystick · A0, A1 and D2',at:[-.86,1.05,.32],detail:'Two analog channels report position. Pressing the stick closes a separate switch on D2.'},
  {name:'Action A · D3',at:[.51,.71,.45],detail:'Button A has its own active-low input. It can stay pressed while other inputs change.'},
  {name:'Action B · D4',at:[1.12,.71,.12],detail:'Button B has its own active-low input. Release it to see the input return high.'},
  {name:'Arduino and wiring',at:[.13,.34,1.30],detail:'The Uno calculates offsets from the captured center and applies a 55-count neutral zone on both axes.'},
];

function Bench({x,y,buttons,selected,select,toggle}:{x:number;y:number;buttons:Inputs;selected:number;select:(i:number)=>void;toggle:(key:Key)=>void}){
  return <>
    <color attach="background" args={['#3e515e']}/>
    <hemisphereLight args={['#eaf5ff','#947d67',2.08]}/>
    <directionalLight position={[-3,6,4]} color="#fff0d9" intensity={2.14}/>
    <Box at={[0,-.095,0]} size={[4.8,.19,3.08]} color="#81918a"/>
    <Box at={[0,.167,-.14]} size={[3.28,.27,1.48]} color="#795e4d"/>
    <Box at={[0,.31,-.14]} size={[3.35,.098,1.52]} color="#b08661"/>
    {[-1.48,1.48].flatMap(at=>[-.74,.48].map(z=><mesh key={at+','+z} position={[at,.363,z]}><sphereGeometry args={[.024,12,8]}/><meshStandardMaterial color="#c2c5bc" metalness={.57}/></mesh>))}
    <group position={[-.86,.49,-.05]} onClick={()=>toggle('Stick click')}>
      <Box at={[0,-.127,0]} size={[.94,.04,.93]} color={selected===0?'#e0b282':'#536873'}/>
      <ControllerStick x={x} y={y} clicked={buttons['Stick click']}/>
    </group>
    {(['Button A','Button B'] as const).map((key,i)=>{
      const x=i===0?.52:1.10,z=i===0?.20:-.23;
      return <group key={key} position={[x,.37,z]} onClick={()=>toggle(key)}>
        <mesh position={[0,.015,0]}><cylinderGeometry args={[.133,.136,.075,26]}/><meshStandardMaterial color={selected===i+1?'#d9ad82':'#334852'}/></mesh>
        <mesh position={[0,buttons[key]?.056:.104,0]}><cylinderGeometry args={[.093,.100,.092,28]}/><meshPhysicalMaterial color={i===0?'#67aaba':'#d69463'} clearcoat={.42} roughness={.38}/></mesh>
      </group>;
    })}
    <group onClick={()=>select(3)}>
      <Box at={[.13,.108,1.17]} size={[.97,.088,.51]} color={selected===3?'#72aaa7':'#287d8b'}/>
      <Box at={[-.24,.177,1.23]} size={[.18,.112,.147]} color="#bdc9cc" metal={.64}/>
      <Box at={[.26,.173,1.18]} size={[.23,.056,.105]} color="#26343b"/>
      {[.98,1.36].map(z=><Box key={z} at={[.17,.168,z]} size={[.61,.053,.043]} color="#27353d"/>)}
    </group>
    <Line points={[[-.65,.34,.28],[-.65,.27,.67],[-.36,.14,.87],[-.07,.18,.98]]} color="#deb073" lineWidth={2.7}/>
    <Line points={[[.52,.35,.30],[.54,.27,.63],[.35,.14,.86],[.18,.18,.98]]} color="#70b9ca" lineWidth={2.7}/>
    <Line points={[[1.10,.35,-.15],[1.11,.29,.55],[.77,.14,.92],[.41,.18,.99]]} color="#c67664" lineWidth={2.7}/>
    {parts.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.34} scale={5.2} far={1.8} resolution={128} frames={1}/>
  </>;
}

export default function ControllerInputDemo(){
  const [axes,setAxes]=useState<readonly [number,number]>(middle);
  const [center,setCenter]=useState<readonly [number,number]>(middle);
  const [buttons,setButtons]=useState(released);
  const [selected,select]=useState(0);
  const [x,y]=axes;
  const dx=x-center[0],dy=y-center[1];
  const neutral=Math.abs(dx)<=55&&Math.abs(dy)<=55;
  function toggle(key:Key){
    select(keys.indexOf(key));
    setButtons(previous=>({...previous,[key]:!previous[key]}));
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D game controller input tester">
        <Canvas camera={{position:[2.08,3.27,6.2],fov:40}} dpr={[1,1.6]} fallback={<p>Use the axis sliders and button states below.</p>}><Bench x={(x-512)/512} y={(y-512)/512} {...{buttons,selected,select,toggle}}/><OrbitControls target={[0,.47,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Controller axis readings">
        <div><span>Raw X · A0</span><strong>{x}</strong></div><div><span>Raw Y · A1</span><strong>{y}</strong></div><div><span>Relative position</span><strong>{neutral?'Neutral':'Outside neutral'}</strong></div>
      </div>
      <div className="gp-demo-result" aria-label="Controller button readings">
        {keys.map(key=><div key={key}><span>{key}</span><strong>{buttons[key]?'Pressed':'Released'}</strong></div>)}
      </div>
    </div>
    <div className="gp-guide">
      <h3>Exercise each input</h3>
      <p>Move either axis or press a button. Leave A down while pressing B to see both inputs register.</p>
      {axes.map((value,i)=>{
        const name=i===0?'X axis':'Y axis';
        return <label className="gp-home-light" key={name}>{name} <output>{value}</output><input aria-label={name} type="range" min="0" max="1023" value={value} onChange={event=>{const next=event.target.valueAsNumber;setAxes(previous=>i===0?[next,previous[1]]:[previous[0],next]);select(0);}}/></label>;
      })}
      <div className="gp-steps">{keys.map(key=><button className="gp-button gp-secondary" type="button" key={key} aria-pressed={buttons[key]} onClick={()=>toggle(key)}>{buttons[key]?'Release':'Press'} {key.toLowerCase()}</button>)}</div>
      <div className="gp-steps"><button type="button" onClick={()=>setAxes(middle)}>Return stick to rest</button><button type="button" onClick={()=>setCenter(axes)}>Capture center</button><button type="button" onClick={()=>{setAxes(middle);setCenter(middle);setButtons(released);select(0);}}>Reset tester</button></div>
      <p role="status">Offsets X {dx}, Y {dy}. {neutral?'Inside the neutral zone.':'Outside the neutral zone.'}</p>
      <ol className="gp-demo-labels">{parts.map(({name},i)=><li key={name}><button className="gp-part-label" type="button" aria-pressed={i===selected} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{parts[selected].detail}</p>
    </div>
  </div>;
}
