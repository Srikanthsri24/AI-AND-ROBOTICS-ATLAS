/** Authored open four-AA teaching holder in native mm. No battery discharge model. */
export const aquaBatteryAt=[-310,0,135] as const;
export const aquaCells=Array.from({length:4},(_,i)=>({id:`aqua-aa-cell-${i+1}`,x:(i-1.5)*14.5,positiveZ:(i%2?1:-1)*26.4,negativeZ:(i%2?-1:1)*28}));
export const aquaSeriesLinks=aquaCells.slice(0,3).map((cell,i)=>({id:`aqua-aa-series-${i+1}`,from:i,to:i+1,x:(cell.x+aquaCells[i+1].x)/2,z:cell.negativeZ}));
export const aquaBatteryTerminals={positive:[0,3.3,45] as const,negative:[12,5.3,46] as const};
export function aquaBatteryContact(kind:'positive'|'negative'):[number,number,number]{const p=aquaBatteryTerminals[kind];return[aquaBatteryAt[0]+p[0],aquaBatteryAt[1]+p[1],aquaBatteryAt[2]+p[2]];}
export const aquaBatteryParts=[
 ['aqua-aa-holder','Open four-AA holder','Holds four alternating alkaline AA cells. Four nominal 1.5 V cells make a nominal 6 V motor source.','Only the motor VM path uses this source; USB still supplies the Uno logic.'],
 ...aquaCells.map((c,i)=>[c.id,`AA cell ${i+1}`,'A separate alkaline cell with a raised positive button and flat negative end.',`Alternating orientation joins cell ${i+1} into the four-cell series chain. Follow the visible + / − markings.`]),
 ...aquaCells.flatMap((c,i)=>[[`aqua-aa-positive-${i+1}`,`Cell ${i+1} positive holder contact`,'A flat metal plate touches the raised cell button.',i===0?'This end feeds the motor switch input.':`Receives the preceding cell’s negative connection through series link ${i}.`],[`aqua-aa-negative-${i+1}`,`Cell ${i+1} negative spring contact`,'A visible compression spring touches the flat negative cell end.',i===3?'This end becomes the pack negative / common return.':`Joins cell ${i+2} positive through series link ${i+1}.`]]),
 ...aquaSeriesLinks.map((l,i)=>[l.id,`Series bridge ${i+1}`,'A distinct metal strip joins adjacent cells at the same end of the holder.',`Cell ${i+1} negative → cell ${i+2} positive. It does not short either cell’s two ends.`]),
 ['aqua-aa-switch-case','Motor-supply slide switch','The switch interrupts the AA positive path independently of USB logic.','Input comes from cell 1 positive; the centre output will feed driver VM.'],
 ['aqua-aa-switch-slider','Motor power slider','Shows whether the separate motor source is connected.','Turning this off can stop physical paddle motion while the Uno still reports its RUNNING command.'],
 ['aqua-aa-switch-input','Switch positive input lug','Receives the pack positive lead.','Internal red wire from cell 1 positive.'],
 ['aqua-aa-switch-output','Switched motor positive lug','The centre solder tab is the switched output.','Connects to driver VM, never Uno 5 V.'],
 ['aqua-aa-switch-unused','Unused switch lug','The spare slide-switch throw is intentionally unwired.','Leave it unconnected in this one-pole motor switch circuit.'],
 ['aqua-aa-return-tab','Pack negative output tab','Provides the external motor supply return.','Joins driver power ground and the Uno common reference.'],
 ['aqua-aa-positive-lead','Pack positive internal lead','Runs above the cells and around the holder to the switch input.','Cell 1 positive → switch input.'],
 ['aqua-aa-return-lead','Pack negative internal lead','Runs from the last cell spring to the external return tab.','Cell 4 negative → pack negative output.'],
];
