import {industrialPanelParts,type IndustrialPoint} from './industrial-panel';
import {industrialControllerParts} from './industrial-controller';
import {industrialControlParts} from './industrial-controls';
import {industrialIndicatorParts} from './industrial-indicators';
import {industrialWireParts,industrialWireIds} from './industrial-wiring';
import {industrialNetworkParts} from './industrial-network';
import {industrialConveyorParts} from './industrial-conveyor';
export const industrialWorkshopParts=[...industrialPanelParts,...industrialControllerParts,...industrialControlParts,...industrialIndicatorParts,...industrialWireParts,...industrialNetworkParts,...industrialConveyorParts].map(([id,name,description,connection])=>({id,name,description,connection}));
export const industrialAssemblySteps=[
 {title:'Prepare the bench',part:'industrial-bench',instruction:'Identify the low-voltage control area, virtual conveyor and separate receiver. Keep USB disconnected while assembling.',check:'The two knobs simulate temperature and vibration indices; they are not calibrated industrial sensors.'},
 {title:'Mount the controller',part:'industrial-uno-pcb',instruction:'Seat the insulating feet, lower the Uno onto its original mounting axes, then insert its screws. Lower the Ethernet shield onto the R3 headers and main SPI connector.',check:'The shield remains above the Uno; D4 and D10 are reserved for the Ethernet board.'},
 {title:'Build the input panel',part:'industrial-panel',instruction:'Place the standoffs and potentiometers first. Lower the drilled plate over both bushings, fit its screws, then each washer, retaining nut and knob.',check:'The potentiometer cans stay below the plate. Both wipers and outer terminals remain accessible underneath.'},
 {title:'Fit stop, button and indicators',part:'industrial-stop-nc',instruction:'Mount the normally closed roller switch and the control breadboard. Seat the tactile switch across the centre trench and install each LED with its own 220 Ω resistor.',check:'COM and NC form the stop loop; NO stays unused. Breadboard edge markings are not continuous supply rails.'},
 {title:'Trace each jumper',part:'industrial-wire-stop-nc',instruction:'Follow the highlighted connection from its named first contact to its second contact. Each connector seats along its pin axis. Finish all 17 conductors before applying USB power.',check:'No two arriving legs share a physical hole. An unplugged NC lead opens the loop even with the roller released.'},
 {title:'Assemble the virtual conveyor',part:'industrial-conveyor-belt',instruction:'Fit the frame and open bearing housings. Place the belt around both rollers before sliding the shafts axially through their aligned bearing bores. Add feed and outfeed trays, then the parcel.',check:'This is a visible illustration of the green RUN output. The actual guide circuit drives LEDs, not a motor or an industrial machine.'},
 {title:'Connect the observer',part:'industrial-network-shield-cable',instruction:'Place the separate receiver and local LAN switch. Seat both Ethernet cables one plug at a time. Connect USB only after the low-voltage circuit has been checked.',check:'The screen shows received copies. A service outage must not override the local stop loop or trip latch.'},
 {title:'Run, trip and acknowledge',part:'industrial-run-lens',instruction:'Start locally, raise a test index or open the stop loop, then compare local indicators with the receiver. Clear the cause, press once to acknowledge, release, and press again to restart.',check:'Acknowledgement alone never moves the belt. A stale remote RUNNING record cannot restart it.'},
] as const;
export type IndustrialAssemblyWindow={start:number;end:number;travel:IndustrialPoint};
const ids=new Set(industrialWorkshopParts.map(p=>p.id));
const window=(start:number,end:number,travel:IndustrialPoint=[0,35,0]):IndustrialAssemblyWindow=>({start,end,travel});
export function industrialAssemblyWindow(id:string):IndustrialAssemblyWindow{
 if(!ids.has(id))throw Error('Unknown industrial part '+id);
 if(id==='industrial-bench')return window(0,0,[0,0,0]);
 if(id==='industrial-uno-feet')return window(0,.15);
 if(id==='industrial-uno-screws')return window(.45,.6);
 if(id.startsWith('industrial-uno-'))return window(.15,.45);
 if(id.startsWith('industrial-shield-'))return window(.6,1);
 if(id==='industrial-usb-host')return window(0,.15);
 if(id==='industrial-usb-cable')return window(6,6.3,[0,0,0]); // Dedicated plug insertion; never translate the whole cable.
 if(id==='industrial-panel-posts')return window(1,1.12);
 if(id==='industrial-panel')return window(1.35,1.55);
 if(id==='industrial-panel-screws')return window(1.55,1.65);
 if(id.startsWith('industrial-temperature-')||id.startsWith('industrial-vibration-')){
  if(id.endsWith('-washer'))return window(1.65,1.75);
  if(id.endsWith('-nut'))return window(1.75,1.85);
  if(id.endsWith('-knob'))return window(1.85,2);
  return window(1.12,1.35);
 }
 if(id==='industrial-control-board'||id==='industrial-stop-mount')return window(2,2.12);
 if(id.startsWith('industrial-stop-')){
  if(id.endsWith('-axle'))return window(2.55,2.65,[18,0,0]);
  if(id.endsWith('-roller'))return window(2.4,2.55);
  if(id.endsWith('-pad'))return window(2.65,2.75);
  return window(2.12,2.4);
 }
 if(id.startsWith('industrial-button-'))return window(2.12,2.4,[0,15,0]);
 if(id.startsWith('industrial-run-')||id.startsWith('industrial-trip-'))return window(2.75,3,[0,15,0]);
 if(id.startsWith('industrial-wire-')){const n=industrialWireIds.indexOf(id);return window(3+n/17,3+(n+1)/17,[0,0,0]);}
 if(id.startsWith('industrial-conveyor-')){
  if(id.endsWith('-frame'))return window(4,4.15);
  if(id.endsWith('-housings'))return window(4.15,4.3);
  if(id.endsWith('-bearings'))return window(4.3,4.45,[0,0,18]);
  if(id.endsWith('-belt')||id.endsWith('-roller'))return window(4.45,4.7);
  if(id.endsWith('-shaft'))return window(4.7,4.85,[0,0,70]);
  if(id.endsWith('-parcel'))return window(4.95,5);
  return window(4.85,4.95);
 }
 if(id==='industrial-network-shield-cable')return window(5.6,5.8,[0,0,0]);
 if(id==='industrial-network-receiver-cable')return window(5.8,6,[0,0,0]);
 if(id.startsWith('industrial-lan-')||id==='industrial-receiver-body')return window(5,5.3);
 return window(5.3,5.6,[0,0,0]); // Receiver screen and keys are fitted to its assembled enclosure.
}
export function industrialAssemblyPose(id:string,progress:number){
 if(!Number.isFinite(progress)||progress<0||progress>7)throw Error('Industrial assembly progress must be 0–7');
 const w=industrialAssemblyWindow(id),fraction=w.end===w.start?1:Math.max(0,Math.min(1,(progress-w.start)/(w.end-w.start))),ease=fraction*fraction*(3-2*fraction);
 return{visible:progress>=w.start,settled:progress>=w.end,fraction,offset:w.travel.map(v=>v*(1-ease)) as IndustrialPoint};
}
