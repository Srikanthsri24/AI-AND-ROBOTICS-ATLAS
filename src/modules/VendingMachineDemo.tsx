import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { MathUtils } from 'three';
import { vendingLanes,vendTiming } from '../data/four-slot-vending';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Vend={lane:number;ms:number;jam:boolean};
type Machine={credit:number;stock:number[];vend:Vend|null;locked:boolean;last:number|null;notice:string};
const initial:Machine={credit:0,stock:[2,2,2,2],vend:null,locked:false,last:null,notice:'Insert a test token to add credit.'};
const laneX=(i:number)=>-.99+(i-1.5)*.655;
const labels=['Classic lane','Cherry lane','Citrus lane','Zero lane','Token gate','Chute sensor'] as const;
const details=[
  'This gate releases one can after the selected lane passes both credit and stock checks.',
  'This gate has its own servo and inventory count. One completed vend uses two credits.',
  'The four lanes share a single exit detector but keep separate inventory counts.',
  'The controller checks the three-credit price before opening this gate.',
  'One interrupted beam counts a classroom token. A new token must clear the path before another can register.',
  'Credit is deducted only after the common chute detects a passage. A timeout locks the gates.',
] as const;

function Can({at,color,rotation=0}:{at:Point;color:string;rotation?:number}){
  return <group position={at} rotation={[0,rotation,Math.PI/2]}>
    <mesh><cylinderGeometry args={[.145,.145,.395,30]}/><meshStandardMaterial color={color} metalness={.39} roughness={.41}/></mesh>
    {[-.203,.203].map(y=><mesh key={y} position={[0,y,0]}><cylinderGeometry args={[.144,.144,.019,28]}/><meshStandardMaterial color="#bfc7cb" metalness={.78} roughness={.33}/></mesh>)}
    <mesh><cylinderGeometry args={[.146,.146,.071,30]}/><meshStandardMaterial color="#ebd9b8" metalness={.22}/></mesh>
  </group>;
}
function Marker({i,at,selected,select}:{i:number;at:Point;selected:number;select:(index:number)=>void}){
  return <WorldLabel position={at} className="gp-marker-anchor">
    <button type="button" className="gp-marker" aria-label={labels[i]} aria-pressed={selected===i} onClick={()=>select(i)}>
      {i+1}{selected===i&&<span className="gp-demo-marker-name">{labels[i]}</span>}
    </button>
  </WorldLabel>;
}
function Cabinet({machine,selected,select,choose,insert,labelsOn,tokenAt}:{tokenAt:number;machine:Machine;selected:number;select:(index:number)=>void;choose:(lane:number)=>void;insert:()=>void;labelsOn:boolean}){
  const active=machine.vend;
  const falling=active&&!active.jam&&active.ms>=330;
  const fraction=active?MathUtils.clamp((active.ms-330)/(vendTiming.confirmMs-330),0,1):0;
  const glow=active&&!active.jam&&active.ms>=730&&active.ms<vendTiming.confirmMs;
  const mark=(i:number,at:Point)=>labelsOn?<Marker {...{i,at,selected,select}}/>:null;
  return <>
    <color attach="background" args={['#263549']}/>
    <hemisphereLight args={['#e3efff','#6b5947',2.4]}/>
    <directionalLight position={[-4,7,6]} intensity={2.32}/>
    <Box at={[0,-.14,0]} size={[6.04,.24,4.06]} color="#566b7b"/>
    <Box at={[-.98,.11,-.20]} size={[3.06,.24,1.52]} color="#3b4c5d"/>
    <Box at={[-.98,1.55,-.88]} size={[2.94,2.80,.12]} color="#876c57"/>
    <Box at={[-.98,2.98,-.19]} size={[3.02,.12,1.47]} color="#ac8c69"/>
    {[-2.43,.48].map(x=><Box key={x} at={[x,1.59,-.28]} size={[.12,2.78,1.36]} color="#b79a77"/>)}
    {Array.from({length:5},(_,i)=><Box key={i} at={[laneX(0)-.31+i*.655,2.13,-.35]} size={[.046,1.52,1.04]} color="#ae9173"/>)}
    {vendingLanes.map(({color},i)=>{
      const x=laneX(i), releasing=active?.lane===i;
      const open=releasing&&active.ms<vendTiming.gateMs;
      return <group key={i} onClick={()=>select(i)}>
        <group position={[x,1.78,-.30]} rotation={[.22,0,0]}><Box at={[0,0,0]} size={[.58,.078,.98]} color="#b99673"/></group>
        <Box at={[x,2.77,.53]} size={[.49,.24,.048]} color={color}/>
        {Array.from({length:Math.max(0,machine.stock[i]-(releasing&&falling?1:0))},(_,n)=>
          <Can key={n} at={[x,1.89+n*.33,.13-n*.22]} color={color}/>)}
        <group position={[x,1.73,.44]} rotation={[open?-.98:0,0,0]}>
          <Box at={[0,.056,0]} size={[.47,.11,.104]} color={selected===i?'#e2ba69':'#465e6b'} metal={.48}/>
        </group>
        <group position={[x,1.24,.58]} onClick={event=>{event.stopPropagation();select(i);choose(i);}}>
          <Box at={[0,0,0]} size={[.37,.24,.11]} color="#293743"/>
          <mesh position={[0,0,.075]} rotation={[Math.PI/2,0,0]}>
            <cylinderGeometry args={[.084,.084,.053,22]}/><meshStandardMaterial color={selected===i?'#daba6f':color}/>
          </mesh>
        </group>
        {mark(i,[x,2.50,.56])}
      </group>;
    })}
    <Box at={[-.98,.90,-.27]} size={[2.79,.09,.93]} color="#a48160"/>
    <Box at={[-.98,.31,.46]} size={[1.27,.13,.69]} color="#3c4b57"/>
    <Box at={[-.98,.41,.80]} size={[1.28,.13,.073]} color="#6c7d86" metal={.38}/>
    {[-1.51,-.44].map(x=><group key={x} onClick={()=>select(5)}>
      <Box at={[x,.72,.37]} size={[.105,.17,.17]} color={selected===5?'#c4a55d':'#26343e'}/>
    </group>)}
    <Line points={[[-1.48,.72,.37],[-.47,.72,.37]]} color={glow?'#dd8963':'#70abb7'} lineWidth={2} dashed dashSize={.055} gapSize={.045}/>
    {mark(5,[-.45,.88,.63])}
    {falling&&active&&<Can at={[MathUtils.lerp(laneX(active.lane),-.98,fraction),MathUtils.lerp(1.79,.51,fraction),MathUtils.lerp(.32,.57,fraction)]}
      color={vendingLanes[active.lane].color} rotation={fraction*.64}/>}
    {!active&&machine.last!==null&&<Can at={[-.98,.50,.53]} color={vendingLanes[machine.last].color}/>}
    <group position={[1.40,.045,.26]} onClick={()=>{select(4);insert();}}>
      <Box at={[0,.40,0]} size={[.72,.76,.34]} color={selected===4?'#cca860':'#5c6e7a'}/>
      <Box at={[0,.56,.18]} size={[.38,.064,.028]} color="#202831"/>
      <mesh position={[0,.73,.17]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.14,.14,.048,26]}/><meshStandardMaterial color="#d6b56d" metalness={.67}/></mesh>
    </group>
    {tokenAt>=0&&<mesh position={[1.40,1.05-tokenAt*.43,.49-tokenAt*.22]} rotation={[Math.PI/2,0,tokenAt*3]}>
      <cylinderGeometry args={[.11,.11,.027,24]}/><meshStandardMaterial color="#ecbd6a" metalness={.7}/>
    </mesh>}
    {mark(4,[1.42,.98,.42])}
    <group position={[1.71,.084,-.97]} scale={1.46}><Uno at={[0,0,0]}/></group>
    <Line points={[[1.42,.37,.10],[1.42,.13,-.45],[1.72,.34,-.59]]} color="#d49862" lineWidth={2.6}/>
    <Line points={[[.56,.31,-.28],[.75,.11,-.60],[1.18,.35,-.60]]} color="#70afbe" lineWidth={2.7}/>
  </>;
}

function advance(m:Machine):Machine{
  if(!m.vend)return m;
  const vend={...m.vend,ms:m.vend.ms+40};
  if(!vend.jam&&vend.ms>=vendTiming.confirmMs){
    return {...m,vend:null,last:vend.lane,credit:m.credit-vendingLanes[vend.lane].price,
      stock:m.stock.map((n,i)=>i===vend.lane?n-1:n),notice:'Chute confirmed · Credit deducted'};
  }
  if(vend.jam&&vend.ms>=vendTiming.expireMs)return {...m,vend:null,locked:true,notice:'Chute timeout · Credit unchanged · Dispense locked'};
  return {...m,vend};
}
export default function VendingMachineDemo(){
  const [machine,setMachine]=useState<Machine>(initial);
  const [jam,setJam]=useState(false);
  const [selected,select]=useState(0);
  const [labelsOn,setLabels]=useState(true);
  const [tokenAt,setTokenAt]=useState(-1);
  const tokenMoving=tokenAt>=0;
  useEffect(()=>{
    if(!tokenMoving)return;
    const timer=window.setInterval(()=>setTokenAt(value=>value>=1?-1:value+.13),40);
    return ()=>window.clearInterval(timer);
  },[tokenMoving]);
  const running=!!machine.vend;
  useEffect(()=>{
    if(!running)return;
    const timer=window.setInterval(()=>setMachine(advance),40);
    return ()=>window.clearInterval(timer);
  },[running]);
  function insert(){setTokenAt(0);setMachine(value=>({...value,credit:Math.min(12,value.credit+1),notice:value.locked?value.notice:'Token accepted'}));}
  function choose(i:number){
    setMachine(value=>{
      if(value.vend||value.locked)return value;
      if(!value.stock[i])return {...value,notice:'Lane empty'};
      if(value.credit<vendingLanes[i].price)return {...value,notice:'More credit needed'};
      return {...value,last:null,vend:{lane:i,ms:0,jam},notice:`Opening ${vendingLanes[i].name} lane`};
    });
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D four-slot cola vending machine">
        <Canvas camera={{position:[3.4,4.5,7.3],fov:42}} dpr={[1,1.6]} fallback={<p>Use the token, lane and chute controls to test a sale.</p>}>
          <Cabinet {...{machine,selected,select,choose,insert,labelsOn,tokenAt}}/>
          <OrbitControls target={[0,1.12,.10]} minDistance={5} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Vending readouts">
        <div><span>Credit</span><strong>{machine.credit}</strong></div>
        <div><span>Total stock</span><strong>{machine.stock.reduce((sum,n)=>sum+n,0)}</strong></div>
        <div><span>Chute</span><strong>{machine.locked?'Locked':running?'Waiting for can':machine.last!==null?'Confirmed':'Clear'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Try a sale and a chute timeout</h3>
      <p>Add enough tokens for a lane, then watch the gate and the common chute. Simulate a jam to see what happens to the balance without a confirmation.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={insert}>Insert token</button>
        <button type="button" aria-pressed={jam} disabled={running||machine.locked} onClick={()=>setJam(!jam)}>Simulate jam</button>
        <button type="button" onClick={()=>{setMachine(initial);setJam(false);setTokenAt(-1);}}>Reset and reload</button>
        <button type="button" aria-pressed={labelsOn} onClick={()=>setLabels(value=>!value)}>Scene labels</button>
      </div>
      <div className="gp-steps" role="group" aria-label="Vending lane controls">
        {vendingLanes.map(({name,price},i)=><button key={name} type="button" disabled={running||machine.locked} onClick={()=>{select(i);choose(i);}}>
          {name} · {price} credit{price===1?'':'s'} · {machine.stock[i]} left
        </button>)}
      </div>
      <p role="status" className="gp-demo-description">{machine.notice}</p>
      <ol className="gp-demo-labels">{labels.map((name,i)=><li key={name}><button className="gp-part-label" type="button" aria-pressed={selected===i}
        onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{details[selected]}</p>
    </div>
  </div>;
}
