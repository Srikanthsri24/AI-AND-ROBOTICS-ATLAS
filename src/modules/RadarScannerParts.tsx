import {memo,useMemo,type ReactNode} from 'react';
import {Text} from '@react-three/drei';
import {Path,Shape} from 'three';
import FloodSonarParts from './FloodSonarParts';
import {radarScanner as d} from '../data/radar-scanner-layout';
import {radarYaw} from '../data/radar-workshop';

const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
type Hole=readonly[number,number,number];
/** Local XY describes X / minus-Z, so a −90° X turn extrudes upwards. */
function plate(left:number,right:number,back:number,front:number,holes:readonly Hole[]=[]){
 const s=new Shape();s.moveTo(left,-back);s.lineTo(right,-back);s.lineTo(right,-front);s.lineTo(left,-front);s.closePath();
 for(const[x,z,r]of holes){const h=new Path();h.absarc(x,-z,r,0,Math.PI*2,true);s.holes.push(h);}return s;
}
function ring(outer:number,inner:number){const s=new Shape();s.absarc(0,0,outer,0,Math.PI*2,false);const h=new Path();h.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(h);return s;}

/** Native millimetres. Reuses only the actual HC-SR04 geometry; the scanner is project-specific. */
function RadarScannerParts({selected,select,actual=90,hornOffset=0,explode=0}:{selected:string;select:(id:string)=>void;actual?:number;hornOffset?:number;explode?:number}){
 const shapes=useMemo(()=>({
  base:plate(-40,40,-30,30,d.mountAxes.map(x=>[x,0,1.3])),
  ears:d.mountAxes.map(x=>plate(x-4,x+4,-6.1,6.1,[[x,0,1.25]])),
  cover:plate(d.servo.left,d.servo.right,-6.1,6.1,[[0,0,2.5]]),
  post:ring(3.2,1.3),collar:ring(6,2.5),shaft:ring(2.4,.7),hub:ring(3.4,.7),
  horn:plate(-14,14,-4,4,[[0,0,2.5],...d.horn.fasteners.map(x=>[x,0,.8] as Hole)]),
  floor:plate(-23,23,-9,9,[[0,0,3.6],...d.horn.fasteners.map(x=>[x,0,.8] as Hole)]),
  nut:ring(1.2,.6),rearNut:ring(1.6,.7),
  straps:[-20,20].map(x=>{
   const s=new Shape();s.moveTo(x-2.5,42);s.lineTo(x+2.5,42);s.lineTo(x+2.5,78);s.lineTo(x-2.5,78);s.closePath();
   for(const[hx,hy]of d.sonar.holes)if(hx===x){const h=new Path();h.absarc(hx,68+hy,.95,0,Math.PI*2,true);s.holes.push(h);}return s;
  }),
 }),[]);
 const color=(id:string,c:string)=>selected===id?'#b78be8':c;
 const tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const material=(id:string,c:string,metal=0)=><meshStandardMaterial color={color(id,c)} metalness={metal} roughness={metal?.32:.58}/>;
 const block=(id:string,at:[number,number,number],size:[number,number,number],c:string)=><mesh position={at} castShadow receiveShadow><boxGeometry args={size}/>{material(id,c)}</mesh>;
 const horizontal=(id:string,shape:Shape,y:number,depth:number,c:string,metal=0)=><mesh position={[0,y,0]} rotation={[-Math.PI/2,0,0]} castShadow receiveShadow><extrudeGeometry args={[shape,{depth,bevelEnabled:false,curveSegments:32}]}/>{material(id,c,metal)}</mesh>;
 const cylinder=(id:string,x:number,z:number,bottom:number,top:number,r:number,c:string,metal=.8)=><mesh position={[x,(bottom+top)/2,z]} castShadow><cylinderGeometry args={[r,r,top-bottom,32]}/>{material(id,c,metal)}</mesh>;
 const fastener=(id:string,x:number,z:number,bottom:number,top:number,r:number,headR:number)=><group key={`${x}/${z}`}>
  {cylinder(id,x,z,bottom,top,r,'#a6b1bf')}{cylinder(id,x,z,top,top+1.2,headR,'#cad0d6')}
  {block(id,[x,top+1.22,z],[headR*1.3,.03,.22],'#3f4957')}
 </group>;
 const raised=Math.max(0,explode);
 return <group>
  {tag('radar-feet',<>{[-32,32].flatMap(x=>[-22,22].map(z=><group key={`${x}/${z}`}>{block('radar-feet',[x,1,z],[8,2,8],'#30323c')}</group>))}</>)}
  {tag('radar-base',<>
   {horizontal('radar-base',shapes.base,2,4,'#343451')}
   {[30,60,90,120,150].map(angle=>{const a=radarYaw(angle),x=27*Math.sin(a),z=27*Math.cos(a);return <group key={angle} position={[x,6.04,z]} rotation={[-Math.PI/2,0,0]}>
    <Text font={font} fontSize={2.8} color="#ece6fd" rotation={[0,0,-a]}>{angle}°</Text>
   </group>;})}
   <Text position={[0,6.05,-22]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={2.1} color="#c9b8eb">ULTRASONIC SCANNER</Text>
  </>)}
  {tag('radar-posts',<>{d.mountAxes.map(x=><group key={x} position={[x,0,0]}>{horizontal('radar-posts',shapes.post,6,21,'#c8b16d',.7)}</group>)}</>)}
  {tag('radar-post-bolts',<>{d.mountAxes.map(x=><group key={x}>
   {cylinder('radar-post-bolts',x,0,1.2,10,.8,'#a6b1bf')}{cylinder('radar-post-bolts',x,0,.8,2,2.4,'#cad0d6')}
  </group>)}</>)}
  <group position={[0,raised*.6,0]}>
   {tag('radar-servo-case',<>
    {block('radar-servo-case',[5.4,20,0],[23,24,12.2],'#216aab')}
    {shapes.ears.map((s,i)=><group key={i}>{horizontal('radar-servo-case',s,27,2,'#347db9')}</group>)}
    {horizontal('radar-servo-case',shapes.cover,32,3,'#2d6f9d')}
    {horizontal('radar-servo-case',shapes.collar,35,1,'#2b6794')}
    <Text position={[5.4,20,6.14]} font={font} fontSize={2.1} color="#edf3fa">SERVO</Text>
    {block('radar-servo-case',[16.9,12,0],[2,3,5],'#253a50')}
   </>)}
   {tag('radar-servo-bolts',<>{d.mountAxes.map(x=>fastener('radar-servo-bolts',x,0,24,29,.8,2))}</>)}
   <group rotation={[0,radarYaw(actual),0]}>
    {tag('radar-shaft',horizontal('radar-shaft',shapes.shaft,32.5,7.5,'#e1d8c0'))}
   </group>
   <group rotation={[0,radarYaw(actual+hornOffset),0]} position={[0,raised*.7,0]}>
    {tag('radar-horn',<>{horizontal('radar-horn',shapes.horn,38,2,'#efe9da')}{horizontal('radar-horn',shapes.hub,40,2,'#e7dfcc')}</>)}
    {tag('radar-hub-screw',fastener('radar-hub-screw',0,0,37,42,.5,1.2))}
    <group position={[0,raised*.8,0]}>
     {tag('radar-bracket',<>
      {horizontal('radar-bracket',shapes.floor,40,2,'#bb9c70')}
      {shapes.straps.map((s,i)=><mesh key={i} position={[0,0,-3.6]} castShadow><extrudeGeometry args={[s,{depth:2,bevelEnabled:false,curveSegments:24}]}/>{material('radar-bracket','#ba9b6d')}</mesh>)}
     </>)}
     {tag('radar-bracket-bolts',<>{d.horn.fasteners.map(x=><group key={x}>
      {fastener('radar-bracket-bolts',x,0,36.6,42,.5,1.4)}
      <group position={[x,0,0]}>{horizontal('radar-bracket-bolts',shapes.nut,36.8,1.2,'#bac2c7',.8)}</group>
     </group>)}</>)}
     <group position={[0,0,raised]}>
      <group position={[0,68,0]}><FloodSonarParts partPrefix="radar-" selected={selected} select={select}/></group>
      {tag('radar-sonar-bolts',<>{d.sonar.holes.map(([x,y])=><group key={`${x}/${y}`} position={[x,68+y,0]}>
       <mesh position={[0,0,-2.5]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.65,.65,6,24]}/>{material('radar-sonar-bolts','#aab5c1',.8)}</mesh>
       <mesh position={[0,0,.6]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[1.4,1.4,1.2,24]}/>{material('radar-sonar-bolts','#c6cdd3',.8)}</mesh>
       {block('radar-sonar-bolts',[0,0,1.22],[1.8,.22,.03],'#3f4957')}
       <mesh position={[0,0,-4.8]} castShadow><extrudeGeometry args={[shapes.rearNut,{depth:1.2,bevelEnabled:false,curveSegments:6}]}/>{material('radar-sonar-bolts','#bac2c7',.8)}</mesh>
      </group>)}</>)}
     </group>
    </group>
   </group>
  </group>
 </group>;
}
export default memo(RadarScannerParts);
