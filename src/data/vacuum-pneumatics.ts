import {vacuumBulbMl,vacuumChamberMl} from './vacuum-workshop-layout';
export type VacuumCondition='clear'|'restricted'|'leak';
/** Teaching parameters, not pump ratings or measured pickup predictions. Flow is ambient-equivalent mL/s, pressure Pa absolute. */
export const vacuumAirModel={ambient:101325,crack:25,nozzleR:.4,shortHoseR:.08,filterR:.12,restrictedFactor:120,inletValveR:.25,outletR:.22,leakConductance:7.5,wallR:4,springPreload:90,springGain:550,squeezeSeconds:.65,stepSeconds:.005};
export type VacuumFlows={nozzle:number;leak:number;inlet:number;outlet:number};
export type VacuumAir={clock:number;compression:number;bottleGasMl:number;bulbGasMl:number;bottlePa:number;bulbPa:number;flows:VacuumFlows;inletOpen:boolean;outletOpen:boolean};
export const vacuumAirInitial=():VacuumAir=>({clock:0,compression:0,bottleGasMl:vacuumChamberMl,bulbGasMl:vacuumBulbMl(0),bottlePa:vacuumAirModel.ambient,bulbPa:vacuumAirModel.ambient,flows:{nozzle:0,leak:0,inlet:0,outlet:0},inletOpen:false,outletOpen:false});
/** Implicit mass balance in two isothermal gas volumes, with an exact four-case active-set check for the two one-way valves. */
export function vacuumAirSolve(previous:VacuumAir,compression:number,condition:VacuumCondition,dt:number):VacuumAir{
 const d=vacuumAirModel;if(!Number.isFinite(dt)||dt<=0)throw Error('Air step must have a finite positive duration.');const volume=vacuumBulbMl(compression),gn=1/d.nozzleR,gl=condition==='leak'?d.leakConductance:0,gf=1/(d.shortHoseR+d.filterR*(condition==='restricted'?d.restrictedFactor:1)+d.inletValveR);
 for(const inletOpen of [false,true])for(const outletOpen of [false,true]){const gi=inletOpen?gf:0,go=outletOpen?1/d.outletR:0,a=vacuumChamberMl/d.ambient+dt*(gn+gl+gi),b=-dt*gi,c=b,e=volume/d.ambient+dt*(gi+go),r=previous.bottleGasMl+dt*(gn+gl)*d.ambient+dt*gi*d.crack,s=previous.bulbGasMl-dt*gi*d.crack+dt*go*(d.ambient+d.crack),det=a*e-b*c,p=(r*e-b*s)/det,q=(a*s-c*r)/det,di=p-q-d.crack,doo=q-d.ambient-d.crack,tolerance=1e-6;
  if((inletOpen?di< -tolerance:di>tolerance)||(outletOpen?doo< -tolerance:doo>tolerance))continue;
  return {clock:previous.clock+dt,compression,bottleGasMl:p*vacuumChamberMl/d.ambient,bulbGasMl:q*volume/d.ambient,bottlePa:p,bulbPa:q,flows:{nozzle:gn*(d.ambient-p),leak:gl*(d.ambient-p),inlet:inletOpen?Math.max(0,gi*di):0,outlet:outletOpen?Math.max(0,go*doo):0},inletOpen,outletOpen};
 }
 throw Error('No consistent valve state for this air step.');
}
/** Release is driven by the bulb's authored spring / wall resistance and the computed inside pressure. Restricted air cannot magically refill the bulb at an imposed speed. */
function step(previous:VacuumAir,squeeze:boolean,condition:VacuumCondition,dt:number){
 const d=vacuumAirModel;if(squeeze){const c=previous.compression+dt/d.squeezeSeconds;return vacuumAirSolve(previous,c>=1-1e-12?1:c,condition,dt);}
 if(previous.compression===0)return vacuumAirSolve(previous,0,condition,dt);
 const oldVolume=vacuumBulbMl(previous.compression),residual=(c:number)=>{const next=vacuumAirSolve(previous,c,condition,dt),actual=(vacuumBulbMl(c)-oldVolume)/dt,elastic=d.springPreload+d.springGain*c*c,permitted=Math.max(0,(elastic+next.bulbPa-d.ambient)/d.wallR);return actual-permitted;};
 if(residual(0)<=0)return vacuumAirSolve(previous,0,condition,dt);
 let lo=0,hi=previous.compression;for(let i=0;i<26;i++){const mid=(lo+hi)/2;if(residual(mid)>0)lo=mid;else hi=mid;}return vacuumAirSolve(previous,(lo+hi)/2,condition,dt);
}
export function vacuumAirAdvance(previous:VacuumAir,seconds:number,squeeze:boolean,condition:VacuumCondition):VacuumAir{
 if(!Number.isFinite(seconds)||seconds<0)throw Error('Elapsed time must be finite and non-negative.');let s=previous;const end=s.clock+seconds;while(s.clock<end-1e-12)s=step(s,squeeze,condition,Math.min(vacuumAirModel.stepSeconds,end-s.clock));return s;
}
