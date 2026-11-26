import {rfidBreadboardHole,type RfidPoint} from './rfid-workbench-layout';
export const rfidIndicators=(['red','green'] as const).map((color,n)=>({color,pin:n?'D7':'D6',id:'rfid-'+color+'-led',anode:rfidBreadboardHole(n?10:4,1,0),cathode:rfidBreadboardHole(n?11:5,1,0),resistor:{id:'rfid-'+color+'-resistor',ohms:220,from:rfidBreadboardHole(n?6:0,1,2),to:rfidBreadboardHole(n?10:4,1,2),bands:['#b7464a','#b7464a','#795038','#b89b58']}}));
export function rfidLedCentre(anode:RfidPoint,cathode:RfidPoint):RfidPoint{return [(anode[0]+cathode[0])/2,anode[1]+5,anode[2]];}
