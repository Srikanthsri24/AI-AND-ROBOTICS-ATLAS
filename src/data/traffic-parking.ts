import type { Build } from './guided-projects';

export const parkingCapacity=3;
export const gateMs=2500;
export const phases=[
  {main:'Green',cross:'Red',ms:5000},
  {main:'Amber',cross:'Red',ms:1600},
  {main:'Red',cross:'Red',ms:900},
  {main:'Red',cross:'Green',ms:5000},
  {main:'Red',cross:'Amber',ms:1600},
  {main:'Red',cross:'Red',ms:900},
] as const;
export const trafficParking:Build={
  id:'directory-25',
  title:'Smart Traffic Light & Parking Systems',
  outcome:'Build a tabletop junction with two interlocked traffic signals and a separate three-space parking gate that refuses entry when full.',
  parts:[
    ['Arduino Uno R3','1','Times both signals and services parking requests while the signals keep running.'],
    ['Signal LEDs and 220 Ω resistors','7 each','Two red, two amber and two green LEDs form the signals. The seventh LED shows the lot is full.'],
    ['Momentary tactile start button','2','One requests a parking entry, the other confirms that a car left. Mount both across the breadboard gap.'],
    ['Positional micro servo','1','Raises a light card barrier for a timed admission, and lowers it after 2.5 seconds.'],
    ['Regulated 5 V servo supply','1','Supplies the servo independently. Share ground with the Arduino and size the supply for the servo stall current.'],
    ['Breadboard and jumper wires','1 set','Use two 170-contact mini breadboards: one for the seven LED resistors and linked ground strips, one for Entry / Exit switches. Use a USB data cable to program and power the Uno.'],
  ],
  assembly:[
    ['Mark the junction and three parking bays','Draw two intersecting streets and three parking bays on card. Put a stop line at each approach. Use separate craft-stick mounts for the two signal heads. Position the lot outside the intersection and give it a separate entrance and exit.','Each signal faces its approaching street. Number the parking bays 1 through 3.',[1,2]],
    ['Wire two traffic signals and the full lamp','With USB disconnected, run the six signal pins in order through separate 220 Ω resistors. Wire D10 to the full LED through its own resistor. Connect all cathodes to common ground.','Only one light per head is lit at a time. Test both directions and the brief all-red clearance.',[0,1,5]],
    ['Fit the entrance barrier and switches','Mount the servo beside the entrance and attach a light striped card arm. Test the servo without the arm fitted, then attach it so 20° is down and 100° is up. Wire Entry and Exit switches to A0 and A1, one contact of each to ground. Power the servo separately.','The barrier clears the model road, and all ground connections are shared.',[0,2,3,4,5]],
    ['Run a full-lot trial','Start with the bays empty. Press Entry once for each model car you admit and move it into a free bay while the arm is raised. Wait for the barrier to close before using either switch again. Then try a fourth request. To free a space, move one car through the separate exit and press Exit once.','The fourth entry is denied. An exit frees one space and the next entry can raise the barrier again.',[0,1,2,3]],
  ],
  wiring:[
    ['D2, D3, D4 each through 220 Ω','Main red, amber, green anodes','Main signal outputs'],
    ['D5, D6, D7 each through 220 Ω','Cross red, amber, green anodes','Cross signal outputs'],
    ['D10 through 220 Ω','Full LED anode','Parking capacity indicator'],
    ['All LED cathodes','Uno GND','LED return'],
    ['A0 and A1','Entry and Exit buttons, other contacts to GND','Active-low requests'],
    ['D9','Servo signal','Barrier command'],
    ['Separate 5 V and negative','Servo power and ground; join negative to Uno GND','Servo power and common reference'],
  ],
  test:'In Serial Monitor at 115200 baud, admit three cars, waiting for the gate to close each time. Verify 0 spaces left and a lit full LED. A fourth request should print Entry denied. Confirm one exit and re-enter. Check that both signals still complete their sequence throughout the trial, with an all-red interval between green directions. This tabletop model counts operator requests rather than detecting vehicles.',
  demo:['Parking request','Full','Space available','Gate stays shut','Gate opens for one car'],
};

export const trafficParkingProgram={
  filename:'traffic_parking.ino',
  setup:'Install Arduino Servo. Upload with the servo supply switched off. Start with no cars in the bays and check the signal wiring before attaching the servo horn. Open Serial Monitor at 115200 baud.',
  source:`#include <Servo.h>
const byte ENTRY=A0, EXIT=A1, SERVO_PIN=9, FULL=10;
const byte signals[2][3]={{2,3,4},{5,6,7}};
enum Lamp { Red, Amber, Green };
const byte lights[6][2]={{Green,Red},{Amber,Red},{Red,Red},{Red,Green},{Red,Amber},{Red,Red}};
const unsigned int phaseMs[]={${phases.map(p=>p.ms).join(', ')}};
const byte CAPACITY=${parkingCapacity};
const unsigned long GATE_MS=${gateMs};
Servo gate;
byte occupied=0, phase=0;
bool open=false;
unsigned long phaseSince=0, gateSince=0;

struct Button {
  byte pin;
  bool candidate=false, state=false;
  unsigned long since=0;
  bool pressed(unsigned long now) {
    const bool down=digitalRead(pin)==LOW;
    if(down!=candidate){ candidate=down; since=now; }
    if(now-since<22 || state==candidate) return false;
    state=candidate;
    return state;
  }
};
Button entry, leaveLot;
void showPhase() {
  for(byte direction=0;direction<2;++direction)
    for(byte color=0;color<3;++color) digitalWrite(signals[direction][color], LOW);
  for(byte direction=0;direction<2;++direction)
    digitalWrite(signals[direction][lights[phase][direction]], HIGH);
}
void report() {
  digitalWrite(FULL, occupied==CAPACITY);
  Serial.print("Spaces left: "); Serial.println(CAPACITY-occupied);
}
void setup() {
  for(auto &head: signals) for(byte pin: head) pinMode(pin, OUTPUT);
  pinMode(FULL, OUTPUT);
  entry.pin=ENTRY; leaveLot.pin=EXIT;
  pinMode(ENTRY, INPUT_PULLUP); pinMode(EXIT, INPUT_PULLUP);
  gate.write(20); gate.attach(SERVO_PIN);
  Serial.begin(115200);
  showPhase(); report(); phaseSince=millis();
}
void loop() {
  const unsigned long now=millis();
  if(now-phaseSince>=phaseMs[phase]){
    phase=(phase+1)%6; phaseSince=now; showPhase();
  }
  if(open && now-gateSince>=GATE_MS){ open=false; gate.write(20); }
  const bool arrive=entry.pressed(now), leave=leaveLot.pressed(now);
  if(open) return;
  if(leave && occupied>0){ --occupied; report(); }
  if(arrive){
    if(occupied==CAPACITY){ Serial.println("Entry denied"); return; }
    ++occupied; open=true; gateSince=now; gate.write(100); report();
  }
}
`,
};
