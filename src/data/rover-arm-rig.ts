import{raArmWorldInitial,raArmWorldAdvance,raArmWorldEnqueue,type RaArmWorld,type RaArmWiring}from'./rover-arm-world';
import{raArmPoseInitial,raArmPoseAdvance,type RaArmPose,type RaArmCalibration}from'./rover-arm-motion';
import{raArmDriverOutputs}from'./rover-arm-driver';
/** Serialisable execution + driver + illustrative calibrated joint response.
 * Integrates motion on the delivered pulse intervals, not the animation frame's
 * final software request. No callbacks or Three objects enter saved state. */
export type RaArmRig={world:RaArmWorld;pose:RaArmPose};
export function raArmRigInitial(angles:readonly number[]):RaArmRig{return{world:raArmWorldInitial(),pose:raArmPoseInitial(angles)};}
export function raArmRigEnqueue(s:RaArmRig,text:string):RaArmRig{return{...s,world:raArmWorldEnqueue(s.world,text)};}
export function raArmRigAdvance(s:RaArmRig,w:RaArmWiring,calibration:readonly(RaArmCalibration|null)[],ms:number):RaArmRig{
 let pose=s.pose;const world=raArmWorldAdvance(s.world,w,ms,(driver,dt)=>{pose=raArmPoseAdvance(pose,raArmDriverOutputs(driver,{servoSupply:w.servoSupply,outputEnabled:w.outputEnabled,leads:w.leads}),calibration,dt);});return{world,pose};
}
