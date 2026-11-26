import {rfidFittingTotal} from './rfid-fitting';
export const rfidAssemblySteps=[
 ['Prepare the unpowered workbench','Disconnect USB and the independent servo supply. Identify the reader, two tags, indicators and lightweight door mechanism.'],
 ['Place the board supports','Stand the Uno on its four mounting supports. Support the antenna overhang with nonmetallic posts and place the breadboard riser.'],
 ['Lower the Uno onto its supports','Align the mounting holes. Leave underside solder joints clear of the mat; do not use conductive spacers across board contacts.'],
 ['Stack the PN532 shield','Align all four Arduino header banks before lowering the shield. Leave the selector solder jumpers open for the default I²C configuration.'],
 ['Prepare the indicator board','Place the breadboard, two LEDs and separate 220 Ω resistors. Match the numbered columns and row letters; keep anode and cathode in different strips.'],
 ['Stand the door frame','Place the base and fixed frame flat. The servo stays on the fixed side; only the hinged panel will open.'],
 ['Fit the hinged door and strike','Join the moving hinge leaves to the fixed pins. The folded strike moves with the door. Check the hinge travel before fitting the latch.'],
 ['Mount the positional servo','Place the servo beside the strike with its factory cable behind the door. The plug chambers remain accessible for the three jumper contacts.'],
 ['Fit the lightweight latch tab','Start at the commanded locked angle of 35°. Secure the horn and tab so they overlap the strike without forcing the shaft. At 105° the tab clears the strike.'],
 ['Place the separate servo supply','Keep the low-voltage output off. Its positive is isolated from Uno 5 V; its negative will share the Uno reference through the return wiring.'],
 ['Fit every jumper end','Follow the twenty contact instructions. Each cable conducts only after both ends are seated. Keep the power sources disconnected throughout fitting.'],
 ['Ready to enroll and test','Inspect polarity, LED series resistors and common ground. Connect USB, enroll one tag, then power the servo and compare matching and nonmatching tags.'],
] as const;
export const rfidAssemblyDurations=[2000,2500,3000,3500,3000,3000,3500,3000,3000,2500,20000] as const;
export const rfidAssemblyTotalMs=rfidAssemblyDurations.reduce((a,b)=>a+b,0);
export function rfidAssemblyProgress(elapsedMs:number){if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid RFID assembly time');let left=elapsedMs;for(let n=0;n<rfidAssemblyDurations.length;n++){const duration=rfidAssemblyDurations[n];if(left<duration)return n+left/duration;left-=duration;}return 11;}
export function rfidAssemblyWireCursor(progress:number){if(!Number.isFinite(progress)||progress<0||progress>11)throw new RangeError('RFID assembly progress must be 0–11');return Math.max(0,Math.min(rfidFittingTotal,(progress-10)*rfidFittingTotal));}

/** Local parent-mm offsets; these author assembly travel, not machining tolerances. */
export const rfidAssemblyObjects:readonly {id:string;start:number;end:number;offset:readonly[number,number,number]}[]=[
 {id:'rfid-work-mat',start:0,end:0,offset:[0,0,0]},
 ...['rfid-uno-supports','rfid-antenna-supports','rfid-breadboard-riser','rfid-card-rest','rfid-fob-rest'].map(id=>({id,start:1,end:2,offset:[0,25,0] as const})),
 {id:'rfid-uno-assembly',start:2,end:3,offset:[0,40,0]},
 {id:'rfid-shield-assembly',start:3,end:4,offset:[0,45,0]},
 {id:'rfid-breadboard',start:4,end:4.35,offset:[0,25,0]},
 {id:'rfid-breadboard-coordinates',start:4,end:4.35,offset:[0,25,0]},
 {id:'rfid-indicator-circuit',start:4.35,end:5,offset:[0,30,0]},
 ...['rfid-door-base','rfid-door-frame','rfid-fixed-hinges'].map(id=>({id,start:5,end:6,offset:[0,30,0] as const})),
 ...['rfid-moving-door','rfid-hinge-pins'].map(id=>({id,start:6,end:7,offset:[0,35,0] as const})),
 ...['rfid-latch-servo','rfid-latch-shaft','rfid-servo-factory-harness'].map(id=>({id,start:7,end:8,offset:[0,0,30] as const})),
 {id:'rfid-latch-tab',start:8,end:8.7,offset:[0,0,20]},
 {id:'rfid-horn-screw',start:8.7,end:9,offset:[0,0,25]},
 {id:'rfid-low-voltage-supply',start:9,end:10,offset:[0,25,0]},
 {id:'rfid-classroom-tags',start:9,end:10,offset:[0,25,0]},
 {id:'rfid-circuit-jumpers',start:10,end:10,offset:[0,0,0]},
];
export function rfidAssemblyPose(id:string,progress:number){rfidAssemblyWireCursor(progress);const object=rfidAssemblyObjects.find(o=>o.id===id);if(!object)throw new RangeError('Unknown RFID assembly object '+id);const t=object.end===object.start?1:Math.max(0,Math.min(1,(progress-object.start)/(object.end-object.start))),ease=t*t*(3-2*t);return {visible:progress>=object.start,offset:object.offset.map(n=>n*(1-ease)) as [number,number,number]};}
export function rfidAssemblyElapsed(progress:number){rfidAssemblyWireCursor(progress);const chapter=Math.floor(progress);return rfidAssemblyDurations.slice(0,chapter).reduce((a,b)=>a+b,0)+(chapter<11?(progress-chapter)*rfidAssemblyDurations[chapter]:0);}
