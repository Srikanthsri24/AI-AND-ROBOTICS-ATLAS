import {rfidWires} from './rfid-wires';
/** A lead conducts only after BOTH ends are seated. Removing a lead breaks its
 * complete branch; breadboard strips remain connected underneath the board. */
export type RfidConnections=Readonly<Record<string,readonly [boolean,boolean]>>;
export function rfidConnectionsSeated():RfidConnections{return Object.fromEntries(rfidWires.map(w=>[w.id,[true,true] as const]));}
export function rfidConnectionState(connections:RfidConnections,dcSeated:boolean){
 const live=(id:string)=>connections[id]?.every(Boolean)===true;
 const common=live('rfid-uno-return-wire');
 return {
  servoPower:dcSeated&&live('rfid-supply-positive-wire')&&live('rfid-servo-positive-wire')&&live('rfid-supply-return-wire'),
  servoGround:common&&live('rfid-servo-return-wire'),
  servoSignal:live('rfid-servo-command-wire'),
  red:common&&live('rfid-red-drive-wire')&&live('rfid-red-return-wire'),
  green:common&&live('rfid-green-drive-wire')&&live('rfid-green-return-wire'),
 };
}
