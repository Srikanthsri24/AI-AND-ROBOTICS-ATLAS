import {emergencyCorridorParts,type EmergencyPoint} from './emergency-corridor';
import {emergencySignalParts} from './emergency-signals';
import {emergencyBoardParts,emergencyResistors} from './emergency-board';
import {emergencyControllerParts} from './emergency-controller';
import {emergencyPiezoParts} from './emergency-piezo';
import {emergencyWireParts,emergencyWires} from './emergency-wiring';
export const emergencyWorkshopParts=[...emergencyCorridorParts,...emergencySignalParts,...emergencyBoardParts,...emergencyControllerParts,...emergencyPiezoParts,...emergencyWireParts].map(([id,name,description,connection])=>({id,name,description,connection}));
export const emergencyAssemblySteps=[
 {title:'Prepare the bench',part:'emergency-bench',instruction:'Build a dry cardboard corridor with a separate low-voltage electronics area. Keep USB disconnected throughout assembly.',check:'This is a classroom lighting model, with no building wiring or mains loads.'},
 {title:'Build the corridor',part:'emergency-back-wall',instruction:'Place the floor, back wall and open exit frame. Slide the four folded lamp carriers against the wall. Their rear wire bores align with the eight wall openings.',check:'The exit stays open. Paper supports do not carry current; each LED needs two real conductors.'},
 {title:'Mount Uno and sensor stand',part:'emergency-uno-pcb',instruction:'Seat the four insulating feet, lower the Uno over its original mounting holes, then fit the retaining screws. Build the separate raised light-sensor stand.',check:'Keep the light sensor above and outside the path lamps. Use the original Uno headers without an added shield.'},
 {title:'Fit sensor, lamps and sounder',part:'emergency-path-1-lens',instruction:'Lower both photoresistor leads into the raised head plate. Insert each LED into its own two carrier holes, with the cathode flat on the right. Place the passive piezo on its slotted cradle.',check:'White LEDs use D5–D7; the red beacon uses D8. The passive piezo is a tone-driven transducer, not an active-buzzer module.'},
 {title:'Build the control circuit',part:'emergency-board-shell',instruction:'Place the 400-contact breadboard. Seat ALARM and RESET across the centre trench. Add five separate 220 Ω limiters and the separate 10 kΩ light-divider resistor.',check:'Each resistor spans two different ties. Contact numbers on opposite sides of the trench are electrically separate.'},
 {title:'Seat all 25 jumpers',part:'emergency-wire-supply',instruction:'Follow each highlighted wire from its first named socket to its second. The plugs seat individually along their pin axes; the rear LED leads pass through the real paper openings.',check:'All 50 ends have different physical contacts. Finish the 5 V, ground, input and series-limited output paths before connecting USB.'},
 {title:'Test light and alarm',part:'emergency-beacon-lens',instruction:'Connect USB and run the model clock. Lower the brightness index to turn on the path lights. Press ALARM, release it, then press RESET to clear the latched warning.',check:'A bright room alone cannot clear an alarm. RESET needs a new 30 ms qualified press with ALARM released. Darkness still keeps the path lights on after reset.'},
] as const;
const ids=new Set(emergencyWorkshopParts.map(p=>p.id));
export function emergencyAssemblyWindow(id:string){if(!ids.has(id))throw Error('Unknown emergency part '+id);const window=(start:number,end:number,travel:EmergencyPoint=[0,25,0])=>({start,end,travel});
 if(id==='emergency-bench')return window(0,0,[0,0,0]);
 if(id==='emergency-floor')return window(0,.12);
 if(id==='emergency-back-wall')return window(.12,.4,[0,0,-30]);
 if(id==='emergency-exit-wall')return window(.4,.55,[30,0,0]);
 if(id.endsWith('-carrier'))return window(.55,.8,[0,0,25]);
 if(id==='emergency-route'||id==='emergency-exit-sign')return window(.8,1,[0,0,0]);
 if(id==='emergency-usb-host')return window(1,1.08);
 if(id==='emergency-uno-feet')return window(1,1.12);
 if(id==='emergency-uno-screws')return window(1.36,1.5);
 if(id.startsWith('emergency-uno-'))return window(1.12,1.36);
 if(id==='emergency-sensor-base')return window(1.5,1.6);
 if(id==='emergency-sensor-post')return window(1.6,1.78);
 if(id==='emergency-sensor-headplate')return window(1.78,2);
 if(id.startsWith('emergency-ldr-'))return window(2,2.25,[0,15,0]);
 if(/^emergency-(path-[123]|beacon)-(lens|anode|cathode)$/.test(id)){const key=id.match(/^emergency-(path-[123]|beacon)-/)![1],n=['path-1','path-2','path-3','beacon'].indexOf(key);return window(2.25+n*.125,2.375+n*.125,[0,15,0]);}
 if(id==='emergency-piezo-cradle')return window(2.75,2.85);
 if(/^emergency-piezo-(case|lid|brass|ceramic|signal|return)$/.test(id))return window(2.85,3,[0,15,0]);
 if(id==='emergency-board-shell'||id==='emergency-board-ties'||id.startsWith('emergency-rail-'))return window(3,3.2,[0,20,0]);
 if(/^emergency-(alarm|reset)-/.test(id))return window(3.2,3.45,[0,15,0]);
 if(id.includes('-resistor-')){const n=emergencyResistors.findIndex(r=>id.startsWith('emergency-'+r.key+'-resistor-'));return window(3.45+n*.55/6,3.45+(n+1)*.55/6,[0,15,0]);}
 if(id.startsWith('emergency-wire-')){const n=emergencyWires.findIndex(w=>w.id===id);return window(4+n/25,4+(n+1)/25,[0,0,0]);}
 if(id==='emergency-usb-cable')return window(5,5.2,[0,0,0]);
 throw Error('Emergency part has no assembly window '+id);
}
export function emergencyAssemblyPose(id:string,progress:number){if(!Number.isFinite(progress)||progress<0||progress>6)throw Error('Emergency assembly progress must be 0–6');const w=emergencyAssemblyWindow(id),fraction=w.end===w.start?1:Math.max(0,Math.min(1,(progress-w.start)/(w.end-w.start))),ease=fraction*fraction*(3-2*fraction);return{visible:progress>=w.start,settled:progress>=w.end,fraction,offset:w.travel.map(v=>ease===1?0:v*(1-ease)) as EmergencyPoint};}
