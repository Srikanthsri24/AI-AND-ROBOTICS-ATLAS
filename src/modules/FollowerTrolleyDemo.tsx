import { useEffect,useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows,Line,OrbitControls } from '@react-three/drei';
import { trolleyControl,trolleyLimits,type TrolleyReading } from '../data/follower-trolley';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { Drv8833Part,HuskyLensPart } from './TrolleyParts';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Spot={x:number;z:number};
type Cart=Spot&{yaw:number;speed:number[];frames:number;following:boolean};
const initialCart:Cart={x:-.28,z:-1.38,yaw:0,speed:[0,0],frames:0,following:false};
const initialTarget={x:-.28,z:.81};
const labels=[
  ['Color camera','The camera reports the horizontal center and width of the learned color patch. Heading uses the center. Following distance uses the apparent width.'],
  ['Sonar clearance','The sonar checks the path in front. A near echo or timeout stops both wheels.'],
  ['Drive and wheels','The DRV8833 changes the two forward speeds independently. Slowing the inside wheel makes the trolley turn.'],
  ['Basket and chassis','The basket sits low on the model frame, with free space ahead of the sensors.'],
  ['Shopper color patch','The model follows this learned patch. Moving or hiding it changes the detection fed to the controller.'],
] as const;

function project(cart:Cart,point:Spot){
  const x=point.x-cart.x,z=point.z-cart.z;
  return {side:Math.cos(cart.yaw)*x-Math.sin(cart.yaw)*z,forward:Math.sin(cart.yaw)*x+Math.cos(cart.yaw)*z};
}
function relative(cart:Cart,side:number,forward:number):Spot{
  return {x:cart.x+Math.cos(cart.yaw)*side+Math.sin(cart.yaw)*forward,z:cart.z-Math.sin(cart.yaw)*side+Math.cos(cart.yaw)*forward};
}
function readSensors(cart:Cart,target:Spot,hidden:boolean,obstacle:Spot|null,echoOff:boolean):TrolleyReading{
  const position=project(cart,target);
  const x=160+position.side*154/Math.max(.2,position.forward);
  const visible=!hidden&&position.forward>.20&&x>0&&x<320;
  let echo=122;
  if(Math.abs(position.side)<.48&&position.forward>.73)echo=Math.min(echo,(position.forward-.73)*50);
  if(obstacle){
    const block=project(cart,obstacle);
    if(Math.abs(block.side)<.53&&block.forward>.73)echo=Math.min(echo,(block.forward-.865)*50);
  }
  return {x:visible?Math.round(x):-1,width:visible?Math.round(77/position.forward):0,visible,echo:echoOff?null:Math.max(3,Math.round(echo))};
}
function Marker({i,at,selected,select}:{i:number;at:Point;selected:number;select:(n:number)=>void}){
  return <WorldLabel position={at} className="gp-marker-anchor">
    <button className="gp-marker" type="button" aria-label={labels[i][0]} aria-pressed={selected===i} onClick={()=>select(i)}>
      {i+1}{selected===i&&<span className="gp-demo-marker-name">{labels[i][0]}</span>}
    </button>
  </WorldLabel>;
}
function Basket({selected}:{selected:boolean}){
  const metal=selected?'#d3ad71':'#aab0ad';
  return <>
    <Box at={[0,.015,0]} size={[.97,.047,1.12]} color="#6f7c82"/>
    {[-.48,.48].map(x=><group key={x}>
      <Box at={[x,.348,0]} size={[.026,.034,1.17]} color={metal} metal={.64}/>
      {Array.from({length:12},(_,i)=><Box key={i} at={[x,.182,(i-5.5)*.102]} size={[.011,.34,.014]} color={metal} metal={.68}/>)}
      {[.083,.168,.259].map(y=><Box key={y} at={[x,y,0]} size={[.013,.012,1.15]} color={metal} metal={.70}/>)}
    </group>)}
    {[-.566,.566].map(z=><group key={z}>
      <Box at={[0,.348,z]} size={[.98,.034,.027]} color={metal} metal={.64}/>
      {Array.from({length:10},(_,i)=><Box key={i} at={[(i-4.5)*.101,.182,z]} size={[.012,.34,.011]} color={metal} metal={.68}/>)}
      {[.083,.168,.259].map(y=><Box key={y} at={[0,y,z]} size={[.96,.012,.012]} color={metal} metal={.71}/>)}
    </group>)}
    <Box at={[-.22,.14,-.16]} size={[.29,.24,.38]} color="#ba8b61"/>
    <Box at={[.12,.095,.17]} size={[.27,.15,.20]} color="#647d77"/>
  </>;
}
function TrolleyField({cart,target,hidden,obstacle,input,selected,select,blocked}:{
  cart:Cart;target:Spot;hidden:boolean;obstacle:Spot|null;input:TrolleyReading;selected:number;select:(n:number)=>void;blocked:boolean;
}){
  return <>
    <color attach="background" args={['#283f4c']}/>
    <hemisphereLight args={['#e8f3ff','#6d5e50',2.35]}/>
    <directionalLight position={[-4,7,5]} intensity={2.75}/>
    <Box at={[0,-.14,0]} size={[6.38,.25,5.76]} color="#5b6b73"/>
    <Box at={[0,.009,0]} size={[6.28,.036,5.66]} color="#8c9690"/>
    {[-1.88,1.88].map(x=><Box key={x} at={[x,.038,0]} size={[.033,.014,5.45]} color="#d6b976"/>)}
    {[-2.56,2.54].map(x=><group key={x} position={[x,.03,-.15]}>
      {[-1.80,.30,1.82].map(z=><Box key={z} at={[0,.38,z]} size={[.39,.76,.062]} color="#576971" metal={.58}/>)}
      {[.14,.47,.78].map(y=><Box key={y} at={[0,y,0]} size={[.53,.060,4.02]} color="#a9aa96"/>)}
      {[-1.39,-.91,-.42,.07,.59,1.07,1.55].map((z,i)=><Box key={z} at={[0,.643,z]} size={[.32,.257,.28]} color={['#9b7358','#6e8e86','#bca66f'][i%3]}/>)}
    </group>)}
    <Box at={[0,.22,2.69]} size={[3.68,.40,.087]} color="#778781"/>
    <group position={[target.x,.04,target.z]} onClick={()=>select(4)}>
      <Box at={[0,.03,.09]} size={[.69,.075,.40]} color="#62747d" metal={.33}/>
      <Box at={[0,.56,.12]} size={[.087,.98,.079]} color="#6f7f87" metal={.53}/>
      <Box at={[0,.625,0]} size={[.63,1.01,.084]} color={selected===4?'#dec18b':'#a5a8a1'}/>
      {!hidden&&<Box at={[0,.79,-.052]} size={[.40,.27,.024]} color="#e97137"/>}
      <Line points={[[0,1.13,.02],[-.36,1.44,.08]]} color="#b8c4b6" lineWidth={1.25}/>
      <Marker i={4} at={[-.39,1.49,.08]} {...{selected,select}}/>
    </group>
    {!!obstacle&&<group position={[obstacle.x,.07,obstacle.z]}>
      <Box at={[0,.161,0]} size={[.52,.322,.27]} color="#b39063"/>
      <Box at={[0,.33,0]} size={[.49,.019,.24]} color="#c1a076"/>
      <Box at={[0,.191,-.142]} size={[.24,.145,.012]} color="#e0d0a4"/>
    </group>}
    <group position={[cart.x,.035,cart.z]} rotation={[0,cart.yaw,0]}>
      <Box at={[0,.247,0]} size={[1.16,.093,1.31]} color="#536169" metal={.47}/>
      <group position={[0,.32,-.12]} onClick={()=>select(3)}><Basket selected={selected===3}/></group>
      <group position={[-.24,.34,.54]} scale={.45} onClick={()=>select(2)}><Drv8833Part/></group>
      {[-.635,.635].map((x,i)=><group key={x} position={[x,.173,.245]} rotation={[cart.speed[i],0,0]} onClick={()=>select(2)}>
        <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.171,.171,.133,27]}/><meshStandardMaterial color="#212831" roughness={.85}/></mesh>
        <mesh position={[Math.sign(x)*.074,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.103,.103,.024,22]}/><meshStandardMaterial color={selected===2?'#e7bd73':'#aaa58c'} metalness={.49}/></mesh>
        <Box at={[Math.sign(x)*.092,.043,0]} size={[.012,.029,.051]} color="#586271"/>
      </group>)}
      <mesh position={[0,.079,-.53]}><sphereGeometry args={[.087,20,16]}/><meshStandardMaterial color="#7e8a8e" metalness={.52}/></mesh>
      <group position={[.0,.62,.655]} scale={.65} onClick={()=>select(0)}><HuskyLensPart selected={selected===0} tracking={input.visible}/></group>
      <group position={[.009,.299,.675]} onClick={()=>select(1)}>
        <Box at={[0,0,0]} size={[.48,.16,.064]} color={selected===1?'#dfb66a':'#306780'}/>
        {[-.122,.122].map(x=><group key={x} position={[x,0,.055]} rotation={[Math.PI/2,0,0]}>
          <mesh><cylinderGeometry args={[.068,.068,.066,24]}/><meshStandardMaterial color="#c4c5c1" metalness={.65}/></mesh>
          <mesh position={[0,.04,0]}><cylinderGeometry args={[.049,.049,.012,22]}/><meshStandardMaterial color="#333e43"/></mesh>
        </group>)}
      </group>
      {input.echo!==null&&<Line points={[[0,.31,.73],[0,.31,.73+Math.min(1.2,input.echo/50)]]} color={blocked?'#f6a17a':'#98dadc'} dashed dashSize={.075} gapSize={.048} lineWidth={2}/>}
      <Marker i={0} at={[.22,.85,.72]} {...{selected,select}}/>
      <Marker i={1} at={[-.28,.46,.86]} {...{selected,select}}/>
      <Marker i={2} at={[-.76,.49,.25]} {...{selected,select}}/>
      <Marker i={3} at={[.08,.83,-.39]} {...{selected,select}}/>
    </group>
    <ContactShadows position={[0,.027,0]} opacity={.37} scale={6.2} blur={2.2} far={1.3} resolution={128}/>
  </>;
}

export default function FollowerTrolleyDemo(){
  const [cart,setCart]=useState(initialCart);
  const [target,setTarget]=useState(initialTarget);
  const [enabled,setEnabled]=useState(false);
  const [hidden,setHidden]=useState(false);
  const [obstacle,setObstacle]=useState<Spot|null>(null);
  const [echoOff,setEchoOff]=useState(false);
  const [selected,select]=useState(0);
  const input=readSensors(cart,target,hidden,obstacle,echoOff);
  const decision=trolleyControl(input,enabled,cart.frames,cart.following);
  useEffect(()=>{
    if(!enabled)return;
    const timer=window.setInterval(()=>setCart(previous=>{
      const readings=readSensors(previous,target,hidden,obstacle,echoOff);
      const valid=readings.visible&&readings.width>=trolleyLimits.minimumWidth&&readings.echo!==null&&readings.echo>=trolleyLimits.near;
      const frames=valid?Math.min(2,previous.frames+1):0;
      const result=trolleyControl(readings,true,frames,previous.following);
      const going=result.reason==='following';
      const speed=(result.left+result.right)*.00019;
      const yaw=previous.yaw+(result.left-result.right)*.00061;
      const x=previous.x+Math.sin(yaw)*speed;
      const z=previous.z+Math.cos(yaw)*speed;
      return {...previous,x:Math.max(-1.36,Math.min(1.36,x)),z:Math.max(-1.89,Math.min(1.88,z)),yaw,frames,following:going,
        speed:[previous.speed[0]+result.left*.0031,previous.speed[1]+result.right*.0031]};
    }),70);
    return ()=>window.clearInterval(timer);
  },[enabled,target,hidden,obstacle,echoOff]);
  function moveTarget(side:number,forward:number){
    const position=relative(cart,side,forward);
    setTarget({x:Math.min(1.56,Math.max(-1.56,position.x)),z:Math.min(2.38,Math.max(-2.3,position.z))});
    setHidden(false);
  }
  const status={parked:'Parked · Drive off','echo missing':'Echo missing · Drive off','too close':'Object too close · Drive off',
    'target lost':'Color target lost · Drive off',acquiring:'Acquiring two good frames','holding gap':'Holding the gap · Drive off',
    following:decision.left===decision.right?'Following straight':decision.left>decision.right?'Steering right':'Steering left'}[decision.reason];
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D shopping trolley aisle">
        <Canvas camera={{position:[3.4,4.65,6.20],fov:44}} dpr={[1,1.6]} fallback={<p>Use the readings to follow the sensors and motors.</p>}>
          <TrolleyField {...{cart,target,hidden,obstacle,input,selected,select}} blocked={decision.reason==='too close'}/>
          <OrbitControls target={[0,.28,.06]} minDistance={4} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Trolley sensor readings">
        <div><span>Color center / width</span><strong>{input.visible?input.x+' / '+input.width+' px':'No ID1'}</strong></div>
        <div><span>Front clearance</span><strong>{input.echo===null?'No echo':input.echo+' cm'}</strong></div>
        <div><span>Left / right PWM</span><strong>{decision.left+' / '+decision.right}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Follow the model shopper</h3>
      <p>Start following, move the learned patch and compare the wheel outputs. Put a plain box ahead or hide the color patch to see the two ways the trolley stops.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>{setEnabled(!enabled);setCart(value=>({...value,frames:0,following:false}));}}>{enabled?'Park trolley':'Start following'}</button>
        <button type="button" onClick={()=>{setCart(initialCart);setTarget(initialTarget);setEnabled(false);setHidden(false);setObstacle(null);setEchoOff(false);}}>Reset aisle</button>
      </div>
      <div className="gp-steps" role="group" aria-label="Shopper position">
        <button type="button" onClick={()=>moveTarget(0,2.04)}>Move shopper ahead</button>
        <button type="button" onClick={()=>moveTarget(-.75,1.85)}>Move shopper left</button>
        <button type="button" onClick={()=>moveTarget(.75,1.85)}>Move shopper right</button>
        <button type="button" onClick={()=>moveTarget(0,1.15)}>Step close</button>
      </div>
      <div className="gp-steps" role="group" aria-label="Signal interruptions">
        <button type="button" aria-pressed={hidden} onClick={()=>setHidden(!hidden)}>{hidden?'Show color patch':'Hide color patch'}</button>
        <button type="button" aria-pressed={!!obstacle} onClick={()=>setObstacle(obstacle?null:relative(cart,0,.99))}>{obstacle?'Remove obstacle':'Place obstacle'}</button>
        <button type="button" aria-pressed={echoOff} onClick={()=>setEchoOff(!echoOff)}>{echoOff?'Restore echo':'Interrupt echo'}</button>
      </div>
      <p role="status" className="gp-demo-description">{status}</p>
      <figure className="gp-trolley-camera">
        <figcaption><strong>Camera frame</strong><span>Center at 160 px</span></figcaption>
        <div aria-hidden="true">
          {input.visible&&<b style={{left:input.x/3.2+'%',width:input.width/3.2+'%'}}>ID1</b>}
        </div>
      </figure>
      <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={i===selected} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected][1]}</p>
    </div>
  </div>;
}
