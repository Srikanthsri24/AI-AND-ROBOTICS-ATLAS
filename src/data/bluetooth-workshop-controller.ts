import {bluetoothCarCommands,bluetoothCarPulseMs,type BluetoothCarCommand} from './bluetooth-car';
/** Mirrors bluetooth_rc_car.ino. Events are a frontend UART inspector, not firmware acknowledgements. */
export type BluetoothWorkshopState={left:-1|0|1;right:-1|0|1;moving:boolean;lastDrive:number;lastByte:number|null;rx:number[];stopReason:'startup'|'stop command'|'unsupported byte'|'pulse timeout'|null;events:{at:number;byte:number|null;text:string}[]};
export const bluetoothWorkshopSpeed=110,bluetoothWorkshopBaud=9600;
export function bluetoothWorkshopInitial():BluetoothWorkshopState{return {left:0,right:0,moving:false,lastDrive:0,lastByte:null,rx:[],stopReason:'startup',events:[{at:0,byte:null,text:'Outputs disabled. Waiting for UART commands.'}]};}
export function bluetoothWorkshopTick(previous:BluetoothWorkshopState,incoming:string|readonly number[],now:number):BluetoothWorkshopState{
 now=now>>>0;const bytes=typeof incoming==='string'?Array.from(new TextEncoder().encode(incoming)):incoming.map(b=>b&255),s:BluetoothWorkshopState={...previous,rx:[...previous.rx,...bytes],events:[...previous.events]};
 const drive=(left:-1|0|1,right:-1|0|1,reason:BluetoothWorkshopState['stopReason'])=>{s.left=left;s.right=right;s.moving=left!==0||right!==0;s.lastDrive=now;s.stopReason=reason;};
 if(s.rx.length){const byte=s.rx.shift()!;s.lastByte=byte;const command=bluetoothCarCommands.find(c=>c.key.charCodeAt(0)===byte);if(command){drive(command.left,command.right,command.key==='S'?'stop command':null);s.events.push({at:now,byte,text:'RX '+command.key+' → '+command.label});}else if(byte===13||byte===10)s.events.push({at:now,byte,text:byte===13?'CR ignored; pulse deadline unchanged.':'LF ignored; pulse deadline unchanged.'});else {drive(0,0,'unsupported byte');s.events.push({at:now,byte,text:'Unsupported byte 0x'+byte.toString(16).padStart(2,'0').toUpperCase()+' → outputs disabled.'});}}
 if(s.moving&&((now-s.lastDrive)>>>0)>=bluetoothCarPulseMs){drive(0,0,'pulse timeout');s.events.push({at:now,byte:null,text:bluetoothCarPulseMs+' ms pulse expired → STBY LOW; outputs disabled.'});}return s;
}
export function bluetoothWorkshopPins(s:BluetoothWorkshopState){return {D5:s.left===0?0:bluetoothWorkshopSpeed,D6:s.right===0?0:bluetoothWorkshopSpeed,D4:s.left>0,D7:s.left<0,D8:s.right>0,D11:s.right<0,D12:s.moving};}
export function bluetoothWorkshopCommand(byte:number):BluetoothCarCommand|null{return bluetoothCarCommands.find(c=>c.key.charCodeAt(0)===byte)?.key??null;}
