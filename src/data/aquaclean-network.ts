/** Illustrative same-subnet Ethernet topology, native mm. No browser networking. */
export type AquaNetworkPoint=[number,number,number];
export const aquaLan={at:[-450,0,30] as const,ports:[[-470,12,61],[-430,12,61]] as const,computer:[-470,0,160] as const,computerPort:[-526,8,155] as const};
export type AquaNetworkEnd={at:AquaNetworkPoint;out:AquaNetworkPoint};
export function aquaNetworkExit(end:AquaNetworkEnd):AquaNetworkPoint{return[end.at[0]+end.out[0]*15,end.at[1]+1,end.at[2]+end.out[2]*15];}
export function aquaNetworkCables(connected=true){const a:AquaNetworkEnd={at:[-345-(connected?0:22),32,-42],out:[-1,0,0]},b:AquaNetworkEnd={at:[...aquaLan.ports[0]],out:[0,0,1]},c:AquaNetworkEnd={at:[...aquaLan.ports[1]],out:[0,0,1]},d:AquaNetworkEnd={at:[...aquaLan.computerPort],out:[-1,0,0]};return[{id:'aqua-network-shield-cable',name:'Shield to local LAN cable',a,b,via:[[-390,22,-42],[-395,10,-10],[-395,10,90],[-470,12,95]] as AquaNetworkPoint[]},{id:'aqua-network-receiver-cable',name:'LAN to receiver computer cable',a:c,b:d,via:[[-430,10,95],[-550,7,95],[-550,7,140]] as AquaNetworkPoint[]}];}
export const aquaNetworkParts=[
 ['aqua-lan-case','Illustrated local LAN switch','Represents the already powered local network connecting the shield and receiving computer.','This static frontend illustrates same-subnet connectivity; it does not create an Internet connection or send real UDP packets.'],
 ['aqua-lan-ports','Two local Ethernet ports','Two open, separate jacks connect the shield and receiving computer.','One cable from the shield; one cable to the receiver computer.'],
 ['aqua-lan-lights','Illustrated network link lamps','Show the model link state independently of the motor-power switch.','Loss of Ethernet stops fresh remote readings; the Uno still performs its local basket checks.'],
 ['aqua-receiver-body','Local receiver computer','Represents the computer running the downloadable Python receiver.','It listens on UDP port 4210 on the same trusted subnet. The workshop does not execute Python or open sockets in your browser.'],
 ['aqua-receiver-keys','Receiver keyboard and touchpad','Identify the operator workstation used for local monitoring.','The real receiver runs from a terminal; use Ctrl+C to stop the supplied Python script.'],
 ['aqua-receiver-screen','Last received basket record','Keeps the last received record visible and explicitly marks it stale after two seconds without a new packet.','A stale remote display does not issue a motor command. Check Serial Monitor and the local link.'],
 ['aqua-network-shield-cable','Shield to local LAN cable','Eight-contact illustrated Ethernet plugs join the shield and first LAN jack.','Unplugging the shield end changes only this cable; motor control remains local.'],
 ['aqua-network-receiver-cable','LAN to receiver computer cable','The second cable joins the receiving computer to the same local network.','One-way status records travel to UDP port 4210; this cable is not a motor-control input.'],
] as const;
export type AquaReceived={uptimeMs:number;gapMm:number;status:'SENSOR_FAULT'|'FULL'|'RUNNING'|'STOPPED'};
export type AquaReceiver={sequence:number;seenAtMs:number|null;record:AquaReceived|null};
export const aquaReceiverInitial=():AquaReceiver=>({sequence:0,seenAtMs:null,record:null});
/** Follows the downloadable receiver's field/range validation. */
export function aquaParsePacket(packet:string):AquaReceived|null{const p=packet.trim().split(',');if(p.length!==3||!/^[-+]?\d+$/.test(p[0].trim())||!/^[-+]?\d+$/.test(p[1].trim()))return null;const uptimeMs=Number(p[0]),gapMm=Number(p[1]),status=p[2];if(!Number.isSafeInteger(uptimeMs)||uptimeMs<0||!Number.isSafeInteger(gapMm)||gapMm< -1||gapMm>260||!['SENSOR_FAULT','FULL','RUNNING','STOPPED'].includes(status))return null;return{uptimeMs,gapMm,status:status as AquaReceived['status']};}
export function aquaReceive(previous:AquaReceiver,packet:string|null,sequence:number,nowMs:number):AquaReceiver{if(!Number.isInteger(sequence)||sequence<0||!Number.isFinite(nowMs)||nowMs<0)throw Error('Invalid receiver sequence/time.');if(sequence===previous.sequence)return previous;if(sequence<previous.sequence)return{...previous,sequence};const record=packet===null?null:aquaParsePacket(packet);return record?{sequence,seenAtMs:nowMs,record}:{...previous,sequence};}
export function aquaReceiverFresh(receiver:AquaReceiver,nowMs:number){return receiver.seenAtMs!==null&&nowMs>=receiver.seenAtMs&&nowMs-receiver.seenAtMs<2000;}
