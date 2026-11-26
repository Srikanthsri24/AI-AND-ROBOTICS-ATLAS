import {mq2FittingOrder,mq2Wires,type Mq2Mode} from './mq2-wires';
export const mq2AssemblySteps=[
 {title:'Prepare the workbench',instruction:'Keep both supplies off. Lay out the Uno, breadboard, two 10 kΩ resistors, 220 Ω resistor, red LED, test dial and MQ-2 module.'},
 {title:'Fit the insulating supports',instruction:'Support the Uno above its solder joints. Place the supply and adapter on their risers. Keep the MQ-2 upright on the open ceramic stand, away from loose material.'},
 {title:'Place the Uno',instruction:'Lower the controller onto its supports. Find A0, D6, 5 V and GND before attaching any jumpers.'},
 {title:'Place the breadboard',instruction:'Each column has two separate five-hole strips. The centre gap separates the two banks; there are no long power rails.'},
 {title:'Upper 10 kΩ divider resistor',instruction:'Fit the upper resistor between the module-signal strip and the midpoint strip. Its brown, black and orange bands identify 10 kΩ.'},
 {title:'Lower 10 kΩ divider resistor',instruction:'Fit the second resistor from the same midpoint strip to the return strip. Equal resistors halve the module AOUT voltage.'},
 {title:'220 Ω indicator resistor',instruction:'Place the red, red and brown resistor in series with the LED anode. This is a separate circuit from the two 10 kΩ divider resistors.'},
 {title:'Fit the warning LED',instruction:'Identify the anode and cathode before inserting them into separate strips. D6 reaches the anode through 220 Ω; the cathode returns to ground.'},
 {title:'Fit the test dial',instruction:'Keep its three terminals on separate strips. The outer ends take Uno 5 V and GND; the centre wiper is the substitute A0 source in dial mode.'},
 {title:'Place the MQ-2 module',instruction:'Keep the mesh open to the surrounding air. Identify DOUT, AOUT, GND and VCC. This project leaves DOUT disconnected.'},
 {title:'Place the separate 5 V supply',instruction:'Keep it switched off while wiring. Its negative terminal shares the Uno ground reference; its positive terminal supplies the module, not Uno 5 V.'},
 {title:'Fit each wire',instruction:'Follow one connector at a time. Never connect the dial wiper and divider midpoint to A0 together. Change that jumper only with both supplies off.'},
 {title:'Connect USB last',instruction:'After checking the wiring, seat the computer plug and then the Uno plug. Real hardware uses Arduino C++ and Serial Monitor at 115200 baud.'},
 {title:'Ready to calibrate',instruction:'Start with the test dial. Let eight readings fill the average, then send b to capture the current baseline. A 90-count rise lights the LED; recovery to 65 counts above baseline switches it off.'},
] as const;
export const mq2AssemblyDurations=[4000,5000,5000,4000,4000,4000,4000,4000,4000,5000,5000,26400,4000] as const;
export const mq2AssemblyTotalMs=mq2AssemblyDurations.reduce((sum,n)=>sum+n,0);
export function mq2AssemblyProgress(elapsedMs:number){
 if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Assembly elapsed time must be finite and nonnegative');
 let t=elapsedMs;for(let n=0;n<mq2AssemblyDurations.length;n++){const duration=mq2AssemblyDurations[n];if(t<duration)return n+t/duration;t-=duration;}return 13;
}
const groups:Readonly<Record<string,{step:number;lift:number}>>={
 'mq2-work-mat':{step:0,lift:0},
 'mq2-supply-risers':{step:1,lift:24},'mq2-uno-supports':{step:1,lift:24},'mq2-breadboard-support':{step:1,lift:24},'mq2-ceramic-stand':{step:1,lift:24},
 'mq2-controller-assembly':{step:2,lift:40},'mq2-breadboard':{step:3,lift:30},
 'mq2-divider-upper':{step:4,lift:18},'mq2-divider-lower':{step:5,lift:18},'mq2-led-resistor':{step:6,lift:18},
 'mq2-warning-led':{step:7,lift:18},'mq2-led-anode':{step:7,lift:18},'mq2-led-cathode':{step:7,lift:18},
 'mq2-test-dial':{step:8,lift:18},'mq2-dial-5v':{step:8,lift:18},'mq2-dial-wiper':{step:8,lift:18},'mq2-dial-ground':{step:8,lift:18},
 'mq2-waveshare-module':{step:9,lift:40},'mq2-low-voltage-supply':{step:10,lift:30},
 'mq2-jumpers':{step:11,lift:0},'mq2-usb-hardware':{step:12,lift:0},
};
export const mq2AssemblyGroups=Object.keys(groups);
function valid(progress:number){if(!Number.isFinite(progress)||progress<0||progress>13)throw new RangeError('Assembly progress must be 0–13');}
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
export function mq2AssemblyPose(id:string,progress:number){valid(progress);const g=groups[id];if(!g)throw new RangeError('Unknown MQ-2 assembly group '+id);return {visible:progress>=g.step,lift:g.lift*(1-ease(progress-g.step))};}
export function mq2AssemblyWireCursor(progress:number){valid(progress);return Math.max(0,Math.min(22,(progress-11)*22));}
export function mq2AssemblyUsb(progress:number){valid(progress);return {hostWithdrawal:12*(1-ease((progress-12)*2)),unoWithdrawal:12*(1-ease((progress-12)*2-1))};}
export function mq2FittingNarration(mode:Mq2Mode,cursor:number){
 if(!Number.isFinite(cursor)||cursor<0||cursor>22)throw new RangeError('Fitting cursor must be 0–22');
 if(cursor===22)return {id:'',title:'Wiring fitted',instruction:'Check all connections with both supplies off before connecting USB.'};
 const ordinal=Math.floor(cursor/2),wire=mq2Wires(mode)[mq2FittingOrder[ordinal]],source=cursor%2<1;
 const kind=source?wire.fromKind:(wire.toKind??'pin');
 return {id:wire.id,title:wire.name,instruction:wire.connection+' '+(kind==='female'?'Slide the female housing over its matching module pin.':kind==='clamp'?'Insert the bare conductor into its screw terminal and secure the clamp.':'Insert the metal pin vertically into its assigned socket or breadboard hole.')};
}
