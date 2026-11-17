import type { Build } from './guided-projects';

export const soapTiming={nearMin:4,nearMax:12,clearMin:18,confirm:3,sampleMs:70,pressMs:460,refillMs:350};
export const soapAngles={rest:35,press:65};

export const soapDispenser:Build={
  id:'directory-26',
  title:'Automatic Liquid Soap Dispenser',
  outcome:'Build a tabletop dispenser that uses an ultrasonic sensor and a servo to press a soap pump once per hand presentation.',
  parts:[
    ['Arduino Uno R3','1','Reads the echo distance and remembers whether the previous hand has moved away.'],
    ['HC-SR04 ultrasonic module','1','Measures the nearest reflecting surface below the sensor.'],
    ['Positional micro servo','1','Moves a short horn over a low-force soap pump head.'],
    ['Regulated 5 V servo supply','1','Powers the servo independently. Choose a regulated supply rated for the servo stall current.'],
    ['Liquid soap pump bottle','1','The spring-loaded pump meters the liquid. Reuse a small bottle with a smooth, easy-to-press head.'],
    ['Breadboard and jumper wires','1 set','Joins the sonar pins and grounds. Use a USB data cable for Uno power and programming.'],
  ],
  assembly:[
    ['Mount the bottle and catch tray','Secure a small, easy-action pump bottle upright in a shallow catch tray. Build a rigid bracket that spans the pump head, with the breadboard and wiring raised off the tray. Rotate the nozzle toward the front.','The bottle stays put when you press the head by hand. The liquid lands inside the tray.',[4,2]],
    ['Align the sensor','Mount the sonar beside the nozzle with its two cylinders facing down and clear of the servo horn. Put a flat target in the tray about 25 cm below the sensor. With the tray empty, confirm the target produces a stable clear reading.','At rest Serial Monitor reports at least 18 cm. A hand or dry card under the nozzle gives a flat echo in the 4–12 cm trigger range.',[0,1]],
    ['Connect and adjust the servo','With both supplies off, wire TRIG, ECHO and the servo as shown. Upload with the servo horn disconnected. Reconnect the servo supply, start at 35°, and fit a short horn just above the pump head. Test both angles against an empty pump and adjust before adding liquid.','The horn presses the pump partway without stalling and leaves it free to spring back. Keep the electronics clear of splashes.',[0,1,2,3,5]],
    ['Try one stroke per hand','Prime the pump manually if needed. Hold a dry target in range, wait for the press and return, and keep the target still. Remove it to expose the flat tray target, then present it again.','Compared with the first presentation, a steady target produces no extra stroke. A fresh presentation after clearing produces one more stroke.',[0,1,2,4]],
  ],
  wiring:[
    ['Uno 5 V and GND','HC-SR04 VCC and GND','Sensor power'],
    ['Uno D2','HC-SR04 TRIG','Starts the ultrasonic pulse'],
    ['HC-SR04 ECHO','Uno D3','Pulse duration input'],
    ['Uno D9','Servo signal','Pump position command'],
    ['Independent regulated 5 V and negative','Servo power and ground','Servo motor power'],
    ['Servo supply negative','Uno GND','Shared signal reference'],
    ['Uno USB','Computer USB','Board power and upload'],
  ],
  test:'Use Serial Monitor at 115200 baud. Verify three clear samples at 18 cm or farther arm the pump. Move a dry target to 8 cm to trigger a single stroke. Keep it there for several seconds to verify it does not trigger again. Withdraw it and present it again. A missing echo cannot trigger or rearm the dispenser.',
  demo:['Distance','Tray target','Hand in range','Ready for a hand','One pump stroke'],
};

export const soapDispenserProgram={
  filename:'automatic_soap_dispenser.ino',
  setup:'Install Arduino Servo. Upload with the servo supply off. Begin with the tray target visible, then follow the empty-pump motion check before filling the bottle. The sketch prints range in centimeters at 115200 baud.',
  source:`#include <Servo.h>
const byte TRIG=2, ECHO=3, SERVO=9;
const int REST=${soapAngles.rest}, PRESS=${soapAngles.press};
const int NEAR_MIN=${soapTiming.nearMin}, NEAR_MAX=${soapTiming.nearMax}, CLEAR_MIN=${soapTiming.clearMin};
const byte CONFIRM=${soapTiming.confirm};
const unsigned long SAMPLE_MS=${soapTiming.sampleMs}, PRESS_MS=${soapTiming.pressMs}, REFILL_MS=${soapTiming.refillMs};
enum State { WAIT_CLEAR, READY, PRESSING, REFILLING };
State state=WAIT_CLEAR;
Servo pump;
byte consecutive=0;
unsigned long lastRead=0, changed=0;

int distanceCm(){
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10); digitalWrite(TRIG, LOW);
  unsigned long echo=pulseIn(ECHO, HIGH, 7000);
  return echo ? (echo*343UL+10000UL)/20000UL : -1;
}
void setup(){
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pump.write(REST); pump.attach(SERVO);
  Serial.begin(115200);
}
void loop(){
  const unsigned long now=millis();
  if(state==PRESSING && now-changed>=PRESS_MS){
    pump.write(REST); state=REFILLING; changed=now;
  }
  if(state==REFILLING && now-changed>=REFILL_MS) state=WAIT_CLEAR;
  if(now-lastRead<SAMPLE_MS) return;
  lastRead=now;
  const int cm=distanceCm();
  Serial.print("cm: "); Serial.println(cm);
  if(state!=WAIT_CLEAR && state!=READY) return;
  const bool qualifies=state==WAIT_CLEAR ? cm>=CLEAR_MIN : cm>=NEAR_MIN && cm<=NEAR_MAX;
  if(!qualifies){ consecutive=0; return; }
  if(++consecutive<CONFIRM) return;
  consecutive=0;
  if(state==WAIT_CLEAR){ state=READY; Serial.println("Ready"); }
  else {
    pump.write(PRESS); state=PRESSING; changed=millis();
    Serial.println("One pump stroke");
  }
}
`,
};
