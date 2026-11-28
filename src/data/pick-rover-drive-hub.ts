import{Path,Shape}from'three';
import{pickChassis,pickChassisWheelScale}from'./pick-rover-chassis';
export const pickDriveHub={shaftRoot:pickChassis.wheelX-.215*pickChassisWheelScale,shaftRadius:1.8,flat:1.2,boreRadius:1.85,hubFace:pickChassis.wheelX+.215*pickChassisWheelScale};
/** D section: x is the upper flat coordinate, y the other radial coordinate. */
export function pickDriveD<T extends Shape|Path>(shape:T,radius:number,flat:number){const angle=Math.acos(flat/radius);shape.moveTo(flat,Math.sqrt(radius*radius-flat*flat));shape.absarc(0,0,radius,angle,Math.PI*2-angle,false);shape.closePath();return shape;}
export function pickDriveWheelBore(){return pickDriveD(new Path(),pickDriveHub.boreRadius/pickChassisWheelScale,pickDriveHub.flat/pickChassisWheelScale);}
export const pickDriveHubParts=([-1,1]as const).flatMap(side=>{const key=side<0?'left':'right',label=side<0?'Left':'Right';return[
 {id:`pick-drive-${key}-shaft`,label:`${label} keyed gearbox output shaft`,description:'The D-shaped output matches the wheel hub’s flat, so the hub is mechanically keyed rather than resting on a smooth round shaft. The hub’s inner face seats on the gearbox output shoulder. The keyed face rotates with this motor’s actual wheel angle. The outboard end has a blind bore for the retaining screw; nominal screw-thread envelopes omit fine thread flanks.'},
 {id:`pick-drive-${key}-washer`,label:`${label} wheel retaining washer`,description:'The bored washer seats on the outer hub face. It spreads the screw-head load across the yellow hub while leaving the tyre and spokes clear. It turns with the wheel; the keyed shaft transmits drive torque.'},
 {id:`pick-drive-${key}-screw`,label:`${label} wheel retaining screw`,description:'The shank enters the shaft’s blind bore through the washer. Its recessed cross head seats against the washer and prevents the hub sliding outward. Tighten only for the matched wheel/gearbox hardware; fine helical threads and tightening torque are not simulated.'},
];});
