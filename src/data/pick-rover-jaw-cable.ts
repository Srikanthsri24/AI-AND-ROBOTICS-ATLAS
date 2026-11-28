import{CatmullRomCurve3,Curve,Quaternion,Vector3}from'three';
import{pickLiftJoints}from'./pick-rover-lift';
import{pickGripper}from'./pick-rover-gripper';
import{pickElectronics as E}from'./pick-rover-electronics';
import{raServo,raServoWires}from'./rover-arm-servo';
export const pickJawCableSeat=[E.pca[0]-23+2.54,E.pca[1]+3.25,E.pca[2]+5.54]as const;
/** One fixed case exit moves with the level gripper, not with its output shaft. */
export function pickJawCableCentre(angle:number){const palm=pickLiftJoints(angle).palm,start=new Vector3(31.35,palm[1]+79.4,palm[2]+pickGripper.gearZ),end=new Vector3(pickJawCableSeat[0],pickJawCableSeat[1]+8.05,pickJawCableSeat[2]);
 const make=(slack:number)=>{const c=new CatmullRomCurve3([start,start.clone().add(new Vector3(9,0,0)),new Vector3(58+slack,start.y+3,start.z+10),new Vector3(65+slack,90,45),new Vector3(end.x,78,45),new Vector3(end.x,63,64),end.clone().add(new Vector3(0,4,0)),end],false,'centripetal');c.arcLengthDivisions=256;return c;};
 let low=0,high=160;if(make(low).getLength()>raServo.leadLength)throw new RangeError('Jaw cable route exceeds available lead');if(make(high).getLength()<raServo.leadLength)throw new RangeError('Jaw cable slack cannot be placed');for(let n=0;n<22;n++){const mid=(low+high)/2;if(make(mid).getLength()<raServo.leadLength)low=mid;else high=mid;}const centre=make((low+high)/2);return{centre,start,end,slack:(low+high)/2};
}
export function pickJawCableRoutes(angle:number){const{centre,start,end,slack}=pickJawCableCentre(angle),stations=192,tangents=Array.from({length:stations+1},(_,i)=>centre.getTangent(i/stations).normalize()),initial=new Vector3(0,0,-1),normals=[initial.clone()];for(let i=1;i<=stations;i++)normals.push(normals[i-1].clone().applyQuaternion(new Quaternion().setFromUnitVectors(tangents[i-1],tangents[i])).normalize());const desired=new Vector3(0,0,-1),last=normals[stations],roll=Math.atan2(tangents[stations].dot(last.clone().cross(desired)),last.dot(desired));
 class JawConductor extends Curve<Vector3>{constructor(readonly offset:number){super();}getPoint(t:number,target=new Vector3()){const f=Math.max(0,Math.min(1,(t-.25)/.5)),ease=f*f*(3-2*f),n=Math.min(stations-1,Math.floor(t*stations)),tangent=centre.getTangent(t).normalize(),normal=normals[n].clone().lerp(normals[n+1],t*stations-n).normalize();normal.addScaledVector(tangent,-normal.dot(tangent)).normalize().applyAxisAngle(tangent,roll*ease);const first=Math.max(0,1-t/.02),final=Math.max(0,(t-.98)/.02);normal.lerp(initial,first*first*(3-2*first)).normalize().lerp(desired,final*final*(3-2*final)).normalize();return centre.getPoint(t,target).addScaledVector(normal,this.offset*(1+1.54*ease));}}
 return{centre,start,end,slack,routes:raServoWires.map(w=>({wire:w,curve:new JawConductor(w.z)}))};
}
export const pickJawCableParts=[
 {id:'pick-jaw-cable-plug',label:'Jaw servo · channel 1 plug',description:'The three-contact plug seats over PWM channel 1 beside the lift cable. Brown aligns with GND, red with V+ and orange with signal. The connector stays fixed on the PCB while cable slack follows the moving gripper.'},
 ...raServoWires.flatMap(w=>[{id:'pick-jaw-cable-'+w.id,label:'Jaw servo · '+w.label+' conductor',description:w.why+' The case end follows the level gripper. The authored centre route keeps the nominal 320 mm lead length by changing its outboard slack bow as the lift moves.'},{id:'pick-jaw-contact-'+w.id,label:'Jaw servo · '+w.label+' spring contact',description:'Both spring strips seat on the actual channel-1 '+w.id+' header pin. '+w.why}]),
];
