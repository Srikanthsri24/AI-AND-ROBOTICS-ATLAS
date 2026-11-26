import {memo,useMemo,type ReactNode} from 'react';
import {Shape,Path} from 'three';
import {Text} from '@react-three/drei';
import {trafficParkingCircuitLayout as layout,type ParkingPoint} from '../data/traffic-parking-circuit-layout';
import {trafficParkingBarrierPlacement as servo} from '../data/traffic-parking-barrier';
import {trafficParkingBays as bays,trafficParkingUnoSupports as supports} from '../data/traffic-parking-workbench';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function TrafficParkingBenchParts({selected,choose}:{selected:string;choose:(id:string)=>void}){
 const shapes=useMemo(()=>{const post=new Shape();post.absarc(0,0,2.4,0,Math.PI*2,false);const bore=new Path();bore.absarc(0,0,.9,0,Math.PI*2,true);post.holes.push(bore);const road=new Shape(),outline=[[-95,-130],[-65,-130],[-65,-70],[-10,-70],[-10,-40],[-65,-40],[-65,20],[-95,20],[-95,-40],[-150,-40],[-150,-70],[-95,-70]];outline.forEach(([x,z],n)=>n?road.lineTo(x,-z):road.moveTo(x,-z));road.closePath();return {post,road};},[]);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color,tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();choose(id);}}>{node}</group>,box=(id:string,name:string,at:ParkingPoint,size:ParkingPoint,color:string)=><mesh name={name} position={[...at]} receiveShadow castShadow><boxGeometry args={[...size]}/><meshStandardMaterial color={c(id,color)} roughness={.7}/></mesh>;
 return <group name="traffic-parking-bench">
 {tag('tp-work-mat',box('tp-work-mat','tp-work-mat-solid',layout.mat.centre,layout.mat.size,'#39344f'))}
 {tag('tp-junction-card',<><mesh name="tp-junction-road" rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shapes.road,{depth:.05,bevelEnabled:false}]}/><meshStandardMaterial color={c('tp-junction-card','#727887')} roughness={.9}/></mesh>{box('tp-junction-card','tp-main-stop-line',[-80,.08,-32],[25,.05,1.5],'#e5dfef')}{box('tp-junction-card','tp-cross-stop-line',[-56,.08,-55],[1.5,.05,25],'#e5dfef')}</>)}
 {tag('tp-parking-card',<>{box('tp-parking-card','tp-parking-base',[92.5,.025,-35],[145,.05,170],'#807a91')}{box('tp-parking-card','tp-entrance-lane',[116,.10,-26],[24,.10,152],'#626b7b')}{box('tp-parking-card','tp-exit-lane',[150,.10,-26],[22,.10,152],'#626b7b')}</>)}
 {bays.map(b=><group key={b.id}>{tag(b.id,<>{box(b.id,b.id+'-back',[45,.10,b.z],[.8,.04,22],'#ded8e9')}{[-1,1].map(side=><group key={side}>{box(b.id,b.id+'-side-'+side,[70,.10,b.z+side*11],[50,.04,.8],'#ded8e9')}</group>)}</>)}<Text font={font} position={[49,.14,b.z]} rotation={[-Math.PI/2,0,Math.PI/2]} fontSize={3} color="#efe6ff" raycast={()=>null}>{b.number}</Text></group>)}
 <Text font={font} position={[-80,.13,8]} rotation={[-Math.PI/2,0,0]} fontSize={2.2} color="#eee7f5" raycast={()=>null}>{'MAIN\n↑'}</Text>
 <Text font={font} position={[-24,.13,-55]} rotation={[-Math.PI/2,0,0]} fontSize={2.2} color="#eee7f5" raycast={()=>null}>{'← CROSS'}</Text>
 <Text font={font} position={[116,.20,42]} rotation={[-Math.PI/2,0,0]} fontSize={2} color="#eee7f5" raycast={()=>null}>{'ENTRY ↑'}</Text>
 <Text font={font} position={[150,.20,42]} rotation={[-Math.PI/2,0,0]} fontSize={2} color="#eee7f5" raycast={()=>null}>{'EXIT ↓'}</Text>
 {tag('tp-uno-supports',<>{supports.map((p,n)=><mesh key={n} name={'tp-uno-support-'+n} position={[p.x,0,p.z]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shapes.post,{depth:p.height,bevelEnabled:false,curveSegments:32}]}/><meshStandardMaterial color={c('tp-uno-supports','#c9c7c0')} roughness={.65}/></mesh>)}</>)}
 {tag('tp-uno-fasteners',<>{supports.map((p,n)=><group key={n} name={'tp-uno-fastener-'+n} position={[p.x,0,p.z]}><mesh name={'tp-uno-shank-'+n} position={[0,13,0]}><cylinderGeometry args={[.8,.8,4,24]}/><meshStandardMaterial color={c('tp-uno-fasteners','#d0ccc4')} roughness={.6}/></mesh><mesh name={'tp-uno-head-'+n} position={[0,15.2,0]}><cylinderGeometry args={[2,2,.8,32]}/><meshStandardMaterial color={c('tp-uno-fasteners','#d0ccc4')} roughness={.6}/></mesh>{box('tp-uno-fasteners','tp-uno-drive-slot-'+n,[0,15.61,0],[2.5,.03,.3],'#777482')}</group>)}</>)}
 {tag('tp-board-bases',<>{(['resistors','buttons'] as const).map(board=><group key={board}>{box('tp-board-bases','tp-'+board+'-base',[layout[board][0],1,layout[board][2]],[47,2,35],'#c7c1b8')}</group>)}</>)}
 {tag('tp-servo-stand',<>{box('tp-servo-stand','tp-servo-stand-foot',[servo[0]+6,1.5,servo[2]-9.5],[44,3,16],'#806d94')}{[-12,24].map(x=><group key={x}>{box('tp-servo-stand','tp-servo-stand-upright-'+x,[servo[0]+x,(3+servo[1]-9)/2,servo[2]-9.5],[3.5,servo[1]-12,3.5],'#aaa3b6')}</group>)}</>)}
 <Text font={font} position={[-166,.08,131]} rotation={[-Math.PI/2,0,0]} anchorX="left" fontSize={3.7} color="#cdb8e8" raycast={()=>null}>TRAFFIC + PARKING · TWO INDEPENDENT SYSTEMS</Text>
 </group>;
}
export default memo(TrafficParkingBenchParts);
