import {vacuumJarParts} from './VacuumJarParts';
import {vacuumBulbParts} from './VacuumBulbParts';
import {vacuumHoseParts} from './VacuumHoseParts';
import {vacuumFilterParts} from './VacuumFilterParts';
export type VacuumPart={id:string;name:string;description:string;connection:string;stage:number;uncover?:number;concept?:boolean};
const connections:Record<string,string>={
 'collection-bottle':'Pickup hose → collection chamber → mesh-protected outlet. The cradles touch the bottle body; neither cradle carries air.',
 'bottle-thread':'The external neck spiral mates with the cap thread. The bottle rim meets the integral sealing lip at full closure.',
 'screw-cap':'Two separate holes hold the pickup and outlet grommets. The cap skirt threads onto the bottle neck.',
 'cap-thread':'Mates with the bottle neck at an authored 3.2 mm pitch. Turning the bottle keeps both hoses stationary.',
 'cap-rim-seal':'Contacts the bottle rim. A small gap here creates a parallel air inlet that bypasses the pickup nozzle.',
 'pickup-grommet':'Lower cap bore ↔ outside of the long pickup hose. Rubber grips the tube wall without blocking the 6 mm air passage.',
 'outlet-grommet':'Upper cap bore ↔ outside of the short outlet hose. It stays separate from the pickup port.',
 'bottle-cradles':'Soft curved liners contact the cylindrical bottle wall. Their bases sit on the bench.',
 'lid-support':'The ribbed cap skirt rests in this separate assembly jig while the bottle is removed. It is an authored bench fixture, not an air-path component.',
 'pickup-hose':'Marked paper site → long hose → lower lid port → downward-facing discharge inside the bottle.',
 'outlet-hose':'Mesh pouch inside the bottle → upper lid port → short hose → barbed bulb inlet.',
 'filter-pouch':'Surrounds the short outlet mouth. Air crosses the weave; the paper pieces are larger than its pores.',
 'filter-tie':'Clamps gathered mesh around the outside of the outlet hose behind its mouth; the tail passes through the locking head.',
 'filter-cover':'A removable sleeve restricts the pouch surface. Remove it before the leaking-cap comparison so only one condition changes.',
 'bulb-shell':'Filtered air enters through the inlet check valve during recovery. Squeezing sends air through the exhaust check valve.',
 'bulb-inlet':'Short hose fits over the left barbs. The open fitting leads to the illustrative inlet valve and elastic cavity.',
 'bulb-inlet-valve':'Bottle → inlet fitting → elastic cavity. Opens downstream on release and seats against reverse flow during squeeze.',
 'bulb-exhaust':'Elastic cavity → exhaust valve → open right-hand fitting → room. Do not connect this outlet back to the bottle.',
 'bulb-outlet-valve':'Elastic cavity → open exhaust. Opens on squeeze, then closes so recovery draws through the bottle instead of backwards from the room.',
 'pump-cradles':'Support the two rigid fitting collars and leave the elastic centre free. They carry no air.',
 'bulb-arrow':'Points from the bottle-side inlet toward the open room exhaust. It identifies the one-way pump direction.'
};
const stages:Record<string,number>={'pickup-grommet':1,'outlet-grommet':2,'pickup-hose':3,'outlet-hose':4,'filter-pouch':5,'filter-tie':6,'filter-cover':13};
export const vacuumWorkshopParts:VacuumPart[]=[...vacuumJarParts,...vacuumHoseParts,...vacuumFilterParts,...vacuumBulbParts].map(([id,name,description])=>({id,name,description,connection:connections[id],stage:stages[id]??(id.startsWith('bulb-')||id==='pump-cradles'?12:0),uncover:['filter-pouch','filter-tie','filter-cover'].includes(id)?6:['cap-thread','cap-rim-seal'].includes(id)?0:undefined,concept:id.includes('-valve')}));
vacuumWorkshopParts.push({id:'paper-tray',name:'Six-site paper tray',description:'Six marked positions hold identical tiny dry paper sheets. Move the nozzle to a different mark only when airflow has stopped and no sheet is still in the hose.',connection:'The nozzle is held above a mark, not pressed against the tray. Keep the gap unchanged for all three comparison trials.',stage:13});
for(let i=0;i<6;i++)vacuumWorkshopParts.push({id:'paper-'+i,name:'Paper sheet '+(i+1),description:'A 2.5 × 2.5 × 0.03 mm authored lightweight sheet. Watch it lift, pass through the entire hose, enter the chamber and settle. It is counted only after entering the bottle.',connection:'Tray mark '+(i+1)+' → pickup nozzle → long hose → collection bottle. The mesh-protected outlet keeps it on the bottle side.',stage:13});
