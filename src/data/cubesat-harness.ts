import {cubeSatInterfaceRows} from './cubesat-electronics';
import type {CubeSatPoint} from './cubesat-chassis';
export type CubeSatHarnessEnd={id:string;name:string;at:CubeSatPoint;out:CubeSatPoint};
const row=(key:typeof cubeSatInterfaceRows[number]['key'],id:string,name:string):CubeSatHarnessEnd=>{const r=cubeSatInterfaceRows.find(r=>r.key===key)!;return{id,name,at:[r.x,r.y+4.4,r.z],out:[0,1,0]};};
export const cubeSatHarnesses=[
 {id:'cubesat-camera-harness',name:'Camera → computer · eight-conductor harness',a:{id:'cubesat-camera-plug',name:'Camera rear mating plug',at:[0,92,42.6] as CubeSatPoint,out:[0,0,-1] as CubeSatPoint},b:row('camera','cubesat-computer-camera-plug','Computer camera mating plug'),via:[[0,92,37],[0,70,37],[0,70,28]] as CubeSatPoint[],why:'Carries the illustrative captured-frame interface from the separate camera PCB to the mission computer. The route stays outside the upper PCB edge before descending.'},
 {id:'cubesat-memory-harness',name:'Computer → buffer · eight-conductor harness',a:row('buffer-computer','cubesat-computer-buffer-plug','Computer buffer mating plug'),b:row('buffer-memory','cubesat-memory-plug','Memory-board mating plug'),via:[[0,67,-26],[0,67,-39],[0,99,-39],[0,99,-26]] as CubeSatPoint[],why:'Joins the computer to the physically separate saved-frame board. Its rear service loop clears the upper PCB instead of passing invisibly through it.'},
 {id:'cubesat-radio-harness',name:'Saved frame → radio · eight-conductor harness',a:row('memory-radio','cubesat-memory-radio-plug','Memory radio-output mating plug'),b:row('radio','cubesat-radio-input-plug','Radio input mating plug'),via:[[18,100,20],[18,100,39],[18,125,39],[18,125,20]] as CubeSatPoint[],why:'Carries the retained-frame interface to the separate radio board. The forward service loop clears the radio PCB and does not overwrite the captured record.'},
] as const;
export const cubeSatHarnessPitch=1.27;
export const cubeSatHarnessWireRadius=.23;
export const cubeSatHarnessExit=(end:CubeSatHarnessEnd):CubeSatPoint=>end.at.map((v,k)=>v+2.8*end.out[k]) as CubeSatPoint;
export const cubeSatHarnessParts=cubeSatHarnesses.flatMap(h=>[
 [h.id,h.name,'Eight individually modelled insulated conductors connect two separate mating plugs.',h.why+' These are authored teaching interfaces; conductor colours do not claim a flight-hardware protocol or pinout.'],
 [h.a.id,h.a.name,'Eight open female contact cavities and separate spring leaves receive the actual pin row. A common cap joins the plug cells.',`The plug enters along the original contact axis. ${h.a.name} → ${h.name}. Each cavity clears its pin without passing through the shroud wall.`],
 [h.b.id,h.b.name,'The second independently modelled female plug has its own eight cavities and contact springs.',`${h.name} → ${h.b.name}. Its insulation exits above the seated pin tips; the plug can withdraw along its actual contact axis during assembly.`],
]);
