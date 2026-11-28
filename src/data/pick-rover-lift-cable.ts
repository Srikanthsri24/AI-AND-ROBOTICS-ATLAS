import{CatmullRomCurve3,Curve,Quaternion,Vector3}from'three';
import{pickLiftDrive as D}from'./pick-rover-lift-drive';
import{pickElectronics as E}from'./pick-rover-electronics';
import{raServoWires}from'./rover-arm-servo';
export const pickLiftCableSeat=[E.pca[0]-23,E.pca[1]+3.25,E.pca[2]+5.54]as const;
/** The case is rotated -90° about Z; the cable leaves its actual relief. */
const centre=new CatmullRomCurve3([[D.servoX-35.4,D.pivotY-31.35,0],[D.servoX-35.4,53,0],[D.servoX-35.4,49,5],[D.servoX-35.4,50,16],[D.servoX-35.4,56,35],[D.servoX-35.4,61,43],[pickLiftCableSeat[0],61,43],[pickLiftCableSeat[0],61,58],[pickLiftCableSeat[0],59,pickLiftCableSeat[2]],[pickLiftCableSeat[0],pickLiftCableSeat[1]+8.05,pickLiftCableSeat[2]]].map(p=>new Vector3(...p)),false,'centripetal');
const stations=512;
const tangents=Array.from({length:stations+1},(_,i)=>centre.getTangent(i/stations).normalize());
const normals=[new Vector3(0,0,1)];
for(let i=1;i<=stations;i++){const q=new Quaternion().setFromUnitVectors(tangents[i-1],tangents[i]);normals.push(normals[i-1].clone().applyQuaternion(q).normalize());}
const desired=new Vector3(0,0,-1),last=normals[stations],roll=Math.atan2(tangents[stations].dot(last.clone().cross(desired)),last.dot(desired));
class LiftConductor extends Curve<Vector3>{constructor(readonly offset:number){super();}getPoint(t:number,target=new Vector3()){const f=Math.max(0,Math.min(1,(t-.25)/.5)),ease=f*f*(3-2*f),n=Math.min(stations-1,Math.floor(t*stations)),normal=normals[n].clone().lerp(normals[n+1],t*stations-n).normalize(),tangent=centre.getTangent(t).normalize();normal.addScaledVector(tangent,-normal.dot(tangent)).normalize().applyAxisAngle(tangent,roll*ease);const first=Math.max(0,1-t/.02),final=Math.max(0,(t-.98)/.02);normal.lerp(new Vector3(0,0,1),first*first*(3-2*first)).normalize().lerp(desired,final*final*(3-2*final)).normalize();const spread=1+1.54*ease;return centre.getPoint(t,target).addScaledVector(normal,this.offset*spread);}}
export const pickLiftCableRoutes=raServoWires.map(w=>({wire:w,curve:new LiftConductor(w.z)}));
export const pickLiftCableParts=[
 {id:'pick-lift-cable-plug',label:'Lift servo · channel 0 plug',description:'The three-way housing seats over PWM channel 0 only. Brown aligns with GND, red with V+ and orange with signal. The housing has three separate open contact cavities; the neighbouring channel stays accessible for the jaw servo.'},
 ...raServoWires.flatMap(w=>[{id:'pick-lift-cable-'+w.id,label:'Lift servo · '+w.label+' conductor',description:w.why+' This conductor leaves the actual fixed lift-servo strain relief. The ribbon gently changes orientation to align with the three channel-0 header rows.'},{id:'pick-lift-contact-'+w.id,label:'Lift servo · '+w.label+' spring contact',description:'Two metal springs seat against the actual channel-0 '+w.id+' pin. '+w.why}]),
];
