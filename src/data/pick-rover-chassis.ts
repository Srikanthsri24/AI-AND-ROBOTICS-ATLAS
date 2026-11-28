import{pickRoverRig}from'./pick-rover-motion';
/** Authored wide-track pick rover, mm. The wheel track is wider than the
 * side-mounted lift servo; actuator/load ratings still require a real build. */
export const pickChassis={width:168,front:-45,rear:195,bottom:35,top:38,wheelX:pickRoverRig.track/2,wheelY:pickRoverRig.wheelRadius,axleZ:-15,motorX:75,motorY:29,casterZ:165,casterRadius:10};
export const pickChassisParts=[
 {id:'pick-rover-deck',label:'Notched acrylic chassis',description:'This wide plate supports the lift and rear electronics. Side pockets clear both motor cases; the four front bores align with the lift base and the rear bore supports the caster stem.'},
 {id:'pick-rover-left-wheel',label:'Left drive tyre and hub',description:'A bored five-spoke hub fits the left motor shaft. Raised rubber tread rolls on the floor; its angle follows the same signed travel as the transfer model.'},
 {id:'pick-rover-right-wheel',label:'Right drive tyre and hub',description:'The right wheel matches the left radius. The wide track leaves clearance beside the lift servo and chassis; both motors drive forward during the timed transfer.'},
 {id:'pick-rover-left-motor',label:'Left geared drive motor',description:'The brushed motor can drives the yellow reduction housing. Its external output shaft enters the wheel hub; two exposed rear terminals connect to motor-driver channel A.'},
 {id:'pick-rover-right-motor',label:'Right geared drive motor',description:'Driver channel B controls this motor. Its shaft is aligned with the opposite wheel, while the rear metal terminals remain accessible for wiring.'},
 {id:'pick-rover-caster-wheel',label:'Passive rear caster wheel',description:'This small unpowered wheel supports the rear of the rover. It turns about its horizontal axle as the platform travels; it does not receive motor commands.'},
 {id:'pick-rover-caster-fork',label:'Bored caster fork and axle',description:'The two fork cheeks clear the tyre sidewalls. A narrow axle passes through their actual bores and the wheel centre.'},
 {id:'pick-rover-caster-stem',label:'Caster stem and top fastener',description:'The stem passes through the rear chassis bore. The upper washer and head retain the caster while the fork can swivel around the vertical axis.'},
]as const;

/** Normalize the existing detailed tyre by its raised-block radial envelope,
 * not just its lathed rubber radius. Native checks measure the actual vertices. */
export const pickChassisWheelScale=pickRoverRig.wheelRadius/Math.hypot(.65,(.062*Math.cos(.3)+.205*Math.sin(.3))/2);
