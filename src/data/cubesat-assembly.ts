import {cubeSatDigitalStages,cubeSatRFStage} from './cubesat-connections';
import {cubeSatChassisParts,type CubeSatPoint} from './cubesat-chassis';
import {cubeSatCameraParts} from './cubesat-camera';
import {cubeSatElectronicsParts} from './cubesat-electronics';
import {cubeSatHarnessParts} from './cubesat-harness';
import {cubeSatRadioParts} from './cubesat-radio';
import {cubeSatCoaxParts} from './cubesat-coax';
import {cubeSatSolarParts} from './cubesat-solar';
import {cubeSatSolarPowerParts} from './cubesat-solar-power';
import {cubeSatStationParts} from './cubesat-ground';
export const cubeSatWorkshopParts=[...cubeSatChassisParts,...cubeSatCameraParts,...cubeSatElectronicsParts,...cubeSatHarnessParts,...cubeSatRadioParts,...cubeSatCoaxParts,...cubeSatSolarParts,...cubeSatSolarPowerParts,...cubeSatStationParts].map(([id,name,description,connection])=>({id,name,description,connection}));
export const cubeSatAssemblyChapters=[
 {title:'Prepare the bench',start:0,end:0,part:'cubesat-stand',instruction:'Keep the tabletop model unpowered. The cradle supports the open bus; the ground receiver stays on the bench during the mission.'},
 {title:'Build the open bus',start:0,end:1,part:'cubesat-bottom-frame',instruction:'Seat the lower frame, lower the four bored corner rails, then raise the lower retaining screws along their actual hole axes.'},
 {title:'Seat the payload carrier',start:1,end:1.5,part:'cubesat-payload-deck',instruction:'Lower the prefitted deck and its four captive studs together, then fit the deck screws. The wider stud heads remain beneath the deck; they do not pass through the small board holes.'},
 {title:'Stack the three boards',start:1.5,end:3.6,part:'cubesat-computer-pcb',instruction:'Slide the lower spacers and populated computer board over the studs. Add the upper spacers, memory board and nuts, followed by radio spacers, populated radio board and its retaining nuts. Chips and headers are already fitted to their PCBs.'},
 {title:'Close the upper frame',start:3.6,end:4.2,part:'cubesat-top-frame',instruction:'Lower the top frame with its prefitted antenna feed and retaining hardware. Tighten the four corner screws. The centre remains open for inspection.'},
 {title:'Fit the camera',start:4.2,end:5,part:'cubesat-camera-plate',instruction:'Slide the separate rear clamp straps forward from inside the bus. Bring the populated camera/plate assembly in from the front, then seat its clamp and board screws along the original front-to-back holes.'},
 {title:'Mount the solar wings',start:5,end:5.6,part:'cubesat-solar-left-ears',instruction:'Bring the two prefitted wing-and-hinge assemblies in from the sides, with the wings open. Their ears rest on the lower and upper frame faces. Seat the retaining screws along the matching frame bores.'},
 {title:'Build the receiving station',start:5.6,end:6.6,part:'cubesat-station-dish',instruction:'Place the weighted base and its pads. Lower the mast/reflector/feed assembly onto it, then place the receiver feet and populated receiver case. The dish stays on the bench, separate from the spacecraft.'},
 {title:'Connect the harnesses',start:6.6,end:7.6,part:'cubesat-camera-harness',instruction:'Follow the separate camera, memory, radio, antenna, solar and receiver connections. Each mating plug must meet its own named port before operating the mission.'},
 {title:'Run the imaging pass',start:7.6,end:8,part:'cubesat-memory-indicator',instruction:'Capture only when Earth-facing and the single-frame slot is free. Preserve that image while the pass advances; downlink it in the authored 35–85° E contact window.'},
] as const;
type Window={start:number;end:number;travel:CubeSatPoint};const windows=new Map<string,Window>();
function assign(ids:string[],start:number,end:number,travel:CubeSatPoint=[0,0,0]){for(const id of ids){if(windows.has(id))throw Error('Duplicate CubeSat assembly mapping '+id);windows.set(id,{start,end,travel});}}
assign(['cubesat-bench','cubesat-stand'],0,0);
assign(['cubesat-bottom-frame'],0,.25,[0,45,0]);assign([1,2,3,4].map(n=>'cubesat-rail-'+n),.25,.65,[0,80,0]);assign(['cubesat-bottom-fasteners'],.65,1,[0,-16,0]);
assign(['cubesat-payload-deck','cubesat-stack-studs'],1,1.35,[0,100,0]);assign(['cubesat-deck-screws'],1.35,1.5,[0,20,0]);assign(['cubesat-lower-spacers'],1.5,1.8,[0,100,0]);
assign(['cubesat-computer-pcb','cubesat-computer-processor','cubesat-computer-clock','cubesat-computer-passives','cubesat-interface-camera','cubesat-interface-buffer-computer'],1.8,2.15,[0,80,0]);assign(['cubesat-upper-spacers'],2.15,2.4,[0,80,0]);
assign(['cubesat-memory-pcb','cubesat-memory-package','cubesat-memory-controller','cubesat-memory-indicator','cubesat-interface-buffer-memory','cubesat-interface-memory-radio'],2.4,2.7,[0,45,0]);assign(['cubesat-stack-nuts'],2.7,2.9,[0,40,0]);assign(['cubesat-radio-spacers'],2.9,3.1,[0,40,0]);
assign(['cubesat-radio-pcb','cubesat-radio-processor','cubesat-radio-shield-case','cubesat-radio-shield-lid','cubesat-radio-jack-body','cubesat-radio-jack-dielectric','cubesat-radio-jack-pin','cubesat-radio-indicator','cubesat-interface-radio','cubesat-solar-regulator','cubesat-solar-left-input','cubesat-solar-right-input'],3.1,3.45,[0,30,0]);assign(['cubesat-radio-nuts'],3.45,3.6,[0,16,0]);
assign(['cubesat-top-frame',...cubeSatRadioParts.filter(p=>p[0].startsWith('cubesat-antenna-')).map(p=>p[0])],3.6,4,[0,45,0]);assign(['cubesat-top-fasteners'],4,4.2,[0,18,0]);
assign(['cubesat-camera-clamps'],4.2,4.4,[0,0,-24]);assign(cubeSatCameraParts.filter(p=>!['cubesat-camera-clamps','cubesat-camera-clamp-screws','cubesat-camera-pcb-screws'].includes(p[0])).map(p=>p[0]),4.4,4.8,[0,0,55]);assign(['cubesat-camera-clamp-screws','cubesat-camera-pcb-screws'],4.8,5,[0,0,16]);
for(const key of['left','right']){assign([...cubeSatSolarParts.filter(p=>p[0].startsWith('cubesat-solar-'+key+'-')&&!p[0].endsWith('-screws')).map(p=>p[0]),'cubesat-solar-'+key+'-port'],5,5.4,[key==='left'?-70:70,0,0]);assign(['cubesat-solar-'+key+'-screws'],5.4,5.6,[0,18,0]);}
assign(['cubesat-station-base','cubesat-station-feet'],5.6,5.9,[0,24,0]);assign(['cubesat-station-mast','cubesat-station-saddle','cubesat-station-dish','cubesat-station-rim','cubesat-station-struts','cubesat-station-horn','cubesat-station-feed-case','cubesat-station-feed-socket'],5.9,6.2,[0,50,0]);assign(['cubesat-station-receiver-feet'],6.2,6.3,[0,20,0]);assign(['cubesat-station-receiver','cubesat-station-input','cubesat-station-display','cubesat-station-controls','cubesat-station-indicator'],6.3,6.6,[0,30,0]);
/** Each digital harness appears with both plugs withdrawn, then seats A followed by B. */
for(const s of cubeSatDigitalStages){assign([s.harness.id],s.start,s.end);assign([s.harness.a.id],s.start,s.mid);assign([s.harness.b.id],s.start,s.end);}
assign(['cubesat-rf-cable'],cubeSatRFStage.start,cubeSatRFStage.end);assign(['cubesat-rf-radio-plug'],cubeSatRFStage.start,cubeSatRFStage.mid);assign(['cubesat-rf-antenna-plug'],cubeSatRFStage.start,cubeSatRFStage.end);
/** Solar and ground-station connector motion remains the following phase. */
const pendingConnections=[...cubeSatSolarPowerParts.filter(p=>/-(lead|panel-plug|board-plug)$/.test(p[0])),...cubeSatStationParts.filter(p=>/-(cable|feed-plug|input-plug)$/.test(p[0]))].map(p=>p[0]);assign(pendingConnections,7.6,7.6);
const known=new Set(cubeSatWorkshopParts.map(p=>p.id));if(known.size!==cubeSatWorkshopParts.length||windows.size!==known.size||[...known].some(id=>!windows.has(id)))throw Error('Incomplete CubeSat assembly coverage');
export function cubeSatAssemblyWindow(id:string){const w=windows.get(id);if(!w)throw Error('Unknown CubeSat part '+id);return w;}
export function cubeSatAssemblyPose(id:string,progress:number){if(!Number.isFinite(progress)||progress<0||progress>8)throw Error('CubeSat assembly progress must be 0–8');const w=cubeSatAssemblyWindow(id),fraction=w.start===w.end?(progress>=w.end?1:0):Math.max(0,Math.min(1,(progress-w.start)/(w.end-w.start))),eased=fraction*fraction*(3-2*fraction);return{visible:progress>=w.start,settled:progress>=w.end,fraction,offset:w.travel.map(v=>v*(1-eased)) as CubeSatPoint};}
