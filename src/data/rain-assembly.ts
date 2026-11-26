import {rainFittingTotal} from './rain-fitting';
export const rainAssemblySteps=[
 ['Prepare the dry workbench','Keep USB and the separate 5 V supply disconnected. Put the sensor tray away from the controller.'],
 ['Place the mechanism base','Set the card base flat. The raised rails guide a lightweight classroom carriage; they are not a full-size clothesline.'],
 ['Support the electronics','Fit the Uno standoffs and breadboard riser before lowering either board. Solder joints must clear the mat.'],
 ['Fit the controller and breadboard','Identify Uno D2, D9, 5 V and GND. The mini breadboard has separate five-hole strips on each side of its centre gap.'],
 ['Fit the rails and supports','Keep both rails parallel. Each open sleeve must slide freely without binding.'],
 ['Slide on the carriage','Fit its two guide sleeves over the rails. Its full stroke must remain clear of the canopy supports.'],
 ['Mount the servo and factory lead','The positional servo stays fixed to the base. Keep its three-wire factory harness clear of the sliding carriage.'],
 ['Fit the horn and pushrod','With the mechanism at the covered position, connect the horn, fixed-length rod and both pins. Never force the linkage past its travel.'],
 ['Add the clothesline and paper load','Fit the uprights, line, pegs and lightweight paper shirts. The demonstration load moves with the carriage.'],
 ['Install the canopy','Check that the paper load is completely under the roof at 35° and outside its edge at 130°.'],
 ['Prepare the wet area','Set the tray and sensor supports beside the mechanism. Keep all liquid inside this tray.'],
 ['Place the water sensor','Lower the Grove board onto its supports, with the electrode surface exposed. Conductive water must bridge signal and ground strips.'],
 ['Place the separate servo supply','Keep its output off. It powers the servo, while Uno 5 V powers the water sensor. The ground references will be joined.'],
 ['Fit the circuit connections','Follow the highlighted terminal instructions. Fit the Grove harness as one unit, then each individual jumper end.'],
 ['Check before connecting USB','Check every terminal and the separate positive supplies. Seat the computer USB plug first, then the Uno USB-B plug. Keep the servo supply off until checked.'],
 ['Ready for the rain experiment','When the complete power connections are available, a wet bridge requests shelter immediately. Four continuously dry seconds are required before extension.'],
] as const;
export const rainAssemblyDurations=[2500,3000,3000,3500,3500,3500,4000,4000,3500,3500,3000,3500,3500,27000,3000] as const;
export const rainAssemblyTotalMs=rainAssemblyDurations.reduce((a,b)=>a+b,0);
export function rainAssemblyProgress(elapsed:number){if(!Number.isFinite(elapsed)||elapsed<0)throw new RangeError('Invalid rain assembly time');let left=elapsed;for(let n=0;n<rainAssemblyDurations.length;n++){const duration=rainAssemblyDurations[n];if(left<duration)return n+left/duration;left-=duration;}return 15;}
const entries:readonly [string,number,number][]=[
 ['rain-usb-hardware',14,0],['rain-work-mat',0,0],['rain-card-base',1,30],['rain-uno-supports',2,24],['rain-breadboard-support',2,24],['rain-uno-assembly',3,40],['rain-breadboard',3,30],
 ['rain-rail-0',4,30],['rain-rail-1',4,30],['rain-rail-supports',4,30],['rain-carriage',5,35],
 ['rain-servo-case',6,35],['rain-servo-shaft',6,35],['rain-servo-factory-harness',6,35],['rain-servo-horn',7,25],['rain-pushrod',7,25],['rain-joints',7,25],
 ['rain-clothesline',8,30],['rain-paper-shirt-0',8,30],['rain-paper-shirt-1',8,30],['rain-clothes-pegs',8,30],['rain-canopy',9,35],
 ['rain-water-tray',10,25],['rain-water-stands',10,25],['rain-grove-water-sensor',11,25],['rain-low-voltage-supply',12,25],['rain-circuit-jumpers',13,0],
];
export const rainAssemblyGroups=entries.map(e=>e[0]);
function valid(progress:number){if(!Number.isFinite(progress)||progress<0||progress>15)throw new RangeError('Rain assembly progress must be 0–15');}
export function rainAssemblyPose(id:string,progress:number){valid(progress);const entry=entries.find(e=>e[0]===id);if(!entry)throw new RangeError('Unknown rain assembly object '+id);const t=Math.max(0,Math.min(1,progress-entry[1])),ease=t*t*(3-2*t);return {visible:progress>=entry[1],lift:entry[2]*(1-ease)};}
export function rainAssemblyWireCursor(progress:number){valid(progress);return Math.max(0,Math.min(rainFittingTotal,(progress-13)*rainFittingTotal));}

export function rainAssemblyUsb(progress:number){valid(progress);const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};return {hostWithdrawal:12*(1-ease((progress-14)*2)),unoWithdrawal:12*(1-ease((progress-14)*2-1))};}
