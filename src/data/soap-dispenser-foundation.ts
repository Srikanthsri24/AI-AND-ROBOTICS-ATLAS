const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>{const t=clamp(n);return t*t*(3-2*t);};
export const soapFoundationSteps=[
 ['soap-stand-base','Set down the weighted base','Lower the base until its four rubber feet meet the bench. Keep the dispensing area in front clear.','The base supports the bottle and fabricated uprights.'],
 ['soap-bottle-shell','Place the pump bottle','Lower the upright bottle onto the base with its nozzle pointing toward the receiving area.','The pump must stay upright and free to return under its own spring.'],
 ['soap-stand-left','Seat the left upright','Lower the fabricated upright, bridge and pre-fitted wire guides onto the base, behind the bottle.','This member carries the left edge of the actuator plate.'],
 ['soap-stand-right','Seat the right upright','Lower the second fabricated upright onto the base. Keep its bridge level with the first.','The two bridge ends define the fixed actuator mounting gap.'],
 ['soap-servo-bracket','Mount the bare-shaft actuator','Lower the servo and its preassembled mounting plate between the two bridges. Leave the horn and roller off.','The fixed bracket carries the servo; the bare shaft remains accessible for calibration.'],
 ['soap-dry-platform','Set up the dry electronics platform','Lower the separate raised platform onto its four feet, beside the dispensing base.','The air gap and raised deck keep the controller away from the dispensing area.'],
 ['soap-uno-supports','Place the insulating supports','Lower four hollow supports onto the platform mounting holes.','They hold the Uno underside above the deck and leave a clear path for each bolt.'],
 ['soap-uno-pcb','Lower the Uno onto its supports','Align the four board holes with the hollow supports and lower the board gently.','The support ends meet the PCB underside without covering components.'],
 ...[0,1,2,3].map(i=>['soap-uno-fastener-'+i,'Secure Uno corner '+(i+1),'Lower the bolt and upper washer through the board, support and deck. Bring the lower washer and nut up from below.','The bolt follows the aligned bores; washers spread contact around the mounting hole.']),
 ['soap-connection-board','Place the connection board','Lower the mini breadboard onto the rear area of the dry deck. Keep its contact rows accessible.','Column 9 a–e will join the controller, sonar and motor-supply negative references.'],
 ['soap-supply-case','Place the separate servo supply','Lower the enclosed regulated 5 V supply onto the front area of the dry platform. Leave its switch off.','Its positive output powers only the servo. Its negative will join the controller reference.'],
].map(([part,title,instruction,why],i)=>({part,title,instruction,why,check:[
 'All four feet meet the bench, with the base top level.',
 'The bottle bottom meets the base and its nozzle points forward.',
 'The upright bottom meets the base; its bridge stays behind the pump head.',
 'Both bridges are level and leave the actuator plate gap open.',
 'The plate meets the bridge ends; the bare shaft and pump remain separate.',
 'All four platform legs meet the bench and an air gap separates it from the dispenser base.',
 'All four support bottoms meet the deck; their bores stay open.',
 'All four PCB holes align with the supports and the board rests on their upper ends.',
 ...[0,1,2,3].map(()=> 'The top washer meets the PCB, the bottom washer meets the deck and the nut sits below it.'),
 'The mini board base meets the deck and its row labels remain visible.',
 'The enclosure base meets the deck; its switch and display stay off.',
 ][i]}));
export function soapFoundationPose(cursor:number){if(!Number.isFinite(cursor)||cursor<0||cursor>14)throw new RangeError('Invalid soap foundation position');const item=(start:number,travel:number)=>{const p=clamp(cursor-start);return{visible:p>0,y:travel*(1-ease(p))};};return{base:item(0,25),bottle:item(1,90),left:item(2,80),right:item(3,80),actuator:item(4,80),deck:item(5,40),supports:item(6,35),uno:item(7,35),fasteners:[0,1,2,3].map(i=>{const t=clamp(cursor-8-i),bolt=ease(t/.65),nut=ease((t-.65)/.35);return{visible:t>0,boltY:35*(1-bolt),nutY:-8*(1-nut),nutRotation:Math.PI*4*nut};}),breadboard:item(12,30),supply:item(13,35)};}
