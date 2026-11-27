export const raGuideKitReferences=[
 {id:'rover-chassis',name:'Rover chassis and caster mounting set',label:'Authored 3D reference · drilled chassis, pierced caster plate and four retained caster fasteners'},
 {id:'rover-motor',name:'Rover motor cradles and contact pads',label:'Authored 3D reference · one motor with its two cradle stacks and contact pads; build both sides'},
 {id:'rover-pcb',name:'Rover insulated board mounting sets',label:'Authored 3D reference · six board-mount stacks in fitted positions; PCB/chassis layers omitted'},
 {id:'rover-sensor',name:'Ultrasonic support and fastening kit',label:'Authored 3D reference · sensor in its bracket, four spaced PCB mounts and two retained chassis anchors'},
 {id:'arm-fixture',name:'Arm fixture and board mounting hardware',label:'Authored 3D reference · drilled fixture, preassembled cable-guide posts/eyes, four base anchors and eight insulated board-mount positions'},
 {id:'extension',name:'Three-wire servo extension leads',label:'Authored 3D reference · three-contact extension coupling detail; use six 1 m leads and preserve brown/red/orange order'},
 {id:'mini',name:'170-point mini breadboard and jumper leads',label:'Authored 3D reference · the actual 170-point board with separate five-contact ties'},
 {id:'arm-supply',name:'Matched 6 V arm actuator supply',label:'Authored 3D reference · the workshop regulated actuator source, shown set to 6.00 V with output off'},
 {id:'arm-kit',name:'Six-servo arm, links and gripper kit',label:'Authored 3D reference · this workshop arm with five positioning joints and one independently driven gripper'},
 {id:'rover-stand',name:'Wheel-test stand and flat obstacle cards',label:'Authored 3D reference · complete rover supported for a lifted-wheel test; flat cards provide range targets'},
]as const;
export type RaGuideKitReferenceId=typeof raGuideKitReferences[number]['id'];
export const raGuideKitPhotos=Object.fromEntries(raGuideKitReferences.map(k=>[k.name,[{path:'./images/project-parts/ra-'+k.id+'-reference.png',label:k.label,reference:true}]]));
