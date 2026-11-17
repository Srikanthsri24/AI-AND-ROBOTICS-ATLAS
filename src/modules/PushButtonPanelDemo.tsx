import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const markers:{name:string;at:Point;detail:string}[]=[
  {name:'Arduino Uno',at:[-1.21,.53,.85],detail:'The internal pull-up holds D2 HIGH while the switch is open. The sketch drives D8 HIGH when the debounced input is LOW.'},
  {name:'Tactile switch',at:[-.33,.78,-.04],detail:'Pressing bridges the two contact sides and joins the yellow D2 wire to the dark ground wire.'},
  {name:'330 Ω resistor',at:[.52,.50,.54],detail:'The resistor sits in series between D8 and the LED anode. It limits current when the output goes HIGH.'},
  {name:'Status LED',at:[1.29,1.01,-.31],detail:'The green LED lights while the button is held. Its cathode returns to the same ground as the button.'},
];
const wires:{points:Point[];color:string}[]=[
  {points:[[-.77,.31,.75],[-.71,.39,.35],[-.56,.37,.12],[-.57,.28,-.08],[-.47,.26,-.04]],color:'#e7af38'},
  {points:[[-.91,.31,.75],[-.84,.37,.01],[-.84,.24,-.56],[-.16,.24,-.56],[-.16,.26,-.04]],color:'#303439'},
  {points:[[-.77,.30,1.12],[-.62,.31,1.21],[-.15,.34,.88],[.23,.25,.57]],color:'#db5758'},
  {points:[[.81,.25,.57],[.99,.33,.35],[1.17,.25,-.23]],color:'#5082c0'},
  {points:[[1.36,.25,-.23],[1.59,.30,-.04],[1.61,.33,.96],[.70,.28,1.22],[-1.04,.3,1.12]],color:'#31383d'},
];

function Panel({pressed,selected,select}:{pressed:boolean;selected:number;select:(value:number)=>void}) {
  return <>
    <color attach="background" args={['#273a4b']}/>
    <hemisphereLight args={['#e4f3ff','#7b614f',2]}/>
    <directionalLight position={[-3,5,4]} intensity={2.35} color="#fff4e0"/>
    <Box at={[0,-.11,0]} size={[4.9,.22,3.1]} color="#596674"/>
    <Box at={[.26,.061,-.08]} size={[2.98,.12,2.12]} color="#608780"/>
    <Box at={[.24,.121,.07]} size={[2.68,.11,1.79]} color="#dedcd1"/>
    {Array.from({length:26},(_,index)=>[-.48,-.36,-.21,.10,.27,.43,.58].map(z=>
      <Box key={index+':'+z} at={[-1.015+index*.099,.181,z]} size={[.027,.005,.027]} color="#777878"/>
    ))}
    <Box at={[.24,.183,-.64]} size={[2.49,.006,.017]} color="#c5665d"/>
    <Box at={[.24,.183,.78]} size={[2.49,.006,.017]} color="#5f7aab"/>
    <Box at={[.24,.183,-.045]} size={[2.51,.008,.074]} color="#bbbdb6"/>
    <group position={[-1.43,.19,.86]} onClick={()=>select(0)}>
      <Box at={[0,0,0]} size={[1.2,.08,.76]} color={selected===0?'#be874e':'#1e7991'}/>
      <Box at={[-.42,.075,.09]} size={[.23,.13,.21]} color="#b6c2cb" metal={.68}/>
      <Box at={[-.18,.078,-.15]} size={[.123,.095,.13]} color="#30383e"/>
      <Box at={[.11,.074,.03]} size={[.35,.063,.16]} color="#222930"/>
      {[-.26,.26].map(z=><group key={z}>
        <Box at={[.12,.07,z]} size={[.77,.08,.08]} color="#252e34"/>
        {Array.from({length:10},(_,i)=><Box key={i} at={[-.21+i*.073,.112,z]} size={[.022,.008,.022]} color="#c7ad78"/>)}
      </group>)}
      <Line points={[[-.52,.077,.09],[-.72,.065,.05],[-.88,.01,-.29],[-1.08,-.035,-.39]]} color="#29343e" lineWidth={4}/>
    </group>
    <group position={[-.32,.26,-.04]} onClick={()=>select(1)}>
      <Box at={[0,.045,0]} size={[.29,.16,.29]} color="#232d34"/>
      <Box at={[0,.138,0]} size={[.29,.042,.29]} color={selected===1?'#d0a06a':'#aeb9bc'} metal={.6}/>
      {[-.15,.15].flatMap(x=>[-.11,.11].map(z=><Box key={x+':'+z} at={[x,-.009,z]} size={[.105,.022,.035]} color="#b0bbbe" metal={.7}/>))}
      <mesh position={[0,pressed?.166:.218,0]}><cylinderGeometry args={[.092,.105,.104,26]}/><meshStandardMaterial color={pressed?'#525a62':'#34383e'}/></mesh>
    </group>
    <group position={[.52,.25,.57]} onClick={()=>select(2)}>
      <Box at={[0,0,0]} size={[.58,.023,.023]} color="#aab8c0" metal={.75}/>
      <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.044,.044,.26,20]}/><meshStandardMaterial color={selected===2?'#f4bd73':'#c3ae83'}/></mesh>
      {['#b26235','#b26235','#624837','#b89855'].map((color,i)=><Box key={i} at={[-.094+i*.057,.013,0]} size={[.02,.065,.071]} color={color}/>)}
    </group>
    <group position={[1.26,.25,-.23]} onClick={()=>select(3)}>
      {[-.09,.09].map(x=><Box key={x} at={[x,.14,0]} size={[.018,.32,.02]} color="#a5b2ba" metal={.7}/>)}
      <mesh position={[0,.30,0]}><cylinderGeometry args={[.10,.115,.15,26]}/><meshStandardMaterial color={pressed?'#77ff90':'#397953'} emissive="#52ee76" emissiveIntensity={pressed?1.55:0}/></mesh>
      <mesh position={[0,.373,0]}><sphereGeometry args={[.099,26,14,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color={pressed?'#baffac':selected===3?'#6cac7f':'#397953'} emissive="#62f487" emissiveIntensity={pressed?2.15:0} roughness={.31}/></mesh>
      {pressed&&<pointLight position={[0,.44,0]} intensity={1.4} distance={.72} color="#66fd86"/>}
    </group>
    {wires.map(({points,color},index)=><Line key={index} points={points} color={color} lineWidth={3}/>)}
    {markers.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.007,0]} opacity={.37} scale={5} far={1.3} resolution={128} frames={1}/>
  </>;
}

export default function PushButtonPanelDemo() {
  const [samples,setSamples]=useState([false]);
  const [selected,select]=useState(1);
  const pressed=samples[samples.length-1];
  function setPressed(next:boolean) {
    setSamples(previous=>previous[previous.length-1]===next ? previous : [...previous.slice(-7),next]);
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D push-button status panel">
        <Canvas camera={{position:[2.35,3.45,5.2],fov:39}} dpr={[1,1.6]} fallback={<p>Use the circuit controls and readings below.</p>}>
          <Panel {...{pressed,selected,select}}/>
          <OrbitControls target={[0,.32,0]} enablePan={false} minDistance={2.8} maxDistance={9}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Push-button circuit readings">
        <div><span>Switch</span><strong>{pressed?'Closed':'Open'}</strong></div>
        <div><span>Input D2</span><strong>{pressed?'LOW':'HIGH'}</strong></div>
        <div><span>Output D8</span><strong>{pressed?'HIGH · LED on':'LOW · LED off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Press, hold, then release</h3>
      <p>Hold with a mouse, touch, Space or Enter. Use the separate press and release controls to inspect either state.</p>
      <div className="gp-steps">
        <button className="gp-button" type="button" onPointerDown={event=>{
          if(event.button!==0)return;
          event.currentTarget.setPointerCapture(event.pointerId);
          setPressed(true);
        }} onPointerUp={()=>setPressed(false)} onPointerCancel={()=>setPressed(false)} onLostPointerCapture={()=>setPressed(false)}
          onKeyDown={event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();setPressed(true);}}}
          onKeyUp={event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();setPressed(false);}}}
          onBlur={()=>setPressed(false)}>Hold button</button>
        <button type="button" onClick={()=>setPressed(true)}>Press</button>
        <button type="button" onClick={()=>setPressed(false)}>Release</button>
      </div>
      <p role="status">{pressed?'Pressed · D2 LOW · LED on':'Released · D2 HIGH · LED off'}</p>
      <p><strong>Recent D2 states</strong> {samples.map(state=>state?'LOW':'HIGH').join(' → ')}</p>
      <ol className="gp-demo-labels">{markers.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{markers[selected].detail}</p>
    </div>
  </div>;
}
