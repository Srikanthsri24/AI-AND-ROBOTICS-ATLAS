import {carMiniBreadboard,carMiniHole} from './bluetooth-mini-breadboard';
import type {CarPoint} from './bluetooth-car-layout';
export function solarTie(column:number,bank:-1|1,row:number):CarPoint{return carMiniHole(column,bank,row).map((n,i)=>n+carMiniBreadboard.at[i]) as CarPoint;}
export const solarDividerResistors=[{id:'solar-divider-high',name:'Upper 10 kΩ divider resistor',ends:[solarTie(4,-1,2),solarTie(4,1,2)]},{id:'solar-divider-low',name:'Lower 10 kΩ divider resistor',ends:[solarTie(4,1,4),solarTie(10,1,4)]}] as const;
export const solarSwitchGeometry={at:[solarTie(12,-1,4)[0],1.205,.06] as CarPoint,bodyWidth:.12,bodyLength:.12,bodyHeight:.055,capRadius:.025,travel:.006,legs:([-1,1] as const).flatMap(bank=>[11,13].map(col=>({bank,column:col,at:solarTie(col,bank,bank<0?4:0)})))};
