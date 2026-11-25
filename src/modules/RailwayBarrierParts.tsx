import {memo,useMemo,useRef,type ReactNode,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {Text} from '@react-three/drei';
import {Group,Path,Shape} from 'three';
import {railwayBarrierAngle} from '../data/railway-barrier-layout';
import type {RailwayClock} from '../data/railway-workshop';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function ring(outer:number,inner:number,sides=0){const s=new Shape();if(sides){for(let n=0;n<sides;n++){const a=n*Math.PI*2/sides;n?s.lineTo(Math.cos(a)*outer,Math.sin(a)*outer):s.moveTo(outer,0);}s.closePath();}else s.absarc(0,0,outer,0,Math.PI*2,false);const h=new Path();h.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(h);return s;}
function plate(x0:number,x1:number,y0:number,y1:number,holes:readonly(readonly[number,number,number])[]=[]){const s=new Shape();s.moveTo(x0,y0);s.lineTo(x1,y0);s.lineTo(x1,y1);s.lineTo(x0,y1);s.closePath();for(const[x,y,r]of holes){const h=new Path();h.absarc(x,y,r,0,Math.PI*2,true);s.holes.push(h);}return s;}
function armPlate(end:number,holes:readonly(readonly[number,number,number])[]){const s=new Shape(),a=Math.asin(3/5);s.moveTo(4,3);s.lineTo(end,3);s.lineTo(end,-3);s.lineTo(4,-3);s.absarc(0,0,5,-a,a-Math.PI*2,true);s.closePath();for(const[x,y,r]of holes){const h=new Path();h.absarc(x,y,r,0,Math.PI*2,true);s.holes.push(h);}return s;}
function RailwayBarrierParts({selected='',select=()=>{},actualAngle=95,clock}:{selected?:string;select?:(id:string)=>void;actualAngle?:number;clock?:RefObject<RailwayClock>}){
 const arm=useRef<Group>(null);useFrame(()=>{if(clock&&arm.current)arm.current.rotation.z=railwayBarrierAngle(clock.current.actualAngle);},-2);
 const shapes=useMemo(()=>{const cover=new Shape();cover.moveTo(-6.1,6);cover.lineTo(6.1,6);cover.lineTo(6.1,26);cover.absarc(0,26,6.1,0,Math.PI,false);cover.closePath();const bore=new Path();bore.absarc(0,26,2.5,0,Math.PI*2,true);cover.holes.push(bore);return{base:plate(-20,20,-70,-35,[-16,16].flatMap(x=>[40,65].map(z=>[x,-z,1.3] as const))),posts:[-9.8,9.8].map(x=>plate(x-2.6,x+2.6,3,26,[[x,18,1.3]])),ears:[-9.8,9.8].map(x=>plate(x-3.7,x+3.7,14,22,[[x,18,1.2]])),cover,collar:ring(4.6,2.5),shaft:ring(2.4,.65),horn:armPlate(15,[[0,0,2.45],[6,0,.8],[12,0,.8]]),arm:armPlate(130,[[0,0,3.6],[6,0,.8],[12,0,.8]]),retainer:ring(3.1,.65),washer:ring(2.5,1.3),head:ring(1.9,.65),nut:ring(2.2,1.05,6),smallNut:ring(1.2,.6,6)};},[]);
 const color=(id:string,c:string)=>selected===id?'#b78be8':c,mat=(id:string,c:string,metal=0)=><meshStandardMaterial color={color(id,c)} metalness={metal} roughness={metal?.3:.55}/>;
 const tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const box=(id:string,p:[number,number,number],s:[number,number,number],c:string)=><mesh position={p} castShadow receiveShadow><boxGeometry args={s}/>{mat(id,c)}</mesh>;
 const extrusion=(id:string,shape:Shape,p:[number,number,number],depth:number,c:string,metal=0)=><mesh position={p} castShadow receiveShadow><extrudeGeometry args={[shape,{depth,curveSegments:48,bevelEnabled:false}]}/>{mat(id,c,metal)}</mesh>;
 const rod=(id:string,p:[number,number,number],r:number,len:number,c:string,metal=.8)=><mesh position={p} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[r,r,len,48]}/>{mat(id,c,metal)}</mesh>;
 return <group name="railway-barrier" position={[-65,0,0]}>
 {tag('railway-barrier-stand',<>
  <mesh rotation={[-Math.PI/2,0,0]} castShadow receiveShadow><extrudeGeometry args={[shapes.base,{depth:3,curveSegments:48,bevelEnabled:false}]}/>{mat('railway-barrier-stand','#8c99a9',.7)}</mesh>
  {shapes.posts.map((s,n)=><group key={n}>{extrusion('railway-barrier-stand',s,[0,0,56],4,'#8c99a9',.7)}</group>)}
 </>)}
 {tag('railway-barrier-foot-screws',<>{[-16,16].flatMap(x=>[40,65].map(z=><group key={`${x}/${z}`}>
  <mesh position={[x,3,z]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shapes.washer,{depth:.5,curveSegments:48,bevelEnabled:false}]}/>{mat('railway-barrier-foot-screws','#b7c0cd',.8)}</mesh>
  <mesh position={[x,1.5,z]}><cylinderGeometry args={[1.1,1.1,6,20]}/>{mat('railway-barrier-foot-screws','#9ca9bb',.8)}</mesh>
  <mesh position={[x,3.5,z]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shapes.head,{depth:1.2,curveSegments:48,bevelEnabled:false}]}/>{mat('railway-barrier-foot-screws','#a5b2c2',.8)}</mesh>
 </group>))}</>)}
 {tag('railway-barrier-case',<>{box('railway-barrier-case',[0,18,52],[12.2,24,23],'#264a86')}{rod('railway-barrier-case',[0,26,60.75],6.1,5.5,'#264a86',0)}
  {[-5.9,5.9].flatMap(x=>[45,49,53].map(z=>box('railway-barrier-case',[x,18,z],[.6,20,.5],'#315e9c')))}
  <Text font={font} position={[0,18,40.45]} rotation={[0,Math.PI,0]} fontSize={2.1} color="#dce5f5" anchorX="center">5V SERVO</Text>
 </>)}
 {tag('railway-barrier-cover',extrusion('railway-barrier-cover',shapes.cover,[0,0,63.5],2,'#345f9f'))}
 {tag('railway-barrier-ears',<>{shapes.ears.map((s,n)=><group key={n}>{extrusion('railway-barrier-ears',s,[0,0,60],2,'#294f8c')}</group>)}</>)}
 {tag('railway-barrier-mounts',<>{[-9.8,9.8].map(x=><group key={x}>
  {rod('railway-barrier-mounts',[x,18,59.2],1,6.4,'#b4bfcd')}
  {extrusion('railway-barrier-mounts',shapes.head,[x,18,62],1.2,'#a8b5c6',.8)}
  {extrusion('railway-barrier-mounts',shapes.nut,[x,18,54.5],1.5,'#98a7bb',.8)}
 </group>)}</>)}
 {tag('railway-barrier-collar',extrusion('railway-barrier-collar',shapes.collar,[0,26,65.5],1.5,'#b0bdcb',.7))}
 <group ref={arm} name="railway-barrier-rotor" position={[0,26,70]} rotation={[0,0,railwayBarrierAngle(actualAngle)]}>
 {tag('railway-barrier-shaft',extrusion('railway-barrier-shaft',shapes.shaft,[0,0,-6],6.5,'#d0d5db',.8))}
 {tag('railway-barrier-horn',extrusion('railway-barrier-horn',shapes.horn,[0,0,-1],2,'#e6e5dc'))}
 {tag('railway-barrier-retainer',<>{rod('railway-barrier-retainer',[0,0,-.2],.55,2.4,'#acb6c6')}{extrusion('railway-barrier-retainer',shapes.retainer,[0,0,1],1,'#a5b2c3',.8)}</>)}
 {tag('railway-barrier-arm',<>{extrusion('railway-barrier-arm',shapes.arm,[0,0,1],2,'#eee8d6')}
  {[24,44,64,84,104,124].map(x=><group key={x}>{box('railway-barrier-arm',[x,0,3.04],[9,5.9,.08],'#c9434d')}{box('railway-barrier-arm',[x,0,.96],[9,5.9,.08],'#c9434d')}</group>)}
 </>)}
 {tag('railway-barrier-arm-fixings',<>{[6,12].map(x=><group key={x}>
  {rod('railway-barrier-arm-fixings',[x,0,.4],.55,5.2,'#bac2ce')}
  {extrusion('railway-barrier-arm-fixings',shapes.smallNut,[x,0,-2.3],1.3,'#9caabc',.8)}
  {rod('railway-barrier-arm-fixings',[x,0,3.5],1.2,1,'#b4bfcc')}
 </group>)}</>)}
 </group>
 </group>;
}
export default memo(RailwayBarrierParts);
