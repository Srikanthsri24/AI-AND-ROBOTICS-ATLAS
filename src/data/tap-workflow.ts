import{tapFoundationSteps,tapFoundationPose}from'./tap-foundation';
import{tapHarnessInitial,tapHarnessTasks,tapHarnessSetEnd,tapHarnessSettings,type TapHarness}from'./tap-harness';
import{tapUsbRequestedAdvance,tapUsbMated,type TapUsbMotion}from'./tap-usb';
import{tapSessionInitial,tapSessionAdvance,type TapSession}from'./automatic-tap-session';
export type TapWorkshopView='build'|'wire'|'program'|'trial';
export const tapWiringSteps=[{kind:'reference' as const,label:'Install the GND-only reference header',part:'tap-driver-reference-header'},...tapHarnessTasks.map(t=>({kind:'end' as const,...t,part:t.wireId+'-end-'+t.end})),{kind:'stemma' as const,label:'Seat the keyed three-pin STEMMA plug',part:'tap-stemma-plug'}];
export type TapWorkflow={view:TapWorkshopView;foundation:number;wiring:number;animating:'build'|'wire'|null;requestedUsb:boolean;usb:TapUsbMotion;supply:boolean;barrelRequested:boolean;barrelWithdrawal:number;loaded:boolean;paused:boolean;session:TapSession};
export const tapWorkflowInitial=():TapWorkflow=>({view:'build',foundation:0,wiring:0,animating:null,requestedUsb:false,usb:{unoWithdrawal:12,hostWithdrawal:12},supply:false,barrelRequested:false,barrelWithdrawal:16,loaded:false,paused:false,session:tapSessionInitial()});
export function tapWorkflowBuilt(s:TapWorkflow){return s.foundation===tapFoundationSteps.length;}
export function tapWorkflowWired(s:TapWorkflow){return tapWorkflowBuilt(s)&&s.wiring===tapWiringSteps.length;}
export function tapWorkflowIsolated(s:TapWorkflow){return !s.requestedUsb&&s.usb.unoWithdrawal===12&&s.usb.hostWithdrawal===12&&!s.supply&&!s.barrelRequested&&s.barrelWithdrawal===16;}
export function tapWorkflowUsb(s:TapWorkflow){return tapWorkflowWired(s)&&tapUsbMated(s.requestedUsb,s.usb);}
export function tapWorkflowCanVisit(s:TapWorkflow,view:TapWorkshopView){return view==='build'||view==='wire'&&tapWorkflowBuilt(s)||view==='program'&&tapWorkflowWired(s)||view==='trial'&&tapWorkflowWired(s)&&s.loaded;}
export function tapWorkflowHarness(s:TapWorkflow):TapHarness{let h=tapHarnessInitial();for(let i=0;i<Math.floor(s.wiring);i++){const t=tapWiringSteps[i];if(t.kind==='reference')h={...h,referenceHeader:true};else if(t.kind==='stemma')h={...h,stemma:true};else h=tapHarnessSetEnd(h,t.wireId,t.end,true);}return h;}
/** Fractional visual fitting cursors; electrical contact is made only at a whole completed step. */
export function tapWorkflowFitting(s:TapWorkflow){const fitting=Object.fromEntries(Object.keys(tapHarnessInitial().ends).map(id=>[id,[0,0]as[number,number]]));let reference=0,stemma=0;for(let i=0;i<tapWiringSteps.length;i++){const t=tapWiringSteps[i],p=Math.max(0,Math.min(1,s.wiring-i));if(t.kind==='reference')reference=p;else if(t.kind==='stemma')stemma=p;else fitting[t.wireId][t.end]=p;}return{fitting,reference,stemma};}
export type TapWorkflowAction={type:'view';value:TapWorkshopView}|{type:'next'|'undo'|'upload'|'reset'}|{type:'usb'|'supply'|'barrel'|'pause';value:boolean};
function resetLogic(s:TapWorkflow):TapWorkflow{return{...s,loaded:false,session:{...s.session,controller:null,clockUs:0,nextLoopUs:0,remainderUs:0,pending:null}};}
export function tapWorkflowAction(s:TapWorkflow,a:TapWorkflowAction):TapWorkflow{
 if(a.type==='reset')return tapWorkflowInitial();if(a.type==='pause')return{...s,paused:a.value};if(a.type==='view')return !s.animating&&tapWorkflowCanVisit(s,a.value)?{...s,view:a.value}:s;if(s.paused)return s;
 if(a.type==='next'){if(!tapWorkflowIsolated(s)||s.animating)return s;if(s.view==='build'&&!tapWorkflowBuilt(s))return{...s,animating:'build'};if(s.view==='wire'&&tapWorkflowBuilt(s)&&!tapWorkflowWired(s))return{...s,animating:'wire'};return s;}
 if(a.type==='undo'){if(!tapWorkflowIsolated(s)||s.animating)return s;const next=resetLogic(s);return s.view==='wire'&&s.wiring>0?{...next,wiring:s.wiring-1}:s.view==='build'&&s.foundation>0?{...next,foundation:s.foundation-1,wiring:0}:s;}
 if(a.type==='usb')return !s.animating&&(!a.value||tapWorkflowWired(s))?{...s,requestedUsb:a.value}:s;
 if(a.type==='barrel')return !s.animating&&!s.supply&&(!a.value||tapWorkflowWired(s))?{...s,barrelRequested:a.value}:s;
 if(a.type==='supply')return !s.animating&&(!a.value||tapWorkflowWired(s)&&s.loaded&&tapWorkflowUsb(s)&&s.barrelWithdrawal===0)?{...s,supply:a.value}:s;
 if(a.type==='upload')return tapWorkflowUsb(s)&&!s.supply&&!s.animating?{...resetLogic(s),loaded:true}:s;
 return s;
}
function barrelAt(s:TapWorkflow,ms:number){const goal=s.barrelRequested?0:16,step=ms*.032;return Math.abs(goal-s.barrelWithdrawal)<=step+1e-10?goal:Math.round((s.barrelWithdrawal+Math.sign(goal-s.barrelWithdrawal)*step)*1e10)/1e10;}
/** Split at physical USB/barrel seating, so no frame can energize the motor early. */
export function tapWorkflowAdvance(s:TapWorkflow,ms:number,reading={distanceCm:26,echoPresent:true,water:false}):TapWorkflow{
 if(!Number.isFinite(ms)||ms<0)throw new RangeError('Invalid tap workshop elapsed time');if(s.paused)return s;
 let next=s;if(s.animating){const field=s.animating==='build'?'foundation':'wiring',goal=Math.floor(s[field])+1,value=Math.min(goal,s[field]+ms/800);next={...next,[field]:Math.abs(goal-value)<1e-9?goal:value,animating:value>=goal-1e-9?null:s.animating};}
 tapFoundationPose(next.foundation);const usb=tapUsbRequestedAdvance(s.usb,ms,s.requestedUsb),barrel=barrelAt(s,ms),breaks=[0,ms];if(s.requestedUsb){const t=(s.usb.unoWithdrawal+s.usb.hostWithdrawal)/.024;if(t>0&&t<ms)breaks.push(t);}if(s.barrelRequested){const t=s.barrelWithdrawal/.032;if(t>0&&t<ms)breaks.push(t);}breaks.sort((a,b)=>a-b);let session=s.session;
 for(let i=1;i<breaks.length;i++){const a=breaks[i-1],b=breaks[i];if(b<=a)continue;const midpoint=(a+b)/2,pose=tapUsbRequestedAdvance(s.usb,midpoint,s.requestedUsb),settings=tapHarnessSettings(tapWorkflowHarness(next),{assembled:tapWorkflowBuilt(next),usb:s.loaded&&tapUsbMated(s.requestedUsb,pose),supplyEnabled:s.supply,barrelWithdrawal:barrelAt(s,midpoint),...reading});session=tapSessionAdvance(session,settings,b-a);}
 return{...next,usb,barrelWithdrawal:barrel,session};
}
