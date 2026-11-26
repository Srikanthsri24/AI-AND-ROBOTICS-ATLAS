import {soapSonarWires,soapSonarWirePose,soapSonarFittingTotal} from './soap-dispenser-sonar-wires';
import {soapCircuitWires,soapCircuitWirePose,soapCircuitFittingTotal} from './soap-dispenser-circuit-wires';
import type {SoapDispenserSettings} from './soap-dispenser-session';
/** Connectivity follows fully seated ends (including tightened supply clamps).
 * Explicit faults represent unplugged leads without changing the nominal supply switch. */
export function soapDispenserWiring(sonarCursor=soapSonarFittingTotal,circuitCursor=soapCircuitFittingTotal,disconnected:readonly string[]=[]){
 const entries=[...soapSonarWires.map((w,i)=>({id:w.id,...soapSonarWirePose(i,sonarCursor)})),...soapCircuitWires.map((w,i)=>({id:w.id,...soapCircuitWirePose(i,circuitCursor)}))],known=new Set(entries.map(w=>w.id));for(const id of disconnected)if(!known.has(id))throw new RangeError('Unknown disconnected dispenser jumper '+id);
 const disabled=new Set(disconnected),connections=Object.fromEntries(entries.map(w=>[w.id,w.sourceSeated&&w.destinationSeated&&!disabled.has(w.id)])),has=(id:string)=>!!connections[id],unoGround=has('soap-wire-uno-ground'),servoReturn=has('soap-wire-servo-negative');
 return {connections,connected:entries.filter(w=>connections[w.id]).length,total:entries.length,flags:{sensorPower:has('soap-wire-sonar-vcc'),sensorGround:has('soap-wire-sonar-gnd')&&unoGround,trigConnected:has('soap-wire-sonar-trig'),echoConnected:has('soap-wire-sonar-echo'),servoGround:servoReturn&&unoGround&&has('soap-wire-supply-reference'),servoPower:servoReturn&&has('soap-wire-servo-positive'),servoSignal:has('soap-wire-servo-signal')}};
}
export function soapSettingsForWiring(settings:SoapDispenserSettings,sonarCursor=soapSonarFittingTotal,circuitCursor=soapCircuitFittingTotal,disconnected:readonly string[]=[]):SoapDispenserSettings{const flags=soapDispenserWiring(sonarCursor,circuitCursor,disconnected).flags,result={...settings};for(const key of ['sensorPower','sensorGround','trigConnected','echoConnected','servoGround','servoPower','servoSignal'] as const)result[key]=settings[key]&&flags[key];return result;}
