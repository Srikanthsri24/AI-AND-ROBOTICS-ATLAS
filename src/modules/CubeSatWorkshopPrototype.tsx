import type {RefObject} from 'react';
import type {Texture} from 'three';
import Chassis from './CubeSatChassisParts';
import Camera from './CubeSatCameraParts';
import Electronics from './CubeSatElectronicsParts';
import Harness from './CubeSatHarnessParts';
import Radio from './CubeSatRadioParts';
import Coax from './CubeSatCoaxParts';
import Solar from './CubeSatSolarParts';
import Power from './CubeSatSolarPowerParts';
import Ground from './CubeSatGroundStationParts';
import AssemblyRig from './CubeSatAssemblyRig';
/** Unregistered foundation. Assembly uses open wings; mission controls/connector motion are still being integrated. */
export default function CubeSatWorkshopPrototype({selected='',select=()=>{},assembly,occupied=false,transmitting=false,deployment=1,image=null,opticalInspection=false,shieldOpen=false,inspectCoax=false,inspectPower=false,inspectStationSockets=false}:{selected?:string;select?:(id:string)=>void;assembly?:RefObject<number>;occupied?:boolean;transmitting?:boolean;deployment?:number;image?:Texture|null;opticalInspection?:boolean;shieldOpen?:boolean;inspectCoax?:boolean;inspectPower?:boolean;inspectStationSockets?:boolean}){
 const props={selected,select},wings=assembly?1:deployment,parts=<><Chassis {...props}/><Camera {...props} opticalInspection={opticalInspection}/><Electronics {...props} occupied={occupied}/><Harness {...props} assembly={assembly}/><Radio {...props} shieldOpen={shieldOpen} transmitting={transmitting}/><Coax {...props} hide={inspectCoax} assembly={assembly}/><Solar {...props} deployment={wings}/><Power {...props} deployment={wings} hideLeads={inspectPower}/><Ground {...props} receiving={transmitting} image={image} inspectSockets={inspectStationSockets}/></>;
 return <group name="cubesat-workshop-mm">{assembly?<AssemblyRig progress={assembly}>{parts}</AssemblyRig>:parts}</group>;
}
