/** Illustrative displacement pump. A full chamber charge uses 0.8% of the
 * displayed reservoir scale, not a claimed millilitre amount or measured flow rate. */
export const soapChargeFraction=.008,soapIntakeFill=(8-4.2)/153.8;
export type SoapEmission={id:number;bornAt:number;y:number;landed?:boolean};
export type SoapWetMark={receiver:'base'|'target'|'hand';x:number;z:number;y?:number;packets:number};
export type SoapFluid={fill:number;chamber:number;delivered:number;depression:number;clockMs:number;outletRate:number;drawn:number;emissions:readonly SoapEmission[];wetMarks:readonly SoapWetMark[];landedPackets:number;motion:'idle'|'press'|'refill'};
export function soapFluidInitial(fill=.8,primed=false):SoapFluid{if(!Number.isFinite(fill)||fill<0||fill>1)throw new RangeError('Invalid soap reservoir fill');return{fill,chamber:primed?1:0,delivered:0,depression:0,clockMs:0,outletRate:0,drawn:0,emissions:[],wetMarks:[],landedPackets:0,motion:'idle'};}
/** Only actual mechanical displacement expels liquid. Holding a command, an
 * unpowered servo or an empty/unprimed chamber cannot create outlet flow. */
export function soapFluidAdvance(s:SoapFluid,depression:number,elapsedMs:number):SoapFluid{if(!Number.isFinite(depression)||depression<0||depression>6||!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid soap fluid step');const delta=depression-s.depression;if(elapsedMs===0&&Math.abs(delta)>1e-10)throw new RangeError('Pump cannot move in zero elapsed time');const expelled=delta>0?Math.min(s.chamber,delta/6):0,drawn=delta<0?Math.min(1-s.chamber,-delta/6,Math.max(0,s.fill-soapIntakeFill)/soapChargeFraction):0;const delivered=s.delivered+expelled,emissions=[...s.emissions];for(let id=Math.floor((s.delivered+1e-10)*8)+1;id<=Math.floor((delivered+1e-10)*8);id++){const fraction=Math.max(0,Math.min(1,(id/8-s.delivered)/(delta/6)));emissions.push({id,bornAt:s.clockMs+elapsedMs*fraction,y:224-(s.depression+delta*fraction)});}return{fill:Math.max(0,s.fill-drawn*soapChargeFraction),chamber:Math.max(0,Math.min(1,s.chamber+drawn-expelled)),delivered,depression,clockMs:s.clockMs+elapsedMs,outletRate:elapsedMs?expelled/elapsedMs:0,drawn:s.drawn+drawn,emissions:emissions.slice(-64),wetMarks:s.wetMarks,landedPackets:s.landedPackets,motion:delta>0?'press':delta<0?'refill':'idle'};}

/** Illustrative free fall, with each droplet starting immediately below the open lip. */
export function soapDropPosition(drop:SoapEmission,clockMs:number,receiverY=0){const t=(clockMs-drop.bornAt)/1000;if(t<0||drop.landed)return null;const y=drop.y-2.1-80*t-4905*t*t;return y-2.1>receiverY?[0,y,45] as const:null;}

/** Register actual downward surface crossings once. Marks use receiver-local
 * coordinates, so a wet card carries its mark when it is moved afterward. */
export function soapFluidLand(s:SoapFluid,previousClockMs:number,targetTop?:readonly[number,number,number],hand?:{point:readonly number[];local:readonly number[]}):SoapFluid{
 const marks=s.wetMarks.map(m=>({...m}));let landedPackets=s.landedPackets,changed=false;
 const bottom=(drop:SoapEmission,time:number)=>{const t=Math.max(0,(time-drop.bornAt)/1000);return drop.y-4.2-80*t-4905*t*t;};
 const target=targetTop&&targetTop[1]>=0&&Math.abs(targetTop[0])<=52.5&&Math.abs(45-targetTop[2])<=52.5?targetTop:null;
 const emissions=s.emissions.map(drop=>{if(drop.landed||drop.bornAt>s.clockMs)return drop;const before=bottom(drop,previousClockMs),after=bottom(drop,s.clockMs),hit=target&&before>=target[1]-1e-9&&after<=target[1]?target:null,handHit=hand&&before>=hand.point[1]-1e-9&&after<=hand.point[1]&&(!hit||hand.point[1]>=hit[1])?hand:null;if(!hit&&!handHit&&!(before>=-1e-9&&after<=0))return drop;const receiver=handHit?'hand':hit?'target':'base',x=handHit?handHit.local[0]:hit?-hit[0]:0,z=handHit?handHit.local[2]:hit?45-hit[2]:45;let mark=marks.find(m=>m.receiver===receiver&&Math.abs(m.x-x)<.01&&Math.abs(m.z-z)<.01);if(mark)mark.packets++;else marks.push({receiver,x,z,...(handHit?{y:handHit.local[1]}:{}),packets:1});landedPackets++;changed=true;return {...drop,landed:true};});
 return changed?{...s,emissions,wetMarks:marks.slice(-32),landedPackets}:s;
}
