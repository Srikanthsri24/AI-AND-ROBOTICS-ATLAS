import {memo} from 'react';
import {lidarAssemblyAt} from '../data/lidar-workshop-assembly';
import {lidarHardwareReference as ref,lidarBenchSupports} from '../data/lidar-workshop-layout';
import AirframeSource from './LidarAirframe';
import PropellersSource from './LidarPropellers';
import RadioSource from './LidarRadio';
import BenchSource from './LidarBench';
import BatterySource,{LidarMediumPins as PinsSource} from './LidarBattery';
import {MultiRangerDeck as MultiSource,FlowDeckV2 as FlowSource,LidarSolid as Box} from './LidarDecks';
const Airframe=memo(AirframeSource),Radio=memo(RadioSource),Bench=memo(BenchSource),Battery=memo(BatterySource),Propellers=memo(PropellersSource),MultiRangerDeck=memo(MultiSource),FlowDeckV2=memo(FlowSource),LidarMediumPins=memo(PinsSource);
/** Full-size mm geometry; the parent scene applies lidarMm once, including the bench supports. */
export default function LidarAssembly({progress,selected,select,powered=false,showHost=false,showBench=false,cardDistance=750,cardX=0,cardYaw=0,droneY=ref.authored.benchRootY,droneZ=0,propellers=false,propellerAngle=0,screen}:{progress:number;selected:string;select:(id:string)=>void;powered?:boolean;showHost?:boolean;showBench?:boolean;cardDistance?:number;cardX?:number;cardYaw?:number;droneY?:number;droneZ?:number;propellers?:boolean;propellerAngle?:number;screen?:{title:string;reading:string;status:string}}){
 const s=lidarAssemblyAt(progress),active=powered&&s.connected===1;
 return <>{showBench&&<Bench {...{selected,select,cardX,cardYaw}} distance={cardDistance} cardLift={s.cardLift} showCard={s.benchVisible}/>} {showHost&&<Radio {...{selected,select,screen}} inserted={s.radioInserted} showRadio={s.radioVisible}/>}<group name='lidar-bench-supports' userData={{partId:'bench-supports'}} onClick={e=>{e.stopPropagation();select('bench-supports');}}>{lidarBenchSupports.map((p,i)=><group key={i}><Box at={[p.x,1.5,p.z]} size={[12,3,12]} color={selected==='bench-supports'?'#b78be8':'#d2cbe5'}/><Box at={[p.x,(p.top+3)/2,p.z]} size={[p.width,p.top-3,p.width]} color={selected==='bench-supports'?'#b78be8':'#8b81aa'}/></group>)}</group>
 <group name='lidar-drone-root' position={[0,droneY,droneZ]}><Airframe {...{selected,select}} powered={active}/>{propellers&&s.ready&&<Propellers {...{selected,select}} angle={propellerAngle}/>}<Battery {...{selected,select}} connected={s.connected} cellLift={s.cellLift} cellVisible={s.cellVisible}/>{s.flowVisible&&<group name='lidar-flow-placement' position={[0,s.flowLift,0]}><FlowDeckV2 {...{selected,select}}/></group>}{s.multiVisible&&<group name='lidar-multi-placement' position={[0,s.multiLift,0]}><MultiRangerDeck {...{selected,select}}/></group>}{s.pinsVisible&&<LidarMediumPins {...{selected,select}} lift={s.pinLift}/>}</group></>;
}
