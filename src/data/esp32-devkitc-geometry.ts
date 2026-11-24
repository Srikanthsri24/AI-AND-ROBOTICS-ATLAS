import data from './esp32-devkitc-v4-layout.json';
import type {CarPoint} from './bluetooth-car-layout';
export const espDevkitScale=.02,espDevkitThickness=.032,espDevkitContactHeight=.186;
export const espDevkitLayout=data;
export function espDevkitPoint(x:number,y:number,height=espDevkitThickness/2):CarPoint{return [(x-data.pcb.width/2)*espDevkitScale,height,(data.pcb.length/2-y)*espDevkitScale];}
/** Duplicate ground names are disambiguated by row and one-based pad. */
export function espDevkitHeaderPoint(row:'J2'|'J3',pad:number):CarPoint{const p=data.headers.find(p=>p.row===row&&p.pad===pad);if(!p)throw Error('Unknown ESP32 header '+row+' / '+pad);return espDevkitPoint(p.at[0],p.at[1],espDevkitContactHeight);}
export function espDevkitPin(name:string):CarPoint{const p=data.headers.filter(p=>p.name===name);if(p.length!==1)throw Error('ESP32 contact must be unique: '+name);return espDevkitHeaderPoint(p[0].row as 'J2'|'J3',p[0].pad);}
