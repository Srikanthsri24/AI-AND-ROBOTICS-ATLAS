/** Authored teaching arm, millimetres. Not a dimensional copy of a specific kit.
 * Servo pulse-to-angle calibration is deliberately separate from these joint angles. */
export const raArmDimensions={baseRadius:63,baseThickness:5,shoulderHeight:76,upperLink:104,forearm:92,wrist:57,rollOffset:-40,palm:52};
export const raArmNeutral=[0,-.3,-.7,.35,0,.25] as const;
export const raArmJoints=[
 {id:'base',label:'Base yaw',axis:'Y',connection:'Rotates the complete shoulder support around the secured base.'},
 {id:'shoulder',label:'Shoulder pitch',axis:'Z',connection:'Raises the upper link; the elbow, wrist and gripper travel with it.'},
 {id:'elbow',label:'Elbow pitch',axis:'Z',connection:'Bends the forearm relative to the upper link.'},
 {id:'pitch',label:'Wrist pitch',axis:'Z',connection:'Tilts the wrist and gripper relative to the forearm.'},
 {id:'roll',label:'Wrist roll',axis:'Y',connection:'Rotates the gripper around its approach axis.'},
 {id:'grip',label:'Gripper drive',axis:'Y',connection:'Turns a pinion between two opposed racks, closing both fingers symmetrically.'},
] as const;
export function raArmParts(){return [
 {id:'ra-arm-baseplate',label:'Secured base plate',description:'Four open anchor bores attach this plate to the work surface. The base servo remains fixed while its horn turns the shoulder support.'},
 ...raArmJoints.flatMap((j,i)=>[
 {id:`ra-arm-${j.id}-cradle`,label:j.label+' · fixed servo cradle',description:'A slotted metal plate supports the servo mounting ears. Its central aperture clears the case. '+j.connection},
 {id:`ra-arm-${j.id}-bolts`,label:j.label+' · mounting bolts',description:'Four bolts pass through the case ears and cradle. Their washers spread the clamping load; these bolts do not connect to the moving horn.'},
 ...(i<5?[{id:`ra-arm-${j.id}-link`,label:j.label+' · moving link',description:'Four mounting bores connect this plate to the rotating horn. Its open centre clears the horn retaining screw. '+j.connection}]:[]),
 ]),
 {id:'ra-arm-pitch-adapter',label:'Wrist offset adapter',description:'An offset bracket clears the roll servo housing and connects its cradle to the wrist pitch link.'},
 {id:'ra-arm-palm',label:'Gripper palm and slide guides',description:'The palm carries the final servo and two linear rack guides. Opposed rack teeth engage the central pinion.'},
 {id:'ra-arm-pinion',label:'Gripper pinion',description:'This small gear turns with the channel 5 servo. Its teeth push one rack left and the other right, moving both fingers by the same distance.'},
 ...['left','right'].map(side=>({id:`ra-arm-${side}-finger`,label:side+' rack and padded finger',description:'The toothed rack slides in its palm guide. A raised support brings the soft pad face to face with the opposite pad, so both fingers can grip the same object.'})),
 ];}
