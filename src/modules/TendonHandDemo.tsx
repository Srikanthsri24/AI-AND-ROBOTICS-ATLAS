import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { WorldLabel } from './LabWorkbench';
import { SolarMeterSolid as Box } from './SolarMeterParts';

type Point=[number,number,number];
const labels=[
 ['Wrist servo','The horn takes up the cord as the command moves from 80° to 105°. The demo shows motion and relative tension.'],
 ['First hinge','The pulled tendon runs below this joint axis. That offset makes the first link curl.'],
 ['Second hinge','The same cord crosses the second hinge and pulls on the fingertip rather than using a second servo.'],
 ['Palm-side tendon','The golden line shows the nylon route under the two hinges. It relaxes as the servo releases.'],
 ['Elastic return','The blue elastic runs over the back of the finger. Its stretch pulls the finger toward the open position.'],
];
function offset(at:Point,x:number,y:number,angle:number,z=0):Point {
 return [at[0]+x*Math.cos(angle)-y*Math.sin(angle),at[1]+x*Math.sin(angle)+y*Math.cos(angle),at[2]+z];
}
function HandScene({amount,selected,select}:{amount:number;selected:number;select:(index:number)=>void}){
 const a=-amount*.72,b=a-amount*.78;
 const knuckle:Point=[-.16,1.38,.14];
 const middle=offset(knuckle,.83,0,a);
 const tip=offset(middle,.67,0,b);
 const horn=-amount*.44;
 const tendon:Point[]=[offset([-1.12,1.03,.41],.20,.14,horn),[-.66,1.20,.35],offset(knuckle,.03,-.115,a,.21),offset(middle,.04,-.105,b,.21),offset(tip,-.13,-.090,b,.21)];
 const elastic:Point[]=[[-.62,1.54,.23],offset(knuckle,.10,.117,a,.09),offset(middle,.08,.117,b,.09),offset(tip,-.12,.080,b,.09)];
 const links:[Point,number,number][]=[[knuckle,a,.83],[middle,b,.67]];
 const anchors:Point[]=[[-1.28,1.55,.58],offset(knuckle,0,.36,a,.15),offset(middle,0,.40,b,.15),offset(middle,0,-.35,b,.34),offset(tip,-.12,.34,b,-.10)];
 return <>
  <color attach="background" args={['#253c4b']}/><hemisphereLight args={['#e3efff','#8f7460',2.2]}/><directionalLight position={[-3,7,6]} intensity={2.65} color="#fff3de"/>
  <RoundedBox args={[4.75,.24,2.83]} radius={.061} position={[0,-.125,0]}><meshStandardMaterial color="#71838a" roughness={.73}/></RoundedBox>
  <Box at={[-.94,.15,0]} size={[.84,.25,1.03]} color="#667982" metal={.43}/>
  <Box at={[-.96,.67,0]} size={[.18,1.07,.60]} color="#6c828d" metal={.54}/>
  <Box at={[-.80,1.32,.0]} size={[1.26,.17,.76]} color="#b69b77"/>
  <Box at={[-.80,1.412,.0]} size={[1.18,.025,.69]} color="#d2b68d"/>
  {[-.99,-.63,-.29].map(x=><Box key={x} at={[x,1.421,.01]} size={[.012,.006,.65]} color="#8d745a"/>)}
  <group onClick={()=>select(0)}>
   <Box at={[-1.12,1.00,.25]} size={[.47,.32,.31]} color={selected===0?'#d9ad6e':'#386987'} metal={.26}/>
   <Box at={[-1.12,1.03,.41]} size={[.15,.14,.065]} color="#b0c2cd" metal={.64}/>
   <group position={[-1.12,1.03,.46]} rotation={[0,0,horn]}><Box at={[.10,.076,0]} size={[.30,.073,.047]} color="#e0dccb"/></group>
  </group>
  {links.map(([base,angle,size],index)=>{
   return <group key={index} position={base} rotation={[0,0,angle]} onClick={()=>select(index+1)}>
    <Box at={[size*.49,0,0]} size={[size,.173,.39]} color={selected===index+1?'#e2ad64':'#bca17c'}/>
    <Box at={[size*.48,.086,0]} size={[size*.87,.021,.32]} color="#d9bd93"/>
    <Box at={[size*.61,-.095,.18]} size={[.06,.061,.053]} color="#6f7e83" metal={.65}/>
    <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.081,.081,.49,24]}/><meshStandardMaterial color="#a0b5bd" metalness={.72} roughness={.34}/></mesh>
    <mesh position={[0,0,.249]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.064,.064,.022,18]}/><meshStandardMaterial color="#596d73" metalness={.62}/></mesh>
   </group>;
  })}
  <group onClick={()=>select(3)}><Line points={tendon} color={selected===3?'#ffe686':'#d8944d'} lineWidth={selected===3?5:3.6}/></group>
  <group onClick={()=>select(4)}><Line points={elastic} color={selected===4?'#9ff2ff':'#63adc3'} lineWidth={selected===4?5:3.6}/></group>
  <Box at={[-1.52,.13,.82]} size={[.86,.12,.53]} color="#327493" metal={.24}/>
  <Box at={[-1.55,.21,.82]} size={[.22,.060,.16]} color="#242f37"/>
  <Line points={[[-1.43,.22,.74],[-1.30,.24,.52],[-1.23,.44,.46],[-1.28,.96,.41]]} color="#383f46" lineWidth={3}/>
  {labels.map(([name],i)=><WorldLabel key={name} position={anchors[i]} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
  <ContactShadows position={[0,.006,0]} opacity={.38} scale={4.7} far={1.2} resolution={128} frames={1}/>
 </>;
}
export default function TendonHandDemo(){
 const [amount,setAmount]=useState(0);
 const [target,setTarget]=useState(0);
 const [selected,select]=useState(0);
 const [playing,setPlaying]=useState(false);
 function command(value:number){
  setPlaying(false);
  setTarget(value);
 }
 function play(){
  setPlaying(true);
  setTarget(1);
 }
 useEffect(()=>{
  if(!playing||amount!==1)return;
  const timer=window.setTimeout(()=>{setPlaying(false);setTarget(0);},450);
  return ()=>window.clearTimeout(timer);
 },[amount,playing]);
 useEffect(()=>{
  if(amount===target)return;
  const timer=window.setTimeout(()=>setAmount(Math.abs(target-amount)<.041?target:amount+Math.sign(target-amount)*.04),25);
  return ()=>window.clearTimeout(timer);
 },[amount,target]);
 const state=amount===0?'Open · Elastic at rest':amount===1?'Curled · Tendon held':target===0?'Releasing · Elastic returns finger':'Curling · Servo takes up cord';
 return <div className="gp-split gp-demo">
  <div className="gp-story-stage"><div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D tendon-driven finger bench">
   <Canvas camera={{position:[2.0,3.2,5.4],fov:42}} dpr={[1,1.6]} fallback={<p>Follow the servo and hinge angles below.</p>}><HandScene {...{amount,selected,select}}/><OrbitControls target={[0,.74,.10]} minDistance={3.2} maxDistance={9} enablePan={false}/></Canvas>
  </div><div className="gp-demo-result" aria-label="Hand motion readings"><div><span>Servo</span><strong>{Math.round(80+25*amount)}°</strong></div><div><span>First hinge</span><strong>{Math.round(41*amount)}°</strong></div><div><span>Second hinge</span><strong>{Math.round(45*amount)}°</strong></div></div></div>
  <div className="gp-guide"><h3>Pull and release the tendon</h3><p>Follow the golden tendon as the servo pulls. Release it to see the blue elastic bring both hinges back.</p>
   <div className="gp-steps"><button type="button" className="gp-button" onClick={play}>Play curl and release</button><button type="button" onClick={()=>command(1)}>Curl finger</button><button type="button" onClick={()=>command(0)}>Release tendon</button></div>
   <p role="status">{state}</p><p>The hinge angles illustrate movement. The final angles on a hand-built finger depend on its pins, guides and cord slack.</p>
   <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
   <p className="gp-demo-description">{labels[selected][1]}</p>
  </div>
 </div>;
}
