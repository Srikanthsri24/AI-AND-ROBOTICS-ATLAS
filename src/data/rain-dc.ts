import {rainSupplyCord,type RainPoint} from './rain-workbench-layout';
/** Authored axial inspection travel on the low-voltage side. */
export function rainDcCord(withdrawal:number):readonly RainPoint[]{
 if(!Number.isFinite(withdrawal)||withdrawal<0||withdrawal>12)throw new RangeError('DC withdrawal must be 0–12 mm');
 return rainSupplyCord.map((p,n)=>[p[0],p[1],p[2]-withdrawal*Math.max(0,1-n/4)]);
}
