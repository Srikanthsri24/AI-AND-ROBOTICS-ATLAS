import type {CarPoint} from './bluetooth-car-layout';
/** 170-point mini board: standard 2.54 mm grid, two independent five-contact banks per column.
 * Envelope follows SparkFun PRT-12043 (47 × 35 × 10 mm); Atlas uses 50 mm per scene unit.
 * Source: https://www.sparkfun.com/breadboard-mini-modular-white.html
 */
export const carMiniBreadboard={at:[-.50,.99,.06] as CarPoint,width:.94,length:.70,height:.20,pitch:.0508,bankGap:.1524,columns:17,rows:5};
export function carMiniHole(column:number,bank:-1|1,row:number):CarPoint{if(!Number.isInteger(column)||column<0||column>16||!Number.isInteger(row)||row<0||row>4)throw Error('Unknown mini-breadboard contact');return [(column-8)*carMiniBreadboard.pitch,carMiniBreadboard.height,bank<0?-carMiniBreadboard.bankGap/2-(4-row)*carMiniBreadboard.pitch:carMiniBreadboard.bankGap/2+row*carMiniBreadboard.pitch];}
