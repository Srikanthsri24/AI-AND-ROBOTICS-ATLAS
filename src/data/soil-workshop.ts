/** Relative calibration belongs to a fixed insertion depth, not a universal moisture scale. */
export type SoilReference={raw:number;depth:number};
export function soilWorkshopReading(raw:number,dry:SoilReference|null,damp:SoilReference|null,depth:number):number|null{
 if(!dry||!damp||![raw,dry.raw,damp.raw,depth].every(Number.isFinite)||dry.depth!==depth||damp.depth!==depth||Math.abs(damp.raw-dry.raw)<20)return null;
 return Math.max(0,Math.min(100,Math.trunc((raw-dry.raw)*100/(damp.raw-dry.raw))));
}
