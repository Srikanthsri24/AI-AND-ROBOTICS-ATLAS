import{tapHarnessWires}from'./tap-harness';
import{tapDryExit}from'./tap-dry-jumpers';
import type{TapPoint}from'./tap-plumbing';
export const tapLevelJumperIds=['tap-wire-level-out','tap-wire-level-vcc','tap-wire-level-ground']as const;
export const tapLevelJumpers=tapLevelJumperIds.map(id=>tapHarnessWires.find(w=>w.id===id)!);
function move(p:TapPoint,axis:TapPoint,t:number):TapPoint{if(!Number.isFinite(t)||t<0||t>1)throw new RangeError('Invalid level extension fitting');const lift=10*(1-t*t*(3-2*t));return[p[0]+axis[0]*lift,p[1]+axis[1]*lift,p[2]+axis[2]*lift];}
export function tapLevelJumperPose(id:string,aPhase=1,bPhase=1){const lane=tapLevelJumperIds.indexOf(id as typeof tapLevelJumperIds[number]),w=tapLevelJumpers[lane];if(!w)throw new RangeError('Unknown level jumper');const source=move(w.a.point,w.a.axis,aPhase),destination=move(w.b.point,w.b.axis,bPhase),a=move(tapDryExit(w.a),w.a.axis,aPhase),b=move(tapDryExit(w.b),w.b.axis,bPhase),forward=-47-lane*4,top=302-lane*4;const middle:TapPoint[]=[[a[0],a[1],forward],[a[0],top,forward]];
 if(w.b.node==='uno-d4'){const escape=Math.max(252,b[1]+3.5);middle.push([b[0],top,-122],[b[0],escape,-122],[b[0],escape,b[2]]);}else middle.push([b[0],top,b[2]]);
 return{source,destination,points:[a,...middle,b]as readonly TapPoint[],sourceSeated:aPhase===1,destinationSeated:bPhase===1};}
export const tapLevelJumperParts=tapLevelJumpers.flatMap(w=>[[w.id,w.label,w.why+' This separate extension preserves the intact factory cable and three-position connector.'],...([w.a,w.b]as const).map((p,i)=>[w.id+'-end-'+i,p.label+' · male jumper',i===0?'The square male pin fits the factory connector socket and touches its two metal leaves. Its insulated grip remains outside the housing.':'The square male pin fits the named controller or breadboard socket. Fit with power off; its insulated grip remains above the opening.'])]);
