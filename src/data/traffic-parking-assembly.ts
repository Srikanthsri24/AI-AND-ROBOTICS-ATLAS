import {trafficParkingLamps} from './traffic-parking-signals';
import {trafficParkingFittingTotal} from './traffic-parking-fitting';
export const trafficParkingAssemblySteps=[
 ['Prepare the unpowered model','Lay out the street cards and three bays. Keep USB and the independent servo supply disconnected.'],
 ['Place insulating supports','Set the four hollow Uno supports, both breadboard bases and the barrier stand on the mat. These fixtures carry no electrical current.'],
 ['Mount the Uno R3','Align its four real mounting holes with the support bores. Lower the PCB onto the shoulders, leaving USB and the socket rows accessible.'],
 ['Secure the Uno','Fit the four insulating retaining screws through the mounting holes. Their heads bear on the board; do not bridge any connection sockets.'],
 ['Place the LED breadboard','Lower the first mini breadboard onto its base. Its two banks are separate; each numbered column joins only five contacts.'],
 ['Place the switch breadboard','Seat the second mini breadboard beside the supply. It keeps the Entry and Exit switch connections separate from the LED branches.'],
 ['Insert seven individual resistors','Lower R1–R7 into their own pairs of strips across the centre channel. Each 220 Ω resistor serves one LED; a shared resistor would not give seven independent branches.'],
 ['Fit the Entry switch','Seat all four legs across the centre gap. Same-side legs are already paired; pressing joins the A0 side to the ground side.'],
 ['Fit the Exit switch','Seat the second switch across the gap at its separate columns. This switch confirms a departure; it does not detect a vehicle automatically.'],
 ['Place the Main signal frame','Stand the prepared card-and-stick frame beside the Main approach. The upper red, middle amber and lower green apertures face approaching cars.'],
 ['Insert the three Main LEDs','Slide the red, amber and green packages through their real card apertures from the front. Their flanges stop on the card face and both rear leads remain accessible.'],
 ['Place the Cross signal frame','Stand the second frame perpendicular to Main, facing the Cross approach. Both heads need their own three outputs and returns.'],
 ['Insert the three Cross LEDs','Slide each package into its matching aperture. Keep the flat cathode side and the two individual rear leads identifiable.'],
 ['Place the FULL indicator frame','Put the short frame beside the parking entrance, outside the driving lane. It represents the three-reservation counter rather than a vehicle sensor.'],
 ['Insert the FULL LED','Seat the red package through the single aperture. Its own resistor and D10 branch will be connected during wiring.'],
 ['Mount the servo module','Lower the prepared servo/bracket module onto its stand. Leave the horn and retaining screw off until the shaft has been tested and positioned.'],
 ['Place the independent supply','Set the regulated 5 V source beside the switch board, with its terminal openings accessible. Leave its output off before fitting conductors.'],
 ['Ready for guided wiring','Follow the 66 connector chapters, then connect USB and test the bare servo. The raised arm is fitted only after calibration, with servo power off.'],
] as const;
export const trafficParkingAssemblyDurations=[1200,2000,2600,2200,2000,2000,2600,2000,2000,2400,2600,2400,2600,2000,2000,2600,2200] as const;
export const trafficParkingAssemblyTotal=17;
export const trafficParkingAssemblyTotalMs=trafficParkingAssemblyDurations.reduce((a,b)=>a+b,0);
function validate(progress:number){if(!Number.isFinite(progress)||progress<0||progress>trafficParkingAssemblyTotal)throw new RangeError('Parking assembly progress must be 0–17');}
export function trafficParkingAssemblyReady(progress:number){validate(progress);return progress===trafficParkingAssemblyTotal;}
export function trafficParkingAssemblyProgress(ms:number){if(!Number.isFinite(ms)||ms<0)throw new RangeError('Invalid parking assembly time');let left=ms;for(let n=0;n<trafficParkingAssemblyTotal;n++){if(left<trafficParkingAssemblyDurations[n])return n+left/trafficParkingAssemblyDurations[n];left-=trafficParkingAssemblyDurations[n];}return trafficParkingAssemblyTotal;}
export function trafficParkingAssemblyElapsed(progress:number){validate(progress);const chapter=Math.floor(progress);return trafficParkingAssemblyDurations.slice(0,chapter).reduce((a,b)=>a+b,0)+(chapter<trafficParkingAssemblyTotal?(progress-chapter)*trafficParkingAssemblyDurations[chapter]:0);}
export const trafficParkingAssemblyObjects:readonly {id:string;start:number;end:number;offset:readonly[number,number,number]}[]=[
 ...['tp-uno-supports','tp-board-bases','tp-servo-stand'].map(id=>({id,start:1,end:2,offset:[0,25,0] as const})),
 {id:'tp-uno-assembly',start:2,end:3,offset:[0,45,0]},
 {id:'tp-uno-fasteners',start:3,end:4,offset:[0,25,0]},
 {id:'tp-resistors-deck',start:4,end:5,offset:[0,25,0]},
 {id:'tp-buttons-deck',start:5,end:6,offset:[0,25,0]},
 ...Array.from({length:7},(_,n)=>({id:`tp-resistor-${n+1}-assembly`,start:6,end:7,offset:[0,25,0] as const})),
 {id:'tp-entry-switch',start:7,end:8,offset:[0,25,0]},
 {id:'tp-exit-switch',start:8,end:9,offset:[0,25,0]},
 {id:'tp-main-head',start:9,end:10,offset:[0,35,0]},
 {id:'tp-cross-head',start:11,end:12,offset:[0,35,0]},
 {id:'tp-full-head',start:13,end:14,offset:[0,25,0]},
 ...trafficParkingLamps.map(l=>({id:l.id+'-package',start:l.head==='main'?10:l.head==='cross'?12:14,end:l.head==='main'?11:l.head==='cross'?13:15,offset:[0,0,18] as const})),
 {id:'tp-servo-assembly',start:15,end:16,offset:[0,30,0]},
 {id:'traffic-parking-supply',start:16,end:17,offset:[0,25,0]},
];
export function trafficParkingAssemblyPose(id:string,progress:number){validate(progress);const object=trafficParkingAssemblyObjects.find(o=>o.id===id);if(!object)throw new RangeError('Unknown parking assembly object');const t=Math.max(0,Math.min(1,(progress-object.start)/(object.end-object.start))),ease=t*t*(3-2*t);return {visible:progress>=object.start,offset:object.offset.map(v=>ease===1?0:v*(1-ease)) as [number,number,number]};}
export const trafficParkingHornSteps=[
 ['Test and position the bare shaft','With the arm off, check both positions, leave the shaft at 100° and turn the servo supply off. The arm is installed raised so its approach clears the completed wiring.'],
 ['Fit the raised horn and arm','Keep the calibrated shaft stationary at 100°. Slide the horn over the output shaft from the front, aligning its central bore.'],
 ['Secure and test','Fit the retaining screw, then restore servo power and check that 20° lowers the arm and 100° clears the entrance. The working program starts with the down command.'],
] as const;
export function trafficParkingHornReady(progress:number){if(!Number.isFinite(progress)||progress<0||progress>2)throw new RangeError('Parking horn progress must be 0–2');return progress===2;}
export function trafficParkingHornPose(id:string,progress:number,angle:number){trafficParkingHornReady(progress);if(!Number.isFinite(angle))throw new RangeError('Invalid servo shaft angle');if(progress>0&&progress<2&&Math.abs(angle-100)>.01)throw new RangeError('Position the shaft at 100° before fitting the raised horn');if(id==='tp-gate-horn'){const t=Math.min(1,progress),e=t*t*(3-2*t);return {visible:progress>0,offset:[0,0,e===1?0:18*(1-e)] as [number,number,number],rotation:0};}if(id==='tp-horn-screw'){const t=Math.max(0,progress-1),tight=Math.max(0,Math.min(1,(t-.65)/.35)),ease=tight*tight*(3-2*tight),approach=Math.min(1,t/.65),ae=approach*approach*(3-2*approach);return {visible:progress>1,offset:[0,0,t>=1?0:t<.65?12-11*ae:1-ease] as [number,number,number],rotation:ease*Math.PI*8};}throw new RangeError('Unknown horn assembly part');}
export function trafficParkingBuildReady(assembly:number,fitting:number,horn:number){const base=trafficParkingAssemblyReady(assembly),arm=trafficParkingHornReady(horn);if(!Number.isFinite(fitting))throw new RangeError('Invalid parking fitting cursor');return base&&fitting>=trafficParkingFittingTotal&&arm;}
