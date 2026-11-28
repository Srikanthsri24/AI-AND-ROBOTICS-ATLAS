import {pickRoverRig}from'./pick-rover-motion';
/** Shared physical anchor map: the renderer, pin checks and end effector use
 * these values rather than independently approximating the animated linkage. */
export const pickLiftGeometry={spacing:26,sideX:18,plateThickness:3,bore:2.1,pinRadius:2,baseY:38,beamWidth:14};
export function pickLiftJoints(angle:number){if(!Number.isFinite(angle)||angle<pickRoverRig.lowAngle-1e-8||angle>pickRoverRig.highAngle+1e-8)throw new RangeError('Lift outside calibrated travel');const z=-pickRoverRig.linkLength*Math.cos(angle),y=pickRoverRig.pivotY+pickRoverRig.linkLength*Math.sin(angle);return{lowerFixed:[0,pickRoverRig.pivotY,0]as const,upperFixed:[0,pickRoverRig.pivotY+pickLiftGeometry.spacing,0]as const,lowerMoving:[0,y,z]as const,upperMoving:[0,y+pickLiftGeometry.spacing,z]as const,palm:[0,y,z-pickRoverRig.palmReach]as const};}
export const pickLiftParts=[
 {id:'pick-lift-base',label:'Bolted lift base',description:'A broad mounting foot transfers the payload and linkage forces into the rover chassis. Its four open bores receive the chassis fasteners.'},
 {id:'pick-lift-fixed-frame',label:'Fixed pivot towers',description:'Two fixed pivot axes sit 26 mm apart. They support the parallelogram links; the frame stays attached to the chassis.'},
 {id:'pick-lift-lower-links',label:'Driven lower links',description:'The two 100 mm links rotate about the lower fixed axis. The lift servo couples to the left link through its horn; both ends have actual pivot bores.'},
 {id:'pick-lift-upper-links',label:'Parallel upper links',description:'Matching 100 mm links follow the upper fixed axis. Together with the end carrier they keep the gripper level while it rises.'},
 {id:'pick-lift-end-carrier',label:'Level end carrier',description:'The 26 mm spacing matches the fixed towers. Its two moving pivots keep this carrier upright throughout the calibrated lift arc.'},
 {id:'pick-lift-pivot-pins',label:'Four pivot shafts',description:'Steel shafts run through the open link and carrier bores. Their exposed ends carry retaining collars; the shafts align with the four linkage axes.'},
 {id:'pick-lift-palm-mount',label:'Horizontal gripper mount',description:'A 35 mm forward-reaching bracket stays level. Its end is the same reference used for the physical foam-block contact model.'},
]as const;
