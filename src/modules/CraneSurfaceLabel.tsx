import {useRef,useState,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {Object3D} from 'three';
import '../styles/crane-surface-label.css';
import {WorldLabel} from './LabWorkbench';
import {floodAnchorWorld,floodOwner,floodVisible,type FloodAnchor} from '../data/flood-surface';
/** Follows the clicked triangle on the actual part, including moving hoist/load geometry. */
export default function CraneSurfaceLabel({anchor,selected,name,calloutGap=12,targetRadius=.004}:{calloutGap?:number;targetRadius?:number;anchor:RefObject<FloodAnchor|null>;selected:string;name:string}){const marker=useRef<Object3D>(null),[valid,setValid]=useState(false);useFrame(()=>{const a=anchor.current,ok=!!a&&!!a.object.parent&&floodVisible(a.object)&&floodOwner(a.object)===selected;if(valid!==ok)setValid(ok);if(marker.current){marker.current.visible=ok;if(ok&&a)marker.current.position.copy(floodAnchorWorld(a));}});return <group ref={marker} name="crane-selected-surface"><mesh name="crane-surface-target" raycast={()=>{}}><sphereGeometry args={[targetRadius,12,12]}/><meshBasicMaterial color="#8051bd"/></mesh>{valid&&<WorldLabel position={[0,0,0]} className="lw-part-label crane-surface-label" keepInView avoidOverlap calloutGap={calloutGap}><span style={{pointerEvents:'none'}}>{name}</span></WorldLabel>}</group>;}
