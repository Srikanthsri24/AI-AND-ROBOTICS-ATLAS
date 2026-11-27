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
    ['Positional micro servo','1','Use a compatible mounting plate, a short 12 mm horn with an offset roller, axle/spacer/retainer and a horn screw. The servo shaft is calibrated before the linkage is fitted.'],
    ['Regulated 5 V servo supply','1','Powers the servo independently. Choose a regulated supply rated for the servo stall current.'],
    ['Liquid soap pump bottle','1','The spring-loaded pump meters the liquid. Reuse a small bottle with a smooth, easy-to-press head.'],
    ['Breadboard and jumper wires','1 set','Use nine jumpers: four sonar leads and five servo/common-reference leads. A mini breadboard joins the three negative references. Add a USB data cable for logic power and programming.'],
    ['Dispenser stand and dry mounting kit','1 set','A weighted base, two fabricated uprights/bridges, a separate raised electronics deck, four hollow Uno supports and mounting fasteners, plus four sonar spacers and corner fasteners. Match real holes and hardware; the workshop is a fitting reference, not a certified fabrication drawing.'],
    ['Dry calibration card and ruler','1 set','Use a flat dry target to check the sensor gap. The workshop includes an adjustable holder; on a physical bench, hold the card at the measured distance without touching wiring.'],
  ],
  assembly:[
    ['Build the fixed supports','Set the upright pump bottle on its weighted base. Fit the two prepared uprights and bridges behind it, then mount the bare-shaft servo and its plate. Keep the horn and roller off. Place the separate raised dry deck beside the dispensing base.','The bottle and fixed members remain still. All feet meet the bench and the dry deck stays clear of the dispensing area.',[4,2,0]],
    ['Mount the electronics and sensor','Seat the Uno on four hollow insulating supports and secure its mounting holes. Place the connection board and separate servo supply. Fit the overhead sensor bracket, four spacers, downward-facing PCB and four corner fasteners.','Both transducers face down and clear the bottle/nozzle. The PCB meets the spacer ends without components pressing into the bracket.',[0,1,3,5]],
    ['Wire, calibrate, then fit the linkage','Disconnect USB and switch the servo supply off before wiring. Connect D2 to TRIG, ECHO to D3, D9 to the servo signal, separate servo power and the shared negative reference. In the 3D Workshop load the separate calibration sketch, observe bare-shaft 35° and 65° travel, return to 35° and switch motor power off. Fit the prepared short horn/roller, then its retaining screw.','The horn is fitted at rest with motor power off. The roller rests on the pump head without preloading it. Keep separate positive rails separate.',[0,1,2,3,5]],
    ['Test empty, fill, prime and dispense','With motor power off, load the working sketch. Restore motor power, show a clear surface, then present the dry card at 8 cm for one empty-pump stroke. Park the card, switch the motor off and fill the reservoir. Restore power and run one priming cycle: its return draws soap into the dry chamber. Clear the sensor before presenting the receiving hand.','The next charged stroke delivers soap. Holding the hand still produces no extra dose; withdrawing and presenting it again permits one more stroke.',[0,1,2,4]],
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
  setup:'Arduino C++ with the Servo library. Use the separate bare-shaft calibration in the 3D Workshop first. Return to 35°, switch motor power off, fit the linkage and upload this working sketch. Begin with a clear sensor reading and perform the empty-pump check before filling and priming. Serial Monitor uses 115200 baud.',
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
