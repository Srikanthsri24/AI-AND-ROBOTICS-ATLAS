import {useEffect,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Interior photoresistor',at:[.18,.62,.03],detail:'A0 measures inside the tunnel. The hood shields the sensor from the entrance lamp.'},
  {name:'Movable shade screen',at:[1.05,1.83,-.30],detail:'The screen blocks daylight at the sensor without dimming the modeled road outside.'},
  {name:'Entrance lamp',at:[1.75,1.26,.79],detail:'D8 powers the entrance LED through its 220 Ω resistor. It turns off when the interior reaches 52%.'},
  {name:'Arduino and divider',at:[-1.12,.41,1.04],detail:'The Uno waits for a continuous 700 ms at or below 42%. A short interruption resets that wait.'},
];

function Tunnel({outside,covered,lit,selected,select}:{outside:number;covered:boolean;lit:boolean;selected:number;select:(i:number)=>void}){
  const ambient=.38+outside*.023;
  return <>
    <color attach="background" args={[outside<40?'#1d2e41':'#3a5063']}/>
    <hemisphereLight args={['#e1f1ff','#756857',ambient]}/>
    <directionalLight position={[-4,6,4]} intensity={ambient} color="#fff0d6"/>
    <Box at={[0,-.092,0]} size={[4.8,.185,3.2]} color="#596f76"/>
    <Box at={[1.04,.061,.02]} size={[2.28,.083,3.06]} color="#434c53"/>
    <Box at={[.06,.14,-.01]} size={[.21,.129,2.95]} color="#969e99"/>
    <Box at={[2.01,.14,-.01]} size={[.21,.129,2.95]} color="#969e99"/>
    {[-1.25,-.83,-.41,.01,.43,.85,1.27].map(z=><Box key={z} at={[1.03,.107,z]} size={[.042,.009,.21]} color="#d5ab63"/>)}
    <Box at={[1.04,1.18,-.80]} size={[1.97,.135,.83]} color="#747d81"/>
    <mesh position={[1.04,.51,-.80]} rotation={[-Math.PI/2,0,0]}><cylinderGeometry args={[.91,.91,.83,36,1,true,-Math.PI/2,Math.PI]}/><meshStandardMaterial color="#828c8d" roughness={.85} side={2}/></mesh>
    <Box at={[.17,.33,-.76]} size={[.12,.48,.93]} color="#838986"/>
    <Box at={[1.90,.33,-.76]} size={[.12,.48,.93]} color="#838986"/>
    <group position={[1.04,.55,.62]}>
      <mesh><torusGeometry args={[.86,.075,12,36,Math.PI]}/><meshStandardMaterial color="#a0a5a0" roughness={.7}/></mesh>
      {[-.86,.86].map(x=><Box key={x} at={[x,-.21,0]} size={[.151,.43,.151]} color="#9da6a1"/>)}
    </group>
    <group onClick={()=>select(1)}>
      <group position={[1.35,1.22,-.25]} rotation={[0,0,covered?0:-1.20]}>
        <Box at={[-.58,0,0]} size={[1.17,.062,.76]} color={selected===1?'#b28760':'#626f77'}/>
        <Box at={[-1.02,.055,.24]} size={[.19,.064,.075]} color="#a5aca7"/>
      </group>
      {covered&&<mesh position={[.73,.111,-.02]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[1.22,.97]}/><meshBasicMaterial color="#121f2c" transparent opacity={.30} depthWrite={false}/></mesh>}
    </group>
    <group onClick={()=>select(0)}>
      <Box at={[.23,.25,.008]} size={[.32,.12,.30]} color="#d9d8c9"/>
      <Box at={[.225,.265,.18]} size={[.30,.15,.058]} color="#69777a"/>
      <mesh position={[.23,.338,.01]}><cylinderGeometry args={[.068,.069,.043,24]}/><meshStandardMaterial color={selected===0?'#f0c184':'#c29d78'}/></mesh>
      <Line points={[[.193,.363,-.014],[.268,.363,-.014],[.268,.363,.009],[.195,.363,.009],[.195,.363,.033],[.266,.363,.033]]} color="#80503a" lineWidth={2}/>
    </group>
    <group onClick={()=>select(2)}>
      <Box at={[1.67,1.03,.725]} size={[.32,.138,.22]} color={selected===2?'#cca470':'#596d75'}/>
      <mesh position={[1.67,.948,.742]}><boxGeometry args={[.23,.039,.15]}/><meshStandardMaterial color="#e0dcca" emissive="#ffd095" emissiveIntensity={lit?2.0:0}/></mesh>
      {lit&&<pointLight position={[1.66,.857,.80]} color="#ffdb9e" intensity={5.4} distance={2.2}/>}
    </group>
    <group onClick={()=>select(3)}>
      <Box at={[-1.23,.118,1.07]} size={[.86,.078,.52]} color={selected===3?'#bc8b56':'#287991'}/>
      <Box at={[-1.51,.188,1.13]} size={[.175,.116,.16]} color="#adb9bf" metal={.68}/>
      <Box at={[-1.15,.187,1.07]} size={[.23,.052,.123]} color="#28333b"/>
      {[.89,1.25].map(z=><Box key={z} at={[-1.13,.176,z]} size={[.51,.052,.056]} color="#29333b"/>)}
      <Box at={[-.48,.112,1.07]} size={[.52,.092,.46]} color="#dedbd0"/>
      {[1,1.16].map(z=><group key={z} position={[-.48,.19,z]}><Box at={[0,0,0]} size={[.36,.022,.024]} color="#aeb6bb" metal={.6}/><Box at={[0,.008,0]} size={[.15,.052,.051]} color="#c2a57c"/></group>)}
    </group>
    <Line points={[[.22,.25,.12],[-.057,.19,.22],[-.25,.171,.61],[-.37,.19,1],[-1.08,.189,.89]]} color="#d39d58" lineWidth={3}/>
    <Line points={[[1.7,.98,.73],[1.93,.78,.73],[2.14,.18,.80],[1.91,.14,1.42],[-.30,.182,1.17]]} color="#658eb9" lineWidth={3}/>
    <Line points={[[1.77,.98,.70],[1.94,.74,.64],[2.19,.138,.82],[2.11,.125,1.46],[-1.01,.184,1.24]]} color="#303c45" lineWidth={2}/>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={i===1&&covered?[.74,1.45,-.28]:at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.006,0]} opacity={.34} scale={5.2} far={1.4} resolution={128} frames={1}/>
  </>;
}
export default function TunnelModelDemo(){
  const [outside,setOutside]=useState(80);
  const [shade,setShade]=useState<'open'|'brief'|'held'>('open');
  const [lit,setLit]=useState(false);
  const [selected,select]=useState(0);
  const interior=Math.max(0,outside-(shade==='open'?13:53));
  const dark=interior<=42;

  useEffect(()=>{
    if(interior>=52)setLit(false);
  },[interior]);

  useEffect(()=>{
    if(!dark||lit)return;
    const delay=window.setTimeout(()=>setLit(true),700);
    return ()=>window.clearTimeout(delay);
  },[dark,lit]);

  useEffect(()=>{
    if(shade!=='brief')return;
    const timer=window.setTimeout(()=>setShade('open'),300);
    return ()=>window.clearTimeout(timer);
  },[shade]);

  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D tunnel model light">
        <Canvas camera={{position:[-2.35,3.05,6.30],fov:42}} dpr={[1,1.6]} fallback={<p>Compare the approach and interior light below.</p>}>
          <Tunnel {...{outside,covered:shade!=='open',lit,selected,select}}/><OrbitControls target={[0,.57,0]} enablePan={false} minDistance={3.5} maxDistance={10}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Tunnel light readings"><div><span>Outside light</span><strong>{outside}%</strong></div><div><span>Interior A0</span><strong>{interior}%</strong></div><div><span>Entrance lamp</span><strong>{lit?'On':'Off'}</strong></div></div>
    </div>
    <div className="gp-guide">
      <h3>Compare a passing screen with held shade</h3>
      <label className="gp-home-light">Outside light <output>{outside}%</output><input aria-label="Outside light" type="range" min="0" max="100" value={outside} onChange={e=>setOutside(e.target.valueAsNumber)}/></label>
      <div className="gp-steps">
        <button type="button" onClick={()=>setShade('brief')} disabled={shade!=='open'}>Pass the screen</button>
        <button type="button" className="gp-button" onClick={()=>setShade(shade==='held'?'open':'held')}>{shade==='held'?'Remove screen':'Hold screen in place'}</button>
        <button type="button" onClick={()=>{setShade('open');setOutside(80);}}>Reset to daylight</button>
      </div>
      <p role="status">{lit?'Entrance lamp on.':dark?'Checking sustained interior shade.':'Entrance lamp off.'}</p>
      <p>At 42% or below the timer runs. After 700 ms the lamp turns on and stays on until the interior reaches 52%.</p>
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected].detail}</p>
    </div>
  </div>;
}
