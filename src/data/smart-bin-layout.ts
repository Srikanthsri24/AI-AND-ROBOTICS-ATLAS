/** Authored tabletop bin dimensions, not manufacturer CAD. Native mm. */
export const binPhysical={outerWidth:280,outerDepth:250,wall:10,floorY:20,rimY:550,sensorFrontY:520,hingeY:550,hingeZ:-136,maximumLidDegrees:78};
export const binMechanicalParts=[
 ['bin-body','Moulded bin walls','The hollow plastic body holds the clean model load and gives the lid a repeatable seating rim.','The sensor must face the broad load target rather than a sloping side wall. An explicitly labelled power-off cutaway will expose the interior for inspection.'],
 ['bin-floor','Empty reference floor','The top of the base is the 500 mm empty reference below the closed sensor datum.','Measure this physical gap before entering EMPTY_MM in the Arduino sketch.'],
 ['bin-rim','Lid seating rim','The reinforced upper rim supports the gasket when the lid closes.','A fully seated lid presses the separate roller microswitch. A partly open lid must not be treated as a valid fill measurement.'],
 ['bin-lid','Hinged sensor lid','The real lid rotates around the rear hinge axis. Its underside will carry the ultrasonic module.','The lid switch inhibits fill readings while open and for 500 ms after closure. Keep the hinge cable loop free.'],
 ['bin-gasket','Lid gasket','The continuous soft ring seats on the plastic rim.','It lies between the rim and lid deck; the sensor faces into the bin through the open interior.'],
 ['bin-hinge-pin','Rear hinge pin','A metal shaft keeps both sets of bored hinge sleeves on one axis.','It passes through the alternating fixed and moving knuckles. Remove power before adjusting the hinge or switch.'],
 ['bin-hinge-fixed','Fixed hinge sleeves','Two bored knuckles attach the hinge axis to the rear bin wall.','The moving lid sleeves alternate between them around the same pin, leaving axial clearance.'],
 ['bin-hinge-moving','Moving lid hinge sleeves','Three open sleeves rotate with the lid around the fixed pin.','Short rear tabs join them to the lid deck. The pin is not a motor: open the model lid by hand.'],
 ['bin-handle','Lid lifting handle','A raised handle provides a visible grip for lifting the sensor lid.','It moves with the lid; the roller switch releases as the lid lifts.'],
 ['bin-load-target','Clean flat load target','A broad, level model surface gives the ultrasonic pulse a repeatable reflection.','Raising the load reduces sensor gap. At the 120 mm full reference the computed fill is 100%; the collection threshold is 80%.'],
 ['bin-load-support','Illustrative clean load','Clean cardboard cartons beneath the target illustrate the growing load.','The browser moves an authored level target, rather than estimating the irregular surface or volume of real waste.'],
] as const;
export function binLoadPose(gap:number){if(!Number.isFinite(gap)||gap<120||gap>500)throw Error('Use load gaps 120–500 mm.');const height=500-gap;return{top:binPhysical.sensorFrontY-gap,height,thickness:Math.min(3,height),visible:height>0};}
export function binLidAngle(degrees:number){if(!Number.isFinite(degrees)||degrees<0||degrees>78)throw Error('Lid travel is 0–78 degrees.');return degrees===0?0:-degrees*Math.PI/180;}
