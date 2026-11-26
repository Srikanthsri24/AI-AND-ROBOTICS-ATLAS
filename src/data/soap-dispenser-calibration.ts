import {soapAngles} from './soap-dispenser';
import {soapDispenserDegreesPerUs} from './soap-dispenser-session';
export const soapCalibrationProgram={
 filename:'soap_dispenser_calibrate.ino',language:'Arduino C++',
 instructions:[
 'Remove the horn, retaining screw and roller linkage from the servo shaft. Keep the pump free to return. Complete the D9 signal, independent regulated 5 V supply and common-ground wiring.',
 'Switch the servo supply off. Connect the USB data cable, choose Arduino Uno and its port in Arduino IDE, and upload this separate calibration sketch.',
 'Open Serial Monitor at 115200 baud. Switch the servo supply on. Send the uppercase letter R to request 35°, then P to request 65°. The bare shaft should move; the disconnected pump should stay still.',
 'Send R again and let the shaft return to 35°. Switch the servo supply off before fitting the short horn and roller at the rest position. Secure the retaining screw.',
 'Keep servo power off while uploading automatic_soap_dispenser.ino. Restore servo power only after checking that the roller rests on the pump head without preloading it.',
 'Test the empty pump first. Clear the sensor, then present the calibration card in range. Watch a single press and full return. Adjust the physical linkage if the pump binds; the program does not measure servo torque or calibrate a real device automatically.',
 ] as const,
 source:`#include <Servo.h>
Servo pump;
const byte SERVO_PIN=9;
const int REST=${soapAngles.rest}, PRESS=${soapAngles.press};
void setup(){
  Serial.begin(115200);
  pump.write(REST); pump.attach(SERVO_PIN);
  Serial.println("Bare shaft: R = 35 degrees, P = 65 degrees. Horn removed.");
}
void loop(){
  if(!Serial.available()) return;
  const char command=Serial.read();
  if(command=='R'){
    pump.write(REST);
    Serial.println("Rest command: 35 degrees.");
  } else if(command=='P'){
    pump.write(PRESS);
    Serial.println("Press command: 65 degrees. Pump must remain disconnected.");
  }
}
`,
} as const;
export type SoapCalibration={powered:boolean;servoPower:boolean;angle:number;command:number;seenRest:boolean;seenPress:boolean;returned:boolean;rows:readonly string[]};
export const soapCalibrationInitial=():SoapCalibration=>({powered:false,servoPower:false,angle:35,command:35,seenRest:false,seenPress:false,returned:false,rows:[]});
export function soapCalibrationPower(s:SoapCalibration,usb:boolean,servoPower:boolean):SoapCalibration{return {...s,powered:usb,servoPower,command:!usb||!s.powered?35:s.command,rows:!usb?[]:!s.powered?['Bare shaft: R = 35 degrees, P = 65 degrees. Horn removed.']:s.rows};}
export function soapCalibrationSend(s:SoapCalibration,input:string):SoapCalibration{if(!s.powered)return s;let next=s;for(const command of input){if(command==='R'||command==='P')next={...next,command:command==='R'?35:65,rows:[...next.rows,command==='R'?'Rest command: 35 degrees.':'Press command: 65 degrees. Pump must remain disconnected.'].slice(-40)};}return next;}
export function soapCalibrationAdvance(s:SoapCalibration,ms:number):SoapCalibration{if(!Number.isFinite(ms)||ms<0)throw new RangeError('Invalid calibration elapsed time');if(!s.powered||!s.servoPower)return s;const diff=s.command-s.angle,step=ms*1000*soapDispenserDegreesPerUs,angle=Math.abs(diff)<=step+1e-10?s.command:Math.round((s.angle+Math.sign(diff)*step)*1e8)/1e8;return {...s,angle,seenRest:s.seenRest||angle===35,seenPress:s.seenPress||angle===65,returned:s.returned||s.seenPress&&angle===35};}
export function soapCalibrationCanFit(s:SoapCalibration){return s.powered&&!s.servoPower&&s.seenRest&&s.seenPress&&s.returned&&s.angle===35&&s.command===35;}
