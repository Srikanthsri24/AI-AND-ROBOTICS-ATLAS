import {railwayControlJumpers,type RailwayWithdrawal} from './railway-control-jumpers';
import {railwaySensorFeeds} from './railway-sensor-feeds';
import {railwaySensorLeads} from './railway-sensor-leads';
import {railwayUsbConnected} from './railway-usb';
import type {RailwayInputs} from './railway-workshop';
const cables=[...railwayControlJumpers,...railwaySensorFeeds,...railwaySensorLeads];
export type RailwayCircuitLinks=Readonly<Record<string,RailwayWithdrawal>>;
export function railwayCircuitLinks(seated=true):RailwayCircuitLinks{return Object.fromEntries(cables.map(w=>[w.id,{a:seated?0:w.a.travel,b:seated?0:w.b.travel}]));}
/** Missing or partly withdrawn cables are open. The authored receiver model
 * releases an unpowered/open signal to INPUT_PULLUP HIGH; it does not model
 * analogue leakage or claim a fault-tolerant railway safety circuit. */
export function railwayCircuit(raw:RailwayInputs,links:RailwayCircuitLinks,usbUno=0,usbHost=0){
 for(const [id,w] of Object.entries(links)){const cable=cables.find(c=>c.id===id);if(!cable)throw Error('Unknown railway cable '+id);for(const end of ['a','b'] as const)if(!Number.isFinite(w[end])||w[end]<0||w[end]>cable[end].travel)throw Error('Invalid withdrawal for '+id+' '+end);}
 const connected=Object.fromEntries(cables.map(c=>{const w=links[c.id];return[c.id,!!w&&w.a===0&&w.b===0];}));
 const logicPowered=railwayUsbConnected(raw.usb,usbUno,usbHost),supply=logicPowered&&connected['railway-sensor-feed-vcc'],ground=logicPowered&&connected['railway-sensor-feed-ground'];
 const devices=Object.fromEntries((['a','b'] as const).flatMap(station=>(['emitter','receiver'] as const).map(role=>{const key=station+'-'+role,id='railway-sensor-'+key;return[key,supply&&ground&&connected[id+'-vcc']&&connected[id+'-ground']];})));
 const entrySignalConnected=!!(devices['a-emitter']&&devices['a-receiver']&&connected['railway-sensor-a-signal']),exitSignalConnected=!!(devices['b-emitter']&&devices['b-receiver']&&connected['railway-sensor-b-signal']);
 const servoSupplyAtLoad=raw.servoPower&&connected['railway-wire-servo-positive']&&connected['railway-wire-servo-return'],commonReference=raw.commonGround&&connected['railway-wire-reference'],servoSignalConnected=connected['railway-wire-servo-signal'],warningConnected=connected['railway-wire-warning-drive']&&connected['railway-wire-warning-return'];
 const effective:RailwayInputs={...raw,usb:logicPowered,servoPower:servoSupplyAtLoad,commonGround:commonReference,entrySignalConnected,exitSignalConnected,servoSignalConnected,warningConnected};
 return{connected,logicPowered,sourceOutputOn:raw.servoPower,servoSupplyAtLoad,commonReference,servoSignalConnected,warningConnected,devices,entrySignalConnected,exitSignalConnected,effective,openCables:cables.filter(c=>!connected[c.id]).map(c=>({id:c.id,name:c.name}))};
}
