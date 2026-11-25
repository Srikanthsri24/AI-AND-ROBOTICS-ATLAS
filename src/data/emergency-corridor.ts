/** Project-specific dry cardboard corridor. Dimensions are authored classroom millimetres. */
export type EmergencyPoint=[number,number,number];
export const emergencyCorridor={bench:[600,14,360] as EmergencyPoint,floor:{at:[20,4.5,-50] as EmergencyPoint,size:[460,3,150] as EmergencyPoint},back:{at:[21.5,56,-126.5] as EmergencyPoint,size:[463,100,3] as EmergencyPoint},exitAt:[250,6,-50] as EmergencyPoint,exitWidth:60,exitHeight:80};
export const emergencyLampMounts=[
 {key:'path-1',name:'Path light 1',x:-110,z:-109,top:32,pin:'D5'},
 {key:'path-2',name:'Path light 2',x:20,z:-109,top:32,pin:'D6'},
 {key:'path-3',name:'Path light 3',x:150,z:-109,top:32,pin:'D7'},
 {key:'beacon',name:'Entrance warning beacon',x:-190,z:-109,top:81,pin:'D8'},
] as const;
export function emergencyLampHole(key:typeof emergencyLampMounts[number]['key'],side:-1|1):EmergencyPoint{const mount=emergencyLampMounts.find(m=>m.key===key);if(!mount||![-1,1].includes(side))throw Error('Unknown emergency lamp contact');return[mount.x+side*1.27,mount.top,mount.z];}
export const emergencySensorStand={at:[-245,0,-90] as EmergencyPoint,postBottom:4,postTop:125,postOuter:5,postInner:3.5,plateTop:128,leadZ:-83};
export function emergencySensorHole(side:-1|1):EmergencyPoint{if(![-1,1].includes(side))throw Error('Unknown light-sensor contact');return[-245+side*1.27,128,-83];}
export const emergencyCorridorParts=[
 ['emergency-bench','Tabletop model base','A dry base supports the corridor and the separate low-voltage electronics area in front.','The Uno is powered by USB. No building wiring or mains loads belong to this model.'],
 ['emergency-floor','Cardboard corridor floor','The open-front floor lets students see each path marker and the direction of travel.','The three white LEDs mark this route. Their separate D5, D6 and D7 resistor branches share the Uno ground.'],
 ['emergency-back-wall','Layered cardboard back wall','The rear wall carries three folded path-light shelves and the higher red entrance beacon.','Eight real feed-through bores align with the folded carriers for the four separate LED supply and return leads. The paper wall is not a conductive return.'],
 ['emergency-exit-wall','Open exit frame','A real 60 by 80 mm opening passes through the end wall, with no hidden solid panel across it.','The opening is a static part of the corridor. The Arduino controls lamps and a piezo, not an automatic door.'],
 ['emergency-route','Printed direction arrows','Four printed arrows make the route to the open end easy to follow when the white lamps turn on.','They are printed graphics, not extra electrical outputs or a simulated moving person.'],
 ['emergency-exit-sign','Printed EXIT placard','A separate green placard identifies the opening in the end wall.','This label is unpowered; D8 drives the separate red warning LED at the entrance.'],
 ...emergencyLampMounts.map(m=>[`emergency-${m.key}-carrier`,`${m.name} · folded carrier`,'A folded cardboard shelf has two separate LED lead holes at 2.54 mm spacing, supporting side gussets and two matching rear wire feed-throughs.',`${m.pin} reaches this LED through its own 220 Ω resistor. The opposite leg returns to common ground; the cardboard is only a mechanical support.`]),
 ['emergency-sensor-base','Raised light-sensor foot','A wide foot keeps the separate light-sensor post upright outside the corridor.','Its position separates the ambient light input from the three path lamps. The browser will use an explicit synthetic A0 input.'],
 ['emergency-sensor-post','Hollow light-sensor post','A rolled-paper tube raises the sensor above the path lights and beacon. Its bore remains genuinely open.','The two sensor leads stay outside the tube at the front of the head plate; no invisible wire is assumed inside a solid post.'],
 ['emergency-sensor-headplate','Light-sensor head plate','Two individual holes receive the photoresistor leads in the small raised support plate.','One lead joins 5 V; the other joins A0 and the 10 kΩ ground resistor. Covering that divider lowers its A0 reading.'],
];
