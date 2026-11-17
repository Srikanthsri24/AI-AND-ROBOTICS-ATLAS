import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
type Trial={sill:number;shade:number;flag:boolean};
const initial:Trial={sill:24,shade:24,flag:false};
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Sill probe · A0',at:[.97,.94,.69],detail:'The probe reads air near the sill. The warning requires at least 31 °C at the sill.'},
  {name:'Shaded reference · A1',at:[-.91,1.12,.32],detail:'The hood shades this probe while leaving air space around it. Use its reading to compare local warming with a warm room.'},
  {name:'Window and shade',at:[1.26,2.47,-.28],detail:'The shade blocks the direct light patch in the model. Choose Sun on sill to warm the near-window probe without heating the reference.'},
  {name:'Warm-spot flag · D8',at:[-.27,.44,1.05],detail:'The flag also needs a difference of at least 4 °C. It clears when the difference drops to 2 °C or the sill cools to 29 °C.'},
];

function WindowBench({sill,shade,flag,selected,select}:{sill:number;shade:number;flag:boolean;selected:number;select:(i:number)=>void}){
  const sun=Math.max(0,sill-shade);
  return <>
    <color attach="background" args={['#3a4f60']}/>
    <hemisphereLight args={['#e5f1ff','#816d5a',2.02]}/>
    <directionalLight position={[-3,6,4]} intensity={2.15} color="#fff2db"/>
    <Box at={[0,-.092,0]} size={[4.79,.185,3.03]} color="#5c717d"/>
    <group onClick={()=>select(2)}>
      <Box at={[.90,1.36,-.42]} size={[2.45,2.43,.135]} color={selected===2?'#caa578':'#bdb5a9'}/>
      <Box at={[.90,1.60,-.34]} size={[2.04,1.62,.065]} color="#7f9fac" metal={.33}/>
      <Box at={[.90,1.60,-.298]} size={[.064,1.60,.046]} color="#d4d2c0"/>
      <Box at={[.90,1.59,-.297]} size={[2.04,.068,.047]} color="#d4d2bf"/>
      <Box at={[.90,.683,.23]} size={[2.62,.12,1.15]} color="#c1a58a"/>
      {[-.28,2.03].map(x=><Box key={x} at={[x,.36,-.11]} size={[.15,.62,.27]} color="#9c8f80"/>)}
      <Box at={[.39,2.401,-.269]} size={[1.03,.075,.073]} color="#8b9893" metal={.54}/>
      {[2.29,2.17,2.05,1.93,1.81].map(y=><Box key={y} at={[.39,y,-.235]} size={[1.03,.063,.061]} color="#a19b87"/>)}
      {sun>=3&&<mesh position={[1.18,.748,.36]} rotation={[-Math.PI/2,0,.10]}><planeGeometry args={[.84,.74]}/><meshBasicMaterial color="#f8d68c" transparent opacity={Math.min(.48,sun*.05)} depthWrite={false}/></mesh>}
    </group>
    {[{x:1,z:.50,y:.79},{x:-.94,z:.29,y:.79}].map(({x,y,z},index)=><group key={x} position={[x,y,z]} onClick={()=>select(index)}>
      <Box at={[0,-.062,0]} size={[.32,.046,.27]} color="#ddd8ca"/>
      <Box at={[0,.032,0]} size={[.149,.099,.096]} color={selected===index?'#dba978':'#2d383e'}/>
      {[-.044,0,.044].map(n=><Box key={n} at={[n,-.027,.056]} size={[.014,.075,.016]} color="#adb8be" metal={.64}/>)}
      {index===1&&<><Box at={[0,.181,-.052]} size={[.46,.054,.38]} color="#677b80"/><Box at={[0,.056,-.211]} size={[.46,.25,.054]} color="#677b80"/></>}
    </group>)}
    <Box at={[-.94,.354,.29]} size={[.39,.705,.40]} color="#a6b2ac"/>
    <group onClick={()=>select(3)}>
      <Box at={[-1.33,.131,1.06]} size={[.83,.076,.49]} color="#2c7890"/>
      <Box at={[-1.59,.199,1.11]} size={[.18,.117,.155]} color="#acbac2" metal={.68}/>
      <Box at={[-1.25,.193,1.06]} size={[.249,.055,.119]} color="#27323a"/>
      {[.895,1.228].map(z=><Box key={z} at={[-1.24,.184,z]} size={[.49,.059,.057]} color="#29333b"/>)}
      <Box at={[-.49,.122,1.015]} size={[.48,.089,.43]} color="#dfdacf"/>
      <Box at={[-.49,.186,.99]} size={[.32,.021,.022]} color="#adb8bd" metal={.6}/>
      <Box at={[-.49,.191,.99]} size={[.154,.051,.052]} color="#bca378"/>
      <mesh position={[-.26,.264,1.10]}><sphereGeometry args={[.066,21,14]}/><meshStandardMaterial color={flag?'#ff7549':'#9d4541'} emissive="#ff603d" emissiveIntensity={flag?2.1:0}/></mesh>
      {flag&&<pointLight position={[-.26,.32,1.11]} color="#ff7755" intensity={.94} distance={.83}/>}
    </group>
    <Line points={[[.99,.74,.56],[.89,.61,.74],[.65,.27,.86],[-.32,.21,.92],[-1.13,.197,.895]]} color="#d19c52" lineWidth={3}/>
    <Line points={[[-.94,.738,.34],[-.89,.31,.52],[-1.12,.21,.67],[-1.24,.19,.895]]} color="#608bb3" lineWidth={3}/>
    <Line points={[[1.045,.742,.56],[.94,.61,.78],[.70,.24,.97],[-.28,.19,1.15],[-1.18,.19,1.226]]} color="#35404a" lineWidth={2}/>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.006,0]} opacity={.33} scale={5.15} far={1.4} resolution={128} frames={1}/>
  </>;
}
export default function SunlitWindowDemo(){
  const [{sill,shade,flag},setTrial]=useState(initial);
  const [selected,select]=useState(0);
  const difference=sill-shade;
  function update(next:Partial<Pick<Trial,'sill'|'shade'>>){
    setTrial(previous=>{
      const {sill,shade}={...previous,...next};
      const difference=sill-shade;
      return {sill,shade,flag:(sill>=31&&difference>=4)||(sill>29&&difference>2&&previous.flag)};
    });
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D sunlit window monitor">
        <Canvas camera={{position:[2.46,3.45,6.48],fov:40}} dpr={[1,1.6]} fallback={<p>Compare the two readings below.</p>}>
          <WindowBench {...{sill,shade,flag,selected,select}}/><OrbitControls target={[0,1.0,0]} enablePan={false} minDistance={3.7} maxDistance={10}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Sunlit window readings">
        <div><span>Sill A0</span><strong>{sill} °C</strong></div><div><span>Shaded A1</span><strong>{shade} °C</strong></div><div><span>Sill minus shade</span><strong>{difference>0?'+':''}{difference} °C</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Compare local warmth with a warm room</h3>
      <label className="gp-home-light">Sill air <output>{sill} °C</output><input type="range" aria-label="Sill air" min="18" max="40" value={sill} onChange={e=>update({sill:e.target.valueAsNumber})}/></label>
      <label className="gp-home-light">Shaded air <output>{shade} °C</output><input type="range" aria-label="Shaded air" min="18" max="40" value={shade} onChange={e=>update({shade:e.target.valueAsNumber})}/></label>
      <div className="gp-steps">
        <button type="button" onClick={()=>update({sill:33,shade:26})}>Sun on sill</button>
        <button type="button" onClick={()=>update({sill:32,shade:32})}>Warm the whole room</button>
        <button type="button" onClick={()=>setTrial(initial)}>Reset trial</button>
      </div>
      <p role="status">{flag?'Local warm spot · Flag on.':'Flag off.'}</p>
      <p>The flag compares temperature readings. It indicates a local difference that can have more than one cause.</p>
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected].detail}</p>
    </div>
  </div>;
}
