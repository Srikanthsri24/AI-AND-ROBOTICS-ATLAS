import type {RefObject,ComponentProps} from 'react';
import {OrbitControls} from '@react-three/drei';
import Prototype from './EmergencyWorkshopPrototype';
import Inspection,{type EmergencyWorkshopView} from './EmergencyWorkshopInspection';
import {floodOwner,floodSurfaceAnchor,type FloodAnchor} from '../data/flood-surface';
export default function EmergencyWorkshopModel({anchor,focus,busy,view,name,viewVersion,...props}:ComponentProps<typeof Prototype>&{anchor:RefObject<FloodAnchor|null>;focus:number;busy:boolean;view:EmergencyWorkshopView;name:string;viewVersion:number}){
 return <><Prototype {...props} controls={false} select={id=>{if(!busy)props.select?.(id);}} onSurface={e=>{if(busy)return;e.stopPropagation();const id=floodOwner(e.object);if(id){anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);props.select?.(id);}}}/><OrbitControls makeDefault target={[0,.25,0]} minDistance={.03} maxDistance={25} maxPolarAngle={Math.PI-.01}/><Inspection selected={props.selected??''} {...{anchor,focus,busy,view,name,viewVersion}}/></>;
}
