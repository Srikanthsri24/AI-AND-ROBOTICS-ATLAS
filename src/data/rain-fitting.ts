import {rainConnections,rainWireRoute} from './rain-wires';
import type {RainPoint} from './rain-workbench-layout';
/** Two operations per wire: source first, destination second. Supplies remain off. */
export const rainFittingTotal=rainConnections.length*2;
const ease=(value:number)=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
export function rainFittingPose(index:number,cursor:number){
 if(!Number.isInteger(index)||index<0||index>=rainConnections.length)throw new RangeError('Unknown rain fitting wire');
 if(!Number.isFinite(cursor)||cursor<0||cursor>rainFittingTotal)throw new RangeError('Rain fitting cursor must be 0–18');
 const w=rainConnections[index],local=cursor-index*2;
 const sourceWithdrawal=16*(1-ease(w.fromKind==='grove'?cursor:local)),destinationWithdrawal=16*(1-ease(local-1));
 const source:RainPoint=w.fromKind==='clamp'?[0,0,sourceWithdrawal]:[0,sourceWithdrawal,0];
 const destination:RainPoint=w.toKind==='servo'?[destinationWithdrawal ? -destinationWithdrawal : 0,0,0]:[0,destinationWithdrawal,0];
 const points=rainWireRoute(index).map((p,n,array):RainPoint=>{const t=n/(array.length-1);return [p[0]+source[0]*(1-t)+destination[0]*t,p[1]+source[1]*(1-t)+destination[1]*t,p[2]+source[2]*(1-t)+destination[2]*t];});
 return {visible:w.fromKind==='grove'||local>=0,source,destination,points};
}
export function rainFittingInstruction(cursor:number){
 rainFittingPose(0,cursor);
 if(cursor===rainFittingTotal)return {id:'',title:'Check before power',instruction:'Confirm the separate servo supply positive never joins Uno 5 V. All grounds share the return strip. Leave the white Grove wire insulated and unused.'};
 const index=Math.floor(cursor/2),w=rainConnections[index],source=cursor%2<1,kind=source?w.fromKind:w.toKind;
 return {id:w.id,title:w.name,instruction:`${source?'First':'Next'}, fit ${source?w.fromPort:w.toPort}. ${kind==='clamp'?'Insert the bare conductor into the supply terminal and secure its screw.':kind==='servo'?'Push the male jumper horizontally into the matching servo socket.':kind==='grove'?'The keyed Grove harness seats as one unit in the first operation. Identify this conductor in its own chamber; do not extract individual contacts.':'Lower the male pin vertically into this exact socket or breadboard hole.'} Keep USB and the separate servo supply off while fitting.`};
}
