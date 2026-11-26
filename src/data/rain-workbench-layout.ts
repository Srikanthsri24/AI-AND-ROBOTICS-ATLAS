import uno from './uno-r3-board-layout.json';
import {carMiniHole} from './bluetooth-mini-breadboard';
export type RainPoint=readonly[number,number,number];
/** Project-specific mm positions: electronics left of the mechanism, wet tray in front. */
export const rainWorkbenchLayout={uno:[-85,18,25],breadboard:[-78,8,-38],sensor:[0,10,95],supply:[-78,0,-87],adapter:[-30,0,-92],mat:{centre:[-5,-1,-2.5],size:[250,2,225]}} as const;
export function rainUnoContact(name:string):RainPoint{const h=uno.headers.find(h=>h.name===name);if(!h)throw new RangeError('Unknown rain-project Uno socket '+name);const p=rainWorkbenchLayout.uno;return [p[0]+h.x-34.29,p[1]+9.3,p[2]+26.67-h.y];}
export function rainBreadboardHole(column:number,bank:-1|1,row:number):RainPoint{const h=carMiniHole(column,bank,row),p=rainWorkbenchLayout.breadboard;return [p[0]+h[0]*50,p[1]+h[1]*50,p[2]+h[2]*50];}

/** Screw-terminal conductor mating centres; power remains separate from Uno 5 V. */
export const rainSupplyContacts={positive:[-33,4.8,-89] as RainPoint,negative:[-27,4.8,-89] as RainPoint};
export const rainSupplyCord:readonly RainPoint[]=[[-30,5,-101],[-30,5,-108],[-48,5,-112.5],[-56,5,-105],[-54,5,-62],[-68,5,-58],[-78,5,-58],[-78,5,-64]];
