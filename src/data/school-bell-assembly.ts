import {schoolBellFittingTotal} from './school-bell-fitting';
export const schoolBellAssemblySteps=[
 ['Prepare the unpowered workbench','Lay out the Uno, clock, display, breadboard and passive sounder. Leave both USB plugs disconnected.'],
 ['Place insulating supports','Set the hollow board supports, display stand, breadboard base and sounder cradle on the mat. Their shoulders support the boards without shorting solder joints.'],
 ['Mount the Uno','Align its four mounting holes and lower the board onto the support shoulders. Fit the insulating fasteners without crossing the connection sockets.'],
 ['Mount the RTC','Lower the clock onto its two supports, leaving the underside clip and downward pins clear. Fit the insulating fasteners. The backup cell can be inserted after this chapter.'],
 ['Stand the time display','Face the digits forwards and keep the four connection pins behind. Lower the display onto the stand, then fit the two lower-hole fasteners from the front.'],
 ['Place the breadboard','Seat the mini breadboard on its base. Columns 1–17 and rows a–j identify real sockets; the centre channel separates the two banks.'],
 ['Seat the passive sounder','Lower the sounder onto the raised cradle. The two pins remain accessible through its centre slot; keep the sound opening clear.'],
 ['Insert the 220 Ω resistor','Lower its two metal leads into front-bank columns 1 and 6, row f. The resistor bridges separate strips instead of placing both leads in one connected column.'],
 ['Connect each jumper end','Follow all thirty connector steps. Check the named port and fitting direction with USB fully withdrawn.'],
 ['Ready to test the timetable','Inspect the common return, separate supply/data/clock strips and D9 series resistor. Connect USB, compare Monday with Saturday, then test the backup cell.'],
] as const;
export const schoolBellAssemblyDurations=[1500,2200,2800,2800,2800,2200,2500,2200,27000] as const;
export const schoolBellAssemblyTotalMs=schoolBellAssemblyDurations.reduce((a,b)=>a+b,0);
function validate(p:number){if(!Number.isFinite(p)||p<0||p>9)throw new RangeError('School-bell assembly progress must be 0–9');}
export function schoolBellAssemblyProgress(elapsedMs:number){if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid assembly time');let left=elapsedMs;for(let n=0;n<9;n++){if(left<schoolBellAssemblyDurations[n])return n+left/schoolBellAssemblyDurations[n];left-=schoolBellAssemblyDurations[n];}return 9;}
export function schoolBellAssemblyElapsed(progress:number){validate(progress);const chapter=Math.floor(progress);return schoolBellAssemblyDurations.slice(0,chapter).reduce((a,b)=>a+b,0)+(chapter<9?(progress-chapter)*schoolBellAssemblyDurations[chapter]:0);}
export function schoolBellAssemblyWireCursor(progress:number){validate(progress);return Math.max(0,Math.min(schoolBellFittingTotal,(progress-8)*schoolBellFittingTotal));}
export const schoolBellAssemblyObjects:readonly {id:string;start:number;end:number;offset:readonly[number,number,number]}[]=[
 ...['school-uno-supports','school-rtc-supports','school-breadboard-base','school-display-stand','school-piezo-cradle'].map(id=>({id,start:1,end:2,offset:[0,25,0] as const})),
 {id:'school-bell-uno-assembly',start:2,end:2.6,offset:[0,40,0]},
 {id:'school-uno-fasteners',start:2.6,end:3,offset:[0,25,0]},
 {id:'school-bell-rtc-assembly',start:3,end:3.6,offset:[0,35,0]},
 {id:'school-rtc-fasteners',start:3.6,end:4,offset:[0,25,0]},
 {id:'school-rtc-battery',start:4,end:4,offset:[0,0,0]},
 {id:'school-bell-display-assembly',start:4,end:4.6,offset:[0,35,0]},
 {id:'school-display-fasteners',start:4.6,end:4.85,offset:[0,0,15]},
 {id:'school-display-nuts',start:4.85,end:5,offset:[0,0,-10]},
 {id:'school-breadboard',start:5,end:6,offset:[0,25,0]},
 {id:'school-breadboard-markings',start:5,end:6,offset:[0,25,0]},
 {id:'school-piezo-capsule',start:6,end:7,offset:[0,30,0]},
 {id:'school-piezo-resistor',start:7,end:8,offset:[0,25,0]},
 {id:'school-bell-jumpers',start:8,end:8,offset:[0,0,0]},
];
export function schoolBellAssemblyPose(id:string,progress:number){validate(progress);const object=schoolBellAssemblyObjects.find(o=>o.id===id);if(!object)throw new RangeError('Unknown school-bell assembly object');const t=object.start===object.end?1:Math.max(0,Math.min(1,(progress-object.start)/(object.end-object.start))),ease=t*t*(3-2*t);return {visible:progress>=object.start,offset:object.offset.map(n=>ease===1?0:n*(1-ease)) as [number,number,number]};}
