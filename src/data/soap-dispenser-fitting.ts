import {soapSonarWires} from './soap-dispenser-sonar-wires';
import {soapCircuitWires,soapCircuitFittingOrder} from './soap-dispenser-circuit-wires';
/** Endpoint order follows the collision-checked wire insertion paths. */
export const soapFittingSteps=[...soapSonarWires,...soapCircuitFittingOrder.map(i=>soapCircuitWires[i])].flatMap((wire,wireIndex)=>[wire.a,wire.b].map((port,end)=>({
 id:wire.id+'-'+end,partId:wire.id,label:wire.label,terminal:port.label,
 instruction:port.kind==='bare-supply'?'Loosen the labelled clamp, slide the stripped conductor fully into its barrel, then tighten the clamp onto the bare metal.':port.kind==='female-sonar'?'Align the open female connector with this labelled sonar pin. Slide it straight on until its spring contacts grip the pin.':'Align the square male pin with the labelled contact. Push it straight into the socket; leave the insulated body outside.',
 why:wire.what,connection:wire.connection,
 check:port.kind==='bare-supply'?'The conductor is inside the barrel and the clamp has closed onto it. No bare tail bridges adjacent terminals.':'The metal end is seated inside the intended contact, not beside the plastic housing. Follow the wire to check its other end.',
 wireIndex,end,
})));
export type SoapFittingState={cursor:number;target:number;playing:boolean};
export const soapFittingInitial=():SoapFittingState=>({cursor:0,target:0,playing:false});
export type SoapFittingPower={unoWithdrawal:number;hostWithdrawal:number;servoPower:boolean};
export function soapFittingIsolated(p:SoapFittingPower){return !p.servoPower&&p.unoWithdrawal>=12&&p.hostWithdrawal>=12;}
export function soapFittingCursors(cursor:number){if(!Number.isFinite(cursor)||cursor<0||cursor>18)throw new RangeError('Invalid soap fitting position');return {sonarFitting:Math.min(8,cursor),circuitFitting:Math.max(0,cursor-8)};}
export function soapFittingAction(s:SoapFittingState,action:'next'|'back'|'pause'|'reset',power:SoapFittingPower):SoapFittingState{
 if(action==='pause')return {...s,playing:false};
 if(!soapFittingIsolated(power))return {...s,playing:false};
 if(action==='reset')return soapFittingInitial();
 if(action==='next'){const target=Math.min(18,Math.floor(s.cursor+1e-8)+1);return {...s,target,playing:target>s.cursor};}
 const target=Math.max(0,Math.ceil(s.cursor-1e-8)-1);return {...s,target,playing:target<s.cursor};
}
/** One terminal takes 1.2 s; all rendering uses the same verified fitting cursors. */
export function soapFittingAdvance(s:SoapFittingState,ms:number,power:SoapFittingPower):SoapFittingState{
 if(!Number.isFinite(ms)||ms<0)throw new RangeError('Invalid fitting elapsed time');
 if(!soapFittingIsolated(power))return {...s,playing:false};
 if(!s.playing)return s;
 const delta=s.target-s.cursor,step=ms/1200,cursor=Math.abs(delta)<=step?s.target:s.cursor+Math.sign(delta)*step;
 return {...s,cursor,playing:cursor!==s.target};
}
