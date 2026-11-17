import {useEffect,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {DialFace,DialPointer} from './DialGaugeParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const markers:{name:string;at:Point;detail:string}[]=[
  {name:'Card dial and calibration marks',at:[-.48,1.99,-.12],detail:'The center mark is 50%. A 60° sweep to either side covers the full scale. Mark the known positions with a protractor.'},
  {name:'Pointer and servo horn',at:[.10,1.36,.17],detail:'The servo rotates the pointer on the front. Align the horn with the middle mark while the input reads 50%.'},
  {name:'10 kΩ input knob · A0',at:[-.49,.58,.80],detail:'The outer terminals connect to Uno 5 V and GND. The middle terminal carries the changing voltage to A0.'},
  {name:'Uno and 5 V servo supply',at:[.98,.44,.29],detail:'The Uno maps the calibrated ADC reading to a D9 servo position. Use a separate servo supply and join the grounds.'},
];

function GaugeScene({input,pointer,selected,select,stepInput}:{input:number;pointer:number;selected:number;select:(value:number)=>void;stepInput:()=>void}){
  return <>
    <color attach="background" args={['#3c515c']}/>
    <hemisphereLight args={['#f7f0dc','#89776a',2.05]}/>
    <directionalLight color="#fff0d8" intensity={2.25} position={[-3,5,4]}/>
    <Box at={[0,-.10,0]} size={[4.25,.20,3.05]} color="#81978d"/>
    <Box at={[-.31,.077,-.17]} size={[2.11,.145,1.02]} color="#ad8660"/>
    {[-1.02,.41].map(x=><Box key={x} at={[x,.46,-.35]} size={[.10,.69,.26]} color="#846a56"/>)}
    <group position={[-.32,1.26,-.30]}>
      <group onClick={()=>select(0)}><DialFace highlighted={selected===0}/></group>
      <group onClick={()=>select(1)}><DialPointer value={pointer} highlighted={selected===1}/>
        <Box at={[0,0,-.18]} size={[.43,.28,.20]} color={selected===1?'#daab70':'#305977'}/>
      </group>
    </group>
    <group position={[-.50,.25,.79]} onClick={stepInput}>
      <Box at={[0,-.11,0]} size={[.67,.24,.48]} color={selected===2?'#d2a470':'#9e805f'}/>
      <group rotation={[0,(50-input)*.042,0]}>
        <mesh><cylinderGeometry args={[.161,.173,.16,40]}/><meshStandardMaterial color="#263840" roughness={.54}/></mesh>
        {Array.from({length:16},(_,index)=>{
          const angle=index*Math.PI/8;
          return <group rotation={[0,angle,0]} key={index}><Box at={[0,0,.17]} size={[.023,.127,.021]} color="#3c5058"/></group>;
        })}
        <Box at={[0,.083,.07]} size={[.019,.013,.12]} color="#f1dfbd"/>
      </group>
    </group>
    <group onClick={()=>select(3)}>
      <Box at={[1.07,.072,.35]} size={[.86,.09,.57]} color={selected===3?'#73afa3':'#277a8b'}/>
      <Box at={[.79,.147,.42]} size={[.17,.108,.16]} color="#c6cece" metal={.61}/>
      <Box at={[1.23,.153,.34]} size={[.24,.063,.115]} color="#283540"/>
      {[.12,.57].map(z=><Box key={z} at={[1.11,.14,z]} size={[.65,.057,.05]} color="#263640"/>)}
      <Box at={[1.17,.108,-.76]} size={[.67,.212,.44]} color="#363e45"/>
      <Box at={[1.16,.217,-.76]} size={[.44,.014,.25]} color="#57636a"/>
    </group>
    <Line points={[[-.23,.19,.75],[.23,.072,.68],[.67,.085,.65],[.92,.15,.56]]} color="#d4ac66" lineWidth={2.6}/>
    <Line points={[[-.26,.20,.68],[.17,.088,.53],[.62,.083,.50],[1.16,.15,.57]]} color="#bf5c4f" lineWidth={2.5}/>
    <Line points={[[-.27,.16,.84],[.10,.075,.92],[.81,.09,.77],[1.26,.14,.56]]} color="#25333d" lineWidth={2.5}/>
    <Line points={[[-.11,1.24,-.53],[.02,.83,-.64],[.29,.12,-.68],[.62,.083,.02],[.94,.15,.13]]} color="#daa564" lineWidth={2.6}/>
    <Line points={[[-.11,1.20,-.53],[.03,.53,-.69],[.41,.12,-.75],[.87,.16,-.72]]} color="#bd5e50" lineWidth={2.5}/>
    <Line points={[[-.11,1.16,-.53],[.04,.45,-.65],[.42,.085,-.68],[.92,.13,-.58],[1.34,.16,.13]]} color="#26323c" lineWidth={2.5}/>
    {markers.map(({name,at},index)=><WorldLabel key={name} position={at} className="gp-marker-anchor">
      <button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}{selected===index&&<span className="gp-demo-marker-name">{name}</span>}</button>
    </WorldLabel>)}
    <ContactShadows position={[0,.009,0]} opacity={.36} scale={4.8} far={2.1} resolution={256} frames={1}/>
  </>;
}

export default function DialGaugeDemo(){
  const [input,setInput]=useState(50);
  const [pointer,setPointer]=useState(50);
  const [offset,setOffset]=useState(0);
  const [selected,select]=useState(0);
  const target=input+offset;
  const moving=pointer!==target;
  const raw=Math.round(input*1023/100);
  useEffect(()=>{
    if(!moving)return;
    const timer=window.setTimeout(()=>setPointer(pointer+Math.sign(target-pointer)*Math.min(2,Math.abs(target-pointer))),16);
    return ()=>window.clearTimeout(timer);
  },[target,pointer,moving]);

  function aim(value:number){
    setInput(value);
    select(2);
  }

  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div role="region" aria-label="3D cardboard dial gauge" className="gp-canvas gp-rc-canvas">
        <Canvas camera={{position:[2.32,2.8,5.12],fov:41}} dpr={[1,1.6]} fallback={<p>Use the calibration controls and readouts below.</p>}>
          <GaugeScene {...{input,pointer,selected,select}} stepInput={()=>aim(input>=100?0:Math.min(input+25,100))}/>
          <OrbitControls target={[0,.83,0]} enablePan={false} minDistance={3} maxDistance={8}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Dial gauge readouts">
        <div><span>A0 reading</span><strong>{raw}</strong></div>
        <div><span>Input level</span><strong>{input}%</strong></div>
        <div><span>Pointer reading</span><strong>{pointer}%</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Check the scale with a known input</h3>
      <p>Try the marked inputs, then set a value between them. Introduce a mounting offset and compare the input and pointer before realigning.</p>
      <div className="gp-steps" role="group" aria-label="Calibration checkpoints">
        {[0,50,100].map(value=><button className="gp-button gp-secondary" type="button" key={value} aria-pressed={input===value} onClick={()=>aim(value)}>Set {value}%</button>)}
      </div>
      <label className="gp-home-light">Knob position <output>{input}%</output><input type="range" min="0" max="100" value={input} aria-label="Knob position" onChange={event=>aim(event.target.valueAsNumber)}/></label>
      <div className="gp-steps">
        <button className="gp-button gp-secondary" type="button" aria-pressed={offset!==0} onClick={()=>{setOffset(8);select(1);}}>Offset pointer</button>
        <button className="gp-button" type="button" disabled={input!==50||offset===0} onClick={()=>{setOffset(0);select(1);}}>Align at 50%</button>
      </div>
      <p role="status">{moving?'Pointer moving.':offset?'Pointer is 8 percentage points above the input. Set 50% to realign.':'Pointer agrees with the input.'}</p>
      <ol className="gp-demo-labels">{markers.map(({name},index)=><li key={name}><button className="gp-part-label" type="button" aria-pressed={selected===index} onClick={()=>select(index)}><span>{index+1}</span>{name}</button></li>)}</ol>
      <p>{markers[selected].detail}</p>
    </div>
  </div>;
}
