import {memo,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {CatmullRomCurve3,Group,Mesh,Quaternion,Vector3} from 'three';
import {SolarMeterSolid as Box} from './SolarMeterParts';
import {bluetoothCarWires,carCableControlPoints,type CarTerminal,type CarWire} from '../data/bluetooth-car-wiring';
const violet='#b78be8';
export function CarWireTerminal({terminal,selected,color,exact=false}:{terminal:CarTerminal;selected:boolean;color:string;exact?:boolean}){
 const key=terminal.axis.join(','),rotation=useMemo(()=>new Quaternion().setFromUnitVectors(new Vector3(0,1,0),new Vector3(...terminal.axis)),[key]),plastic=selected?violet:'#222e38',metal=selected?'#c6a1ec':'#c3b99a';
 const inserted=terminal.insertion??.11,base=.12-inserted;
 return <group position={terminal.at} quaternion={rotation}>
 {terminal.type==='male-jumper'?<><Box exact={exact} at={[0,base+.095,0]} size={[.040,.190,.040]} color={plastic}/><Box exact={exact} at={[0,.065-inserted,0]} size={[.012,.130,.012]} color={metal} metal={.75}/>{[-1,1].map(side=><Box exact={exact} key={side} at={[side*.0205,base+.12,0]} size={[.002,.016,.033]} color={selected?violet:color}/>)}</>:terminal.type==='female-jumper'?<>
 {[-1,1].map(side=><group key={side}><Box exact={exact} at={[side*.0145,.040,0]} size={[.011,.160,.040]} color={plastic}/><Box exact={exact} at={[0,.040,side*.0145]} size={[.018,.160,.011]} color={plastic}/><Box exact={exact} at={[side*.0065,-.012,0]} size={[.004,.065,.014]} color={metal} metal={.75}/></group>)}<Box exact={exact} at={[0,.115,0]} size={[.040,.010,.040]} color={plastic}/>{[-1,1].map(side=><Box exact={exact} key={side} at={[side*.0205,.07,0]} size={[.002,.016,.033]} color={selected?violet:color}/>)}</>:<>
 <mesh><sphereGeometry args={[.018,14,10]}/><meshStandardMaterial color={metal} metalness={.75} roughness={.35}/></mesh><mesh position={[0,.022,0]}><cylinderGeometry args={[.006,.006,.044,10]}/><meshStandardMaterial color={selected?violet:'#bb9368'} metalness={.65} roughness={.4}/></mesh></>}
 </group>;
}
const Cable=memo(function Cable({wire,selected,select,signature}:{wire:CarWire;selected:boolean;select:(id:string)=>void;signature:string}){
 const group=useRef<Group>(null),tube=useRef<Mesh>(null),elapsed=useRef(0),reduced=useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches),curve=useMemo(()=>new CatmullRomCurve3(carCableControlPoints(wire).map(p=>new Vector3(...p)),false,'centripetal'),[signature]);
 useFrame((_,dt)=>{elapsed.current+=dt;const progress=reduced.current?1:Math.min(1,elapsed.current/.95);tube.current?.geometry.setDrawRange(0,Math.floor(progress*64)*48);if(group.current)group.current.userData.busy=progress<1;});
 return <group ref={group} name='bluetooth-wire-route' userData={{partId:wire.id,busy:true}} onClick={e=>{e.stopPropagation();select(wire.id);}}>
  <mesh ref={tube} castShadow><tubeGeometry args={[curve,64,wire.motor?.011:.008,8,false]}/><meshStandardMaterial color={selected?violet:wire.color} roughness={.48}/></mesh>
  {wire.ends.map((terminal,index)=><CarWireTerminal key={index} {...{terminal,selected}} color={wire.color}/>)}
 </group>;
},(a,b)=>a.signature===b.signature&&a.selected===b.selected&&a.select===b.select);
export const CarCableRoutes=memo(function CarCableRoutes({wires,selected,select}:{wires:CarWire[];selected:string;select:(id:string)=>void}){return <>{wires.map(w=><Cable key={w.id} wire={w} selected={selected===w.id} select={select} signature={w.points.map(p=>p.join(',')).join('|')+';'+w.ends.map(e=>e.insertion??'').join(',')}/>)}</>;});
export default memo(function BluetoothCarWiring({step,selected,select,leftReversed=false,rightReversed=false,ctsLift=0}:{step:number;selected:string;select:(id:string)=>void;leftReversed?:boolean;rightReversed?:boolean;ctsLift?:number}){
 const wires=useMemo(()=>bluetoothCarWires(leftReversed,rightReversed,ctsLift),[leftReversed,rightReversed,ctsLift]);
 return <CarCableRoutes wires={wires.filter(w=>w.step<=step)} selected={selected} select={select}/>;
});
