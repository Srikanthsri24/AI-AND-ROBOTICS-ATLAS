import Header from './SchoolBellRtcHeaderParts';
import {memo,useMemo,type ReactNode} from 'react';
import {Shape,Path,Vector3,Quaternion} from 'three';
import {Text} from '@react-three/drei';
import type {ThreeEvent} from '@react-three/fiber';
import layout from '../data/ds3231-rtc-layout.json';
type P=readonly[number,number,number];
type Pad={name:string;x:string;y:string;dx:string;dy:string};
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
/** Original Adafruit Eagle XY layout; see bundled notices. Heights/materials
 * are authored visualization dimensions, not a manufacturer 3D model. */
function SchoolBellRtcParts({selected,choose}:{selected:string;choose:(id:string)=>void}){
 const board=useMemo(()=>{const s=new Shape(),pending=layout.outline.map(w=>({x1:+w.x1,y1:+w.y1,x2:+w.x2,y2:+w.y2,curve:Number(('curve' in w?w.curve:0)??0)}));let x=pending[0].x1,y=pending[0].y1;s.moveTo(x,y);while(pending.length){const n=pending.findIndex(w=>Math.hypot(w.x1-x,w.y1-y)<.001||Math.hypot(w.x2-x,w.y2-y)<.001);if(n<0)throw Error('Disconnected RTC outline');let w=pending.splice(n,1)[0];if(Math.hypot(w.x1-x,w.y1-y)>.001)w={x1:w.x2,y1:w.y2,x2:w.x1,y2:w.y1,curve:-w.curve};if(w.curve){const a=w.curve*Math.PI/180,dx=w.x2-w.x1,dy=w.y2-w.y1,d=Math.hypot(dx,dy),h=d/(2*Math.tan(a/2)),cx=(w.x1+w.x2)/2-dy/d*h,cy=(w.y1+w.y2)/2+dx/d*h,start=Math.atan2(w.y1-cy,w.x1-cx);s.absarc(cx,cy,Math.hypot(w.x1-cx,w.y1-cy),start,start+a,a<0);}else s.lineTo(w.x2,w.y2);x=w.x2;y=w.y2;}s.closePath();for(const p of layout.pads){const hole=new Path();hole.absarc(p.x,p.y,p.drill/2,0,Math.PI*2,true);s.holes.push(hole);}return s;},[]);
 const c=(id:string,color:string)=>id===selected?'#b78be8':color,tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 const box=(id:string,p:P,size:P,color:string,metal=0)=><mesh position={[...p]} castShadow><boxGeometry args={[...size]}/><meshStandardMaterial color={c(id,color)} roughness={metal?.3:.5} metalness={metal}/></mesh>;
 const bar=(id:string,a:P,b:P)=>{const from=new Vector3(...a),to=new Vector3(...b),q=new Quaternion().setFromUnitVectors(new Vector3(0,1,0),to.clone().sub(from).normalize());return <mesh position={from.clone().add(to).multiplyScalar(.5)} quaternion={q}><boxGeometry args={[.5,from.distanceTo(to),.15]}/><meshStandardMaterial color={c(id,'#bdc6ce')} metalness={.8} roughness={.3}/></mesh>;};
 const chip=layout.elements.find(e=>e.name==='IC1')!,chipPads=(layout.packages['adafruit/SO16W'].smd as Pad[]);
 return <group name="school-rtc-hardware"><Header selected={selected} choose={choose}/>
 {tag('school-rtc-board',<mesh name="school-rtc-substrate" rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[board,{depth:1.6,bevelEnabled:false,curveSegments:32}]}/><meshStandardMaterial color={c('school-rtc-board','#185b77')} roughness={.55}/></mesh>)}
 {tag('school-rtc-plating',<>{layout.pads.flatMap((p,n)=>[0,1.6].map(height=><mesh key={n+':'+height} name={'school-rtc-pad-'+p.element+'-'+p.name+'-'+height} position={[p.x,height+(height?.02:-.02),-p.y]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[p.drill/2,p.diameter/2,32]}/><meshStandardMaterial color={c('school-rtc-plating','#c6b781')} metalness={.8} roughness={.3}/></mesh>))}</>)}
 {tag('school-rtc-copper',<>{layout.traces.map((w,n)=><mesh key={n} name={'school-rtc-trace-'+n} position={[(+w.x1+ +w.x2)/2,w.layer==='1'?1.61:-.01,-(+w.y1+ +w.y2)/2]} rotation={[0,Math.atan2(+w.y2- +w.y1,+w.x2- +w.x1),0]}><boxGeometry args={[Math.hypot(+w.x2- +w.x1,+w.y2- +w.y1),.015,+w.width]}/><meshStandardMaterial color={c('school-rtc-copper','#6e9c9e')} metalness={.65} roughness={.4}/></mesh>)}</>)}
 {tag('school-rtc-ic',<group position={[+chip.x,0,-(+chip.y)]} rotation={[0,Math.PI/2,0]}>{box('school-rtc-ic',[0,3,0],[10.3,2.4,7.5],'#272e36')}{chipPads.map(p=>{const sign=Math.sign(+p.y);return <group key={p.name}><mesh name={'school-rtc-ic-pad-'+p.name} position={[+p.x,1.63,-(+p.y)]}><boxGeometry args={[+p.dx,.06,+p.dy]}/><meshStandardMaterial color={c('school-rtc-ic','#c0c9ce')} metalness={.8} roughness={.3}/></mesh>{bar('school-rtc-ic',[+p.x,2.6,-sign*3.7],[+p.x,2.6,-sign*4])}{bar('school-rtc-ic',[+p.x,2.6,-sign*4],[+p.x,1.74,-sign*4.4])}{bar('school-rtc-ic',[+p.x,1.74,-sign*4.4],[+p.x,1.74,-sign*5.4])}</group>;})}<Text font={font} position={[0,4.21,0]} rotation={[-Math.PI/2,0,0]} fontSize={1.25} color="#c9d0d5">DS3231</Text></group>)}
 {layout.elements.filter(e=>['R1','R2','C1'].includes(e.name)).map(e=>{const id='school-rtc-'+e.name.toLowerCase(),pads=(layout.packages as Record<string,{smd:Pad[]}>)[e.library+'/'+e.package].smd;return <group key={id}>{tag(id,<group position={[+e.x,0,-(+e.y)]} rotation={[0,Number(('rot' in e?e.rot:'R0')?.replace('R','')??0)*Math.PI/180,0]}>{box(id,[0,1.97,0],[1.9,.62,1.25],e.name==='C1'?'#bba17f':'#303a44')}{pads.map(p=><group key={p.name}>{box(id,[+p.x,1.64,-(+p.y)],[+p.dx,.08,+p.dy],'#c2c9cd',.8)}</group>)}</group>)}</group>;})}
 </group>;
}
export default memo(SchoolBellRtcParts);
