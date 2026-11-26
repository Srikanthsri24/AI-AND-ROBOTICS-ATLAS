import {mq2Circuit,type Mq2CircuitReading} from './mq2-circuit';
import {mq2Advance,mq2QueueCommand,mq2SystemInitial,type Mq2System} from './mq2-system';
import {mq2UsbAdvance,mq2UsbMated,type Mq2UsbMotion} from './mq2-usb';
import type {Mq2Mode} from './mq2-wires';
export type Mq2SessionSettings={assembled:boolean;mode:Mq2Mode;dial:number;moduleOutputV:number;requestUsb:boolean;supply:boolean;commonGround:boolean};
export const mq2SessionDefaults:Mq2SessionSettings={assembled:false,mode:'dial',dial:.2,moduleOutputV:2,requestUsb:false,supply:false,commonGround:true};
export type Mq2Session={usb:Mq2UsbMotion;controller:Mq2System;remainderMs:number;elapsedMs:number};
export function mq2SessionInitial():Mq2Session{return{usb:{unoWithdrawal:12,hostWithdrawal:12},controller:mq2SystemInitial(),remainderMs:0,elapsedMs:0};}
export function mq2SessionReading(state:Mq2Session,settings:Mq2SessionSettings):Mq2CircuitReading{
 return mq2Circuit({usb:settings.assembled&&mq2UsbMated(settings.requestUsb,state.usb),commonGround:settings.commonGround,mode:settings.mode,dialPosition:settings.dial,sensorSupply:settings.supply,moduleOutputV:settings.moduleOutputV,upperOhms:10000,lowerOhms:10000,dialConnected:settings.mode==='dial',dividerConnected:settings.mode==='sensor'});
}
/** Fixed 1 ms integration keeps physical mating, first ADC sample and serial capture
 * independent of browser frame size. Fractional elapsed time is carried forward. */
export function mq2SessionAdvance(previous:Mq2Session,settings:Mq2SessionSettings,durationMs:number):Mq2Session{
 if(!Number.isFinite(durationMs)||durationMs<0)throw new RangeError('Session duration must be finite and nonnegative');
 let state={...previous},remaining=previous.remainderMs+durationMs;
 while(remaining>=1-1e-9){
  const oldPower=settings.assembled&&mq2UsbMated(settings.requestUsb,state.usb),target=settings.assembled&&settings.requestUsb?0:12;
  const usb=mq2UsbAdvance(state.usb,1,target,target),powered=settings.assembled&&mq2UsbMated(settings.requestUsb,usb);
  state={...state,usb};const reading=mq2SessionReading(state,settings);
  const controller=mq2Advance(state.controller,{usb:powered,ground:settings.commonGround,signalConnected:reading.valid,reading:reading.adc??0},powered&&oldPower?1:0);
  state={...state,controller,elapsedMs:state.elapsedMs+1};remaining-=1;
 }
 return {...state,remainderMs:Math.max(0,Math.round(remaining*1e9)/1e9)};
}
export function mq2SessionCapture(state:Mq2Session):Mq2Session{return{...state,controller:mq2QueueCommand(state.controller,'b')};}
/** A mode change physically rewires A0; require both supplies off and exposed USB. */
export function mq2CanRewire(state:Mq2Session,settings:Mq2SessionSettings){return !settings.requestUsb&&!settings.supply&&state.usb.unoWithdrawal===12&&state.usb.hostWithdrawal===12;}
/** Pressing RESET restarts the sketch without removing the Uno's supply. This is
 * useful after the separately powered module is ready; it does not calibrate it. */
export function mq2SessionRestart(state:Mq2Session,settings:Mq2SessionSettings):Mq2Session{
 const reading=mq2SessionReading(state,settings),powered=settings.assembled&&mq2UsbMated(settings.requestUsb,state.usb);
 return {...state,controller:mq2Advance(mq2SystemInitial(),{usb:powered,ground:settings.commonGround,signalConnected:reading.valid,reading:reading.adc??0},0)};
}
