import{memo,useMemo,type ReactNode}from'react';
import{Text}from'@react-three/drei';
import{Path,Shape}from'three';
import Uno from'./BluetoothCarUno';
import Board from'./BluetoothMiniBreadboard';
import ControllerParts from'./FloodControllerParts';
import{gateElectronics as d,gateServoContacts,gateSupplyPorts}from'../data/flood-gate-wiring';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function FloodGateElectricalParts({selected,select,logicPower=true,servoPower=true}:{selected:string;select:(id:string)=>void;logicPower?:boolean;servoPower?:boolean}){
 const c=(id:string,color:string)=>selected===id?'#b78be8':color,tag=(id:string,node:ReactNode,key=id)=><group key={key} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>,box=(at:[number,number,number],size:[number,number,number],color:string)=><mesh position={at} castShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.55}/></mesh>;
 const plug=useMemo(()=>{const s=new Shape();s.moveTo(-4.1,-3.5);s.lineTo(4.1,-3.5);s.lineTo(4.1,3.5);s.lineTo(-4.1,3.5);s.closePath();for(const x of[-2.54,0,2.54]){const h=new Path();h.moveTo(x-.6,-.6);h.lineTo(x-.6,.6);h.lineTo(x+.6,.6);h.lineTo(x+.6,-.6);h.closePath();s.holes.push(h);}return s;},[]);
 return <><group position={d.uno} scale={50}><Uno {...{selected,select}} powered={logicPower}/></group><ControllerParts {...{selected,select}} powered={logicPower}/>
 {tag('gate-breadboard',<group position={d.board} scale={50}><Board selected={selected==='gate-breadboard'} supplyLabel="No rail" returnLabel="No rail"/></group>)}
 {tag('gate-servo-plug',<><mesh position={[-272,1,40]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[plug,{depth:8,bevelEnabled:false}]}/><meshStandardMaterial color={c('gate-servo-plug','#293449')} roughness={.6}/></mesh>{gateServoContacts.map(p=><group key={p.id}>{box([p.x,4.2,40],[.7,.5,.7],c('gate-servo-plug','#b8a878'))}{box([p.x,5.3,40.5],[.5,2,.15],c('gate-servo-plug','#b8a878'))}</group>)}</>)}
 {tag('gate-supply-case',<>{box(d.supply,[72,32,50],c('gate-supply-case','#d4dbe5'))}{box([-310,17,133.2],[64,25,.5],c('gate-supply-case','#39445b'))}<Text position={[-310,26,133.6]} font={font} fontSize={3.2} color="#f1ebfa">REGULATED SERVO SUPPLY</Text><mesh position={[-310,18,133.6]}><planeGeometry args={[18,6]}/><meshBasicMaterial color={servoPower?'#b7e3d1':'#65718a'}/></mesh><Text position={[-310,18,133.8]} font={font} fontSize={3} color="#253a4b">{servoPower?'5.0 V':'OFF'}</Text></>)}
 {gateSupplyPorts.map(p=>tag(p.id==='positive'?'gate-supply-positive':'gate-supply-negative',<group position={[p.x,15,134]}><mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[2.8,2.8,3,24]}/><meshStandardMaterial color={c(p.id==='positive'?'gate-supply-positive':'gate-supply-negative',p.color)} roughness={.5}/></mesh><mesh position={[0,0,5]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[1.1,1.1,8,20]}/><meshStandardMaterial color={c(p.id==='positive'?'gate-supply-positive':'gate-supply-negative','#b9c0c8')} metalness={.8} roughness={.3}/></mesh><mesh position={[0,0,8]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[2.1,2.1,2,6]}/><meshStandardMaterial color={c(p.id==='positive'?'gate-supply-positive':'gate-supply-negative','#b9c0c8')} metalness={.8} roughness={.3}/></mesh>{p.id==='negative'&&<mesh position={[8,0,2]}><boxGeometry args={[16,1,.7]}/><meshStandardMaterial color={c('gate-supply-negative','#b9c0c8')} metalness={.8} roughness={.3}/></mesh>}<Text position={[0,-8,0]} font={font} fontSize={1.7} color="#dce3ed">{p.label}</Text></group>,p.id))}
 </>;
}
export default memo(FloodGateElectricalParts);
