/** Authored drive adapter and keyed axle, not a claim that these parts are
 * included with every commercial six-axis arm kit. Dimensions are mm. */
export const pickLiftDrive={servoX:-33,pivotY:90,shaftStart:-32.7,shaftLength:60.7,shaftRadius:2,shaftFlat:1.5};
export const pickLiftDriveParts=[
 {id:'pick-lift-drive-axle',label:'Keyed lift drive axle',description:'A D-section axle crosses both lower-link bores and the round tower bearings. Its flat engages matching link bores so the servo can rotate both lower links together.'},
 {id:'pick-lift-drive-hub',label:'Spline-to-D drive adapter',description:'The rear socket accepts the servo spline. The forward socket accepts the D axle; the adapter couples two different shaft profiles without a full-size horn sweeping into the tower.'},
 {id:'pick-lift-drive-bracket',label:'Lift servo support bracket',description:'The servo mounting ears seat against this bored plate. Its small edge notch clears the cable outlet during case insertion. Short posts transfer its load to the side outrigger without touching the gearbox or the lower links.'},
 {id:'pick-lift-drive-fasteners',label:'Lift servo mounting fasteners',description:'Four bolts pass through the bracket and the servo-ear slots. Hollow washers and retaining nuts seat on opposite faces of the 4.8 mm mounting stack.'},
 {id:'pick-lift-outrigger',label:'Side support foot',description:'A low extension meets the lift base at its side face and supports the lift servo. Fit this foot to the chassis before the shared left motor clamps. The central lift base later meets its side face.'},
]as const;
