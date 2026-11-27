import Mounts from './RoverArmBoardMounts';
import Uno from './RoverArmUnoParts';
import Pca from './RoverArmPcaParts';
import {raArmUnoAt,raArmPcaAt} from '../data/rover-arm-electronics';
import {raArmBoardFitPart,type RaArmBoardAssembly} from '../data/rover-arm-board-assembly';
/** Millimetre-scale mounting stage; both sources remain disconnected. */
export default function RoverArmBoardAssembly({assembly,selected,choose}:{assembly:RaArmBoardAssembly;selected:string;choose:(id:string)=>void}){
 const uno=raArmBoardFitPart(assembly,'uno-board'),pca=raArmBoardFitPart(assembly,'pca-board'),travel=(t:number)=>25*(1-t*t*(3-2*t));
 return <group name="ra-board-assembly"><Mounts {...{assembly,selected,choose}}/>{uno.visible&&<group position={[raArmUnoAt[0],raArmUnoAt[1]+travel(uno.progress),raArmUnoAt[2]]}><Uno {...{selected,choose}} powered={false}/></group>}{pca.visible&&<group position={[raArmPcaAt[0],raArmPcaAt[1]+travel(pca.progress),raArmPcaAt[2]]}><Pca {...{selected,choose}}/></group>}</group>;
}
