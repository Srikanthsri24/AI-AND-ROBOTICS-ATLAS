import{aquaWires}from'./aquaclean-wiring';
type Point=[number,number,number];
const wireIds=aquaWires().map(w=>w.id),ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
export const aquaAssemblySteps=[
 {title:'Prepare the dry tray',part:'aqua-tray',instruction:'Place the empty clear tray on a level bench. Identify its shallow-water limit. Keep all electrical sources disconnected.',check:'No model water or litter is added during construction.'},
 {title:'Build the inlet and basket',part:'aqua-ramp',instruction:'Seat the mesh basket on its legs, then fit the supported descending ramp and side guides. The inlet is above the full target height.',check:'The mesh floor drains above the shallow waterline. The complete ramp clears the paddle sweep.'},
 {title:'Lower the paddle assembly',part:'aqua-paddle-hub',instruction:'Prepare the bare shaft and bearing sleeves before attaching the hub and lightweight strips. Lower the preassembled rotor and bearing stands together.',check:'Both shaft ends remain accessible. The tips skim the model surface; the shaft clears the intact tray rim.'},
 {title:'Align the dry motor drive',part:'aqua-drive-coupler',instruction:'Seat the dry motor stand. Fit the stepped coupling onto the paddle shaft before sliding the gearbox output into its smaller bore. Fit the fixing bolts and set screws last.',check:'The two shafts share one axis. Turn by hand with both supplies off; do not force the paddle or coupling.'},
 {title:'Fit the follower and sensor',part:'aqua-follower-card',instruction:'Fit the uncapped guide rods. Lower the card and bored carriers over them, then fit the retaining caps. Seat the sensor plate on its support lip and raise the module into its aligned fixing holes.',check:'The card moves freely and stays clear of the ramp inlet. The empty top face is 200 mm below the sensor datum.'},
 {title:'Prepare the dry electronics',part:'aqua-shield-pcb',instruction:'Seat the Uno on insulating feet and fit the Ethernet shield without bending its stack or ICSP pins. Place the driver, button board, switched AA pack and local network / receiver models outside the wet tray.',check:'USB is disconnected and the AA switch is off. Logic VCC and motor VM remain separate.'},
 {title:'Seat each labelled connection',part:'aqua-wire-logic',instruction:'Follow the named circuit wires. Each first end seats before its second end. Ground uses the reserved five-hole ties; motor current bypasses them. Finally seat the two Ethernet cables.',check:'D2/D3 sonar, D5/D6/D8 drive and D7 Start/Stop match the sketch. No two jumper plugs share a breadboard hole.'},
 {title:'Check before the demonstration',part:'aqua-button-cap',instruction:'Inspect the complete dry circuit before connecting USB or motor power. Check the real sketch with dry targets first, then use a supervised shallow-water model.',check:'Run collects readings; Start/Stop requests the paddle. A full or unavailable basket stops locally even without fresh network data.'},
] as const;
export function aquaPartStage(id:string){
 if(id==='aqua-tray')return 0;
 if(['aqua-ramp','aqua-ramp-rails','aqua-ramp-supports','aqua-basket','aqua-basket-legs'].includes(id))return 1;
 if(id.startsWith('aqua-paddle-'))return 2;
 if(id.startsWith('aqua-drive-'))return 3;
 if(id.startsWith('aqua-sensor-')||id.startsWith('aqua-follower-')||id.startsWith('aqua-sonar-'))return 4;
 if(id.startsWith('uno-')||id.startsWith('aqua-shield-')||id.startsWith('aqua-driver-')||id.startsWith('aqua-aa-')||id.startsWith('aqua-button-')||id.startsWith('aqua-lan-')||id.startsWith('aqua-receiver-')||['flood-controller-feet','flood-usb-host','aqua-breadboard'].includes(id))return 5;
 if(wireIds.includes(id)||id.startsWith('aqua-network-'))return 6;
 if(id==='flood-usb-cable'||id==='aqua-water'||id.startsWith('aqua-litter-'))return 7;
 throw Error('Unknown AQUACLEAN assembly owner '+id);
}
/** Distances along each terminal's own unplugging direction, not a rigid cable translation. */
export function aquaWireSeating(index:number,progress:number){if(!Number.isInteger(index)||index<0||index>23||!Number.isFinite(progress)||progress<0||progress>7)throw Error('Invalid wire seating step.');const start=index<22?5+index*.0375:5.84+(index-22)*.08,duration=index<22?.0375:.08,t=(progress-start)/duration;if(progress>=start+duration)return{visible:true,settled:true,a:0,b:0};return{visible:progress>start,settled:progress>=start+duration,a:12*(1-ease(t*2)),b:12*(1-ease((t-.5)*2))};}
export function aquaAssemblyPose(id:string,progress:number):{visible:boolean;settled:boolean;offset:Point}{if(!Number.isFinite(progress)||progress<0||progress>7)throw Error('Assembly progress must be 0–7.');const stage=aquaPartStage(id);if(stage===0||progress>=stage)return{visible:true,settled:true,offset:[0,0,0]};let start=stage-1,end=stage,offset:Point=[0,0,0];
 if(stage===1){if(['aqua-basket','aqua-basket-legs','aqua-ramp-supports'].includes(id)){end=.5;offset=[0,50*(1-ease(progress/.5)),0];}else{start=.5;offset=[0,45*(1-ease((progress-.5)/.5)),0];}}
 else if(stage===2)offset=[0,80*(1-ease(progress-1)),0];
 else if(stage===3){if(id==='aqua-drive-bracket'){end=2.25;offset=[0,55*(1-ease((progress-2)/.25)),0];}else if(id==='aqua-drive-coupler'){start=2.25;end=2.5;offset=[0,0,20*(1-ease((progress-start)/.25))];}else if(['aqua-drive-bolts','aqua-drive-screws'].includes(id)){start=2.85;offset=[0,18*(1-ease((progress-start)/.15)),0];}else{start=2.5;end=2.85;offset=[0,0,40*(1-ease((progress-start)/.35))];}}
 else if(stage===4){if(id==='aqua-follower-guides'){end=3.2;offset=[0,40*(1-ease((progress-3)/.2)),0];}else if(['aqua-follower-card','aqua-follower-carrier'].includes(id)){start=3.2;end=3.65;offset=[0,180*(1-ease((progress-start)/.45)),0];}else if(id==='aqua-follower-caps'){start=3.65;end=3.8;offset=[0,18*(1-ease((progress-start)/.15)),0];}else if(['aqua-sensor-stand','aqua-sensor-loom'].includes(id)){end=3.3;offset=[0,55*(1-ease((progress-3)/.3)),0];}else if(id==='aqua-sensor-mount'){start=3.3;end=3.55;offset=[0,25*(1-ease((progress-start)/.25)),0];}else{start=3.8;offset=[0,-25*(1-ease((progress-start)/.2)),0];}}
 else if(stage===5){if(id.startsWith('uno-')||id==='flood-controller-feet'){end=4.18;}else if(id.startsWith('aqua-shield-')){start=4.18;end=4.38;}else if(id.startsWith('aqua-driver-')){start=4.38;end=4.55;}else if(id.startsWith('aqua-button-')||id==='aqua-breadboard'){start=4.55;end=4.7;}else if(id.startsWith('aqua-aa-')){start=4.7;end=4.85;}else{start=4.85;}offset=[0,45*(1-ease((progress-start)/(end-start))),0];}
 else if(stage===6){const index=wireIds.includes(id)?wireIds.indexOf(id):id==='aqua-network-shield-cable'?22:23;const p=aquaWireSeating(index,progress);return{visible:p.visible,settled:p.settled,offset:[0,0,0]};}
 else return{visible:false,settled:false,offset:[0,0,0]};
 return{visible:progress>start,settled:progress>=end,offset:progress>=end?[0,0,0]:offset};
}
