import {railwayLayout} from './railway-workshop';
export const railwayTrack={left:-560,right:660,railZ:18,railTop:4,wheelY:10,wheelRadius:6,carriages:[{front:0,rear:-110,axles:[-22,-88]},{front:-130,rear:-240,axles:[-152,-218]}]} as const;
export const railwayTrackParts=[
 ['railway-base','Tabletop crossing base','Supports the track and paper road as one flat model.','The straight track follows the positive X direction. This is a one-way tabletop demonstration.'],
 ['railway-road','Model road and crossing deck','Shows the road that the barrier closes before a train reaches it.','The road spans −45 to +45 mm along the track. The train must clear the exit beam before the sketch releases the gate.'],
 ['railway-sleepers','Track sleepers','Hold the two rails at a fixed gauge and distribute their load to the base.','Rail clips secure the metal rails above the sleepers; the road deck stops short of the moving wheel flanges.'],
 ['railway-rails','Running rails','The polished rail heads support the model train wheels.','The tread radius is 6 mm and the wheel centres are 10 mm above the base, meeting the 4 mm rail-head height.'],
 ['railway-rail-clips','Rail clips and fasteners','Hold both rail webs to their sleeper seats.','The clips sit outside the rolling tread and below the wheel flanges.'],
 ['railway-front-body','Leading carriage body','Its opaque lower side interrupts beam A, then beam B as the train moves forward.','The real beam-height body occupies the front 110 mm of the same 240 mm train used by the controller.'],
 ['railway-rear-body','Trailing carriage body','Keeps the exit beam interrupted until the last body has passed it.','Its rear at nose minus 240 mm is the tail used by the beam-intersection calculation.'],
 ['railway-front-roof','Leading carriage removable roof','Closes the passenger compartment above the window frame.','The roof is above the beam-height band. It does not determine whether a receiver is blocked.'],
 ['railway-rear-roof','Trailing carriage removable roof','Closes the rear passenger compartment.','Its lower lip overlaps the side frame; the opaque lower body remains continuous beneath the windows.'],
 ['railway-front-windows','Leading carriage glazing','Inset dark glazing and framing make the cab and side windows visible.','The windows sit above both infrared beams so they do not create false gaps in this model.'],
 ['railway-rear-windows','Trailing carriage glazing','Separates the rear compartment windows from its structural lower body.','The infrared line crosses below the glazing. A transparent real carriage would need an opaque strip at beam height.'],
 ['railway-coupler','Coupler and opaque beam-height bridge','Joins the cars and bridges their 20 mm gap with an opaque strip.','Without this bridge, a gap between cars could clear a beam prematurely. It occupies the same y=16–40 mm band as the lower bodies.'],
 ['railway-front-underframe','Leading carriage underframe','Carries the leading body and its two axle supports.','The underframe sits above the axles and below the solid lower body.'],
 ['railway-rear-underframe','Trailing carriage underframe','Carries the trailing body and axle supports.','It travels with the train nose, preserving the rear body and wheel spacing.'],
 ['railway-headlamps','Leading headlamps and bezels','Identify the front of the one-way train.','These are decorative model features, not the D6 crossing warning LED.'],
 ...railwayTrack.carriages.flatMap((car,n)=>car.axles.flatMap((x,a)=>[
  [`railway-axle-${n}-${a}`,`${n?'Rear':'Front'} carriage axle ${a+1}`,'Transfers the two wheel loads through one shaft.','The axle turns around its Z axis while the train moves along X.'],
  ...[-1,1].map((side)=>[`railway-wheel-${n}-${a}-${side}`,`${n?'Rear':'Front'} carriage ${side<0?'far':'near'} wheel ${a+1}`,'A rolling metal tread meets the rail; its inner flange keeps the train aligned.','Wheel rotation is derived from actual train travel divided by the 6 mm tread radius, rather than a free-running animation.'])
 ])),
].map(([id,name,what,connection])=>({id,name,what,connection}));
export function railwayTrainBand(nose:number){return{left:nose-railwayLayout.trainLength,right:nose,bottom:railwayLayout.trainBandBottom,top:railwayLayout.trainBandTop};}
