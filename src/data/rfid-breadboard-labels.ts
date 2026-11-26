import {rfidBreadboardHole,rfidWorkbench,type RfidPoint} from './rfid-workbench-layout';
const b=rfidWorkbench.breadboard;
/** Authored workshop coordinates, not a claim about a vendor's printed legend. */
export const rfidBreadboardLabels=[
 ...Array.from({length:17},(_,column)=>({text:String(column+1),position:[rfidBreadboardHole(column,1,0)[0],b[1]+10.12,b[2]-16.2] as RfidPoint,kind:'column' as const})),
 ...Array.from({length:10},(_,n)=>{const bank=n<5?1:-1,row=n%5;return {text:'ABCDEFGHIJ'[n],position:[b[0]+22.6,b[1]+10.12,rfidBreadboardHole(0,bank,row)[2]] as RfidPoint,kind:'row' as const};}),
];
