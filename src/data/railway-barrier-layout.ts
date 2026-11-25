export const railwayBarrier={pivot:[-65,26,70],closed:5,open:95,armEnd:130,armHalfHeight:3,armBack:1,armFront:3} as const;
export function railwayBarrierAngle(actualAngle:number){return(actualAngle-railwayBarrier.closed)*Math.PI/180;}
export function railwayBarrierTip(actualAngle:number){const a=railwayBarrierAngle(actualAngle);return[railwayBarrier.pivot[0]+Math.cos(a)*railwayBarrier.armEnd,railwayBarrier.pivot[1]+Math.sin(a)*railwayBarrier.armEnd,railwayBarrier.pivot[2]+railwayBarrier.armFront] as const;}
export const railwayBarrierParts=[
 ['railway-barrier-stand','Servo mounting stand','A bored two-post bracket supports the servo above the model base.','The two posts align with the servo ears. Four foot screws anchor the base outside the road.'],
 ['railway-barrier-foot-screws','Barrier stand foot screws','Four screws and washers hold the stand to the tabletop model.','Their shafts pass through the actual foot bores; they do not enter the road or train path.'],
 ['railway-barrier-case','Positional micro servo case','Houses the motor, reduction gears and position control electronics.','Its power comes from a separate regulated 5 V supply; Uno D9 provides the angle command with a shared ground reference.'],
 ['railway-barrier-cover','Servo gearbox cover','Closes the output gear housing around the shaft.','The cover remains stationary while the shaft, horn and barrier rotate.'],
 ['railway-barrier-ears','Servo mounting ears','Two bored tabs transfer the servo reaction force into the stand.','The ear holes align with the stand posts; a screw and nut secure each side.'],
 ['railway-barrier-mounts','Servo mounting screws and nuts','Two through-fasteners clamp the ears to the stand posts.','The nuts sit behind the posts, with the screw heads in front of the ears.'],
 ['railway-barrier-collar','Output shaft collar','Supports the shaft at the fixed gearbox cover.','Its central bore stays open around the rotating shaft.'],
 ['railway-barrier-shaft','Servo output shaft','Turns the horn according to the simulated mechanical angle.','The 5° command maps to a horizontal arm and 95° to an upright arm in this authored mounting. No encoder measurement is claimed.'],
 ['railway-barrier-horn','Servo horn','Transfers shaft rotation to the lightweight card arm.','Centre the bare servo at 95° before fitting the arm upright. Its two arm fasteners are separate from the central retaining screw.'],
 ['railway-barrier-retainer','Horn retaining screw','Secures the horn to the output shaft.','Its head fits through the arm’s larger central access opening so it clamps the horn directly.'],
 ['railway-barrier-arm','Striped lightweight barrier arm','Blocks the model road while the train passes between the two beams.','The whole arm turns with the physical shaft. It sits beside the track and clears the train envelope throughout the sweep.'],
 ['railway-barrier-arm-fixings','Arm mounting screws and nuts','Two small through-fasteners attach the card arm to the horn.','The screws pass through matching holes in both pieces; rear nuts remain clear of the fixed collar.'],
].map(([id,name,what,connection])=>({id,name,what,connection}));
