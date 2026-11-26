import {memo,useRef,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {Group,Matrix3,Vector3,type Object3D} from 'three';
import Track from './RailwayTrackParts';
import Beams from './RailwayBeamParts';
import Barrier from './RailwayBarrierParts';
import Electrical from './RailwayElectricalParts';
import Uno from './RailwayUnoParts';
import Supply from './RailwaySupplyParts';
import Controls from './RailwayControlJumpers';
import Feeds from './RailwaySensorFeeds';
import Leads from './RailwaySensorLeads';
import Usb from './RailwayUsbParts';
import {railwayAssemblyMotion,railwayAssemblyParts,railwayAssemblyPose} from '../data/railway-assembly';
import {railwayInitial,railwayDefaults,type RailwayClock,type RailwayInputs} from '../data/railway-workshop';
import type {RailwayWithdrawal} from '../data/railway-control-jumpers';
import type {RailwayUsbMotion} from '../data/railway-usb';
export type RailwayAssemblyRuntime={clock:RefObject<RailwayClock>;inputs:RefObject<RailwayInputs>;controls:RefObject<readonly RailwayWithdrawal[]>;feeds:RefObject<readonly RailwayWithdrawal[]>;leads:RefObject<readonly RailwayWithdrawal[]>;usb:RefObject<RailwayUsbMotion>;warning:RefObject<boolean>};
export function createRailwayAssemblyRuntime():RailwayAssemblyRuntime{return{clock:{current:railwayInitial()},inputs:{current:{...railwayDefaults}},controls:{current:[]},feeds:{current:[]},leads:{current:[]},usb:{current:{usb:false,usbUno:12,usbHost:12}},warning:{current:false}};}
type Owner={node:Object3D;rest:Vector3;visible:boolean;id:string;ancestor:string|undefined};
function RailwayAssemblyPrototype({progress,runtime,selected='',select=()=>{}}:{progress:RefObject<number>;runtime:RailwayAssemblyRuntime;selected?:string;select?:(id:string)=>void}){
 const root=useRef<Group>(null),owners=useRef<Owner[]>([]),lastMotion=useRef(-1),lastPose=useRef(-1);
 useFrame(()=>{const p=progress.current;if(p===lastMotion.current)return;const m=railwayAssemblyMotion(p);runtime.clock.current=m.clock;runtime.inputs.current=m.raw;runtime.controls.current=m.controls;runtime.feeds.current=m.feeds;runtime.leads.current=m.leads;runtime.usb.current=m.usb;runtime.warning.current=m.circuit.warningConnected;lastMotion.current=p;},-3);
 useFrame(()=>{const r=root.current,p=progress.current;if(!r||p===lastPose.current)return;if(!owners.current.length){const ids=new Set<string>();r.traverse(node=>{const id=node.userData.partId as string|undefined;if(!id)return;if(ids.has(id)||!railwayAssemblyParts.some(part=>part.id===id))throw Error('Invalid railway assembly owner '+id);ids.add(id);let parent=node.parent;while(parent&&parent!==r&&!parent.userData.partId)parent=parent.parent;owners.current.push({node,id,rest:node.position.clone(),visible:node.visible,ancestor:parent?.userData.partId});});if(ids.size!==railwayAssemblyParts.length)throw Error('Incomplete railway assembly scene');}
 r.updateWorldMatrix(true,true);const rootLinear=new Matrix3().setFromMatrix4(r.matrixWorld);for(const item of owners.current){const pose=railwayAssemblyPose(item.id,p),ancestor=item.ancestor?railwayAssemblyPose(item.ancestor,p).offset:[0,0,0];const delta=new Vector3(...pose.offset).sub(new Vector3(...ancestor)).applyMatrix3(rootLinear);item.node.parent!.updateWorldMatrix(true,false);delta.applyMatrix3(new Matrix3().setFromMatrix4(item.node.parent!.matrixWorld).invert());item.node.position.copy(item.rest).add(delta);item.node.visible=item.visible&&pose.visible;}
 r.updateWorldMatrix(true,true);r.userData.assemblyProgress=p;lastPose.current=p;},-.5);
 return <group ref={root} name="railway-assembly-prototype">
  <Track selected={selected} select={select} clock={runtime.clock}/>
  <Beams selected={selected} select={select} inputs={runtime.inputs}/>
  <Barrier selected={selected} select={select} clock={runtime.clock}/>
  <Electrical selected={selected} select={select} clock={runtime.clock} warningConnected={runtime.warning}/>
  <Uno selected={selected} select={select} clock={runtime.clock}/>
  <Supply selected={selected} select={select} inputs={runtime.inputs}/>
  <Controls selected={selected} select={select} motion={runtime.controls}/>
  <Feeds selected={selected} select={select} motion={runtime.feeds}/>
  <Leads selected={selected} select={select} motion={runtime.leads} inputs={runtime.inputs}/>
  <Usb selected={selected} select={select} motion={runtime.usb}/>
 </group>;
}
export default memo(RailwayAssemblyPrototype);
