import {useEffect,useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import type {Group} from 'three';
import {WorldLabel} from './LabWorkbench';
import {DrawerCabinet,SlidingDrawer} from './DrawerIndicatorParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const positions={Open:.84,Ajar:.21,Seated:0};
type Position=keyof typeof positions;
const parts:{name:string;at:Point;detail:string}[]=[
  {name:'Drawer and guides',at:[-.61,.83,.87],detail:'The guides keep the drawer aligned. Move it through open, ajar and seated positions.'},
  {name:'Rear tab and roller · D2',at:[.05,.79,-.60],detail:'The tab only closes the roller switch at the end of travel. The active-low input then reads LOW.'},
  {name:'Closed indicator · D8',at:[1.44,.43,.65],detail:'The LED turns on after the closure settles. It goes out when the roller releases.'},
  {name:'Arduino Uno',at:[1.36,.39,1.26],detail:'The Uno filters switch bounce and follows the stable position through D8.'},
];

function Bench({target,seated,selected,select,cutaway}:{target:Position;seated:boolean;selected:number;select:(i:number)=>void;cutaway:boolean}){
  const drawer=useRef<Group>(null);
  useFrame((_,delta)=>{
    if(!drawer.current)return;
    const position=drawer.current.position;
    position.z+=(positions[target]-position.z)*(1-Math.exp(-12*delta));
  });
  return <>
    <color attach="background" args={['#40525c']}/>
    <hemisphereLight args={['#ebf5ff','#947c68',2.1]}/><directionalLight position={[-3,6,4]} color="#fff2df" intensity={2.16}/>
    <Box at={[0,-.094,0]} size={[4.67,.19,3.23]} color="#81918a"/>
    <group position={[-.58,.035,-.37]} scale={[1.19,1.16,1.12]}>
      <DrawerCabinet cutaway={cutaway}/>
      <group ref={drawer} position={[0,.365,positions.Open]} onClick={()=>select(0)}><SlidingDrawer selected={selected===0}/></group>
    </group>
    <group position={[.02,.55,-1.20]} onClick={()=>select(1)}>
      <Box at={[0,0,0]} size={[.16,.16,.19]} color={selected===1?'#dba776':'#303d43'}/>
      <group position={[0,.079,.02]} rotation={[seated?-.08:.31,0,0]}>
        <Box at={[0,0,.09]} size={[.066,.027,.208]} color="#adbcc1" metal={.62}/>
        <mesh position={[0,.009,.183]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.042,.042,.062,22]}/><meshStandardMaterial color="#b9c7cb" metalness={.46}/></mesh>
      </group>
    </group>
    <group onClick={()=>select(2)}>
      <Box at={[1.47,.11,.62]} size={[.51,.11,.44]} color={selected===2?'#ddb385':'#e1ddd1'}/>
      <Box at={[1.40,.188,.62]} size={[.25,.038,.047]} color="#b19469"/>
      <mesh position={[1.58,.246,.64]}><sphereGeometry args={[.064,22,16]}/><meshStandardMaterial color={seated?'#8ce3b5':'#487764'} emissive="#6ee2a0" emissiveIntensity={seated?2.5:0}/></mesh>
      {seated&&<pointLight position={[1.58,.31,.64]} color="#7cebb0" intensity={1.1} distance={.79}/>}
    </group>
    <group onClick={()=>select(3)}>
      <Box at={[1.36,.096,1.17]} size={[.93,.082,.49]} color={selected===3?'#72aaa5':'#267885'}/>
      <Box at={[1.02,.172,1.23]} size={[.18,.112,.15]} color="#bdc8cc" metal={.62}/>
      <Box at={[1.48,.164,1.16]} size={[.24,.056,.103]} color="#26343b"/>
      {[.99,1.35].map(z=><Box key={z} at={[1.42,.16,z]} size={[.61,.052,.043]} color="#27343a"/>)}
    </group>
    <Line points={[[.05,.48,-1.20],[.51,.44,-.96],[.65,.13,-.42],[.86,.12,.53],[1.15,.177,.99]]} color="#e6af6b" lineWidth={2.8}/>
    <Line points={[[1.39,.19,.66],[1.33,.16,.82],[1.39,.17,.99]]} color="#78beae" lineWidth={2.8}/>
    {parts.map(({name,at},i)=><WorldLabel key={name} position={i===0&&target==='Open'?[-.66,.77,1.22]:at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={i===selected} onClick={()=>select(i)}>{i+1}{i===selected&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.34} scale={5.2} far={1.8} resolution={128} frames={1}/>
  </>;
}

export default function DrawerIndicatorDemo(){
  const [target,setTarget]=useState<Position>('Open');
  const [position,setPosition]=useState<Position>('Open');
  const [cutaway,setCutaway]=useState(true);
  const [selected,select]=useState(0);
  const moving=target!==position;
  const seated=!moving&&position==='Seated';
  useEffect(()=>{
    if(!moving)return;
    const timer=window.setTimeout(()=>setPosition(target),500);
    return ()=>window.clearTimeout(timer);
  },[target,moving]);
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D drawer closed indicator">
        <Canvas camera={{position:[2.03,3.35,6.4],fov:41}} dpr={[1,1.6]} fallback={<p>Use the positions and output readouts below.</p>}><Bench {...{target,seated,selected,select,cutaway}}/><OrbitControls target={[0,.49,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Drawer position readings"><div><span>Drawer</span><strong>{moving?'Moving':position}</strong></div><div><span>D2</span><strong>{seated?'LOW':'HIGH'}</strong></div><div><span>Indicator</span><strong>{seated?'On':'Off'}</strong></div></div>
    </div>
    <div className="gp-guide">
      <h3>Try the three drawer positions</h3>
      <p>Stop ajar before seating the drawer. The cutaway shows where the rear tab reaches the roller.</p>
      <div className="gp-steps">{(['Open','Ajar','Seated'] as const).map((value,i)=><button key={value} className={i===2?'gp-button':'gp-button gp-secondary'} aria-pressed={target===value} type="button" onClick={()=>{setTarget(value);select(0);}}>{['Open drawer','Leave ajar','Seat drawer'][i]}</button>)}</div>
      <div className="gp-steps"><button type="button" onClick={()=>setCutaway(!cutaway)}>{cutaway?'Show cabinet cover':'Show cutaway'}</button></div>
      <p role="status">{moving?'Drawer moving.':seated?'Roller pressed. Indicator on.':'Roller released. Indicator off.'}</p>
      <ol className="gp-demo-labels">{parts.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{parts[selected].detail}</p>
    </div>
  </div>;
}
