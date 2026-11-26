import {memo} from 'react';
import Frame from './SoapFrameParts';
import Pump from './SoapPumpParts';
import Servo from './SoapServoParts';
import Lead from './SoapServoLeadParts';
import {soapPumpFollower} from '../data/soap-dispenser-pump';
import {soapServoPlacement} from '../data/soap-dispenser-servo';
function SoapMechanismParts({angle=35,flow='idle',fill=.8,pumpCutaway=false,servoCutaway=false,selected,choose}:{angle?:number;flow?:'idle'|'press'|'refill';fill?:number;pumpCutaway?:boolean;servoCutaway?:boolean;selected:string;choose:(id:string)=>void}){const pose=soapPumpFollower(angle);return <group name="soap-dispenser-mechanism"><Frame selected={selected} choose={choose}/><Pump selected={selected} choose={choose} depression={pose.depression} flow={flow} fill={fill} cutaway={pumpCutaway}/><group name="soap-servo-assembly" position={[...soapServoPlacement]}><Servo angle={angle} cutaway={servoCutaway} selected={selected} choose={choose}/><Lead selected={selected} choose={choose}/></group></group>;}
export default memo(SoapMechanismParts);
