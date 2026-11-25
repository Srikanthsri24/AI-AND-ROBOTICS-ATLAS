/** Illustrative same-subnet Ethernet topology, native mm. No browser networking. */
export type BinNetworkPoint=[number,number,number];
export const binLan={at:[-450,0,30] as const,ports:[[-470,12,61],[-430,12,61]] as const,computer:[-470,0,160] as const,computerPort:[-526,8,155] as const};
export type BinNetworkEnd={at:BinNetworkPoint;out:BinNetworkPoint};
export function binNetworkExit(end:BinNetworkEnd):BinNetworkPoint{return[end.at[0]+end.out[0]*15,end.at[1]+1,end.at[2]+end.out[2]*15];}
export function binNetworkCables(connected=true){const a:BinNetworkEnd={at:[-345-(connected?0:22),32,-42],out:[-1,0,0]},b:BinNetworkEnd={at:[...binLan.ports[0]],out:[0,0,1]},c:BinNetworkEnd={at:[...binLan.ports[1]],out:[0,0,1]},d:BinNetworkEnd={at:[...binLan.computerPort],out:[-1,0,0]};return[{id:'bin-network-shield-cable',name:'Shield to local LAN cable',a,b,via:[[-390,22,-42],[-395,10,-10],[-395,10,90],[-470,12,95]] as BinNetworkPoint[]},{id:'bin-network-receiver-cable',name:'LAN to receiver computer cable',a:c,b:d,via:[[-430,10,95],[-550,7,95],[-550,7,140]] as BinNetworkPoint[]}];}
export const binNetworkParts=[
 ['bin-lan-case','Illustrated local LAN switch','The dry local-network model joins the shield and receiving computer.','This static frontend does not open sockets or create an Internet connection.'],
 ['bin-lan-ports','Local Ethernet ports','Two separate open jacks receive the two illustrated network cables.','One joins the Uno shield; the other joins the receiver computer.'],
 ['bin-lan-lights','Local link lamps','The first port follows the powered shield link; the receiver port represents the separately powered computer.','A lost shield link prevents fresh remote records while the Uno still reads the lid and load.'],
 ['bin-receiver-body','Local monitoring computer','Represents a computer running the downloadable Python receiver.','Use the same trusted subnet and UDP port 4212 on real hardware. The browser does not run Python.'],
 ['bin-receiver-keys','Monitor keyboard and touchpad','Identify the operator computer.','The real receiver runs in a terminal; Ctrl+C closes it.'],
 ['bin-receiver-screen','Last accepted fill record','Retains the last valid record and marks it stale after two seconds without a new accepted record in the browser model.','The remote record is read-only. A stale screen does not disable the local collection LED.'],
 ['bin-network-shield-cable','Shield to LAN Ethernet cable','An eight-contact plug seats in the actual shield jack and the first local-switch port.','Disconnecting its shield end changes only this cable. Local measurement is independent of network freshness.'],
 ['bin-network-receiver-cable','LAN to monitor Ethernet cable','Connects the other local-switch port to the receiving computer.','One-way status records carry uptime, gap, fill percentage and state to UDP 4212.'],
] as const;
export type BinReceived={uptimeMs:number;gapMm:number;percent:number;status:'AVAILABLE'|'COLLECTION_NEEDED'|'LID_OPEN'|'SETTLING'|'SENSOR_FAULT'};
export type BinReceiver={sequence:number;seenAtMs:number|null;record:BinReceived|null};
export const binReceiverInitial=():BinReceiver=>({sequence:0,seenAtMs:null,record:null});
/** ASCII numeric CSV from the sketch uses the downloadable receiver ranges, bounded by
 * JavaScript safe integer representation. Freshness tracks accepted records.
 */
export function binParsePacket(packet:string):BinReceived|null{if(/[^\x00-\x7F]/.test(packet))return null;const p=packet.trim().split(',');if(p.length!==4||!p.slice(0,3).every(v=>/^[-+]?\d+$/.test(v.trim())))return null;const uptimeMs=Number(p[0]),gapMm=Number(p[1]),percent=Number(p[2]),status=p[3];if(!Number.isSafeInteger(uptimeMs)||uptimeMs<0||!Number.isSafeInteger(gapMm)||gapMm< -1||!Number.isSafeInteger(percent)||percent< -1||percent>100||!['AVAILABLE','COLLECTION_NEEDED','LID_OPEN','SETTLING','SENSOR_FAULT'].includes(status))return null;return{uptimeMs,gapMm,percent,status:status as BinReceived['status']};}
export function binReceive(previous:BinReceiver,packet:string|null,sequence:number,nowMs:number):BinReceiver{if(!Number.isInteger(sequence)||sequence<0||!Number.isFinite(nowMs)||nowMs<0)throw Error('Invalid receiver sequence or time');if(sequence===previous.sequence)return previous;if(sequence<previous.sequence)return{...previous,sequence};const record=packet===null?null:binParsePacket(packet);return record?{sequence,seenAtMs:nowMs,record}:{...previous,sequence};}
export function binReceiverFresh(receiver:BinReceiver,nowMs:number){return receiver.seenAtMs!==null&&nowMs>=receiver.seenAtMs&&nowMs-receiver.seenAtMs<2000;}
/** Seating is reserved for the final two cables in the wiring stage, 5–6. */
export function binEthernetSeating(index:number,progress:number){if(![0,1].includes(index)||!Number.isFinite(progress)||progress<0||progress>7)throw Error('Invalid Ethernet assembly step');const t=(progress-(5.84+index*.08))/.08,ease=(n:number)=>{const v=Math.max(0,Math.min(1,n));return v*v*(3-2*v);};return{a:12*(1-ease(t*2)),b:12*(1-ease((t-.5)*2))};}
