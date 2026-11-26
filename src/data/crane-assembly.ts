export const craneAssemblyChapters=[
 ['Prepare the workbench','Place the pickup pad and receiving tray on the timber base.','Keep both supplies disconnected.'],
 ['Brace the uprights','Seat both wide feet and their diagonal braces on the base.','The frame must resist tipping before adding a load.'],
 ['Thread the saddle','Keep the crossbar above the uprights and slide the saddle over its free end.','Do this before seating the crossbar; the closed saddle cannot pass through a post.'],
 ['Seat the crossbar','Lower the threaded crossbar onto the two uprights.','The saddle stays between the posts and slides without touching its support brackets.'],
 ['Hang the electromagnet','Attach the rear lifting bracket and cord, then lower the magnet.','The cord carries the weight; electrical leads need slack.'],
 ['Place the controller','Fit the Uno on insulating supports and place the hold button across the breadboard gap.','The four switch feet form two separate contact pairs.'],
 ['Place driver and supply','Mount the MOSFET driver and independent regulated 5 V supply.','D9 carries a logic command, never the coil current.'],
 ['Connect control wiring','Fit D2, common ground, D9 and the separate coil-supply leads.','Positive and ground occupy separate breadboard banks.'],
 ['Route coil leads','Secure the strain relief and route both slack loops to the magnet.','OUT+ feeds the coil; OUT− is its switched return.'],
 ['Prepare programming','Place the computer and inspect both disconnected USB plugs.','Upload the Arduino C++ sketch before connecting coil power.'],
 ['Operate the crane','Connect USB with the hold button released, then enable coil power.','Lower onto the washer, hold, lift, transfer, lower and release within eight seconds.'],
] as const;
export const craneAssemblyDurations=[6000,8000,4000,6000,6000,6000,6000,16800,5000,5000] as const;
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
export function craneAssemblyAdvance(progress:number,elapsedMs:number){if(!Number.isFinite(progress)||progress<0||progress>10||!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid crane assembly time');let p=progress,left=elapsedMs;while(p<10&&left>0){const chapter=Math.floor(p),duration=craneAssemblyDurations[chapter],remaining=(1-(p-chapter))*duration;if(left>=remaining){left-=remaining;p=chapter+1;}else{p+=left/duration;left=0;}}return p;}
export function craneAssemblyGroup(id:string){if(id==='crane-base'||id==='crane-pickup-pad'||id==='crane-receiver'||id==='crane-washer')return 0;if(id.startsWith('crane-upright-'))return 1;if(id==='crane-crossbar'||id==='crane-saddle')return 2;if(['crane-cord','crane-coil-housing','crane-pole-face','crane-mount-bracket','crane-magnet-grommets','crane-coil-field'].includes(id))return 4;if(id.startsWith('crane-uno-')||id==='crane-breadboard'||id.startsWith('crane-button-')&&!id.endsWith('-wire'))return 5;if(id.startsWith('crane-host-')||id.startsWith('crane-usb-'))return 9;if(['crane-coil-positive','crane-coil-return','crane-lead-clamp'].includes(id))return 8;if(id.endsWith('-wire')||id==='crane-ground-feed'||id==='crane-jst-plug')return 7;return 6;}
/** Native millimetres. Bought modules move together; rail threading precedes post seating. */
export function craneAssemblyPose(id:string,progress:number){if(!Number.isFinite(progress)||progress<0||progress>10)throw new RangeError('Invalid assembly position');const group=craneAssemblyGroup(id),t=clamp(progress-group);let visible=group===0||progress>=group;let lift=group>0?40*(1-ease(t)):0,shiftX=0;if(group===1)lift=80*(1-ease(t));if(group===2){lift=progress<3?55+45*(1-ease(t/.25)):55*(1-ease(progress-3));if(id==='crane-saddle'){visible&&=t>=.25||progress>=3;shiftX=205*(1-ease((t-.25)/.75));}}if(group===4||group===7)lift=0;return{visible,lift,shiftX};}
export function craneAssemblyMagnetLift(progress:number){return progress<4?42:42*(1-ease(progress-4));}
