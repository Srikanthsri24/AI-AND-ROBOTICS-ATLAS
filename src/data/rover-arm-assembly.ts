import{raArmAnchorFits}from'./rover-arm-anchors';
import{raArmWorldOutputs,type RaArmWiring}from'./rover-arm-world';
import type{RaArmRig}from'./rover-arm-rig';
import{raArmValidateCalibration,type RaArmCalibration}from'./rover-arm-motion';
import{raArmJoints}from'./rover-arm-mechanics';
/** Mechanical subassembly only. Electronics, calibration bench and wiring are
 * separate workshop phases; these records must not be treated as a full build. */
export type RaArmFit={id:string;part:string;title:string;instruction:string;why:string;check:string;channel?:number;horn?:boolean};
export const raArmMechanicalFits:readonly RaArmFit[]=[
 {id:'anchor-base',part:'ra-arm-baseplate',title:'Position the base plate',instruction:'Place the base on the drilled fixture and align all four anchor holes. The next steps insert the bolts and retain them underneath.',why:'A stable base keeps joint movement from tipping the build.',check:'The base does not rock and all four anchor positions are accessible.'},
 ...raArmAnchorFits,
 ...raArmJoints.flatMap((j,ch)=>[
 {id:j.id+'-cradle',part:`ra-arm-${j.id}-cradle`,title:j.label+' · seat the cradle',instruction:'Align the cradle with its supporting bracket. Keep its central opening clear for the servo case.',why:'The cradle fixes the case; it must not constrain the rotating output.',check:'The case aperture and mounting bores remain open.'},
 {id:j.id+'-servo',part:`ra-arm-${j.id}-servo`,title:j.label+' · insert the servo',instruction:'Slide the case through the cradle aperture until its mounting ears sit flat. Keep the cable exit clear.',why:'The case stays fixed while the output shaft turns.',check:'Both ears sit flat without bending and the lead exit is not trapped.'},
 {id:j.id+'-bolts',part:`ra-arm-${j.id}-bolts`,title:j.label+' · fasten the case',instruction:'Insert the four mounting fasteners through the aligned slots. Tighten evenly without crushing the plastic ears.',why:'Loose case mounting would move the entire servo instead of just the joint.',check:'The case is secure and the output shaft remains free.'},
 {id:j.id+'-horn',part:`ra-arm-${j.id}-servo-horn`,title:j.label+' · fit the checked horn',instruction:'With power disconnected, fit the horn at the previously checked neutral orientation. Seat its retaining screw before attaching the next link.',why:'Horn indexing determines where the assembled joint sits at neutral.',check:'The horn is seated on the spline and its centre screw is retained.',channel:ch,horn:true},
 ...(ch<5?[{id:j.id+'-link',part:`ra-arm-${j.id}-link`,title:j.label+' · attach the moving link',instruction:'Align the link’s four bores with the horn. Fit the fasteners while keeping the centre clearance open.',why:j.connection,check:'The link is retained on the horn and clears the fixed housing.'}]:[]),
 ...(ch===3?[{id:'wrist-adapter',part:'ra-arm-pitch-adapter',title:'Fit the wrist offset adapter',instruction:'Attach the offset support to the wrist pitch link before adding the roll cradle.',why:'The offset leaves room for the roll-servo case.',check:'The roll mounting face sits clear of the wrist link.'}]:[]),
 ]),
 {id:'palm',part:'ra-arm-palm',title:'Fit the palm and guides',instruction:'Seat the palm supports outside the servo housing. Keep both sliding guide channels clear.',why:'The guides support the two racks without touching the servo case.',check:'Both rack paths are open and the centre hub opening is clear.'},
 {id:'pinion',part:'ra-arm-pinion',title:'Fit the drive pinion',instruction:'Fit the hollow hub and pinion over the retained horn. Keep the hub’s centre recess clear of the retaining screw.',why:'The gear transfers the final servo’s rotation to both racks.',check:'The pinion turns with the horn and clears the fixed palm.'},
 ...(['left','right']as const).map(side=>({id:side+'-rack',part:`ra-arm-${side}-finger`,title:'Insert the '+side+' rack and finger',instruction:'Slide the rack into its guide with its teeth facing the pinion. Keep the soft pad facing the other finger.',why:'The two opposed racks move the pads equally in opposite directions.',check:'The rack is supported, its teeth mesh and both pads share the same grasping plane.'})),
];
export type RaArmAssembly={completed:readonly string[];calibrated:readonly {channel:number;value:RaArmCalibration}[];active:string|null;progress:number};
export const raArmAssemblyInitial=():RaArmAssembly=>({completed:[],calibrated:[],active:null,progress:0});
export function raArmAssemblyStart(s:RaArmAssembly,id:string,power:{usb:boolean;servoSupply:boolean}):RaArmAssembly{
 if(power.usb||power.servoSupply)throw new Error('Disconnect both power sources before mechanical assembly');
 if(s.active)throw new Error('Finish the active fitting first');
 const index=raArmMechanicalFits.findIndex(f=>f.id===id),fit=raArmMechanicalFits[index];if(!fit)throw new RangeError('Unknown mechanical fitting');
 if(s.completed.includes(id))throw new Error('This fitting is already complete');
 if(index>0&&!s.completed.includes(raArmMechanicalFits[index-1].id))throw new Error('Complete the preceding fitting first');
 if(fit.horn&&!s.calibrated.some(c=>c.channel===fit.channel))throw new Error('Check unloaded neutral calibration before fitting this horn');
 return{...s,active:id,progress:0};
}
export function raArmAssemblyAdvance(s:RaArmAssembly,ms:number):RaArmAssembly{if(!Number.isFinite(ms)||ms<0)throw new RangeError('Invalid fitting interval');if(!s.active)return s;const elapsed=s.progress+ms/1000,progress=elapsed>=1-1e-12?1:elapsed;return progress<1?{...s,progress}:{...s,progress:0,active:null,completed:[...s.completed,s.active]};}
export function raArmAssemblyPart(s:RaArmAssembly,part:string){const fit=raArmMechanicalFits.find(f=>f.part===part);if(!fit)return{visible:false,progress:0};if(s.completed.includes(fit.id))return{visible:true,progress:1};return{visible:s.active===fit.id,progress:s.active===fit.id?s.progress:0};}

/** Record the virtual bench result only while this horn is unloaded. The final
 * UI must identify virtual calibration separately from measurements on a kit. */
export function raArmAssemblyRecordCalibration(s:RaArmAssembly,channel:number,rig:RaArmRig,w:RaArmWiring,value:RaArmCalibration):RaArmAssembly{
 if(!Number.isInteger(channel)||channel<0||channel>5)throw new RangeError('Invalid calibration channel');raArmValidateCalibration(value);
 const horn=raArmMechanicalFits.find(f=>f.horn&&f.channel===channel)!;
 if(s.active||s.completed.includes(horn.id))throw new Error('Check calibration with this horn unloaded and fitting paused');
 const output=raArmWorldOutputs(rig.world,w)[channel];
 if(rig.world.session.mode!=='arm'||rig.world.session.halted||!rig.world.session.homed||output.status!=='tracking'||output.pulseUs===null||Math.abs(output.pulseUs-value.pulseA)>.1||rig.pose.status[channel]!=='settled'||Math.abs(rig.pose.angles[channel]-value.angleA)>.001)throw new Error('Deliver neutral and let this unloaded virtual servo settle first');
 return{...s,calibrated:[...s.calibrated.filter(c=>c.channel!==channel),{channel,value:{...value}}]};
}
