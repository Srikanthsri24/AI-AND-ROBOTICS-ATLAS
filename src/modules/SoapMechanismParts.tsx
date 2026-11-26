import {memo,useMemo} from 'react';
import CircuitWires from './SoapCircuitWireParts';
import {soapCircuitClamps} from '../data/soap-dispenser-circuit-wires';
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
function SoapMechanismParts({angle=35,flow='idle',fill=.8,pumpCutaway=false,servoCutaway=false,logicPowered=false,servoPowered=false,sonarFitting=8,circuitFitting=10,selected,choose}:{angle?:number;flow?:'idle'|'press'|'refill';fill?:number;pumpCutaway?:boolean;servoCutaway?:boolean;logicPowered?:boolean;servoPowered?:boolean;sonarFitting?:number;circuitFitting?:number;selected:string;choose:(id:string)=>void}){const pose=soapPumpFollower(angle),clampRelease=useMemo(()=>soapCircuitClamps(circuitFitting),[circuitFitting]);return <group name="soap-dispenser-mechanism"><CircuitWires selected={selected} choose={choose} cursor={circuitFitting}/><Harness selected={selected} choose={choose}/><SonarWires selected={selected} choose={choose} cursor={sonarFitting}/><SonarMount selected={selected} choose={choose}/><group name="soap-hand-detector" position={[...soapSonarPlacement]} rotation={[Math.PI/2,0,0]}><Sonar selected={selected} select={choose}/></group><Electronics selected={selected} choose={choose} powered={logicPowered} servoPowered={servoPowered} clampRelease={clampRelease}/><Frame selected={selected} choose={choose}/><Pump selected={selected} choose={choose} depression={pose.depression} flow={flow} fill={fill} cutaway={pumpCutaway}/><group name="soap-servo-assembly" position={[...soapServoPlacement]}><Servo angle={angle} cutaway={servoCutaway} selected={selected} choose={choose}/><Lead selected={selected} choose={choose}/></group></group>;}
export default memo(SoapMechanismParts);
