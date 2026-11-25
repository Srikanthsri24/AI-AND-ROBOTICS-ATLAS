import { industrialParsePacket } from './industrial-workshop';
import { industrialUnoAt } from './industrial-controller';
export type IndustrialNetworkPoint=[number,number,number];
export type IndustrialNetworkEnd={at:IndustrialNetworkPoint;out:IndustrialNetworkPoint};
/** Authored same-subnet bench layout; no real browser networking. */
export const industrialLan={at:[-55,0,-130] as const,ports:[[-75,12,-99],[-35,12,-99]] as const,computer:[222,0,80] as const,computerPort:[166,8,75] as const};
export function industrialNetworkExit(end:IndustrialNetworkEnd):IndustrialNetworkPoint{return[end.at[0]+end.out[0]*15,end.at[1]+1,end.at[2]+end.out[2]*15];}
export function industrialNetworkCables(connected=true){const a:IndustrialNetworkEnd={at:[industrialUnoAt[0]-35-(connected?0:22),32,industrialUnoAt[2]+8],out:[-1,0,0]},b:IndustrialNetworkEnd={at:[...industrialLan.ports[0]],out:[0,0,1]},c:IndustrialNetworkEnd={at:[...industrialLan.ports[1]],out:[0,0,1]},d:IndustrialNetworkEnd={at:[...industrialLan.computerPort],out:[-1,0,0]};return[
 {id:'industrial-network-shield-cable',a,b,via:[[-220,22,-67],[-215,18,-150],[-108,14,-150],[-108,13,-65],[-75,13,-60]] as IndustrialNetworkPoint[]},
 {id:'industrial-network-receiver-cable',a:c,b:d,via:[[-55,13,-55],[-55,10,125],[140,9,125]] as IndustrialNetworkPoint[]},
 ];}
export function industrialNetworkPoints(w:ReturnType<typeof industrialNetworkCables>[number]):IndustrialNetworkPoint[]{const lift=(e:IndustrialNetworkEnd):IndustrialNetworkPoint=>[e.at[0]+e.out[0]*25,e.at[1]+1,e.at[2]+e.out[2]*25];return[industrialNetworkExit(w.a),lift(w.a),...w.via,lift(w.b),industrialNetworkExit(w.b)];}
const smooth=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
export function industrialEthernetSeating(index:number,progress:number){if(![0,1].includes(index)||!Number.isFinite(progress)||progress<0||progress>7)throw Error('Invalid industrial Ethernet insertion');const t=(progress-(5.6+index*.2))/.2;return{a:20*(1-smooth(t*2)),b:(index===1?14:20)*(1-smooth((t-.5)*2))};}
export const industrialNetworkParts=[
 ['industrial-lan-case','Local LAN switch enclosure','The illustrated two-port switch joins the panel and independent monitoring computer on the same local network.','Its role is to carry read-only status copies. The browser does not open sockets or create a real network connection.'],
 ['industrial-lan-ports','Open local Ethernet ports','Each separate open jack has eight metal contacts aligned with its cable plug.','One port joins the Uno shield; the other joins the receiver. Both plug ends seat individually during assembly.'],
 ['industrial-lan-lights','LAN power / link indicators','The first port follows the powered shield link, while the receiver-side link represents the independently powered observer.','Closing the Python receiver is a service outage, not a physical cable removal, so it does not turn off these link lamps.'],
 ['industrial-receiver-body','Independent monitoring computer','The illustrated computer has an open side Ethernet jack with eight separate socket contacts.','It represents the same-subnet computer running industrial_training_monitor.py on UDP 4214; it does not control the local trip latch.'],
 ['industrial-receiver-keys','Receiver keyboard and touchpad','Separate keycaps and a touchpad identify the operator computer running the monitor.','On the real receiver, Ctrl+C closes the process. In the browser, use the receiver-service control to drop incoming copies.'],
 ['industrial-receiver-screen','Last accepted industrial record','Shows the last received uptime, temperature index, vibration index, stop-loop flag and status.','An old RUNNING record can become stale while the current local controller is TRIPPED. The screen never silently replaces it with local values.'],
 ['industrial-network-shield-cable','Shield-to-LAN Ethernet cable','Its eight-contact plugs seat in the actual shield jack and the first local-switch port.','Unplugging at the shield moves only this cable’s panel end and tail. The local button, stop loop and indicator logic remain independent.'],
 ['industrial-network-receiver-cable','LAN-to-receiver Ethernet cable','Joins the second switch port to the receiver’s actual open side jack.','This physical cable stays seated during a receiver-service outage; lost status copies are not replayed when the service resumes.'],
] as const;

export function industrialNetworkDisplay(packet:string){const r=industrialParsePacket(packet);return{state:r?'Copied state: '+r.status:'WAITING FOR RECORD',temperature:r?'Temp index: '+r.temperature+' / 100':'Temp index: —',vibration:r?'Vibration index: '+r.vibration+' / 100':'Vibration index: —',stop:r?'Stop loop: '+(r.stopOpen?'OPEN':'CLOSED'):'Stop loop: —',uptime:r?'Board uptime: '+r.uptimeMs+' ms':'Board uptime: —',color:r?.status==='TRIPPED'?'#ef9aa9':r?.status==='RUNNING'?'#91dfbc':'#d7e0f2'};}
