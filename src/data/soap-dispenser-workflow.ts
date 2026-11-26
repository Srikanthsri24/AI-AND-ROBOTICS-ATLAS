import {soapCalibrationInitial,soapCalibrationPower,soapCalibrationSend,soapCalibrationAdvance,soapCalibrationCanFit,type SoapCalibration} from './soap-dispenser-calibration';
import {soapLinkageAdvance} from './soap-dispenser-linkage';
import {soapFoundationPose} from './soap-dispenser-foundation';
import {soapSensorAssemblyPose} from './soap-dispenser-sensor-assembly';
import {soapFittingCursors} from './soap-dispenser-fitting';
import {soapDispenserSessionInitial,soapDispenserDefaults} from './soap-dispenser-session';
import {soapFluidInitial} from './soap-dispenser-fluid';
import {soapWetSessionAdvance,type SoapWetSession} from './soap-dispenser-wet-session';
import {soapUsbRequestedAdvance,soapUsbMated,type SoapUsbMotion} from './soap-dispenser-usb';
import {soapTargetTravel,soapTargetReading} from './soap-dispenser-target';
import {soapHandPose,type SoapHandPoint} from './soap-dispenser-hand';
export type SoapWorkshopView='foundation'|'sensor'|'wiring'|'calibration'|'trial';
export type SoapWorkshopReading={distanceCm:number;echoPresent:boolean;hand?:{point:readonly number[];local:readonly number[]}};
export type SoapWorkshopProbe=(position:SoapHandPoint)=>SoapWorkshopReading;
export type SoapWorkflow={view:SoapWorkshopView;foundation:number;sensor:number;fitting:number;requestedUsb:boolean;usb:SoapUsbMotion;servoPower:boolean;sketch:'none'|'calibration'|'working';calibration:SoapCalibration;linkage:number;fittingLinkage:boolean;wet:SoapWetSession;cardGap:number;nextCardGap:number|null;cardCursor:number;cardGoal:0|1;handCursor:number;handGoal:0|1;mode:'card'|'hand';emptyTested:boolean;filling:boolean;paused:boolean};
export function soapWorkflowInitial():SoapWorkflow{const usb={unoWithdrawal:12,hostWithdrawal:12};return{view:'foundation',foundation:0,sensor:0,fitting:0,requestedUsb:false,usb,servoPower:false,sketch:'none',calibration:soapCalibrationInitial(),linkage:0,fittingLinkage:false,wet:{workbench:{usb,session:soapDispenserSessionInitial()},fluid:soapFluidInitial(0)},cardGap:24.9,nextCardGap:null,cardCursor:0,cardGoal:0,handCursor:0,handGoal:0,mode:'card',emptyTested:false,filling:false,paused:false};}
export function soapWorkflowBuilt(s:SoapWorkflow){return s.foundation===14&&s.sensor===7;}
export function soapWorkflowWired(s:SoapWorkflow){return soapWorkflowBuilt(s)&&s.fitting===18;}
export function soapWorkflowUsb(s:SoapWorkflow){return soapWorkflowWired(s)&&soapUsbMated(s.requestedUsb,s.usb);}
export function soapWorkflowIsolated(s:SoapWorkflow){return !s.requestedUsb&&!s.servoPower&&s.usb.unoWithdrawal===12&&s.usb.hostWithdrawal===12;}
export function soapWorkflowCanVisit(s:SoapWorkflow,view:SoapWorkshopView){return view==='foundation'||view==='sensor'&&s.foundation===14||view==='wiring'&&soapWorkflowBuilt(s)||view==='calibration'&&soapWorkflowWired(s)||view==='trial'&&s.sketch==='working'&&s.linkage===2;}
export type SoapWorkflowAction=
 |{type:'view';value:SoapWorkshopView}|{type:'foundation'|'sensor'|'fitting';value:number}
 |{type:'usb'|'servo'|'pause';value:boolean}|{type:'upload-calibration'|'fit-linkage'|'upload-working'|'fill'|'reset'}
 |{type:'serial';value:string}|{type:'card';gap:number|null}|{type:'hand';present:boolean};
function resetElectrical(s:SoapWorkflow):SoapWorkflow{return{...s,sketch:'none',calibration:soapCalibrationInitial(),linkage:0,fittingLinkage:false,emptyTested:false,filling:false,wet:{workbench:{usb:s.usb,session:soapDispenserSessionInitial()},fluid:soapFluidInitial(0)}};}
export function soapWorkflowAction(s:SoapWorkflow,a:SoapWorkflowAction):SoapWorkflow{
 if(a.type==='reset')return soapWorkflowInitial();
 if(a.type==='view')return soapWorkflowCanVisit(s,a.value)?{...s,view:a.value}:s;
 if(a.type==='pause')return{...s,paused:a.value};
 if(a.type==='foundation'||a.type==='sensor'||a.type==='fitting'){
  if(a.type==='foundation')soapFoundationPose(a.value);else if(a.type==='sensor')soapSensorAssemblyPose(a.value);else soapFittingCursors(a.value);
  if(s[a.type]===a.value)return s;
  if(!soapWorkflowIsolated(s)||s.linkage>0||s.fittingLinkage)return s;
  if(a.type==='sensor'&&s.foundation!==14||a.type==='fitting'&&!soapWorkflowBuilt(s))return s;
  const next=resetElectrical(s);
  return a.type==='foundation'?{...next,foundation:a.value,sensor:0,fitting:0}:a.type==='sensor'?{...next,sensor:a.value,fitting:0}:{...next,fitting:a.value};
 }
 if(a.type==='usb'){if(a.value&&!soapWorkflowWired(s)||s.fittingLinkage||s.filling)return s;return{...s,requestedUsb:a.value};}
 if(a.type==='servo'){if(s.fittingLinkage||s.filling||a.value&&(!soapWorkflowUsb(s)||s.sketch==='none'||s.sketch==='calibration'&&s.linkage>0||s.sketch==='working'&&s.linkage!==2))return s;return{...s,servoPower:a.value,calibration:soapCalibrationPower(s.calibration,s.calibration.powered,a.value)};}
 if(a.type==='upload-calibration'){
  if(!soapWorkflowUsb(s)||s.servoPower||s.linkage>0)return s;
  return{...s,sketch:'calibration',calibration:soapCalibrationPower(soapCalibrationInitial(),true,false)};
 }
 if(a.type==='serial')return s.sketch==='calibration'&&soapWorkflowUsb(s)&&!s.fittingLinkage&&s.linkage===0?{...s,calibration:soapCalibrationSend(s.calibration,a.value)}:s;
 if(a.type==='fit-linkage')return s.sketch==='calibration'&&soapWorkflowUsb(s)&&soapCalibrationCanFit(s.calibration)&&s.linkage===0?{...s,fittingLinkage:true}:s;
 if(a.type==='upload-working'){
  if(!soapWorkflowUsb(s)||s.servoPower||s.linkage!==2||s.fittingLinkage)return s;
  if(s.sketch==='working')return{...s,wet:{...s.wet,workbench:{usb:s.usb,session:{...soapDispenserSessionInitial(),angle:s.wet.workbench.session.angle,pressArmed:s.wet.workbench.session.pressArmed,completedServoPresses:s.wet.workbench.session.completedServoPresses}}}};
  return{...s,sketch:'working',wet:{workbench:{usb:s.usb,session:{...soapDispenserSessionInitial(),angle:s.calibration.angle}},fluid:soapFluidInitial(0)},emptyTested:false};
 }
 if(a.type==='card'){
  if(a.gap!==null&&(!Number.isFinite(a.gap)||a.gap<4||a.gap>24.9))throw new RangeError('Invalid calibration card gap');
  if(s.sketch!=='working'||s.handCursor>0||s.handGoal>0)return s;
  if(a.gap===null)return{...s,mode:'card',cardGoal:0,nextCardGap:null};
  return s.cardCursor>0&&a.gap!==s.cardGap?{...s,mode:'card',cardGoal:0,nextCardGap:a.gap}:{...s,mode:'card',cardGap:a.gap,cardGoal:1,nextCardGap:null};
 }
 if(a.type==='hand'){
  if(s.sketch!=='working'||s.cardCursor>0||s.cardGoal>0||s.nextCardGap!==null||!s.emptyTested||s.wet.fluid.fill===0||s.filling)return s;
  return{...s,mode:'hand',handGoal:a.present?1:0};
 }
 if(a.type==='fill'){
  if(s.sketch!=='working'||!s.emptyTested||s.servoPower||s.filling||s.wet.workbench.session.angle!==35||s.handCursor>0||s.handGoal>0||s.cardCursor>0||s.cardGoal>0||s.nextCardGap!==null)return s;
  return{...s,filling:true};
 }
 return s;
}
const travel=(from:number,to:number,ms:number,duration:number)=>Math.abs(to-from)<=ms/duration+1e-10?to:from+Math.sign(to-from)*ms/duration;
/** Drives the existing exact sketch/mechanics rather than a second pump demo.
 * The optional hand probe must sample the actual rendered mesh at this pose.
 * Without a mesh probe, hand mode returns unavailable echo data. */
export function soapWorkflowAdvance(previous:SoapWorkflow,elapsedMs:number,probe?:SoapWorkshopProbe):SoapWorkflow{
 if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid soap workflow elapsed time');
 if(previous.paused)return previous;
 let s=previous,left=elapsedMs;
 do{
  const dt=Math.min(10,left),wired=soapWorkflowWired(s);
  const usb=soapUsbRequestedAdvance(s.usb,dt,wired&&s.requestedUsb),powered=wired&&soapUsbMated(s.requestedUsb,usb);
  let calibration=soapCalibrationPower(s.calibration,s.sketch==='calibration'&&powered,s.servoPower);
  calibration=soapCalibrationAdvance(calibration,dt);
  const linkage=s.fittingLinkage?soapLinkageAdvance(s.linkage,dt,calibration):s.linkage;
  const cardCursor=travel(s.cardCursor,s.cardGoal,dt,1000),nextCardGap=s.cardCursor===0?s.nextCardGap:null,cardGap=nextCardGap??s.cardGap,cardGoal=nextCardGap===null?s.cardGoal:1,handCursor=travel(s.handCursor,s.handGoal,dt,1600);
  let wet=s.wet;
  if(s.sketch==='working'){
   const targetTop=soapTargetTravel(cardGap,cardCursor),reading:SoapWorkshopReading=s.mode==='hand'?(probe?.(soapHandPose(handCursor))??{distanceCm:0,echoPresent:false}):soapTargetReading(targetTop);
   const cursors=soapFittingCursors(s.fitting);
   wet=soapWetSessionAdvance({...wet,workbench:{...wet.workbench,usb:s.usb}},{...soapDispenserDefaults,assembled:wired&&linkage===2,usb:s.requestedUsb,servoPower:s.servoPower,...reading},dt,cursors.sonarFitting,cursors.circuitFitting,targetTop,reading.hand);
   if(s.filling)wet={...wet,fluid:{...wet.fluid,fill:Math.min(.8,wet.fluid.fill+dt*.0004)}};
  }
  const phase=wet.workbench.session.controller?.phase,emptyTested=s.emptyTested||s.sketch==='working'&&wet.fluid.fill===0&&wet.workbench.session.completedServoPresses>0&&wet.workbench.session.angle===35&&(phase==='WAIT_CLEAR'||phase==='READY');
  s={...s,usb:s.sketch==='working'?wet.workbench.usb:usb,calibration,linkage,fittingLinkage:s.fittingLinkage&&linkage<2,cardGap,cardGoal,nextCardGap:nextCardGap===null?s.nextCardGap:null,cardCursor,handCursor,wet,emptyTested,filling:s.filling&&wet.fluid.fill<.8};
  left=Math.max(0,left-dt);
 }while(left>1e-10);
 return s;
}
