import{raGrip,raGripPitch}from'./rover-arm-gripper';
import{pickRoverRig}from'./pick-rover-motion';
/** Authored parallel-jaw transmission; native millimetres. Gap is measured
 * between the actual inner faces of the two rubber pads. */
export const pickGripper={gearY:32,gearZ:20,rackY:34.5,padWidth:1.5,padHeight:24,padDepth:24,fingerWidth:5,fingerOffset:4};
export function pickGripperPose(gap:number){if(!Number.isFinite(gap)||gap<pickRoverRig.closedGap-1e-8||gap>pickRoverRig.openGap+1e-8)throw new RangeError('Gripper outside calibrated gap');return{gap,pinionAngle:(pickRoverRig.openGap-gap)/(2*raGrip.radius),leftX:-(gap/2+pickGripper.fingerOffset),rightX:gap/2+pickGripper.fingerOffset};}
export function pickGripperToothX(side:-1|1){const phase=(pickRoverRig.openGap/2+pickGripper.fingerOffset-13+raGripPitch/2)%raGripPitch;return Array.from({length:21},(_,i)=>-side*13+(i-10)*raGripPitch-side*phase);}
export const pickGripperParts=[
 {id:'pick-grip-pinion',label:'Gripper drive pinion',description:'The small gear converts the jaw servo rotation into two opposite rack translations. It is a 20-tooth authored teaching gear; its centre bore couples to the output.'},
 {id:'pick-grip-left-rack',label:'Left sliding rack and finger',description:'The teeth mesh on one side of the pinion. The guided rack carries the left finger inward as the gear turns; it does not rotate around the block.'},
 {id:'pick-grip-right-rack',label:'Right sliding rack and finger',description:'This rack meshes on the opposite side of the pinion. Equal and opposite travel keeps the payload centred between the two fingers.'},
 {id:'pick-grip-left-pad',label:'Left contact pad',description:'The actual inner face defines the left side of the measured jaw gap. A small illustrative compression allowance models gripping soft foam without letting the metal finger pass through it.'},
 {id:'pick-grip-right-pad',label:'Right contact pad',description:'This opposing pad completes the grip. A block must be physically aligned and contacted; a close command alone does not count as a capture.'},
 {id:'pick-grip-guides',label:'Open rack guides',description:'Two guide channels constrain the racks to slide sideways. The central opening clears the drive gear and leaves the tooth engagement visible.'},
]as const;
export const pickGripperDriveParts=[
 {id:'pick-grip-spline-hub',label:'Compact splined drive hub',description:'This small-bore adapter joins the servo spline to the pinion. Its compact outside diameter clears both racks; a full-size circular horn would sweep through their teeth.'},
 {id:'pick-grip-drive-retainer',label:'Pinion retaining screw',description:'The axial screw passes through the pinion bore and engages the servo output. Its head seats below the gear; the hub supports the opposite face.'},
 {id:'pick-grip-servo-bracket',label:'Inverted servo bracket',description:'The slotted servo ears seat beneath this bored plate. An edge notch clears the cable outlet during insertion. Rear posts support the case above the transmission, clear of the moving finger bridges.'},
 {id:'pick-grip-mount-fasteners',label:'Servo mounting bolts and nuts',description:'Four separate fasteners pass through the plate and servo-ear slots. The nuts seat below the ears and the washers seat on the bracket.'},
]as const;
