export type TerrariumReading={sampledAt:number;meanAdc:number|null;voltage:number|null;temperature:number|null;flag:boolean};
export const terrariumInitial:TerrariumReading={sampledAt:0,meanAdc:null,voltage:null,temperature:null,flag:false};
/** Deterministic sixteen-reading quantisation of the TMP36's 500 mV + 10 mV/°C response. */
export function terrariumSamples(air:number,bias=0){const ideal=Math.max(0,Math.min(1023,((air+bias)/100+.5)*1023/5)),low=Math.floor(ideal),highCount=Math.round((ideal-low)*16);return Array.from({length:16},(_,i)=>low+(i<highCount?1:0));}
export function terrariumMeasure(samples:number[],correction=0){if(samples.length!==16||samples.some(x=>!Number.isInteger(x)||x<0||x>1023))throw new Error('Sixteen valid 10-bit ADC samples are required.');const meanAdc=samples.reduce((sum,x)=>sum+x,0)/16,voltage=meanAdc*5/1023;return {meanAdc,voltage,temperature:(voltage-.5)*100+correction};}
export function terrariumNextFlag(previous:boolean,temperature:number|null){if(temperature===null)return false;if(temperature>=29)return true;if(temperature<=27)return false;return previous;}
export function terrariumUpdate(previous:TerrariumReading,samples:number[],correction:number,now:number):TerrariumReading{if(now-previous.sampledAt<250)return previous;const measured=terrariumMeasure(samples,correction);return {...measured,sampledAt:now,flag:terrariumNextFlag(previous.flag,measured.temperature)};}
/** Illustrative accelerated air exchange: room exchange plus a sealed warm bottle's heat input. */
export function terrariumAdvanceAir(air:number,room:number,bottleInside:boolean,ventFraction:number,seconds:number){const rate=.15+.55*Math.max(0,Math.min(1,ventFraction)),target=room+(bottleInside?1.2/rate:0);return target+(air-target)*Math.exp(-rate*Math.max(0,seconds));}
/** Lift above the clear rim, travel over the open enclosure, then lower to the floor. */
export function terrariumBottlePose(progress:number):[number,number,number]{const t=Math.max(0,Math.min(1,progress));if(t<.25)return [2.95,.16+(1.9-.16)*t/.25,1.2];if(t<.75){const f=(t-.25)/.5;return [2.95+(2.1-2.95)*f,1.9,1.2+(-.55-1.2)*f];}return [2.1,1.9+(.25-1.9)*(t-.75)/.25,-.55];}
export function terrariumBottleInside(progress:number){const [x,bottom,z]=terrariumBottlePose(progress);return x-.18>.1&&x+.18<2.7&&z-.18> -1.05&&z+.18<.75&&bottom+.79<=1.75;}
