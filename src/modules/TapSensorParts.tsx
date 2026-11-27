import {useMemo} from 'react';
import {Text} from '@react-three/drei';
import {Shape,Path} from 'three';
import type {ThreeEvent} from '@react-three/fiber';
import Sonar from './SoapSonarParts';
import {soapSonar} from '../data/soap-dispenser-sonar';
import {tapLevelPlacement,tapLevelDimensions as d,tapSonarPlacement,tapSensorPlate as plate} from '../data/tap-sensors';
type Props={selected:string;choose:(id:string)=>void;levelOffset?:number;routedLeads?:boolean};
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function annulus(outer:number,inner:number){const s=new Shape();s.absarc(0,0,outer,0,Math.PI*2,false);const h=new Path();h.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(h);return s;}
export default function TapSensorParts({selected,choose,levelOffset=0,routedLeads=false}:Props){
 const plateShape=useMemo(()=>{const s=new Shape();s.moveTo(-27.5,-14);s.lineTo(27.5,-14);s.lineTo(27.5,14);s.lineTo(-27.5,14);s.closePath();for(const[x,z]of soapSonar.holes){const h=new Path();h.absarc(x,z,1.15,0,Math.PI*2,true);s.holes.push(h);}return s;},[]);
 const levelShell=useMemo(()=>{const s=new Shape();s.moveTo(-d.width/2,-d.height/2);s.lineTo(d.width/2,-d.height/2);s.lineTo(d.width/2,d.height/2);s.lineTo(-d.width/2,d.height/2);s.closePath();const h=new Path();h.moveTo(-4,-6);h.lineTo(-4,6);h.lineTo(4,6);h.lineTo(4,-6);h.closePath();s.holes.push(h);return s;},[]);
 const spacer=useMemo(()=>annulus(2,1.15),[]),washer=useMemo(()=>annulus(2.1,.95),[]);
 const nut=useMemo(()=>{const s=new Shape();for(let i=0;i<6;i++){const a=i*Math.PI/3,x=1.8*Math.cos(a),y=1.8*Math.sin(a);if(i===0)s.moveTo(x,y);else s.lineTo(x,y);}s.closePath();const h=new Path();h.absarc(0,0,.85,0,2*Math.PI,true);s.holes.push(h);return s;},[]);
 const mat=(id:string,color:string,metalness=0)=>({color:selected===id?'#c4a2ff':color,metalness,roughness:.35,emissive:selected===id?'#6e3ab5':'#000000',emissiveIntensity:.25});
 const event=(id:string)=>(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);};
 const block=(id:string,position:[number,number,number],size:[number,number,number],color:string)=><mesh position={position} onClick={event(id)}><boxGeometry args={size}/><meshStandardMaterial {...mat(id,color)}/></mesh>;
 return <group name="tap-sensors">
  <group position={[tapLevelPlacement[0],tapLevelPlacement[1],tapLevelPlacement[2]+levelOffset]} name="tap-level-sensor">
   <group name="tap-level-case" userData={{partId:'tap-level-case'}} onClick={event('tap-level-case')}>
    <mesh position={[0,0,-2]}><extrudeGeometry args={[levelShell,{depth:3.5,bevelEnabled:false}]}/><meshStandardMaterial {...mat('tap-level-case','#6f48ac')}/></mesh>
    {[-1,1].map(side=><group key={side}>{block('tap-level-case',[side*4.7,0,1.5],[1.2,d.height,1],'#7951b7')}{block('tap-level-case',[0,side*7.85,1.5],[8.2,1.2,1],'#7951b7')}</group>)}
    <Text font={font} position={[0,7.6,2.1]} fontSize={.9} color="#ebe0ff">DFRobot</Text>
   </group>
   <mesh name="tap-level-face" userData={{partId:'tap-level-face'}} position={[0,0,-.25]} onClick={event('tap-level-face')}><boxGeometry args={[8,12,3.5]}/><meshStandardMaterial {...mat('tap-level-face','#8a61c2')}/></mesh>
   <group name="tap-level-potting" userData={{partId:'tap-level-potting'}} onClick={event('tap-level-potting')}>{block('tap-level-potting',[0,0,1.65],[8.2,13.3,.6],'#151d23')}{block('tap-level-potting',[0,-7.7,1.8],[4.4,1.5,.7],'#19212a')}</group>
   {(['out','vcc','gnd'] as const).map((pin,i)=>{const id='tap-level-'+pin,color=['#329d79','#d45b6a','#344350'][i],x=(i-1)*1.2;return <group key={pin} name={id} userData={{partId:id}} onClick={event(id)}><mesh position={[x,-16,1.5]}><cylinderGeometry args={[.45,.45,16,16]}/><meshStandardMaterial {...mat(id,color)}/></mesh>{!routedLeads&&<mesh position={[x,-24.4,1.5]}><cylinderGeometry args={[.21,.21,.8,12]}/><meshStandardMaterial {...mat(id,'#c2b99d',.8)}/></mesh>}</group>;})}
  </group>
  <group name="tap-sonar-support" userData={{partId:'tap-sonar-support'}} onClick={event('tap-sonar-support')}>
   {block('tap-sonar-support',[30,429.78,-145],[90,12,12],'#929ba8')}{block('tap-sonar-support',[45,429.78,-50],[12,12,190],'#929ba8')}
  </group>
  <mesh name="tap-sonar-plate" userData={{partId:'tap-sonar-plate'}} position={[45,plate.bottom,40]} rotation={[-Math.PI/2,0,0]} onClick={event('tap-sonar-plate')}><extrudeGeometry args={[plateShape,{depth:plate.thickness,bevelEnabled:false}]}/><meshStandardMaterial {...mat('tap-sonar-plate','#d1d6df',.7)}/></mesh>
  <group name="tap-sonar-spacers" userData={{partId:'tap-sonar-spacers'}} onClick={event('tap-sonar-spacers')}>
   {soapSonar.holes.map(([x,z],i)=><mesh key={i} position={[45+x,plate.bottom,40+z]} rotation={[Math.PI/2,0,0]}><extrudeGeometry args={[spacer,{depth:6,bevelEnabled:false}]}/><meshStandardMaterial {...mat('tap-sonar-spacers','#e7e4db')}/></mesh>)}
  </group>
  {soapSonar.holes.map(([x,z],i)=>{const id='tap-sonar-screw-'+i;return <group key={id} name={id} userData={{partId:id}} onClick={event(id)}>
   <mesh position={[45+x,plate.bottom-4.5,40+z]}><cylinderGeometry args={[.85,.85,16,20]}/><meshStandardMaterial {...mat(id,'#adb6c1',.85)}/></mesh>
   <mesh position={[45+x,plate.bottom+4.3,40+z]}><cylinderGeometry args={[1.65,1.65,1.6,6]}/><meshStandardMaterial {...mat(id,'#b5bdc6',.85)}/></mesh>
   {[plate.bottom+3.5,tapSonarPlacement[1]].map(y=><mesh key={y} position={[45+x,y,40+z]} rotation={[Math.PI/2,0,0]}><extrudeGeometry args={[washer,{depth:.5,bevelEnabled:false}]}/><meshStandardMaterial {...mat(id,'#adb6c1',.85)}/></mesh>)}
   <mesh position={[45+x,tapSonarPlacement[1]-.5,40+z]} rotation={[Math.PI/2,0,0]}><extrudeGeometry args={[nut,{depth:1.4,bevelEnabled:false}]}/><meshStandardMaterial {...mat(id,'#b5bdc6',.85)}/></mesh>
  </group>;})}
  <group position={[...tapSonarPlacement]} rotation={[Math.PI/2,0,0]}><Sonar selected={selected} select={choose} partPrefix="tap-"/></group>
 </group>;
}
