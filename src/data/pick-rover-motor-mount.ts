/** The left motor feet also clamp the lift-servo outrigger. The right feet
 * clamp only the deck. Both sit against the underside at y=35 mm. */
export const pickMotorAnchors=([-1,1]as const).flatMap(side=>[-7,7].map(z=>({id:`pick-motor-anchor-${side<0?'left':'right'}-${z<0?'front':'rear'}`,side,x:side*54,z,stackTop:side<0?41:38,label:`${side<0?'Left':'Right'} ${z<0?'front':'rear'} motor-support bolt`})));
export const pickMotorMountParts=[
 ...([-1,1]as const).map(side=>({id:`pick-motor-support-${side<0?'left':'right'}`,label:`${side<0?'Left':'Right'} formed motor supports`,description:'Two open-centred metal collars surround the reduction housing. Their mounting feet sit below the acrylic deck, holding the motor axis level without filling the gearbox with a solid bracket.'})),
 ...pickMotorAnchors.map(a=>({id:a.id,label:a.label,description:`This M4 bolt passes through the motor-support foot and acrylic deck${a.side<0?' plus the servo outrigger above it':''}. The bored washer sits above the stack; the hollow nut seats below the foot. The left and right bolt lengths match their different stacks.`})),
];
