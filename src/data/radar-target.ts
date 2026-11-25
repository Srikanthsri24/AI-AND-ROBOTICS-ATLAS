import {radarDefaults,radarGeometry,radarRotate,radarValidate,radarYaw,type RadarInputs} from './radar-workshop';
export type RadarTargetInput=Pick<RadarInputs,'targetPresent'|'targetAngle'|'targetDistanceMm'|'targetYaw'>;
export const radarTargetParts=[
 ['radar-target-card','Rigid flat test card','The 120 mm-wide face reflects the workshop’s simplified central sonar ray. It is a finite surface, not an all-direction distance setting.','Place the front face about 40 cm from the reference sensor face. Turn the card to face the head; moving it sideways changes which bearings receive a return.'],
 ['radar-target-stand','Slotted target stand','Supports the card above the table with front and rear clamping blocks.','The stand remains below the 68 mm acoustic axis. Its blocks do not form the target surface used by the simplified measurement model.'],
 ['radar-target-mark','Printed aiming cross','Marks the acoustic-axis height on the front of the test card. The ink is not an electronic sensor.','At 90° and 40 cm the head faces this mark. ECHO still measures sound returning from the finite card, not from a special tracking marker.'],
] as const;
export function radarTargetPose(input:RadarTargetInput){
 radarValidate({...radarDefaults,...input});
 const[x,z]=radarRotate(0,radarGeometry.faceOffsetMm+input.targetDistanceMm,input.targetAngle);
 return{position:[x,0,z] as [number,number,number],yaw:radarYaw(input.targetAngle+input.targetYaw),halfWidth:radarGeometry.targetHalfWidthMm};
}
