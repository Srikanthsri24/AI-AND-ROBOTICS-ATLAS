import type {ThreeEvent} from '@react-three/fiber';
import {memo,useMemo} from 'react';
import {useGLTF} from '@react-three/drei';
import {DoubleSide,Shape,Path,type Mesh} from 'three';
import {soapHandSkin} from './soap-hand-skin';
import {soapHandNails} from './soap-hand-nails';
import {soapHandRegions} from '../data/soap-dispenser-hand';
const asset=new URL('./models/project-soap-hand.glb',document.baseURI).href;
function SoapHandParts({selected,choose,position=[25,170,75]}:{selected:string;choose:(id:string)=>void;position?:readonly[number,number,number]}){const {nodes}=useGLTF(asset),skin=useMemo(soapHandSkin,[]),nails=useMemo(()=>soapHandNails(soapHandRegions.map(id=>(nodes[id+'-skin'] as Mesh).geometry)),[nodes]),cuff=useMemo(()=>{const s=new Shape();s.absellipse(0,0,28,18,0,Math.PI*2,false,0);const h=new Path();h.absellipse(0,0,25,15,0,Math.PI*2,true,0);s.holes.push(h);return s;},[]);return <group name='soap-human-hand' position={[...position]}>{soapHandRegions.map((id,i)=><group key={id} name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}><mesh name={id+'-skin'} geometry={(nodes[id+'-skin'] as Mesh).geometry} castShadow><meshPhysicalMaterial color={selected===id?'#b78be8':'#bc8c73'} map={skin.map} bumpMap={skin.bump} bumpScale={.003} roughness={.62} sheen={.2} sheenColor='#b77967'/></mesh>{i>=1&&i<=5&&<mesh name={id+'-nail'} geometry={nails[i-1]}><meshPhysicalMaterial side={DoubleSide} color={selected===id?'#b78be8':'#e6c3af'} roughness={.38} clearcoat={.35}/></mesh>}{i===6&&<mesh name='soap-hand-shirt-cuff' position={[100,-13,4]} rotation={[0,Math.PI/2,0]}><extrudeGeometry args={[cuff,{depth:110,bevelEnabled:false,curveSegments:48}]}/><meshStandardMaterial color={selected===id?'#b78be8':'#48566d'} roughness={.95}/></mesh>}</group>)}</group>;}
export default memo(SoapHandParts);
