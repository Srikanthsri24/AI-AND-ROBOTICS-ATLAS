/** Illustrative displacement pump. A full chamber charge uses 0.8% of the
 * displayed reservoir scale, not a claimed millilitre amount or measured flow rate. */
export const soapChargeFraction=.008,soapIntakeFill=(8-4.2)/153.8;
export type SoapFluid={fill:number;chamber:number;delivered:number;depression:number;clockMs:number;outletRate:number;drawn:number};
export function soapFluidInitial(fill=.8,primed=false):SoapFluid{if(!Number.isFinite(fill)||fill<0||fill>1)throw new RangeError('Invalid soap reservoir fill');return{fill,chamber:primed?1:0,delivered:0,depression:0,clockMs:0,outletRate:0,drawn:0};}
/** Only actual mechanical displacement expels liquid. Holding a command, an
 * unpowered servo or an empty/unprimed chamber cannot create outlet flow. */
export function soapFluidAdvance(s:SoapFluid,depression:number,elapsedMs:number):SoapFluid{if(!Number.isFinite(depression)||depression<0||depression>6||!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid soap fluid step');const delta=depression-s.depression;if(elapsedMs===0&&Math.abs(delta)>1e-10)throw new RangeError('Pump cannot move in zero elapsed time');const expelled=delta>0?Math.min(s.chamber,delta/6):0,drawn=delta<0?Math.min(1-s.chamber,-delta/6,Math.max(0,s.fill-soapIntakeFill)/soapChargeFraction):0;return{fill:Math.max(0,s.fill-drawn*soapChargeFraction),chamber:Math.max(0,Math.min(1,s.chamber+drawn-expelled)),delivered:s.delivered+expelled,depression,clockMs:s.clockMs+elapsedMs,outletRate:elapsedMs?expelled/elapsedMs:0,drawn:s.drawn+drawn};}
