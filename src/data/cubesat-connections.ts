import {cubeSatHarnesses} from './cubesat-harness';
export const cubeSatDigitalStages=([[6.6,6.78],[6.78,6.96],[6.96,7.14]] as const).map(([start,end],index)=>({index,start,mid:(start+end)/2,end,harness:cubeSatHarnesses[index],maxA:index===0?4:8,maxB:8}));
export function cubeSatContactWithdraw(progress:number,start:number,end:number,travel:number){if(!Number.isFinite(progress)||progress<0||progress>8)throw Error('CubeSat assembly progress must be 0–8');const f=Math.max(0,Math.min(1,(progress-start)/(end-start)));return travel*(1-f*f*(3-2*f));}
export function cubeSatDigitalWithdrawal(index:number,progress:number){const s=cubeSatDigitalStages[index];if(!s)throw Error('Unknown CubeSat digital harness');return{a:cubeSatContactWithdraw(progress,s.start,s.mid,s.maxA),b:cubeSatContactWithdraw(progress,s.mid,s.end,s.maxB)};}
export const cubeSatRFStage={start:7.14,mid:7.21,end:7.28,maxRadio:8,maxAntenna:8} as const;
export function cubeSatRFWithdrawal(progress:number){const s=cubeSatRFStage;return{radio:cubeSatContactWithdraw(progress,s.start,s.mid,s.maxRadio),antenna:cubeSatContactWithdraw(progress,s.mid,s.end,s.maxAntenna)};}
export const cubeSatPowerStages=([{side:-1,start:7.28,end:7.38},{side:1,start:7.38,end:7.48}] as const).map(s=>({...s,mid:(s.start+s.end)/2,key:s.side<0?'left':'right'}));
export function cubeSatPowerWithdrawal(side:number,progress:number){const s=cubeSatPowerStages.find(s=>s.side===side);if(!s)throw Error('Unknown solar panel');return{panel:cubeSatContactWithdraw(progress,s.start,s.mid,8),board:cubeSatContactWithdraw(progress,s.mid,s.end,8)};}
export const cubeSatStationStage={start:7.48,mid:7.54,end:7.6} as const;
export function cubeSatStationWithdrawal(progress:number){const s=cubeSatStationStage;return{feed:cubeSatContactWithdraw(progress,s.start,s.mid,8),receiver:cubeSatContactWithdraw(progress,s.mid,s.end,8)};}
