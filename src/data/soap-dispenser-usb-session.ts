import {soapUsbRequestedAdvance,soapUsbMated,type SoapUsbMotion} from './soap-dispenser-usb';
import {soapDispenserSessionAdvance,type SoapDispenserSession,type SoapDispenserSettings} from './soap-dispenser-session';
import {soapDispenserInitial} from './soap-dispenser-workshop';
import {soapSettingsForWiring} from './soap-dispenser-wiring';
export type SoapUsbSession={usb:SoapUsbMotion;session:SoapDispenserSession};
/** Ideal USB power gating, without an invented real-world boot/upload delay.
 * Consume disconnected travel first; only the time after final seating runs the sketch. */
export function soapUsbSessionAdvance(previous:SoapUsbSession,settings:SoapDispenserSettings,elapsedMs:number,sonarFitting=8,circuitFitting=10):SoapUsbSession{
 const usb=soapUsbRequestedAdvance(previous.usb,elapsedMs,settings.usb),wired=soapSettingsForWiring(settings,sonarFitting,circuitFitting),timeToSeat=Math.round((previous.usb.unoWithdrawal+previous.usb.hostWithdrawal)/.024*1e9)/1e9;
 if(!settings.assembled||!soapUsbMated(settings.usb,usb))return {usb,session:soapDispenserSessionAdvance(previous.session,{...wired,usb:false},elapsedMs)};
 const disconnected=Math.min(elapsedMs,timeToSeat),off=disconnected>0?soapDispenserSessionAdvance(previous.session,{...wired,usb:false},disconnected):previous.session,ready={...off,controller:off.controller??soapDispenserInitial()};
 return {usb,session:soapDispenserSessionAdvance(ready,{...wired,usb:true},Math.max(0,elapsedMs-disconnected))};
}
