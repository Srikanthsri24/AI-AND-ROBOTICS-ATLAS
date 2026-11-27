import{tapHarnessWires}from'./tap-harness';
import{tapDryExit}from'./tap-dry-jumpers';
import type{TapPoint}from'./tap-plumbing';
export const tapSonarIds=['tap-wire-sonar-vcc','tap-wire-trigger','tap-wire-echo','tap-wire-sonar-ground'] as const;
export const tapSonarWires=tapSonarIds.map(id=>tapHarnessWires.find(w=>w.id===id)!);
function offset(p:TapPoint,axis:TapPoint,n:number):TapPoint{return[p[0]+axis[0]*n,p[1]+axis[1]*n,p[2]+axis[2]*n];}
function lift(n:number){if(!Number.isFinite(n)||n<0||n>1)throw new RangeError('Invalid sonar fitting phase');return 10*(1-n*n*(3-2*n));}
export function tapSonarWirePose(id:string,sourcePhase=1,destinationPhase=1){const lane=tapSonarIds.indexOf(id as typeof tapSonarIds[number]),w=tapSonarWires[lane];if(!w)throw new RangeError('Unknown tap sonar wire');const source=offset(w.a.point,w.a.axis,lift(sourcePhase)),destination=offset(w.b.point,w.b.axis,lift(destinationPhase)),a=offset(tapDryExit(w.a),w.a.axis,lift(sourcePhase)),b=offset(tapDryExit(w.b),w.b.axis,lift(destinationPhase)),highAtSource=w.a.kind==='female-header',high=highAtSource?a:b,low=highAtSource?b:a;
 const near=-4+lane*5,side=80+lane*3,y=438+lane*3,right=246+lane*3,deck=281+lane*3;
 const middle:TapPoint[]=[];
 if((highAtSource?w.b:w.a).node.startsWith('uno-')){const escape=Math.max(252,low[1]+3.5);middle.push([low[0],escape,low[2]],[low[0],escape,-122],[low[0],deck,-122]);}
 else middle.push([low[0],deck,low[2]]);
 middle.push([right,deck,-133],[right,y,-133],[side,y,-133],[side,y,near],[side,high[1],near],[high[0],high[1],near]);
 const points:readonly TapPoint[]=[low,...middle,high];return{source,destination,points:highAtSource?[...points].reverse():points,sourceSeated:sourcePhase===1,destinationSeated:destinationPhase===1};
}
export const tapSonarWireParts=tapSonarWires.flatMap(w=>[[w.id,w.label,w.why+' The coloured lead follows the dry overhead frame, clear of the water stream.'],...([w.a,w.b]as const).map((p,i)=>[w.id+'-end-'+i,p.label+' · '+(p.kind==='socket'?'male jumper':'female sensor connector'),p.kind==='socket'?'The square male pin enters the named Uno or breadboard socket; its insulated grip stays above the opening.':'The open female housing fits the actual square HC-SR04 header. Its metal leaves grip the pin while the insulated wire exits away from the board.'])]);
export const tapSonarCableGuideParts=[
 ['tap-sonar-top-comb','Sensor harness · upper cable guide','Four open channels hold the separate VCC, TRIG, ECHO and GND leads in front of the top crossbar. The insulated wires pass through; the guide is not an electrical connection.'],
 ['tap-sonar-side-comb','Sensor harness · side cable guide','Keeps the four downward runs separated beside the dry frame upright. Its rear mounting face meets the upright front, away from the basin and water stream.'],
] as const;
