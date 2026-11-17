import type { Build } from './guided-projects';

export const gateLimits={openCm:8,closeCm:5,downstreamLimitCm:6,maxCm:10,emptyMm:230};

export const floodGate:Build={
  id:'directory-9',
  title:'Smart Flood Monitoring and Automatic Flood Gate System',
  outcome:'Build a tabletop spillway with two water-level sensors and a servo-driven gate. Test when the controller permits or blocks water transfer.',
  parts:[
    ['Arduino Uno R3','1','Measures the two depths, checks the downstream limit and commands the gate servo.'],
    ['HC-SR04 ultrasonic module','2','One sensor faces each compartment. The Uno pings them in sequence to avoid overlapping echoes.'],
    ['Positional micro servo','1','Turns a horn and light linkage to open or close the model flap.'],
    ['Regulated 5 V servo supply','1','Powers the servo separately from the Uno. Size it for servo stall current.'],
    ['Breadboard and jumper wires','1 set','Connects sensor power, trigger and echo signals, and the shared ground.'],
    ['Clear basin and hinged model gate','1 set','A divided basin forms upstream and downstream chambers. A lightweight flap cut from a spare plastic lid controls the opening.'],
  ],
  assembly:[
    ['Build the two-chamber spillway','Secure a lightweight removable divider across the middle of a clear basin. Leave an opening at the bottom and hang a light flap across it with a flexible top hinge. Mark both compartments up to 10 cm above the inside bottom.','Move the flap by hand. It covers the opening when closed and clears it when lifted. Test fit with the basin dry.',[5]],
    ['Fit the servo and linkage','Mount the servo on a dry rigid support. Power the servo through its own supply and test the sketch with the horn disconnected. Set the closed and open angles until the horn travel matches the flap motion. Then join the horn to the flap using a light rod.','The servo moves the flap freely without forcing either end stop. Everything electrical stays clear of splashes.',[2,3,5]],
    ['Mount and wire both sensors','Mount one sensor above the center of each chamber, transducers down and about 23 cm above the bottom. Run the trigger and echo wires to their own pins. Route servo power outside the basin and join both ground references.','Each transducer has a clear vertical path and at least 10 cm of air gap at maximum fill.',[0,1,3,4]],
    ['Calibrate the two channels','With both chambers dry, upload the sketch and read both empty gaps at 9600 baud. Enter the two measured gaps in UP_EMPTY and DOWN_EMPTY and upload again. Confirm both depths are near zero before adding water.','Both channels report plausible readings and the gate stays closed with empty chambers.',[0,1,5]],
  ],
  wiring:[
    ['Uno 5 V / GND','Both sonar VCC / GND pairs','Sensor power'],
    ['Uno D2','Upstream TRIG','Trigger the upstream measurement'],
    ['Upstream ECHO','Uno D3','Read the upstream echo'],
    ['Uno D4','Downstream TRIG','Trigger the downstream measurement'],
    ['Downstream ECHO','Uno D5','Read the downstream echo'],
    ['Uno D9','Servo signal','Gate position command'],
    ['External regulated 5 V','Servo red power lead','Servo motor supply'],
    ['Servo supply negative and servo ground','Uno GND','Common signal reference'],
    ['Computer USB','Uno USB','Logic power and serial readings'],
  ],
  test:'First use dry flat targets under the two sensors. With downstream below 6 cm, confirm the gate opens at 8 cm upstream, stays open at 7 cm, and closes at 5 cm. Then keep upstream high and bring downstream to 6 cm. The gate should close. With USB and servo power disconnected, remove one ECHO lead and repeat the powered test. The sketch should report a sensor fault and command closed. Reconnect with power off before doing a shallow-water trial.',
  demo:['Upstream depth','Low','High','Gate remains closed','Gate opens if downstream has room'],
};

export type GateReason='Waiting for upstream'|'Releasing water'|'Upstream recovered'|'Downstream interlock'|'Sensor fault';
export function gateDecision(up:number|null,down:number|null,open:boolean):{open:boolean;reason:GateReason} {
  if(up===null||down===null) return {open:false,reason:'Sensor fault'};
  if(down>=gateLimits.downstreamLimitCm||down>=up&&open) return {open:false,reason:'Downstream interlock'};
  if(open&&up<=gateLimits.closeCm) return {open:false,reason:'Upstream recovered'};
  if(open||up>=gateLimits.openCm) return {open:true,reason:'Releasing water'};
  return {open:false,reason:'Waiting for upstream'};
}

export const floodGateProgram={
  filename:'automatic_flood_gate.ino',
  setup:'Open Serial Monitor at 9600 baud. Calibrate both empty gaps and test using flat targets with the servo horn disconnected. Fit the horn and linkage only after you check the servo angle range. The two sensors must be valid before the gate can open.',
  source:`#include <Servo.h>

const byte UP_TRIG=2, UP_ECHO=3, DOWN_TRIG=4, DOWN_ECHO=5, SERVO_PIN=9;
const long UP_EMPTY=${gateLimits.emptyMm}, DOWN_EMPTY=${gateLimits.emptyMm};
const long UP_OPEN=${gateLimits.openCm*10}, UP_CLOSE=${gateLimits.closeCm*10}, DOWN_LIMIT=${gateLimits.downstreamLimitCm*10};
const int CLOSED_ANGLE=65, OPEN_ANGLE=120;
Servo gate;
bool opened=false;

long readDepth(byte trigger,byte echo,long emptyGap) {
  digitalWrite(trigger,LOW);
  delayMicroseconds(2);
  digitalWrite(trigger,HIGH);
  delayMicroseconds(10);
  digitalWrite(trigger,LOW);
  const unsigned long pulse=pulseIn(echo,HIGH,6000);
  const long gap=(pulse*343UL+1000UL)/2000UL;
  if (!pulse || gap<95 || gap>emptyGap+20) return -1;
  return max(0L,emptyGap-gap);
}

void setup() {
  pinMode(UP_TRIG,OUTPUT);
  pinMode(DOWN_TRIG,OUTPUT);
  pinMode(UP_ECHO,INPUT);
  pinMode(DOWN_ECHO,INPUT);
  gate.write(CLOSED_ANGLE);
  gate.attach(SERVO_PIN);
  Serial.begin(9600);
}

void loop() {
  const long up=readDepth(UP_TRIG,UP_ECHO,UP_EMPTY);
  delay(60);
  const long down=readDepth(DOWN_TRIG,DOWN_ECHO,DOWN_EMPTY);
  delay(60);

  const char* reason="Waiting for upstream";
  if(up<0 || down<0) {opened=false; reason="Sensor fault";}
  else if(down>=DOWN_LIMIT || (opened && down>=up)) {opened=false; reason="Downstream interlock";}
  else if(opened && up<=UP_CLOSE) {opened=false; reason="Upstream recovered";}
  else if(opened || up>=UP_OPEN) {opened=true; reason="Releasing water";}

  gate.write(opened?OPEN_ANGLE:CLOSED_ANGLE);
  Serial.print("Upstream mm: "); Serial.print(up);
  Serial.print("  Downstream mm: "); Serial.print(down);
  Serial.print("  Gate: "); Serial.print(opened?"OPEN":"CLOSED");
  Serial.print("  "); Serial.println(reason);
}
`,
};
