import{raRoverSonarMount}from'./rover-arm-rover-range';
import{raRoverSonarNativePoint}from'./rover-arm-rover-sonar';
/** Authored support dimensions in 50 mm scene units, not a drilling template. */
export const raRoverSensorSupport={front:raRoverSonarMount.pcb[2]+.032+.12,thickness:.04,width:1,top:2.10,footBack:-1.80,chassisTop:.99,chassisBottom:.91,spacerLength:.12};
export const raRoverSensorHoles=[-20,20].flatMap(x=>[-7.5,7.5].map(y=>{const p=raRoverSonarNativePoint([x,y,0]);return{x:p[0],y:p[1]};}));
export const raRoverSensorFootHoles=[-.32,.32].map(x=>({x,z:-1.92}));
export const raRoverSensorDrills=raRoverSensorFootHoles.map(p=>[p.x,0,p.z]as[number,number,number]);
export const raRoverSensorSupportParts=[
 {id:'ra-rover-sensor-support',label:'Range sensor · right-angle support',description:'The upright supports the sensor behind its timing electronics. Its foot rests on the chassis and its four open face bores match the sensor mounting pattern.'},
 {id:'ra-rover-sensor-spacers',label:'Range sensor · four insulating spacers',description:'These hollow 6 mm spacers meet the PCB back and support face. They leave the rear components clear and keep the sensor upright.'},
 {id:'ra-rover-sensor-board-screws',label:'Range sensor · board screws and washers',description:'The small screws pass through the actual PCB holes, hollow spacers and support bores. Front washers spread the clamp load without touching either transducer.'},
 {id:'ra-rover-sensor-board-nuts',label:'Range sensor · rear retaining nuts',description:'These nuts retain the sensor screws behind the upright. Tighten evenly while keeping the PCB flat on all four spacers.'},
 {id:'ra-rover-sensor-foot-screws',label:'Range sensor · chassis anchor screws',description:'Two screws and washers pass through the support foot and matching open chassis holes. They anchor the support independently of the electrical wires.'},
 {id:'ra-rover-sensor-foot-nuts',label:'Range sensor · underside anchor nuts',description:'The nuts meet the chassis underside and retain the two foot screws. Check that no hardware enters a wheel or motor path.'},
];
