import{tapWorkflowInitial,tapWorkflowAction,tapWorkflowAdvance,tapWorkflowWired,tapWorkflowUsb,type TapWorkflow,type TapWorkflowAction}from'./tap-workflow';
import{tapFluidInitial,tapFluidFill,tapFluidAdvance,tapFluidInventory,type TapFluid}from'./tap-fluid';
import{tapHandCursor,tapHandProbe,type TapHandIndex,type TapHandMotion}from'./tap-hand-surface';
import{tapTankWet,type TapPoint}from'./tap-plumbing';
export type TapTrial={workflow:TapWorkflow;fluid:TapFluid;remainderMs:number;emptyChecked:boolean;filling:boolean;prime:'idle'|'present'|'withdraw'|'clear'|'done';primeCycles:number;card:TapHandMotion;hand:TapHandMotion};
export const tapTrialInitial=(workflow=tapWorkflowInitial()):TapTrial=>({workflow,fluid:tapFluidInitial(),remainderMs:0,emptyChecked:false,filling:false,prime:'idle',primeCycles:0,card:{from:0,to:0,startedAt:0},hand:{from:0,to:0,startedAt:0}});
export const tapTrialCardPose=(cursor:number):TapPoint=>[450-405*cursor*cursor*(3-2*cursor),319,40];
export function tapTrialReading(s:TapTrial,index?:TapHandIndex){const hand=tapHandCursor(s.hand,s.fluid.clockMs),card=tapHandCursor(s.card,s.fluid.clockMs),pose=tapTrialCardPose(card);if(card>0){const both=Math.abs(pose[0]-45)<=14.5;return{distanceCm:both?8:26,echoPresent:true,receiver:null,pose:undefined};}return index?tapHandProbe(index,hand):{distanceCm:26,echoPresent:true,receiver:null,pose:undefined};}
export type TapTrialAction=TapWorkflowAction|{[K in 'check-empty'|'fill'|'prime'|'present-hand'|'withdraw-hand']:{type:K}}['check-empty'|'fill'|'prime'|'present-hand'|'withdraw-hand'];
export function tapTrialAction(s:TapTrial,a:TapTrialAction,index?:TapHandIndex):TapTrial{
 const w=s.workflow,now=s.fluid.clockMs,hand=tapHandCursor(s.hand,now),card=tapHandCursor(s.card,now),ready=tapWorkflowWired(w)&&tapWorkflowUsb(w)&&w.loaded&&!w.paused;
 if(a.type==='reset')return tapTrialInitial();if(w.paused&&a.type!=='pause')return s;
 if(a.type==='check-empty')return ready&&w.supply&&w.barrelWithdrawal===0&&s.fluid.addedMl===0&&w.session.controller?.rows.some(r=>r.startsWith('WATER LOW'))&&w.session.poweredUs===0?{...s,emptyChecked:true}:s;
 if(a.type==='fill')return ready&&s.emptyChecked&&!w.supply&&!s.filling&&hand===0&&card===0&&s.fluid.tankMl<2600?{...s,filling:true}:s;
 if(a.type==='prime')return ready&&w.supply&&s.emptyChecked&&!s.filling&&tapTankWet(s.fluid.tankMl)&&hand===0&&card===0&&s.prime==='idle'&&w.session.controller?.mode==='READY'?{...s,prime:'present',primeCycles:1,card:{from:0,to:1,startedAt:now}}:s;
 if(a.type==='present-hand')return ready&&w.supply&&!!index&&s.prime==='done'&&!s.filling&&card===0&&hand===0&&w.session.controller?.mode==='READY'?{...s,hand:{from:hand,to:1,startedAt:now}}:s;
 if(a.type==='withdraw-hand')return{...s,hand:{from:hand,to:0,startedAt:now}};
 // A wet apparatus must be reset to a dry kit before mechanical changes.
 if((a.type==='next'||a.type==='undo')&&tapFluidInventory(s.fluid)>0)return s;
 return{...s,workflow:tapWorkflowAction(w,a)};
}
/** One clock for fitting, power, sensing and fluid transport; serializable state
 * survives guide navigation. Geometry itself stays outside saved state. */
export function tapTrialAdvance(previous:TapTrial,elapsedMs:number,index?:TapHandIndex):TapTrial{
 if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid tap trial interval');if(previous.workflow.paused)return previous;
 // Never advance a remembered visible hand before its actual geometry is ready.
 if(!index&&(tapHandCursor(previous.hand,previous.fluid.clockMs)>0||previous.hand.to===1))return previous;
 const total=previous.remainderMs+elapsedMs,steps=Math.floor(total+1e-9);let s=previous;
 for(let i=0;i<steps;i++){
  const reading=tapTrialReading(s,index),before=s.workflow.session.poweredUs,workflow=tapWorkflowAdvance(s.workflow,1,{distanceCm:reading.distanceCm,echoPresent:reading.echoPresent,water:tapTankWet(s.fluid.tankMl)});
  let fluid=tapFluidAdvance(s.fluid,1,(workflow.session.poweredUs-before)/1000,reading.receiver,reading.pose),filling=s.filling;
  if(filling){if(workflow.supply)filling=false;else{fluid=tapFluidFill(fluid,Math.min(2600,fluid.tankMl+.5));if(fluid.tankMl>=2600)filling=false;}}
  s={...s,workflow,fluid,filling};const now=fluid.clockMs,card=tapHandCursor(s.card,now),controller=workflow.session.controller;
  if(s.prime==='present'&&card===1&&controller?.mode==='WAIT_CLEAR'&&controller.runCommands>=s.primeCycles)s={...s,prime:'withdraw',card:{from:1,to:0,startedAt:now}};
  if(s.prime==='withdraw'&&card===0)s={...s,prime:'clear'};
  if(s.prime==='clear'&&controller?.mode==='READY')s=fluid.deliveredMl>0?{...s,prime:'done'}:{...s,prime:'present',primeCycles:s.primeCycles+1,card:{from:0,to:1,startedAt:now}};
 }
 return{...s,remainderMs:Math.max(0,Math.round((total-steps)*1e9)/1e9)};
}
