import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { MathUtils, Shape, Vector3, type Group, type Mesh } from 'three';
import { dryDelayMs, rainServoAngles } from '../data/rain-clothesline';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
const pivot:Point=[1.12,.43,1.00];
const sliderZ=.32;
const crank=.87;
const rodLength=1.13;
const up=new Vector3(0,1,0);

function linkage(degrees:number){
  const angle=MathUtils.degToRad(180-degrees);
  const x=pivot[0]+crank*Math.cos(angle);
  const z=pivot[2]-crank*Math.sin(angle);
  const carriage=x-Math.sqrt(rodLength**2-(z-sliderZ)**2);
  return {x,z,carriage};
}

function Panel({at,size,color,metal=0}: {at:Point;size:Point;color:string;metal?:number}) {
  return <RoundedBox position={at} args={size} radius={.018} smoothness={2}>
    <meshStandardMaterial color={color} metalness={metal} roughness={.62}/>
  </RoundedBox>;
}

export function RainSensorPlate({selected=false,wet=false}: {selected?:boolean;wet?:boolean}) {
  return <>
    <Panel at={[0,.03,0]} size={[1.04,.045,.62]} color={selected?'#247b88':'#135e73'}/>
    <Panel at={[-.36,.091,0]} size={[.16,.095,.36]} color="#e3dcc8"/>
    <Panel at={[-.20,.062,0]} size={[.056,.027,.085]} color="#44454a"/>
    {Array.from({length:10},(_,i)=><Panel key={i} at={[.155,.057,-.218+i*.049]} size={[.58,.009,.027]} color="#a9b0ae" metal={.68}/>)}
    {wet&&[[.07,-.06],[.32,.12],[-.02,.13]].map(([x,z])=><mesh key={x} position={[x,.070,z]} scale={[1,.36,1]}>
      <sphereGeometry args={[.058,14,10]}/><meshStandardMaterial color="#79c7e6" metalness={.31} roughness={.16}/>
    </mesh>)}
  </>;
}

const inspection=[
  ['Rain sensing plate','A drop across adjacent exposed traces pulls D2 LOW. The tray keeps stray water away from the controller.'],
  ['Servo and pushrod','The Uno sends the position command on D9. The separate supply powers the servo. Its short rocker pulls or pushes the rigid link.'],
  ['Sliding clothesline','The carriage moves along two rails. After four continuous seconds dry, the same linkage returns it to the exposed position.'],
  ['Arduino controller','A new wet reading resets the dry timer. The Uno uses that timer to decide whether the carriage should stay covered.'],
] as const;

function Shirt({at,color,width}: {at:Point;color:string;width:number}) {
  const pattern=useMemo(()=>{
    const shape=new Shape();
    shape.moveTo(-.10,0);shape.lineTo(-.22,-.04);shape.lineTo(-.29,-.19);shape.lineTo(-.20,-.24);
    shape.lineTo(-.145,-.18);shape.lineTo(-.134,-.42);shape.lineTo(.134,-.42);
    shape.lineTo(.145,-.18);shape.lineTo(.20,-.24);shape.lineTo(.29,-.19);shape.lineTo(.22,-.04);
    shape.lineTo(.10,0);shape.quadraticCurveTo(0,-.105,-.10,0);shape.closePath();
    return shape;
  },[]);
  return <mesh position={at} scale={[width,1,1]}>
    <extrudeGeometry args={[pattern,{depth:.02,bevelEnabled:true,bevelSize:.007,bevelThickness:.006,steps:1,bevelSegments:1}]}/>
    <meshStandardMaterial color={color} roughness={.94}/>
  </mesh>;
}

function Rain({wet}: {wet:boolean}) {
  const drops=useRef<Group>(null);
  useFrame(({clock})=>{
    if(!wet) return;
    drops.current?.children.forEach((drop,i)=>{
      const t=(clock.elapsedTime*1.9+i*.137)%1;
      drop.position.set(1.45+((i*29)%17)/16*1.32,2.35-2.02*t,-.96+((i*11)%19)/13);
    });
  });
  return <group ref={drops} visible={wet}>
    {Array.from({length:24},(_,i)=><mesh key={i}>
      <cylinderGeometry args={[.012,.010,.15,5]}/><meshBasicMaterial color="#91d5fa" transparent opacity={.65}/>
    </mesh>)}
  </group>;
}

function Rack({covered,selected,select}: {covered:boolean;selected:number;select:(i:number)=>void}) {
  const carriage=useRef<Group>(null);
  const rocker=useRef<Mesh>(null);
  const rod=useRef<Mesh>(null);
  const present=useRef(rainServoAngles.covered);
  const from=useMemo(()=>new Vector3(),[]);
  const to=useMemo(()=>new Vector3(),[]);
  useFrame((_,delta)=>{
    if(!carriage.current||!rocker.current||!rod.current) return;
    present.current=MathUtils.damp(present.current,covered ? rainServoAngles.covered : rainServoAngles.outside,8,delta);
    const {x,z,carriage:travel}=linkage(present.current);
    carriage.current.position.x=travel;
    from.set(x,pivot[1],z);
    to.set(travel,pivot[1],sliderZ);
    rod.current.position.copy(from).add(to).multiplyScalar(.5);
    rod.current.quaternion.setFromUnitVectors(up,to.sub(from).normalize());
    from.set(pivot[0],pivot[1],pivot[2]);to.set(x,pivot[1],z);
    rocker.current.position.copy(from).add(to).multiplyScalar(.5);
    rocker.current.quaternion.setFromUnitVectors(up,to.sub(from).normalize());
  });
  return <>
    <group ref={carriage} position={[linkage(rainServoAngles.covered).carriage,0,0]}>
      <Panel at={[0,.139,0]} size={[1.13,.115,.72]} color={selected===2?'#c29b59':'#687b84'} metal={.32}/>
      {[-.49,.49].map(x=><group key={x}>
        <Panel at={[x,.66,-.04]} size={[.067,1.00,.072]} color="#779094" metal={.48}/>
        <Panel at={[x,.192,-.04]} size={[.15,.056,.15]} color="#829594" metal={.38}/>
      </group>)}
      <Line points={[[-.50,1.16,-.04],[.50,1.16,-.04]]} color="#ebe5d3" lineWidth={2}/>
      <Shirt at={[-.267,1.157,-.023]} color="#ce7d69" width={.68}/>
      <Panel at={[.056,.975,-.017]} size={[.18,.35,.026]} color="#e2ca87"/>
      <Panel at={[.311,1.002,-.018]} size={[.205,.307,.022]} color="#8bc0c6"/>
      {[-.31,-.20,.055,.31].map(x=><Panel key={x} at={[x,1.161,.006]} size={[.040,.095,.033]} color="#be9573"/>)}
      <Panel at={[0,.285,sliderZ]} size={[.11,.284,.105]} color="#616c70" metal={.43}/>
      <WorldLabel position={[0,.69,.42]} className="gp-marker-anchor">
        <button type="button" className="gp-marker" aria-label="Sliding clothesline" aria-pressed={selected===2} onClick={()=>select(2)}>3</button>
      </WorldLabel>
    </group>
    <mesh ref={rod}><cylinderGeometry args={[.026,.026,rodLength,14]}/><meshStandardMaterial color={selected===1?'#edbd72':'#aeb6bb'} metalness={.69}/></mesh>
    <mesh ref={rocker}><cylinderGeometry args={[.039,.048,crank,14]}/><meshStandardMaterial color={selected===1?'#e5bb73':'#d5d5c8'} metalness={.29}/></mesh>
  </>;
}

function Scene({wet,covered,selected,select}: {wet:boolean;covered:boolean;selected:number;select:(i:number)=>void}) {
  return <>
    <color attach="background" args={[wet?'#354a60':'#385268']}/>
    <ambientLight intensity={1.35}/>
    <directionalLight position={[3,6,4]} intensity={2.69}/>
    <directionalLight position={[-4,4,-4]} intensity={1.25} color="#b6d0ef"/>
    <Panel at={[0,-.15,0]} size={[6.45,.26,3.54]} color="#9b6d50"/>
    <Panel at={[0,.006,0]} size={[6.31,.073,3.40]} color="#598078"/>
    <Panel at={[-.20,.055,0]} size={[3.51,.05,1.05]} color="#9c8d73"/>
    {[-.31,.31].map(z=><Panel key={z} at={[-.20,.096,z]} size={[3.54,.051,.056]} color="#b2bbbb" metal={.62}/>)}
    {[-1.68,-.16].flatMap(x=>[-.66,.66].map(z=><Panel key={`${x}:${z}`} at={[x,.87,z]} size={[.09,1.66,.088]} color="#a67855"/>))}
    <group position={[-.91,1.77,0]} rotation={[.09,0,0]}>
      <Panel at={[0,0,0]} size={[1.84,.076,1.57]} color="#536778" metal={.21}/>
      {Array.from({length:12},(_,i)=><Panel key={i} at={[-.84+i*.15,.041,0]} size={[.031,.029,1.55]} color="#778994" metal={.34}/>)}
      <Panel at={[0,-.045,.77]} size={[1.90,.087,.068]} color="#425266"/>
    </group>
    <Panel at={[pivot[0],.22,pivot[2]]} size={[.41,.345,.29]} color={selected===1?'#a47b45':'#255978'}/>
    <Panel at={[pivot[0],.134,pivot[2]]} size={[.54,.069,.23]} color="#344c65"/>
    <mesh position={[pivot[0],.416,pivot[2]]}><cylinderGeometry args={[.116,.116,.058,24]}/><meshStandardMaterial color="#dedbc8"/></mesh>
    <Rack covered={covered} selected={selected} select={select}/>
    <Panel at={[2.04,.111,-.63]} size={[1.43,.15,1.02]} color="#647681" metal={.43}/>
    <Panel at={[2.04,.190,-.63]} size={[1.19,.026,.81]} color="#4b6571"/>
    <group position={[2.04,.212,-.63]} rotation={[0,.18,0]}><RainSensorPlate selected={selected===0} wet={wet}/></group>
    <Rain wet={wet}/>
    <Panel at={[-.76,.137,1.18]} size={[1.25,.09,.60]} color={selected===3?'#ab824f':'#268598'}/>
    <Panel at={[-1.20,.218,1.17]} size={[.21,.131,.24]} color="#b6bec6" metal={.67}/>
    <Panel at={[-.60,.208,1.23]} size={[.32,.054,.17]} color="#262d33"/>
    {[-.21,.21].map(z=><Panel key={z} at={[-.58,.212,1.18+z]} size={[.74,.067,.044]} color="#30353d"/>)}
    <Panel at={[2.54,.18,1.12]} size={[.67,.25,.53]} color="#303742"/>
    <Line points={[[1.63,.29,-.53],[1.48,.24,-.37],[.50,.16,-.59],[-1.53,.18,-.60],[-2.04,.20,1.1],[-1.12,.22,1.06]]}
      color="#e1ba6b" lineWidth={1.65}/>
    <Line points={[[.93,.24,1.0],[.55,.26,1.34],[.23,.24,1.41],[-.23,.22,1.41]]} color="#e28f58" lineWidth={1.66}/>
    <Line points={[[1.34,.22,1.04],[1.63,.24,1.24],[2.13,.25,1.13]]} color="#cb6965" lineWidth={1.66}/>
    {([{index:0,at:[2.05,.30,-.62],tag:[2.42,1.04,-.41]},
      {index:1,at:[1.11,.42,1.00],tag:[1.73,.74,1.37]},
      {index:3,at:[-.76,.24,1.18],tag:[-.93,.68,1.58]}] satisfies {index:number;at:Point;tag:Point}[]).map(({index,at,tag})=><group key={index}>
      <Line points={[at,tag]} color={index===selected?'#ffe29b':'#bdcdd5'} lineWidth={1.35}/>
      <WorldLabel position={tag} className="gp-marker-anchor">
        <button type="button" className="gp-marker" aria-label={inspection[index][0]} aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button>
      </WorldLabel>
    </group>)}
    <ContactShadows position={[0,.03,0]} opacity={.35} blur={2.3} scale={8} far={4}/>
  </>;
}

const trial=[{wet:true,duration:1500},{wet:false,duration:1700},{wet:true,duration:1400},{wet:false,duration:dryDelayMs+500}];

export default function RainClotheslineDemo() {
  const [wet,setWet]=useState(false);
  const [remaining,setRemaining]=useState(dryDelayMs);
  const [step,setStep]=useState<number|null>(null);
  const [selected,setSelected]=useState(0);
  const covered=wet||remaining>0;
  useEffect(()=>{
    if(wet||remaining===0) return;
    const end=performance.now()+remaining;
    const timer=window.setInterval(()=>setRemaining(Math.max(0,end-performance.now())),80);
    return ()=>window.clearInterval(timer);
  },[wet,remaining===0]);
  useEffect(()=>{
    if(step===null) return;
    const stage=trial[step];
    setWet(stage.wet);
    setRemaining(dryDelayMs);
    const timer=window.setTimeout(()=>setStep(step===trial.length-1?null:step+1),stage.duration);
    return ()=>window.clearTimeout(timer);
  },[step]);

  function changeWeather(value:boolean){
    setStep(null);
    if(wet!==value) {
      setWet(value);
      setRemaining(dryDelayMs);
    }
  }

  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive rain-protected clothesline">
        <Canvas dpr={[1,1.5]} camera={{position:[3.3,4.05,7.4],fov:43}} fallback={<p>The sensor controls and carriage readouts are available without WebGL.</p>}>
          <Scene wet={wet} covered={covered} selected={selected} select={setSelected}/>
          <OrbitControls target={[0,.62,0]} minDistance={4} maxDistance={13} enablePan={false} maxPolarAngle={Math.PI/2.06}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Clothesline readings">
        <div><span>Grove sensor</span><strong>{wet?'Wet · LOW':'Dry · HIGH'}</strong></div>
        <div><span>Dry wait remaining</span><strong>{wet?'Waiting for dry':`${(Math.ceil(remaining/100)/10).toFixed(1)} s`}</strong></div>
        <div><span>Carriage command</span><strong>{covered?'Shelter':'Extend'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Test a passing shower</h3>
      <p>Play a two-shower trial, or wet and dry the sensor yourself. Try adding a second drop before the dry wait finishes.</p>
      <div className="gp-steps">
        <button className="gp-button" type="button" onClick={()=>setStep(step===null?0:null)}>{step===null?'Play shower trial':'Stop trial'}</button>
        <button type="button" aria-pressed={wet} onClick={()=>changeWeather(true)}>Wet sensor</button>
        <button type="button" aria-pressed={!wet} onClick={()=>changeWeather(false)}>Dry sensor</button>
      </div>
      <p className="gp-demo-description" role="status">
        {wet?'The traces are wet. The servo commands the sheltered position and resets the dry wait.':
          covered?'The traces are dry. The controller waits four continuous seconds before extending.':
            'The full dry interval has elapsed. The servo returns the carriage to the exposed position.'}
      </p>
      <h4>Inspect the mechanism</h4>
      <ol className="gp-demo-labels">{inspection.map(([name],index)=><li key={name}>
        <button className="gp-part-label" type="button" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{inspection[selected][1]}</p>
    </div>
  </div>;
}
