import {soapFoundationPose} from '../data/soap-dispenser-foundation';
import {soapSensorAssemblyPose} from '../data/soap-dispenser-sensor-assembly';
import {memo,useMemo,type RefObject} from 'react';
import Delivery from './SoapDeliveryParts';
import type {SoapFluid} from '../data/soap-dispenser-fluid';
import Usb from './SoapUsbParts';
import type {SoapUsbMotion} from '../data/soap-dispenser-usb';
import CircuitWires from './SoapCircuitWireParts';
import {soapCircuitClamps} from '../data/soap-dispenser-circuit-wires';
import TargetStand from './SoapTargetStand';
import Target from './SoapTargetParts';
import Harness from './SoapHarnessParts';
import SonarWires from './SoapSonarWireParts';
import Sonar from './SoapSonarParts';
import SonarMount from './SoapSonarMount';
import {soapSonarPlacement} from '../data/soap-dispenser-sonar';
import Electronics from './SoapElectronicsParts';
import Frame from './SoapFrameParts';
import Pump from './SoapPumpParts';
import Servo from './SoapServoParts';
import Lead from './SoapServoLeadParts';
import {soapPumpFollower} from '../data/soap-dispenser-pump';
import {soapServoPlacement} from '../data/soap-dispenser-servo';
type Props={toolsVisible?:boolean;angle?:number;foundationAssembly?:number;sensorAssembly?:number;hornFitted?:boolean;flow?:'idle'|'press'|'refill';fill?:number;pumpCutaway?:boolean;servoCutaway?:boolean;logicPowered?:boolean;servoPowered?:boolean;sonarFitting?:number;circuitFitting?:number;usbMotion?:RefObject<SoapUsbMotion>;serialRows?:readonly string[];targetTop?:readonly[number,number,number];fluid?:SoapFluid;selected:string;choose:(id:string)=>void};
function SoapMechanismParts({toolsVisible=true,angle=35,foundationAssembly=14,sensorAssembly=7,hornFitted=true,flow='idle',fill=.8,pumpCutaway=false,servoCutaway=false,logicPowered=false,servoPowered=false,sonarFitting=8,circuitFitting=10,usbMotion,serialRows=[],targetTop,fluid,selected,choose}:Props){
 const foundation=soapFoundationPose(foundationAssembly),ready=foundationAssembly===14,linked=ready&&hornFitted;
 const sensorPose=soapSensorAssemblyPose(ready?sensorAssembly:0),pose=soapPumpFollower(linked?angle:35);
 const clampRelease=useMemo(()=>soapCircuitClamps(circuitFitting),[circuitFitting]);
 return <group name="soap-dispenser-mechanism">
  {ready&&<Delivery fluid={fluid} targetTop={targetTop} selected={selected} choose={choose}/>}
  {ready&&toolsVisible&&<><TargetStand selected={selected} choose={choose} top={targetTop}/><Target selected={selected} choose={choose} top={targetTop}/><Usb selected={selected} choose={choose} powered={logicPowered} motion={usbMotion} rows={serialRows}/></>}
  {ready&&toolsVisible&&<CircuitWires selected={selected} choose={choose} cursor={circuitFitting}/>}
  {foundation.left.visible&&<group position={[0,foundation.left.y,0]}><Harness selected={selected} choose={choose}/></group>}
  {ready&&toolsVisible&&<SonarWires selected={selected} choose={choose} cursor={sonarFitting}/>}
  <SonarMount assembly={ready?sensorAssembly:0} selected={selected} choose={choose}/>
  {sensorPose.sensor.visible&&<group name="soap-hand-detector" position={[soapSonarPlacement[0],soapSonarPlacement[1]+sensorPose.sensor.y,soapSonarPlacement[2]]} rotation={[Math.PI/2,0,0]}><Sonar selected={selected} select={choose}/></group>}
  <Electronics assembly={foundationAssembly} selected={selected} choose={choose} powered={ready&&logicPowered} servoPowered={ready&&servoPowered} clampRelease={clampRelease}/>
  <Frame assembly={foundationAssembly} selected={selected} choose={choose}/>
  {foundation.bottle.visible&&<group name="soap-bottle-placement" position={[0,foundation.bottle.y,0]}><Pump selected={selected} choose={choose} depression={pose.depression} flow={linked?flow:'idle'} fill={fill} charge={ready?fluid?.chamber??0:0} cutaway={pumpCutaway}/></group>}
  {foundation.actuator.visible&&<group name="soap-servo-assembly" position={[soapServoPlacement[0],soapServoPlacement[1]+foundation.actuator.y,soapServoPlacement[2]]}><Servo hornFitted={linked} angle={ready?angle:35} cutaway={servoCutaway} selected={selected} choose={choose}/><Lead selected={selected} choose={choose}/></group>}
 </group>;
}
export default memo(SoapMechanismParts);
