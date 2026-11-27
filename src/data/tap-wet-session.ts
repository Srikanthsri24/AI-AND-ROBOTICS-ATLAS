import{tapSessionInitial,tapSessionAdvance,type TapSession,type TapSettings}from'./automatic-tap-session';
import{tapFluidInitial,tapFluidAdvance,type TapFluid,type TapFluidReceiver}from'./tap-fluid';
import{tapTankWet,type TapPoint}from'./tap-plumbing';
export type TapWetSession={electrical:TapSession;fluid:TapFluid;remainderMs:number};
export type TapWetProbe=(clockMs:number)=>{distanceCm:number;echoPresent:boolean;receiver:TapFluidReceiver|null;pose?:TapPoint};
export const tapWetInitial=(tankMl=0):TapWetSession=>({electrical:tapSessionInitial(),fluid:tapFluidInitial(tankMl),remainderMs:0});
/** Canonical 1 ms transport steps preserve timing across render-frame partitions.
 * Actual powered motor time drives water; software requests alone cannot. */
export function tapWetAdvance(previous:TapWetSession,settings:TapSettings,elapsedMs:number,probe?:TapWetProbe):TapWetSession{if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid wet tap interval');const total=previous.remainderMs+elapsedMs,steps=Math.floor(total+1e-9),remainderMs=Math.max(0,Math.round((total-steps)*1e9)/1e9);let electrical=previous.electrical,fluid=previous.fluid;for(let i=0;i<steps;i++){const reading=probe?.(fluid.clockMs+1),before=electrical.poweredUs;electrical=tapSessionAdvance(electrical,{...settings,...(reading?{distanceCm:reading.distanceCm,echoPresent:reading.echoPresent}:{}),water:tapTankWet(fluid.tankMl)},1);fluid=tapFluidAdvance(fluid,1,(electrical.poweredUs-before)/1000,reading?.receiver??null,reading?.pose);}return{electrical,fluid,remainderMs};}
