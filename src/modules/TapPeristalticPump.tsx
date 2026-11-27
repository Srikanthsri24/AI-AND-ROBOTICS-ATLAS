import {useEffect,useMemo} from 'react';
import type {ThreeEvent} from '@react-three/fiber';
import {BufferGeometry,Float32BufferAttribute,Shape,Path} from 'three';
import {tapRollerCenters,tapTubePoint,tapTubeLeadPoint} from '../data/tap-peristaltic-geometry';
type Props={phase?:number;cutaway?:boolean;selected:string;choose:(id:string)=>void};
export const tapPumpParts=[
 ['tap-pump-can','DC motor','Turns the pump rotor when the MOSFET completes the motor circuit. Its two terminals connect to driver OUT+ and OUT−.'],
 ['tap-pump-head','Pump housing','Holds the tube against a fixed circular track. The liquid stays inside the silicone tube, away from the motor.'],
 ['tap-pump-rotor','Rotor carrier','Carries the rollers around the track. The internal geometry is an explanatory cutaway rather than manufacturer CAD.'],
 ['tap-pump-rollers','Compression rollers','Squeeze the tube against the track. Successive moving contact points push liquid toward the spout.'],
 ['tap-pump-tube','Silicone tube','Connects the submerged reservoir intake to the spout. Fit it along the track before closing the cover.'],
 ['tap-pump-inlet','Reservoir inlet tube','Connect this lead to the submerged reservoir intake. Keep the intake below the minimum water line and prime the tubing before testing.'],
 ['tap-pump-outlet','Spout outlet tube','Connect this lead to the spout above the basin. Check flow direction during commissioning; reversing motor polarity reverses transport.'],
 ['tap-pump-cover','Removable head cover','Retains the tubing and shields the rotating mechanism. Open the teaching cutaway to inspect the rollers.'],
 ['tap-pump-positive','Positive motor terminal','Connect to driver OUT+, which receives the separate regulated motor supply.'],
 ['tap-pump-negative','Switched motor terminal','Connect to driver OUT−. The MOSFET switches this return path; the Uno pin supplies only a control signal.'],
 ['tap-pump-mount','Mounting flange','Fasten above the basin splash zone through the two mounting bores, 50 mm apart.'],
] as const;
function tubeGeometry(phase:number,side?:-1|1){
 const positions:number[]=[],indices:number[]=[];const rings=side?49:145,sides=24;
 for(let layer=0;layer<2;layer++)for(let i=0;i<rings;i++)for(let j=0;j<=sides;j++)positions.push(...(side?tapTubeLeadPoint(side,i/(rings-1),j/sides*2*Math.PI,phase,layer===1):tapTubePoint(-3*Math.PI/4+i/(rings-1)*3*Math.PI/2,j/sides*2*Math.PI,phase,layer===1)));
 const stride=sides+1,offset=rings*stride;
 for(let layer=0;layer<2;layer++)for(let i=0;i<rings-1;i++)for(let j=0;j<sides;j++){const a=layer*offset+i*stride+j,b=a+stride;if(layer===0)indices.push(a,b,a+1,a+1,b,b+1);else indices.push(a,a+1,b,a+1,b+1,b);}
 for(const ring of [0,rings-1])for(let j=0;j<sides;j++){const a=ring*stride+j,b=a+offset;indices.push(a,a+1,b,a+1,b+1,b);}
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
export default function TapPeristalticPump({phase=0,cutaway=false,selected,choose}:Props){
 const tube=useMemo(()=>tubeGeometry(phase),[phase]),inlet=useMemo(()=>tubeGeometry(phase,-1),[phase]),outlet=useMemo(()=>tubeGeometry(phase,1),[phase]);
 useEffect(()=>()=>{tube.dispose();inlet.dispose();outlet.dispose();},[tube,inlet,outlet]);
 const flange=useMemo(()=>{const s=new Shape();s.moveTo(-29,-9);s.lineTo(29,-9);s.lineTo(29,9);s.lineTo(-29,9);s.closePath();for(const x of [-25,25]){const h=new Path();h.absarc(x,0,1.85,0,2*Math.PI,true);s.holes.push(h);}return s;},[]);
 const shell=useMemo(()=>{
  const ranges=cutaway?[[0,135],[170,180]]:[[-180,-170],[-135,135],[170,180]];
  return ranges.map(([start,end])=>{const shape=new Shape(),steps=Math.ceil((end-start)/3);for(let i=0;i<=steps;i++){const a=(start+(end-start)*i/steps)*Math.PI/180,x=23*Math.sin(a),y=23*Math.cos(a);if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y);}for(let i=steps;i>=0;i--){const a=(start+(end-start)*i/steps)*Math.PI/180;shape.lineTo(20*Math.sin(a),20*Math.cos(a));}shape.closePath();return shape;});
 },[cutaway]);
 const event=(id:string)=>(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);};
 const mat=(id:string,color:string,metalness=.1)=>({color:selected===id?'#c4a2ff':color,metalness,roughness:.35,emissive:selected===id?'#6e3ab5':'#000000',emissiveIntensity:selected===id?.35:0});
 // All meshes use mm; parent workbench applies the shared 0.01 scale.
 return <group name="tap-peristaltic-pump">
  <group name="tap-pump-can" userData={{partId:"tap-pump-can"}} onClick={event('tap-pump-can')}>
   <mesh position={[0,0,-36.9]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[13.9,13.9,45.8,64]}/><meshStandardMaterial {...mat('tap-pump-can','#b8bdc4',.8)}/></mesh>
   <mesh position={[0,0,-29]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[14.02,14.02,24,64]}/><meshStandardMaterial {...mat('tap-pump-can','#f0f1ec')}/></mesh>
   {Array.from({length:10},(_,i)=><mesh key={i} position={[13.98*Math.sin(i*.32-1.44),13.98*Math.cos(i*.32-1.44),-28]} rotation={[0,0,-(i*.32-1.44)]}><boxGeometry args={[1.3,.35,12]}/><meshStandardMaterial {...mat('tap-pump-can','#222735')}/></mesh>)}
  </group>
  <mesh name="tap-pump-mount" userData={{partId:"tap-pump-mount"}} position={[0,0,-12]} onClick={event('tap-pump-mount')}><extrudeGeometry args={[flange,{depth:3,bevelEnabled:false}]}/><meshStandardMaterial {...mat('tap-pump-mount','#171b24')}/></mesh>
  <group name="tap-pump-head" userData={{partId:"tap-pump-head"}} onClick={event('tap-pump-head')}>
   <mesh position={[0,0,-7.5]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[23,23,1,72]}/><meshStandardMaterial {...mat('tap-pump-head','#131722')}/></mesh>
   {shell.map((shape,i)=><mesh key={i} position={[0,0,-7]}><extrudeGeometry args={[shape,{depth:13,bevelEnabled:false}]}/><meshStandardMaterial {...mat('tap-pump-head','#202532')}/></mesh>)}
   <mesh position={[0,0,-11]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[10,10,6,48]}/><meshStandardMaterial {...mat('tap-pump-head','#202532')}/></mesh>
  </group>
  <group name="tap-pump-rotor" userData={{partId:"tap-pump-rotor"}} rotation={[0,0,-phase]} onClick={event('tap-pump-rotor')}>
   <mesh position={[0,0,-6.3]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[15,15,1,48]}/><meshStandardMaterial {...mat('tap-pump-rotor','#e2e3da')}/></mesh>
   <mesh position={[0,0,-4.3]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[3,3,3,32]}/><meshStandardMaterial {...mat('tap-pump-rotor','#a0a8b3',.8)}/></mesh>
  </group>
  <group name="tap-pump-rollers" userData={{partId:"tap-pump-rollers"}} onClick={event('tap-pump-rollers')}>{tapRollerCenters(phase).map(([x,y],i)=><group key={i} position={[x,y,0]}><mesh position={[0,0,-.7]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[1.3,1.3,11.2,24]}/><meshStandardMaterial {...mat('tap-pump-rollers','#939aa5',.85)}/></mesh><mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[5,5,9,40]}/><meshStandardMaterial {...mat('tap-pump-rollers','#ece8dc')}/></mesh><mesh position={[0,0,4.7]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[1.3,1.3,.4,24]}/><meshStandardMaterial {...mat('tap-pump-rollers','#939aa5',.85)}/></mesh></group>)}</group>
  <mesh name="tap-pump-tube" userData={{partId:"tap-pump-tube"}} geometry={tube} onClick={event('tap-pump-tube')}><meshStandardMaterial {...mat('tap-pump-tube','#e4eff0')} transparent opacity={.82} side={2}/></mesh>
  <mesh name="tap-pump-inlet" userData={{partId:'tap-pump-inlet'}} geometry={inlet} onClick={event('tap-pump-inlet')}><meshStandardMaterial {...mat('tap-pump-inlet','#e4eff0')} transparent opacity={.82} side={2}/></mesh>
  <mesh name="tap-pump-outlet" userData={{partId:'tap-pump-outlet'}} geometry={outlet} onClick={event('tap-pump-outlet')}><meshStandardMaterial {...mat('tap-pump-outlet','#e4eff0')} transparent opacity={.82} side={2}/></mesh>
  {!cutaway&&<mesh name="tap-pump-cover" userData={{partId:"tap-pump-cover"}} position={[0,0,6.25]} rotation={[Math.PI/2,0,0]} onClick={event('tap-pump-cover')}><cylinderGeometry args={[23,23,1.5,72]}/><meshStandardMaterial {...mat('tap-pump-cover','#161b24')}/></mesh>}
  {[-1,1].map((side)=><mesh key={side} name={side===1?'tap-pump-positive':'tap-pump-negative'} userData={{partId:side===1?'tap-pump-positive':'tap-pump-negative'}} position={[side*7,0,-59]} onClick={event(side===1?'tap-pump-positive':'tap-pump-negative')}><boxGeometry args={[3,.6,1.6]}/><meshStandardMaterial {...mat(side===1?'tap-pump-positive':'tap-pump-negative',side===1?'#c95c48':'#a5aab3',.75)}/></mesh>)}
 </group>;
}
