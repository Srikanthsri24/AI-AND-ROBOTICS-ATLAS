import {memo,useMemo,useRef,type ReactNode,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {RoundedBox,Text} from '@react-three/drei';
import {Group,Path,Shape} from 'three';
import {railwayLayout as d,type RailwayClock} from '../data/railway-workshop';
import {railwayTrack as t} from '../data/railway-track-layout';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
/** Native millimetres. Lower bodies and the opaque coupler share the controller's beam band. */
function RailwayTrackParts({selected='',select=()=>{},nose=d.startNose,clock}:{selected?:string;select?:(id:string)=>void;nose?:number;clock?:RefObject<RailwayClock>}){
 const train=useRef<Group>(null),wheels=useRef<Map<string,Group>>(new Map());
 useFrame(()=>{if(!clock||!train.current)return;const x=clock.current.trainNose;train.current.position.x=x;for(const wheel of wheels.current.values())wheel.rotation.z=-(x-d.startNose)/t.wheelRadius;},-2);
 const color=(id:string,c:string)=>selected===id?'#b78be8':c;
 const mat=(id:string,c:string,metal=0,rough=.5)=><meshStandardMaterial color={color(id,c)} metalness={metal} roughness={rough}/>;
 const tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const box=(id:string,p:[number,number,number],s:[number,number,number],c:string,metal=0)=><mesh position={p} castShadow receiveShadow><boxGeometry args={s}/>{mat(id,c,metal)}</mesh>;
 const round=(id:string,p:[number,number,number],s:[number,number,number],c:string,r=1)=><RoundedBox position={p} args={s} radius={r} smoothness={3} castShadow receiveShadow>{mat(id,c)}</RoundedBox>;
 const cylinder=(id:string,p:[number,number,number],r:number,len:number,c:string,axis:'x'|'z'='z',metal=.75)=><mesh position={p} rotation={axis==='z'?[Math.PI/2,0,0]:[0,0,Math.PI/2]} castShadow receiveShadow><cylinderGeometry args={[r,r,len,32]}/>{mat(id,c,metal,.3)}</mesh>;
 const wall=useMemo(()=>{const s=new Shape();s.moveTo(-110,40);s.lineTo(0,40);s.lineTo(0,51);s.lineTo(-110,51);s.closePath();for(const x of[-95,-73,-51,-29]){const h=new Path();h.moveTo(x-7,42);h.lineTo(x-7,49);h.lineTo(x+7,49);h.lineTo(x+7,42);h.closePath();s.holes.push(h);}return s;},[]);
 return <group name="railway-track-mm">
 {tag('railway-base',round('railway-base',[(t.left+t.right)/2,-3,0],[t.right-t.left+40,6,350],'#d9cbb4',2))}
 {tag('railway-road',<>
  {[-98,98].map(z=><group key={z}>{box('railway-road',[0,.6,z],[90,1.2,150],'#4e5869')}{[-140,-112,-84,-56].map(v=>box('railway-road',[0,1.24,Math.sign(z)*Math.abs(v)],[1.5,.08,12],'#f1e5bb'))}</group>)}
  {box('railway-road',[0,2.75,0],[90,2.5,27],'#6d665d')}
  {[-34,34].map(z=>box('railway-road',[0,2.75,z],[90,2.5,23],'#6d665d'))}
 </>)}
 {tag('railway-sleepers',<>{Array.from({length:49},(_,n)=>-550+n*25).map(x=>box('railway-sleepers',[x,.75,0],[10,1.5,53],'#5d4c3f'))}</>)}
 {tag('railway-rails',<>{[-t.railZ,t.railZ].map(z=><group key={z}>
  {box('railway-rails',[(t.left+t.right)/2,1.8,z],[t.right-t.left,.6,5],'#787d84',.75)}
  {box('railway-rails',[(t.left+t.right)/2,2.65,z],[t.right-t.left,1.1,1.4],'#a1a7ae',.85)}
  {box('railway-rails',[(t.left+t.right)/2,3.55,z],[t.right-t.left,.9,2.8],'#c3c9ce',.9)}
 </group>)}</>)}
 {tag('railway-rail-clips',<>{Array.from({length:49},(_,n)=>-550+n*25).flatMap(x=>[-1,1].map(side=><group key={`${x}/${side}`}>
  {box('railway-rail-clips',[x,1.85,side*22.2],[5,.7,3.2],'#555d67',.7)}
  <mesh position={[x,2.4,side*22.8]}><cylinderGeometry args={[.8,.8,.7,6]}/>{mat('railway-rail-clips','#a5a9aa',.8)}</mesh>
 </group>))}</>)}
 <group ref={train} name="railway-train" position={[nose,0,0]}>
 {t.carriages.map((car,n)=>{const prefix=n?'rear':'front',centre=(car.front+car.rear)/2;return <group key={prefix}>
  {tag(`railway-${prefix}-body`,<>
   {box(`railway-${prefix}-body`,[centre,28,0],[110,24,46],n?'#25696c':'#245b70')}
   {[-1,1].map(side=><group key={side}>
    <mesh position={[car.front,0,side*23]}><extrudeGeometry args={[wall,{depth:.7,bevelEnabled:false}]}/>{mat(`railway-${prefix}-body`,n?'#25696c':'#245b70')}</mesh>
    {box(`railway-${prefix}-body`,[centre,33,side*23.4],[109,1.7,.4],'#d4bb7d')}
    {box(`railway-${prefix}-body`,[car.front-10,33,side*23.65],[13,29,.5],'#214e60')}
    {box(`railway-${prefix}-body`,[car.front-10,33,side*23.98],[11.6,27.6,.2],n?'#25696c':'#245b70')}
    {box(`railway-${prefix}-body`,[car.front-14,31,side*24.2],[.8,3,.5],'#b9c1c8',.8)}
    {[21,44].map(y=>box(`railway-${prefix}-body`,[car.front-4.2,y,side*24.1],[.7,2,.4],'#7d8d99',.7))}
    {[car.rear+2.5,car.front-2.5].map(x=>box(`railway-${prefix}-body`,[x,26,side*23.5],[.35,19,.3],'#193c4c'))}
   </group>)}
   {box(`railway-${prefix}-body`,[car.front-.8,45,0],[1.6,10,46],'#245b70')}
   {box(`railway-${prefix}-body`,[car.rear+.8,45,0],[1.6,10,46],'#245b70')}
  </>)}
  {tag(`railway-${prefix}-windows`,<>
   {[-1,1].flatMap(side=>[-95,-73,-51,-29].map(x=>box(`railway-${prefix}-windows`,[car.front+x,45.5,side*22.6],[14.5,7.5,.5],'#182d3f',.45)))}
   {[-1,1].map(side=>box(`railway-${prefix}-windows`,[car.front-10,43,side*24.1],[8,6,.15],'#182d3f',.4))}
   {box(`railway-${prefix}-windows`,[car.front+.06,45,0],[.18,6,32],'#182d3f',.4)}
  </>)}
  {tag(`railway-${prefix}-roof`,<>{round(`railway-${prefix}-roof`,[centre,53,0],[111,5,47],'#b6bcc1',2)}
   {[-80,-55,-30].map(x=><group key={x}>{box(`railway-${prefix}-roof`,[car.front+x,56,0],[12,1,15],'#6a7785')}{[-5,-2.5,0,2.5,5].map(z=>box(`railway-${prefix}-roof`,[car.front+x,56.6,z],[10,.3,.4],'#bec7ce',.7))}</group>)}
  </>)}
  {tag(`railway-${prefix}-underframe`,<>{box(`railway-${prefix}-underframe`,[centre,14,0],[105,4,36],'#263240')}{car.axles.map(x=>box(`railway-${prefix}-underframe`,[x,11.5,0],[9,5,29],'#293341'))}</>)}
  {car.axles.map((x,a)=><group key={a}>
   {tag(`railway-axle-${n}-${a}`,cylinder(`railway-axle-${n}-${a}`,[x,10,0],1.2,42,'#a8adb5'))}
   {[-1,1].map(side=>{const id=`railway-wheel-${n}-${a}-${side}`;return <group key={side} position={[x,10,side*18]} rotation={[0,0,-(nose-d.startNose)/6]} ref={g=>{if(g)wheels.current.set(id,g);else wheels.current.delete(id);}}>
    {tag(id,<>
     {cylinder(id,[0,0,0],6,4,'#7d8791')}{cylinder(id,[0,0,-side*2.2],7,.6,'#505b65')}{cylinder(id,[0,0,side*2.2],2.3,.7,'#c5ccd2')}
     {[0,1,2,3,4,5].map(k=><mesh key={k} position={[Math.cos(k*Math.PI/3)*3.8,Math.sin(k*Math.PI/3)*3.8,side*2.04]}><sphereGeometry args={[.6,8,6]}/>{mat(id,'#333c47',.6)}</mesh>)}
    </>)}
   </group>})}
  </group>)}
 </group>})}
 {tag('railway-coupler',<>{box('railway-coupler',[-120,28,0],[20,24,12],'#29323c')}{box('railway-coupler',[-120,40.5,0],[36,1,12],'#6a7682',.5)}{[-135,-105].flatMap(x=>[-4,4].map(z=><mesh key={`${x}/${z}`} position={[x,41.3,z]}><cylinderGeometry args={[.8,.8,.6,6]}/>{mat('railway-coupler','#b9c1c8',.8)}</mesh>))}{cylinder('railway-coupler',[-120,13,0],2,20,'#737d87','x')}</>)}
 {tag('railway-headlamps',<>{[-14,14].map(z=><group key={z}>
  {cylinder('railway-headlamps',[.7,34,z],3,1.4,'#b9c1c9','x')}
  <mesh position={[1.5,34,z]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[2.2,2.2,.3,24]}/><meshStandardMaterial color={color('railway-headlamps','#f6e4bc')} emissive="#dbc18a" emissiveIntensity={selected==='railway-headlamps'?0:.2}/></mesh>
 </group>)}</>)}
 <Text font={font} fontSize={4} position={[-55,23,23.65]} color="#dfe5ea" anchorX="center">ATLAS · 01</Text>
 </group>
 </group>;
}
export default memo(RailwayTrackParts);
