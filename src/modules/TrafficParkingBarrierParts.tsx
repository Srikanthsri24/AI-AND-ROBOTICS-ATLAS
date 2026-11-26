import {memo,useMemo,type ReactNode} from 'react';
import {Path,Shape} from 'three';
import {trafficParkingBarrierRotation} from '../data/traffic-parking-barrier';
const rect=(x0:number,y0:number,x1:number,y1:number)=>{const s=new Shape();s.moveTo(x0,y0);s.lineTo(x1,y0);s.lineTo(x1,y1);s.lineTo(x0,y1);s.closePath();return s;};
const hole=(s:Shape,x:number,y:number,r:number)=>{const h=new Path();h.absarc(x,y,r,0,Math.PI*2,true);s.holes.push(h);};
/** Shaft points along +Z; all dimensions are authored millimetres. */
function TrafficParkingBarrierParts({selected,choose,angle=20,cutaway=false}:{selected:string;choose:(id:string)=>void;angle?:number;cutaway?:boolean}){
 const shapes=useMemo(()=>{const cover=rect(-6,-6,17,6);hole(cover,0,0,1.15);const ears=[rect(-13,-6,-6,6),rect(17,-6,25,6)];hole(ears[0],-9.5,0,1.1);hole(ears[1],21,0,1.1);const bracket=rect(-14,-9,26,9),cut=new Path();cut.moveTo(-6.3,-6.3);cut.lineTo(-6.3,6.3);cut.lineTo(17.3,6.3);cut.lineTo(17.3,-6.3);cut.closePath();bracket.holes.push(cut);hole(bracket,-9.5,0,1.1);hole(bracket,21,0,1.1);const horn=new Shape();horn.moveTo(3.464,2);horn.lineTo(70,2);horn.quadraticCurveTo(72,2,72,0);horn.quadraticCurveTo(72,-2,70,-2);horn.lineTo(3.464,-2);horn.absarc(0,0,4,-Math.PI/6,-Math.PI*11/6,true);horn.closePath();hole(horn,0,0,1.05);return {cover,ears,bracket,horn};},[]);
 const c=(id:string,normal:string)=>selected===id?'#b78be8':normal,tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();choose(id);}}>{node}</group>;
 const box=(id:string,name:string,at:[number,number,number],size:[number,number,number],color:string,glass=false)=><mesh name={name} position={at}><boxGeometry args={size}/>{glass?<meshPhysicalMaterial color={c(id,color)} transparent opacity={.72} roughness={.22} clearcoat={.9}/>:<meshStandardMaterial color={c(id,color)} roughness={.55}/>}</mesh>;
 const disc=(id:string,name:string,at:[number,number,number],radius:number,depth:number,color:string,metal=false)=><mesh name={name} position={at} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[radius,radius,depth,40]}/><meshStandardMaterial color={c(id,color)} roughness={metal?.28:.55} metalness={metal?.8:0}/></mesh>;
 const gear=(x:number,z:number,r:number,n:number,rotation:number)=><group position={[x,0,z]} rotation={[0,0,rotation]}>{disc('tp-servo-gears',`tp-gear-${x}-${z}-disc`,[0,0,0],r-.22,.8,'#e4dec9')}{Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2;return <group key={i} position={[r*Math.cos(a),r*Math.sin(a),0]} rotation={[0,0,a]}>{box('tp-servo-gears',`tp-gear-${x}-${z}-tooth-${i}`,[0,0,0],[.4,.36,.8],'#e4dec9')}</group>;})}</group>;
 const rotation=trafficParkingBarrierRotation(angle);
 return <group name="traffic-parking-barrier">
 {tag('tp-servo-case',<>
 {box('tp-servo-case','tp-servo-left-wall',[-5.6,0,-11.9],[.8,12,23.8],'#2863a2',true)}
 {box('tp-servo-case','tp-servo-right-wall',[16.6,0,-11.9],[.8,12,23.8],'#2863a2',true)}
 {box('tp-servo-case','tp-servo-bottom-wall',[5.5,-5.6,-11.9],[21.4,.8,23.8],'#2863a2',true)}
 {!cutaway&&<>{box('tp-servo-case','tp-servo-top-wall',[5.5,5.6,-11.9],[21.4,.8,23.8],'#2863a2',true)}{box('tp-servo-case','tp-servo-back-wall',[5.5,0,-23.4],[21.4,10.4,.8],'#2863a2',true)}<mesh name="tp-servo-front-cover"><extrudeGeometry args={[shapes.cover,{depth:.8,bevelEnabled:false,curveSegments:32}]}/><meshPhysicalMaterial color={c('tp-servo-case','#2863a2')} transparent opacity={.72} roughness={.22} clearcoat={.9}/></mesh></>}
 {shapes.ears.map((shape,n)=><mesh key={n} name={'tp-servo-ear-'+n} position={[0,0,-8]}><extrudeGeometry args={[shape,{depth:2,bevelEnabled:false,curveSegments:32}]}/><meshStandardMaterial color={c('tp-servo-case','#2863a2')} roughness={.4}/></mesh>)}
 </>)}
 {tag('tp-servo-motor',<>{disc('tp-servo-motor','tp-servo-motor-can',[10,0,-13],3.2,14,'#b7bec5',true)}{disc('tp-servo-motor','tp-servo-motor-shaft',[10,0,-4.4],.45,3.2,'#b7bec5',true)}</>)}
 {tag('tp-servo-gears',<>{gear(10,-4.7,1,8,rotation*12)}{gear(6.5,-4.7,2.1,18,-rotation*6)}{gear(5.4,-2.4,.8,8,-rotation*6)}{gear(0,-2.4,4.1,32,rotation)}{disc('tp-servo-gears','tp-servo-output-shaft',[0,0,-3.5],1,14,'#b9bfc7',true)}</>)}
 {tag('tp-servo-feedback',disc('tp-servo-feedback','tp-servo-feedback-body',[0,0,-10],3,2,'#aa8969'))}
 {tag('tp-servo-pcb',<>{box('tp-servo-pcb','tp-servo-control-board',[5.5,-4.8,-14],[19,.6,14],'#2e8671')}{box('tp-servo-pcb','tp-servo-control-chip',[1,-4.05,-14],[4,.9,3],'#25313b')}{[-1,1].flatMap(side=>Array.from({length:4},(_,i)=><group key={side+'/'+i}>{box('tp-servo-pcb','tp-servo-control-pad-'+side+'-'+i,[-.5+i,-4.35,-14+side*2],[.4,.25,1],'#b7bfc5')}</group>))}</>)}
 <group name="tp-barrier-motion" rotation={[0,0,rotation]}>
 {tag('tp-gate-horn',<><mesh name="tp-gate-horn-solid" position={[0,0,2]}><extrudeGeometry args={[shapes.horn,{depth:1.6,bevelEnabled:false,curveSegments:40}]}/><meshStandardMaterial color={c('tp-gate-horn','#eee9df')} roughness={.45}/></mesh>{[12,25,38,51,64].map(x=><group key={x}>{box('tp-gate-horn','tp-gate-stripe-front-'+x,[x,0,3.65],[5,4,.1],'#bc425d')}{box('tp-gate-horn','tp-gate-stripe-back-'+x,[x,0,1.95],[5,4,.1],'#bc425d')}</group>)}</>)}
 </group>
 {tag('tp-horn-screw',<>{disc('tp-horn-screw','tp-horn-screw-shank',[0,0,1.9],.45,5.6,'#aeb8c4',true)}<group position={[0,0,4.9]}>{box('tp-horn-screw','tp-horn-screw-head-left',[-.8,0,0],[.7,2.3,.7],'#aeb8c4')}{box('tp-horn-screw','tp-horn-screw-head-right',[.8,0,0],[.7,2.3,.7],'#aeb8c4')}{box('tp-horn-screw','tp-horn-screw-head-floor',[0,0,-.25],[.9,2.3,.2],'#aeb8c4')}</group></>)}
 {tag('tp-servo-bracket',<mesh name="tp-servo-bracket-sheet" position={[0,0,-10]}><extrudeGeometry args={[shapes.bracket,{depth:1,bevelEnabled:false,curveSegments:32}]}/><meshStandardMaterial color={c('tp-servo-bracket','#574276')} roughness={.55}/></mesh>)}
 {[-9.5,21].map((x,n)=>{const id='tp-servo-bolt-'+(n?'right':'left');return <group key={id}>{tag(id,<>{disc(id,id+'-shank',[x,0,-8],.75,7,'#b5becb',true)}<mesh name={id+'-head'} position={[x,0,-4.8]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[1.8,1.8,.8,6]}/><meshStandardMaterial color={c(id,'#b5becb')} metalness={.8} roughness={.3}/></mesh></>)}</group>;})}
 </group>;
}
export default memo(TrafficParkingBarrierParts);
