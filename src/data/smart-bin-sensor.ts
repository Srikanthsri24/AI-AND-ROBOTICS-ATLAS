import{binPhysical,binLidAngle}from'./smart-bin-layout';
export type BinPoint=[number,number,number];
export const binSensor={x:0,z:0,boardY:534,frontY:520,plateBottom:542,plateTop:546,lidBottom:552};
/** Closed-lid world point transformed about the real hinge axis. */
export function binOnLid(point:BinPoint,degrees:number):BinPoint{const t=binLidAngle(degrees),y=point[1]-binPhysical.hingeY,z=point[2]-binPhysical.hingeZ;return[point[0],binPhysical.hingeY+y*Math.cos(t)-z*Math.sin(t),binPhysical.hingeZ+y*Math.sin(t)+z*Math.cos(t)];}
export const binLever={x:148,pivotY:540,pivotZ:65,length:Math.hypot(20,11.5),rollerRadius:2.5,freeAngle:Math.atan2(11.5,20)};
/** Exact plane / circle contact against the rotating lid striker underside.
 * A 1 mm roller deflection is an authored switch trip setting, not a datasheet.
 */
export function binSwitchPose(degrees:number,strikerLift=0){const theta=-binLidAngle(degrees),d=binLever,rhs=2+strikerLift-d.rollerRadius+10*Math.cos(theta)+201*Math.sin(theta),contact=theta+Math.asin(Math.max(-1,Math.min(1,rhs/d.length))),angle=Math.min(d.freeAngle,contact),roller:BinPoint=[d.x,d.pivotY+d.length*Math.sin(angle),d.pivotZ+d.length*Math.cos(angle)],stroke=d.pivotY+11.5-roller[1];const plungerCentreY=540+4*Math.tan(angle)-1.4/Math.cos(angle);return{angle,roller,stroke,closed:stroke>=1,plungerCentreY,plungerTop:plungerCentreY+1.2};}
export const binSensorParts=[
 ['bin-sensor-plate','Ultrasonic mounting plate','A bored plate keeps the board supported beneath the lid, with the transducers pointing at the load.','Four coaxial spacers and screws meet the module holes. Do not use the model as a fabrication drilling jig.'],
 ['bin-sensor-bosses','Bonded lid mounting bosses','Four insulating bored bosses join the plate to the lid underside without an exposed electrical connection.','The screw tips end inside their blind bosses; the bonded pads attach to the lid.'],
 ['bin-sensor-spacers','Insulating module spacers','Bored sleeves keep the PCB and rear timing electronics clear of the mounting plate.','All four sleeves share the actual board / plate hole axes. They do not carry signal ground.'],
 ['bin-sensor-screws','Sensor mounting screws','Four small metal shafts hold the board, spacers and plate to the bosses.','Heads seat below the PCB; tips stop inside the blind bosses beneath the lid.'],
 ['bin-switch-bracket','Lid switch mounting bracket','A bonded outside bracket positions the roller lever beneath the lid striker.','Adjust with USB off. The lid presses the roller without crushing the switch body.'],
 ['bin-switch-body','Roller microswitch body','The insulated housing supports the spring contact mechanism.','Use COM and NO for the lid input; leave NC unconnected.'],
 ['bin-switch-lever','Spring roller lever','The lever deflects as the actual lid striker lowers onto its roller.','Roller motion presses the separate plunger. The illustrated trip setting is 1 mm of roller deflection.'],
 ['bin-switch-roller','Lid contact roller','The rolling contact follows the underside of the moving striker without a sharp sliding edge.','Opening the lid lets the spring return; the source then blanks fill readings.'],
 ['bin-switch-axle','Roller axle pin','A separate metal pin holds the bored roller between the lever fork ears.','Place the wheel between the ears, align its bore, then slide the pin through all three open axes.'],
 ['bin-switch-plunger','Microswitch plunger','A small spring-return button follows the lever near its pivot.','Its short travel changes COM-to-NO continuity; the Uno D7 pull-up reads an open lid HIGH.'],
 ['bin-switch-com','Microswitch COM contact','The common terminal provides the switch reference.','Connect COM to Uno ground. It is not a supply input.'],
 ['bin-switch-no','Microswitch NO contact','Normally open contact closes to COM when the lid depresses the lever.','Connect NO to Uno D7 with INPUT_PULLUP. Closure pulls D7 LOW.'],
 ['bin-switch-nc','Unused microswitch NC contact','Normally closed terminal is the alternative contact.','Leave it unconnected in this project; wiring it would invert lid detection.'],
 ['bin-lid-striker','Lid switch striker','A small tab attached to the lid presses the roller at the fully seated position.','It moves with the real hinge. Its contact geometry drives the illustrated roller and switch state.'],
] as const;
