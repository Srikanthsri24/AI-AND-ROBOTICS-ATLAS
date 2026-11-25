import type {CubeSatPoint} from './cubesat-chassis';
export const cubeSatCoaxEnds=[
 {id:'cubesat-rf-radio-plug',name:'Radio-output coaxial mating plug',at:[-22,120.8,15] as CubeSatPoint,out:[0,1,0] as CubeSatPoint,outer:3.2,inner:2.65,depth:4,contactStart:-4},
 {id:'cubesat-rf-antenna-plug',name:'Antenna-feed coaxial mating plug',at:[0,124.3,-45] as CubeSatPoint,out:[0,-1,0] as CubeSatPoint,outer:2.2,inner:1.6,depth:3,contactStart:-.5},
] as const;
export const cubeSatCoaxRoute:CubeSatPoint[]=[[-22,126.8,15],[-22,131,15],[-22,131,-36],[0,131,-36],[0,115,-36],[0,115,-45],[0,118.3,-45]];
export const cubeSatCoaxParts=[
 ['cubesat-rf-cable','Radio → antenna · coaxial lead','A separate insulated cable connects the radio output to the antenna feed, with a rounded service route above and behind the radio PCB.','The mating ends contain separate shell, dielectric and centre-contact structures. This is a teaching connection, not a specified RF cable or a measured link budget.'],
 ...cubeSatCoaxEnds.map(e=>[e.id,e.name,'A hollow mating sleeve surrounds the corresponding port, with a separate centre-contact tube, dielectric cap and strain relief.',e.id==='cubesat-rf-radio-plug'?'The sleeve clears the radio output threads. Its fine centre socket receives the original pin inside the dielectric bore.':'The sleeve stops below the retaining nut. Its centre socket meets the exposed feed pin without entering the solid dielectric.']),
];
