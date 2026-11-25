import{useCallback,type RefObject}from'react';
import{OrbitControls}from'@react-three/drei';
import Prototype,{type AquacleanPrototypeProps}from'./AquacleanPrototype';
import Inspection,{type AquacleanView}from'./AquacleanInspection';
import{floodOwner,floodSurfaceAnchor,floodVisible,type FloodAnchor}from'../data/flood-surface';
export type AquacleanModelProps=AquacleanPrototypeProps&{anchor:RefObject<FloodAnchor|null>;focus:number;name:string;busy:boolean;view:AquacleanView;viewVersion:number};
export default function AquacleanWorkshopModel({anchor,focus,name,busy,view,viewVersion,select,...props}:AquacleanModelProps){const choose=useCallback((id:string)=>{if(!busy)select(id);},[busy,select]);return <><Prototype {...props} select={choose} onSurface={e=>{if(busy||!floodVisible(e.object))return;const id=floodOwner(e.object);if(!id)return;e.stopPropagation();anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);select(id);}}/><OrbitControls makeDefault target={[-2.8,2.4,.3]} maxDistance={85} minDistance={.05} maxPolarAngle={Math.PI-.01}/><Inspection {...{anchor,focus,name,busy,view,viewVersion}} selected={props.selected}/></>}
