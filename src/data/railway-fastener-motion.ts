export type RailwayFastenerMotion={mountFront:number;mountRear:number;armFront:number;armRear:number;armRearLift:number;armRearTurn:number};
const ease=(p:number,a:number,b:number)=>{const t=Math.max(0,Math.min(1,(p-a)/(b-a)));return t*t*(3-2*t);};
/** Native mm: front bolts approach -Z. Arm nuts clear the gearbox above it,
 * align behind the bolt tips, then thread forward only after lowering. */
export function railwayFastenerMotion(p:number):RailwayFastenerMotion{if(!Number.isFinite(p)||p<0||p>14)throw Error('Railway fastener progress must be 0–14');const armRear=p<12.94?-12+10.6*ease(p,12.9,12.94):p<12.97?-1.4:1.4*(ease(p,12.97,13)-1);return{mountFront:12*(1-ease(p,4.65,4.85)),mountRear:12*(ease(p,4.85,5)-1),armFront:12*(1-ease(p,12.75,12.9)),armRear,armRearLift:12*(1-ease(p,12.94,12.97)),armRearTurn:Math.PI*4*ease(p,12.97,13)};}
