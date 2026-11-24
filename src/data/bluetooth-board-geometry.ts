import bluefruit from './bluefruit-board-layout.json';
import driver from './tb6612-board-layout.json';
export type BluetoothBoardKind='bluefruit'|'tb6612';
export type BoardPoint=[number,number,number];
export const bluetoothBoardScale=.03;
export const bluetoothBoardThickness=1.6*bluetoothBoardScale;
export const bluetoothBoardTop=bluetoothBoardThickness/2;
export type BluetoothCadPad={name:string;x:string;y:string;kind:string;net:string|null;drill?:string;diameter?:string;dx?:string;dy?:string};
export type BluetoothCadElement={name:string;x:string;y:string;rot?:string;package:string;pads:BluetoothCadPad[]};
export type BluetoothCadLayout={source:string;license:string;licenseURI:string;attribution:string;outline:{x1:string;y1:string;x2:string;y2:string;width:string;layer:string;curve?:string}[];elements:BluetoothCadElement[];tracks:{x1:string;y1:string;x2:string;y2:string;width:string;layer:string}[]};
export const bluetoothBoardLayouts:Record<BluetoothBoardKind,BluetoothCadLayout>={bluefruit,tb6612:driver};
export const bluetoothBoardDimensions={bluefruit:[21.336,31.75],tb6612:[19.05,26.67]} as const;
export function bluetoothBoardPoint(kind:BluetoothBoardKind,x:number,y:number,height=0):BoardPoint{const [w,h]=bluetoothBoardDimensions[kind];return [(x-w/2)*bluetoothBoardScale,height,(h/2-y)*bluetoothBoardScale];}
/** Eagle package coordinates are rotated before translating into PCB coordinates. */
export function bluetoothPadPosition(element:{x:string;y:string;rot?:string},pad:{x:string;y:string}):[number,number]{const rotation=element.rot??'R0',angle=Number(rotation.replace(/[^\d.-]/g,''))*Math.PI/180,x=Number(pad.x)*(rotation.startsWith('M')?-1:1),y=Number(pad.y);return [Number(element.x)+x*Math.cos(angle)-y*Math.sin(angle),Number(element.y)+x*Math.sin(angle)+y*Math.cos(angle)];}
// Names are the board silkscreen, not the radio module's internal opposite-facing flow-control nets.
export const bluetoothRadioHeaderNames=['DFU','GND','RTS','VIN','RXI','TXO','CTS','MOD'] as const;
export const bluetoothDriverInputNames=['VM','VCC','GND','PWMB','BIN2','BIN1','STBY','AIN1','AIN2','PWMA'] as const;
export const bluetoothDriverOutputNames=['A01','A02','GND1','GND2','B02','B01'] as const;
export function bluetoothHeaderPoints(kind:BluetoothBoardKind){const layout=bluetoothBoardLayouts[kind];return layout.elements.filter(e=>e.name.startsWith('JP')).flatMap(e=>e.pads.map((pad,i)=>{const [x,y]=bluetoothPadPosition(e,pad),names=kind==='bluefruit'?bluetoothRadioHeaderNames:e.name==='JP1'?bluetoothDriverInputNames:bluetoothDriverOutputNames;return {name:names[i],net:pad.net,element:e.name,pad:pad.name,at:bluetoothBoardPoint(kind,x,y,.18)};}));}
export function bluetoothHeaderPoint(kind:BluetoothBoardKind,name:string):BoardPoint{const pin=bluetoothHeaderPoints(kind).find(p=>p.name===name);if(!pin)throw new Error('Unknown '+kind+' header '+name);return pin.at;}
