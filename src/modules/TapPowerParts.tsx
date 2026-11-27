import {useMemo,type ReactNode} from 'react';
import {Text,RoundedBox} from '@react-three/drei';
import {Shape,Path,CatmullRomCurve3,Vector3,Vector2} from 'three';
import type{ThreeEvent}from'@react-three/fiber';
import {tapPowerLayout,tapPowerWorld,tapPowerTerminals,tapPowerCableDiameter} from '../data/tap-power';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
type Props={selected:string;choose:(id:string)=>void;withdrawal?:number;clampRelease?:Readonly<Record<string,number>>};
function rect(x0:number,y0:number,x1:number,y1:number){const s=new Shape();s.moveTo(x0,y0);s.lineTo(x1,y0);s.lineTo(x1,y1);s.lineTo(x0,y1);s.closePath();return s;}
function hole(s:Shape,x:number,y:number,r:number){const p=new Path();p.absarc(x,y,r,0,2*Math.PI,true);s.holes.push(p);}
function ring(outer:number,inner:number){return [new Vector2(inner,0),new Vector2(outer,0),new Vector2(outer,1),new Vector2(inner,1),new Vector2(inner,0)];}
export default function TapPowerParts({selected,choose,withdrawal=0,clampRelease={}}:Props){
 const shapes=useMemo(()=>{const front=rect(-7,1.5,7,10),top=rect(-7,-16,7,-8),metal=rect(-2.4,2.5,2.4,7.5);for(const t of tapPowerTerminals){hole(front,t.x,4.5,1.1);hole(top,t.x,-12,1.35);}hole(metal,0,4.5,.65);const cap=(sign:number)=>{const s=new Shape(),a=Math.acos(.16/1.1);s.absarc(0,0,1.1,sign>0?-a:Math.PI-a,sign>0?a:Math.PI+a,false);s.closePath();return s;};return {front,top,metal,outer:ring(2.75,2.5),inner:ring(1.3,1.05),separator:ring(2.5,1.3),female:ring(3.2,2.85),jack:ring(4.5,3.2),caps:[cap(-1),cap(1)]};},[]);
 const cord=useMemo(()=>{const start=tapPowerWorld([0,7,-47-withdrawal]);return new CatmullRomCurve3([new Vector3(...start),new Vector3(100-withdrawal,230,-60),new Vector3(100-withdrawal,210,-140),new Vector3(160,180,-175),new Vector3(280,60,-175),new Vector3(280,20,90),new Vector3(230,30,100)],false,'centripetal');},[withdrawal]);
 const mat=(id:string,color:string,metalness=0)=>({color:selected===id?'#c4a2ff':color,metalness,roughness:.4,emissive:selected===id?'#6e3ab5':'#000000',emissiveIntensity:.25});
 const tag=(id:string,node:ReactNode)=><group name={id} key={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 const box=(id:string,position:[number,number,number],size:[number,number,number],color:string,metalness=0)=><mesh position={position}><boxGeometry args={size}/><meshStandardMaterial {...mat(id,color,metalness)}/></mesh>;
 const sleeve=(id:string,shape:Vector2[],z:number,depth:number,color:string,metalness=0)=><mesh position={[0,7,z]} rotation={[Math.PI/2,0,0]} scale={[1,depth,1]}><latheGeometry args={[shape,128]}/><meshStandardMaterial {...mat(id,color,metalness)}/></mesh>;
 return <group name="tap-power-system">
  {tag('tap-supply-case',<group position={[...tapPowerLayout.source]}><RoundedBox position={[0,14,0]} args={[42,28,60]} radius={2} smoothness={3}><meshStandardMaterial {...mat('tap-supply-case','#262c3a')}/></RoundedBox>{box('tap-supply-case',[0,27.2,0],[30,.5,38],'#bec5ca')}<Text font={font} position={[0,27.5,-4]} rotation={[-Math.PI/2,0,0]} fontSize={3} color="#253045">5 V DC</Text><Text font={font} position={[0,27.5,5]} rotation={[-Math.PI/2,0,0]} fontSize={2} color="#253045">2 A · CENTRE +</Text></group>)}
  {tag('tap-supply-cord',<mesh><tubeGeometry args={[cord,180,tapPowerCableDiameter/2,12,false]}/><meshStandardMaterial {...mat('tap-supply-cord','#262d3b')}/></mesh>)}
  <group position={[...tapPowerLayout.adapter]} rotation={[0,Math.PI/2,0]}>
   {tag('tap-supply-adapter',<>{box('tap-supply-adapter',[0,7,-1],[14,14,18],'#282e3b')}{sleeve('tap-supply-adapter',shapes.jack,-22,12,'#282e3b')}{[0,1,2,3].map(i=><mesh key={i} position={[0,7,-17+i*1.8]}><torusGeometry args={[4.5,.45,8,40]}/><meshStandardMaterial {...mat('tap-supply-adapter','#303642')}/></mesh>)}<mesh position={[0,7,-11]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[4.5,4.5,2,48]}/><meshStandardMaterial {...mat('tap-supply-adapter','#282e3b')}/></mesh></>)}
   {tag('tap-supply-jack-positive',<mesh position={[0,7,-17]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[1,1,10,32]}/><meshStandardMaterial {...mat('tap-supply-jack-positive','#b7ad87',.8)}/></mesh>)}
   {tag('tap-supply-jack-negative',<>{sleeve('tap-supply-jack-negative',shapes.female,-23,11,'#c0c4c8',.8)}{[-1,1].map(side=><group key={side}>{box('tap-supply-jack-negative',[side*2.8,7,-18],[.1,1.1,7],'#b8bdbf',.8)}</group>)}</>)}
   <group position={[0,0,-withdrawal]}>
    {tag('tap-supply-grip',<><mesh position={[0,7,-31]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[5.5,5.5,16,48]}/><meshStandardMaterial {...mat('tap-supply-grip','#242b38')}/></mesh><mesh position={[0,7,-43]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[3,4.3,8,32]}/><meshStandardMaterial {...mat('tap-supply-grip','#242b38')}/></mesh>{Array.from({length:5},(_,i)=><mesh key={i} position={[0,7,-39-i*1.5]}><torusGeometry args={[4.0-i*.2,.35,8,32]}/><meshStandardMaterial {...mat('tap-supply-grip','#242b38')}/></mesh>)}</>)}
    {tag('tap-supply-plug-negative',sleeve('tap-supply-plug-negative',shapes.outer,-23,10,'#bfc4ca',.85))}
    {tag('tap-supply-plug-positive',<>{sleeve('tap-supply-plug-positive',shapes.inner,-23,10,'#b5a774',.8)}{[-1,1].map(side=><group key={side}>{box('tap-supply-plug-positive',[side*1.025,7,-18.5],[.05,.45,7],'#b5a774',.8)}</group>)}</>)}
    {tag('tap-supply-plug-insulator',sleeve('tap-supply-plug-insulator',shapes.separator,-23,10,'#252d37'))}
   </group>
   {tag('tap-supply-terminal-housing',<>{box('tap-supply-terminal-housing',[0,1.1,12],[14,.8,8],'#4c997d')}<mesh position={[0,0,15]}><extrudeGeometry args={[shapes.front,{depth:1,bevelEnabled:false}]}/><meshStandardMaterial {...mat('tap-supply-terminal-housing','#4c997d')}/></mesh><mesh position={[0,9.5,0]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shapes.top,{depth:.5,bevelEnabled:false}]}/><meshStandardMaterial {...mat('tap-supply-terminal-housing','#4c997d')}/></mesh>{[-6.7,0,6.7].map(x=><group key={x}>{box('tap-supply-terminal-housing',[x,5.5,11.5],[.6,8,7],'#4c997d')}</group>)}</>)}
   {tapPowerTerminals.map(t=>{const id='tap-supply-'+t.polarity,release=clampRelease[id]??0;return <group key={id} position={[t.x,0,0]}>
    {tag(id,<mesh position={[0,0,9]}><extrudeGeometry args={[shapes.metal,{depth:6,bevelEnabled:false,curveSegments:32}]}/><meshStandardMaterial {...mat(id,'#b9a66d',.8)}/></mesh>)}
    {tag(id+'-screw',<group position={[0,release,12]} rotation={[0,release*6*Math.PI,0]}><mesh position={[0,6.745,0]}><cylinderGeometry args={[.75,.75,4.51,32]}/><meshStandardMaterial {...mat(id+'-screw','#b9c1c7',.8)}/></mesh><mesh position={[0,9.1,0]}><cylinderGeometry args={[1.1,1.1,.2,32]}/><meshStandardMaterial {...mat(id+'-screw','#b9c1c7',.8)}/></mesh>{shapes.caps.map((shape,i)=><mesh key={i} position={[0,9.2,0]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shape,{depth:.5,bevelEnabled:false}]}/><meshStandardMaterial {...mat(id+'-screw','#b9c1c7',.8)}/></mesh>)}</group>)}
    <Text font={font} position={[0,10.05,9.3]} rotation={[-Math.PI/2,0,0]} fontSize={1.6} color={t.polarity==='positive'?'#ffe5de':'#dce9f0'}>{t.polarity==='positive'?'+':'−'}</Text>
   </group>;})}
  </group>
 </group>;
}
