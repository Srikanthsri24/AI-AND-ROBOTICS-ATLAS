import {memo,useMemo} from 'react';
import type {Texture} from 'three';
import Scanner from './RadarScannerParts';
import Uno from './RadarUnoParts';
import SensorLeads from './RadarSonarHarness';
import Power from './RadarPowerParts';
import Jumpers from './RadarPowerJumpers';
import Usb from './RadarUsbParts';
import Target from './RadarTargetParts';
import {radarPowerSeating} from '../data/radar-power-jumpers';
import {radarUsbConnected} from '../data/radar-usb';
import {radarDefaults} from '../data/radar-workshop';
import type {RadarTargetInput} from '../data/radar-target';
/** Unregistered, unified native-mm hardware. Student assembly and mission scene are still pending. */
function RadarWorkshopPrototype({selected='',select=()=>{},actual=90,hornOffset=0,explode=0,sonarWithdraw=0,unoWithdraw=0,powerProgress=1,usbUno=12,usbHost=12,usb=false,servoPower=false,screen=null,target=radarDefaults}:{selected?:string;select?:(id:string)=>void;actual?:number;hornOffset?:number;explode?:number;sonarWithdraw?:number;unoWithdraw?:number;powerProgress?:number;usbUno?:number;usbHost?:number;usb?:boolean;servoPower?:boolean;screen?:Texture|null;target?:RadarTargetInput}){
 const common={selected,select},withdrawals=useMemo(()=>radarPowerSeating(powerProgress),[powerProgress]),powered=radarUsbConnected(usb,usbUno,usbHost);
 return <group name="radar-workshop-mm">
  <Scanner {...common} {...{actual,hornOffset,explode}}/>
  <Uno {...common} powered={powered}/>
  <SensorLeads {...common} heading={actual+hornOffset} {...{sonarWithdraw,unoWithdraw}}/>
  <Power {...common} {...{servoPower}}/>
  <Jumpers {...common} {...{withdrawals}}/>
  <Usb {...common} unoWithdrawal={usbUno} hostWithdrawal={usbHost} {...{usb,screen}}/>
  <Target {...common} input={target}/>
 </group>;
}
export default memo(RadarWorkshopPrototype);
