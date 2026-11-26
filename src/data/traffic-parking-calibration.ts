/** Separate bare-shaft sketch. The normal traffic program is not a calibration mode. */
export const trafficParkingCalibrationHoldMs=1500;
export const trafficParkingCalibrationProgram={
 filename:'traffic_parking_calibrate.ino',
 language:'Arduino C++',
 instructions:[
  'Leave the horn and screw off. Complete the D9 signal, separate regulated 5 V servo supply and common-ground wiring. Switch the servo supply off before uploading.',
  'Open this separate sketch in Arduino IDE, select Arduino Uno and its port, then upload using the USB data cable. The seven signal LEDs remain off during calibration.',
  'Switch the servo supply on BEFORE pressing the Uno Reset button. Keep fingers clear of the bare shaft. Reset starts a fresh 1.5-second down command at 20°, followed by a held raised command at 100°.',
  'Observe both positions. If you powered the servo after the down interval, press Reset again; the sketch cannot detect whether the motor supply was on. Open Serial Monitor at 115200 baud to read the command messages.',
  'Wait for the shaft to settle at 100°, then switch the independent servo supply OFF. Keep the shaft stationary and slide the raised horn onto it before fitting the retaining screw.',
  'With servo supply still off, upload traffic_parking.ino. Its first command is 20°. Restore servo power, watch the arm lower, and test Entry to raise it. Calibration does not save a setting to the servo or measure its angle.',
 ] as const,
 source:`#include <Servo.h>
Servo gate;
const byte SERVO_PIN=9;
const byte lamps[]={2,3,4,5,6,7,10};
const unsigned long HOLD_MS=1500;
unsigned long began=0;
bool raised=false;
void setup() {
  Serial.begin(115200);
  for (byte pin:lamps) { pinMode(pin,OUTPUT); digitalWrite(pin,LOW); }
  gate.write(20);
  gate.attach(SERVO_PIN);
  began=millis();
  Serial.println("Bare shaft: 20 degrees. Horn must be removed.");
}
void loop() {
  if (!raised && (unsigned long)(millis()-began)>=HOLD_MS) {
    gate.write(100);
    raised=true;
    Serial.println("Holding 100 degrees. Let shaft settle; switch servo supply OFF before fitting raised horn.");
  }
}
`,
} as const;
export type TrafficParkingCalibrationController={began:number;raised:boolean};
const uint=(now:number)=>{if(!Number.isInteger(now)||now<0||now>0xffffffff)throw new RangeError('Invalid unsigned calibration clock');return now>>>0;};
export function trafficParkingCalibrationInitial(now=0):TrafficParkingCalibrationController{return {began:uint(now),raised:false};}
export function trafficParkingCalibrationLoop(s:TrafficParkingCalibrationController,now:number):TrafficParkingCalibrationController{const elapsed=(uint(now)-s.began)>>>0;return !s.raised&&elapsed>=trafficParkingCalibrationHoldMs?{...s,raised:true}:s;}
export function trafficParkingCalibrationCommand(s:TrafficParkingCalibrationController){return s.raised?100:20;}
