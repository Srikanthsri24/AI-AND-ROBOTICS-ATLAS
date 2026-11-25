import{gateWires}from'./flood-gate-wiring';
type Point=[number,number,number];
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
const wireOrder=gateWires().filter(w=>!w.bare).map(w=>w.id);
export const gateAssemblySteps=[
 {title:'Prepare the two chambers',part:'gate-basin',instruction:'Set the clear basin on its tray. Identify the separate upstream and downstream depth marks. Keep both chambers dry while assembling.',check:'Both marks start at the same inside-bottom datum. The receiving chamber is independent.'},
 {title:'Fit the divider and flap',part:'gate-flap',instruction:'Seat the divider, illustrated seal and lightweight flap. Attach the flexible hinge strips along its upper edge.',check:'The closed flap covers the lower opening. It can swing into the downstream chamber.'},
 {title:'Mount the dry servo drive',part:'gate-servo-case',instruction:'Fit the overhead frame and U bracket. Mount the servo using its two flange bolts. Keep the prewired three-contact plug on the dry bench.',check:'The body clears the bracket opening. The motor, board and feedback element are above the water limit.'},
 {title:'Connect the horn and rod',part:'gate-rod',instruction:'With power disconnected and the servo at the illustrated closed position, fit the horn, retain it with its central screw, then connect the rod and its two pins.',check:'The rod keeps one length through the checked 65–120° range. It does not force an end stop.'},
 {title:'Position both sensors',part:'gate-up-sonar-pcb',instruction:'Fit the preassembled insulating mounts and modules under the two overhead arms. Aim each module down at its own chamber.',check:'There are separate upstream and downstream modules and empty-gap references. Each front stays at least 100 mm above the maximum fill.'},
 {title:'Place the dry electronics',part:'uno-mcu',instruction:'Place the Uno on its insulating feet, the reference breadboard and the separate regulated servo supply outside the tray.',check:'The servo supply is not the Uno 5 V rail. Both electrical sources remain off.'},
 {title:'Wire the two-channel circuit',part:'gate-wire-reference',instruction:'Connect each sensor to its own trigger / echo pins. Distribute Uno 5 V only to the sensors. Connect servo power directly to its separate supply and join the signal grounds.',check:'D2 / D3 are upstream; D4 / D5 are downstream; D9 is servo signal. The positive supplies are separate.'},
 {title:'Calibrate and test',part:'gate-horn',instruction:'Connect USB, upload the Arduino C++ sketch and set both empty references. Test dry flat targets before the shallow-water demonstration.',check:'Open at 80 mm upstream when downstream has room; hold through 70 mm; close at 50 mm or the downstream / sensor interlock.'},
] as const;
export function gatePartStage(id:string){
 if(['gate-tray','gate-basin','gate-up-scale','gate-down-scale'].includes(id))return 0;
 if(['gate-divider','gate-seal','gate-flap','gate-hinge'].includes(id))return 1;
 if(['gate-dry-frame','gate-servo-bracket','gate-servo-plug'].includes(id)||id.startsWith('gate-servo-')||id.startsWith('gate-harness-'))return 2;
 if(['gate-horn','gate-rod','gate-link-pins','gate-link-clips','gate-hub-screw'].includes(id))return 3;
 if(id.startsWith('gate-up-sonar-')||id.startsWith('gate-down-sonar-')||['gate-up-mount','gate-down-mount'].includes(id))return 4;
 if(id.startsWith('uno-')||id.startsWith('gate-supply-')||['gate-breadboard','flood-controller-feet','flood-usb-host'].includes(id))return 5;
 if(id.startsWith('gate-wire-'))return 6;
 if(['flood-usb-cable','gate-up-water','gate-down-water'].includes(id))return 7;
 throw Error('Unknown flood-gate assembly owner '+id);
}
export function gateAssemblyPose(id:string,progress:number):{visible:boolean;settled:boolean;offset:Point}{
 if(!Number.isFinite(progress)||progress<0||progress>7)throw Error('Assembly position must be 0–7.');const stage=gatePartStage(id);if(stage===0||progress>=stage)return {visible:true,settled:true,offset:[0,0,0]};
 let start=stage-1,end=stage,offset:Point=[0,0,0];
 if(stage===1){if(['gate-flap','gate-hinge'].includes(id)){start=.25;offset=[40*(1-ease((progress-start)/.75)),0,0];}else offset=[0,50*(1-ease(progress)),0];}
 else if(stage===2){if(['gate-dry-frame','gate-servo-bracket'].includes(id)){end=1.3;offset=[0,70*(1-ease((progress-1)/.3)),0];}else{start=1.3;offset=[0,0,55*(1-ease((progress-start)/.7))];}}
 else if(stage===3){if(id==='gate-horn'){end=2.3;offset=[0,0,20*(1-ease((progress-2)/.3))];}else if(id==='gate-rod'){start=2.3;end=2.75;offset=[0,0,35*(1-ease((progress-start)/.45))];}else if(id==='gate-link-clips'){start=2.9;offset=[6*(1-ease((progress-start)/.1)),0,0];}else{start=2.75;end=id==='gate-link-pins'?2.9:3;offset=[0,0,15*(1-ease((progress-start)/(end-start)))];}}
 else if(stage===4){const slide=ease((progress-3)/.5),rise=ease((progress-3.5)/.4);offset=[0,-35*(1-rise),75*(1-slide)];end=3.9;}
 else if(stage===5)offset=[0,45*(1-ease(progress-4)),0];
 else if(stage===6){const index=wireOrder.indexOf(id);start=5+Math.max(0,index)*.05;end=start+.3;const t=ease((progress-start)/.3);offset=[0,25*(1-t),15*(1-t)];}
 else if(id==='flood-usb-cable')offset=[0,0,0]; // Keep the host end fixed; the USB-B subassembly handles its unpowered offset.
 else return {visible:false,settled:false,offset:[0,0,0]};
 return {visible:progress>start,settled:progress>=end,offset:progress>=end?[0,0,0]:offset};
}
