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
 {id:'pick-rover-caster-fork',label:'Bored caster fork',description:'The two fork cheeks clear the tyre sidewalls. Their horizontal bores align with the separate axle; the top bore surrounds the vertical stem. A bearing sleeve supports the deck above the fork.'},
 {id:'pick-rover-caster-stem',label:'Caster stem and lower head',description:'This vertical shank passes through the fork, bearing sleeve and deck. Its lower hex head supports the lower washer. Separate upper washer and nut retain the assembly; fine thread flanks are omitted in the model.'},
 {id:'pick-rover-caster-axle',label:'Caster axle bolt',description:'The horizontal shank passes through both 2.6 mm fork bores and the bored tyre. The left hex head seats against the outer fork cheek. The right washer and nut prevent sideways withdrawal; fine thread flanks are omitted.'},
 {id:'pick-rover-caster-axle-washer',label:'Caster axle washer',description:'This bored washer seats on the outside of the right fork cheek. It spreads the nut load onto the fork rather than the rolling tyre.'},
 {id:'pick-rover-caster-axle-nut',label:'Caster axle retaining nut',description:'The hex nut seats against the axle washer. Secure the axle while leaving the tyre free to roll between the cheeks; do not squeeze the fork into the tyre. Thread detail is represented by nominal mating envelopes.'},
 {id:'pick-rover-caster-lower-washer',label:'Caster lower thrust washer',description:'This ring lies between the stem head and underside of the fork top. It carries the vertical support load across a wider face while keeping the stem centred.'},
 {id:'pick-rover-caster-bearing',label:'Caster swivel bearing sleeve',description:'The bored sleeve fills the space between fork top and deck underside. Its outside clears the fork cheeks, while its central bore surrounds the stem and supports a free swivel joint.'},
 {id:'pick-rover-caster-top-washer',label:'Caster top washer',description:'This ring seats directly on the acrylic deck around the rear stem bore. It spreads the upper nut load without filling the stem opening.'},
 {id:'pick-rover-caster-stem-nut',label:'Caster stem retaining nut',description:'The separate upper hex nut seats on the top washer. Check the fork can swivel after fitting; an over-tightened joint would drag. Fine helical threads and torque ratings are not simulated.'},
]as const;

/** Normalize the existing detailed tyre by its raised-block radial envelope,
 * not just its lathed rubber radius. Native checks measure the actual vertices. */
export const pickChassisWheelScale=pickRoverRig.wheelRadius/Math.hypot(.65,(.062*Math.cos(.3)+.205*Math.sin(.3))/2);
