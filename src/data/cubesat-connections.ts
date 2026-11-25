import {cubeSatHarnesses} from './cubesat-harness';
export const cubeSatDigitalStages=([[6.6,6.78],[6.78,6.96],[6.96,7.14]] as const).map(([start,end],index)=>({index,start,mid:(start+end)/2,end,harness:cubeSatHarnesses[index],maxA:index===0?4:8,maxB:8}));
export function cubeSatContactWithdraw(progress:number,start:number,end:number,travel:number){if(!Number.isFinite(progress)||progress<0||progress>8)throw Error('CubeSat assembly progress must be 0–8');const f=Math.max(0,Math.min(1,(progress-start)/(end-start)));return travel*(1-f*f*(3-2*f));}
export function cubeSatDigitalWithdrawal(index:number,progress:number){const s=cubeSatDigitalStages[index];if(!s)throw Error('Unknown CubeSat digital harness');return{a:cubeSatContactWithdraw(progress,s.start,s.mid,s.maxA),b:cubeSatContactWithdraw(progress,s.mid,s.end,s.maxB)};}
export const cubeSatRFStage={start:7.14,mid:7.21,end:7.28,maxRadio:8,maxAntenna:8} as const;
export function cubeSatRFWithdrawal(progress:number){const s=cubeSatRFStage;return{radio:cubeSatContactWithdraw(progress,s.start,s.mid,s.maxRadio),antenna:cubeSatContactWithdraw(progress,s.mid,s.end,s.maxAntenna)};}
