/** Separate two-wheel balance frame, in mm. This is an authored teaching kit,
 * not a dimensioned claim about a commercially supplied balancing robot. */
export const balanceFrame={wheelRadius:32.5,track:200,axleY:32.5,lowerY:35,middleY:102,upperY:180,thickness:3,postX:44,postZ:50,postRadius:3.5,postBore:2.1,motorPocketX:61.2,plateBore:2.2,studRadius:1.9} as const;
export const balanceFrameCorners=([-1,1]as const).flatMap(x=>[-1,1].map(z=>({key:`${x<0?'left':'right'}-${z<0?'front':'rear'}`,x:x*balanceFrame.postX,z:z*balanceFrame.postZ})));
const part=(id:string,label:string,description:string)=>({id:'balance-'+id,label,description});
export const balanceFrameParts=[
 part('lower-plate','Notched balance base plate','The 3 mm plate joins the two motor supports. Its side pockets clear the gearbox housings and rear motor cans. Four corner bores align the upright studs; this build has no caster and no gripper.'),
 part('middle-plate','Middle electronics shelf','This separate bored shelf rests on four lower tubular spacers. Its open centre routes the loom between tiers. The upper spacer set clamps above it; it is not a solid block joining the boards.'),
 part('upper-plate','Upper balance shelf','The top shelf rests on four upper spacers. Keeping the electronic and battery masses above the axle creates the inverted-pendulum teaching layout; actual mass distribution must be measured before tuning.'),
 ...balanceFrameCorners.flatMap(c=>[
  part(`lower-spacer-${c.key}`,`${c.key.replaceAll('-',' ')} lower spacer`,'The hollow aluminium tube seats between the base top and middle-shelf underside. Its 4.2 mm bore clears the nominal M4 stud. The spacer carries clamp load without filling the cable space.'),
  part(`upper-spacer-${c.key}`,`${c.key.replaceAll('-',' ')} upper spacer`,'This longer hollow spacer seats between the middle-shelf top and upper-shelf underside. The same stud passes through its centre. Keep cables beside the spacer, not trapped under its ends.'),
  part(`stud-${c.key}`,`${c.key.replaceAll('-',' ')} M4 tie stud`,'One continuous nominal M4 threaded rod passes through all three plates and both tubular spacers. Upper and lower nuts clamp the stack. Fine helical thread flanks and tightening torque are not simulated.'),
  ...(['lower','upper']as const).flatMap(end=>[
   part(`${end}-washer-${c.key}`,`${c.key.replaceAll('-',' ')} ${end} washer`,'A separate bored washer spreads nut pressure onto the acrylic shelf. Its central opening clears the tie stud; the washer must be seated before the nut.'),
   part(`${end}-nut-${c.key}`,`${c.key.replaceAll('-',' ')} ${end} M4 nut`,'This hollow hex nut retains the tie-stud stack against its washer. It does not fill the stud bore. Tighten evenly for the real frame material; nominal mating envelopes omit the thread detail.'),
  ]),
 ]),
]as const;
export const balanceFrameAssembly=[
 {id:'lower-plate',label:'Position the notched base',parts:['balance-lower-plate'],from:[0,65,0],why:'Its motor pockets and four corner bores establish the two-wheel frame. There is no rear caster to hold this robot upright.'},
 {id:'studs',label:'Insert the four tie studs',parts:balanceFrameCorners.map(c=>'balance-stud-'+c.key),from:[0,180,0],why:'Keep all four rods parallel. The clearance bores locate the stack without asking the acrylic to act as a threaded nut.'},
 {id:'bottom-washers',label:'Seat the lower washers',parts:balanceFrameCorners.map(c=>'balance-lower-washer-'+c.key),from:[0,-18,0],why:'These bored washers meet the underside of the lower plate before the nuts are retained.'},
 {id:'bottom-nuts',label:'Retain the lower nuts',parts:balanceFrameCorners.map(c=>'balance-lower-nut-'+c.key),from:[0,-22,0],why:'The lower nuts give the studs an axial stop. The virtual nuts translate into place; torque and thread engagement require physical checks.'},
 {id:'lower-spacers',label:'Lower the first spacer set',parts:balanceFrameCorners.map(c=>'balance-lower-spacer-'+c.key),from:[0,180,0],why:'Each hollow tube slides down its own stud and stops on the base. The visible bore is wider than the stud.'},
 {id:'middle-plate',label:'Lower the middle shelf',parts:['balance-middle-plate'],from:[0,180,0],why:'All four bores must align before the shelf rests on the lower spacer ends. Keep the central cable opening clear.'},
 {id:'upper-spacers',label:'Fit the upper spacers',parts:balanceFrameCorners.map(c=>'balance-upper-spacer-'+c.key),from:[0,180,0],why:'The upper set carries the top shelf. These tubes are longer than the lower set and stay distinct in the inventory.'},
 {id:'upper-plate',label:'Lower the upper shelf',parts:['balance-upper-plate'],from:[0,180,0],why:'The top shelf slides down the four studs onto the upper spacers. It leaves open sides for connector access.'},
 {id:'top-washers',label:'Seat the upper washers',parts:balanceFrameCorners.map(c=>'balance-upper-washer-'+c.key),from:[0,40,0],why:'Spread the retaining load over each upper shelf bore before fitting the nuts.'},
 {id:'top-nuts',label:'Retain the upper nuts',parts:balanceFrameCorners.map(c=>'balance-upper-nut-'+c.key),from:[0,40,0],why:'Close the stack evenly. The model shows retained geometric envelopes, not a torque-certified or free-standing tested physical frame.'},
]as const;
