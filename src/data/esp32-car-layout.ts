import {bluetoothCarLayout,bluetoothCarMountPoints,bluetoothCarBreakoutPoint,type CarPoint} from './bluetooth-car-layout';
import {espDevkitHeaderPoint,espDevkitPoint} from './esp32-devkitc-geometry';
export const espCarLayout={...bluetoothCarLayout,controller:{at:[-.72,1.20,-1.93] as CarPoint},carrier:{at:[-.72,1.08,-1.93] as CarPoint,width:.84,length:.94,thickness:.04,ledgeTop:1.184,jawInset:.2794,jawTravel:.08}};
export const espCarBoardPoint=(p:CarPoint):CarPoint=>p.map((n,i)=>n+espCarLayout.controller.at[i]) as CarPoint;
export const espCarHeaderPoint=(row:'J2'|'J3',pad:number)=>espCarBoardPoint(espDevkitHeaderPoint(row,pad));
export function espCarPin(name:string){const names:Record<string,['J2'|'J3',number]>={'3V3':['J2',1],'GPIO25':['J2',9],'GPIO26':['J2',10],'GPIO32':['J2',7],'GPIO33':['J2',8],'GPIO27':['J2',11],'GPIO23':['J3',2],'GPIO18':['J3',9],'GPIO19':['J3',8],'GND':['J3',1]};const p=names[name];if(!p)throw Error('Unused ESP32 car contact '+name);return espCarHeaderPoint(...p);}
export const espCarDriverPoint=(name:string)=>bluetoothCarBreakoutPoint('tb6612',name);
export const espCarMounts=[...[-1,1].flatMap(x=>[-1,1].map(z=>({name:'ESP carrier '+x+','+z,at:[espCarLayout.carrier.at[0]+x*.36,espCarLayout.carrier.at[1],espCarLayout.carrier.at[2]+z*.39] as CarPoint,top:espCarLayout.carrier.at[1]+espCarLayout.carrier.thickness,screwStage:4}))),...bluetoothCarMountPoints().filter(p=>p.name.startsWith('tb6612')).map(p=>({...p,screwStage:6}))];
export const espCarUsbMouth=espCarBoardPoint(espDevkitPoint(13.9446,-.30,.016+.025));
