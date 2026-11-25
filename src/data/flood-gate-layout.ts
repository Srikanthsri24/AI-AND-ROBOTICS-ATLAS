/** Authored millimetre teaching geometry, not a manufacturer's drilling drawing. */
export const gateBasin={insideWidth:360,insideLength:220,floor:8,rim:118,wall:2,dividerThickness:2,opening:{bottom:10,top:84,halfWidth:28},flapPivotY:88,flapLength:80,flapWidth:60,linkZ:37} as const;
export function gateWaterBox(side:'up'|'down',depth:number){if(!Number.isFinite(depth)||depth<0||depth>100)throw Error('Fill each chamber only between 0 and 100 mm.');return {at:[side==='up'?-90.5:90.5,8+depth/2,0] as[number,number,number],size:[178.6,depth,219.6] as[number,number,number]};}
export const gateBasinParts=[
 ['gate-tray','Spillway drip tray','Supports the two-chamber model and catches small tabletop splashes.','The controller and both electrical supplies stay on the dry bench outside it.'],
 ['gate-basin','Clear two-chamber basin','A straight-sided clear model makes both independently measured water surfaces visible. Its dimensions are authored for this lesson.','The divider separates equal-area upstream and downstream chambers.'],
 ['gate-divider','Divider and lower opening','Three fixed panels leave a real opening low in the divider. The flap covers that opening when closed.','The gate swings into the downstream chamber; the sensor beams stay clear of it.'],
 ['gate-seal','Model gate sealing strip','An illustrated flexible border marks where the closed flap meets the opening. Watertightness and pressure loads are not simulated.','Seats against the flap on the downstream face of the divider.'],
 ['gate-up-water','Upstream water body','This is the physical upstream level, separate from its calibrated ultrasonic reading.','The controller considers release at 80 mm; the hinged flap determines whether the model opening is clear.'],
 ['gate-down-water','Downstream water body','This is the physical receiving-chamber level. A high downstream reading blocks release.','The sketch commands closed at 60 mm downstream, even if upstream remains high.'],
 ['gate-up-scale','Upstream depth marks','Marks 0, 5, 8 and 10 cm from the actual inside bottom.','Compare these marks with the upstream echo-derived depth after calibration.'],
 ['gate-down-scale','Downstream depth marks','Marks the same physical datum on the receiving chamber.','The 6 cm downstream limit is marked separately because it has priority over release.'],
] as const;

export const gateSupport={rearZ:-155,postX:135,foot:[46,8,40] as[number,number,number],servoAxis:[0,180,35] as[number,number,number],sensorX:{up:-90,down:90}};
export function gateSensorPosition(side:'up'|'down',gap=230):[number,number,number]{if(!Number.isFinite(gap)||gap<200||gap>300)throw Error('Keep the dry sensor gap between 200 and 300 mm.');return [gateSupport.sensorX[side],8+gap+14,0];}
export const gateSupportParts=[
 ['gate-dry-frame','Dry overhead support frame','Two weighted feet and upright posts support the sensor arms and servo bracket outside the drip tray.','The rear posts are outside the wet tray; the overhead servo drive remains above the maximum water line.'],
 ['gate-servo-bracket','Servo mounting bracket','A U-shaped bracket clears the servo body and grips its two drilled mounting ears.','Hangs from the frame cross-arm; two separate bolts fasten the servo flange.'],
 ['gate-up-mount','Upstream sensor mounting plate','A drilled plate locates the upstream module directly over its chamber.','Four insulating spacers align with the HC-SR04 board holes.'],
 ['gate-down-mount','Downstream sensor mounting plate','The second drilled plate locates the downstream module independently.','It has its own empty-gap reference and echo channel.'],
] as const;
