import type { Build } from './guided-projects';

export type CrossingPhase = 'clear' | 'occupied' | 'leaving';

export function crossingPhase(phase: CrossingPhase, entryBlocked: boolean, exitBlocked: boolean): CrossingPhase {
  if (phase === 'clear') return entryBlocked ? 'occupied' : 'clear';
  if (phase === 'occupied') return exitBlocked ? 'leaving' : 'occupied';
  return entryBlocked || exitBlocked ? 'leaving' : 'clear';
}

export const railwayGate: Build = {
  id:'directory-17',
  title:'Automatic Railway Gate System',
  outcome:'Build a one-way tabletop railway crossing. Two infrared beams tell an Arduino when to lower the barrier and when the last carriage has passed.',
  parts:[
    ['Arduino Uno R3','1','Reads both beam receivers and commands the warning lamp and servo.'],
    ['3 mm IR break-beam pair','2 pairs','Each pair puts an emitter and receiver across the track. A carriage interrupts the invisible beam.'],
    ['Positional micro servo','1','Rotates a lightweight striped card barrier between upright and across the road.'],
    ['Red LED and 220 Ω resistor','1 each','The lamp warns while the gate is down. The resistor limits LED current.'],
    ['Regulated 5 V servo supply','1','Powers the servo from a separate 5 V rail. Choose a supply that can meet the servo stall current.'],
    ['Breadboard and jumper wires','1 set','Distributes Uno sensor power and shares ground with the servo supply.'],
  ],
  assembly:[
    ['Lay out the model crossing','Use a flat card base, a paper road, and a single straight track. Make the train from one opaque card block or join the cars with an opaque strip at beam height. Mark A before the crossing and B beyond it. Leave enough approach distance to lower the arm before the train reaches the road.','The train can move through the model in one direction without bumping the barrier or posts.',[1,2]],
    ['Align beam A and beam B','Place each emitter opposite its receiver with the lenses facing across the track at the same height. Power the sensor pairs from the Uno and start with a small air gap. Test each pair with a card before fixing it in place.','Each receiver reads LOW with its beam clear, and HIGH with the train in the beam.',[0,1,5]],
    ['Fit the model barrier','Fasten the servo on the road shoulder with the shaft horizontal. Fit a lightweight striped card arm to the horn. With the horn detached, run the sketch on an empty track and let the servo move to its open position before fitting the arm upright. Reapply power and test with the track empty.','The arm reaches both positions without hitting scenery or forcing the servo against a stop. Adjust the two angles if needed.',[2,4]],
    ['Wire the warning and run the crossing','Switch off USB and the servo supply. Complete the pin connections below. Power the electronics again with both beams clear. Move the train by hand from A toward B. Pause in the middle, then continue until its tail clears B.','The red light and lowered arm stay on after A clears. They release only after the train has blocked and then cleared B.',[0,1,2,3,4,5]],
  ],
  wiring:[
    ['Uno 5 V and GND','Red and black wires on both IR emitter/receiver pairs','Sensor power and ground'],
    ['Beam A receiver signal','Uno D2','Approach input with built-in pull-up'],
    ['Beam B receiver signal','Uno D3','Exit input with built-in pull-up'],
    ['Uno D6 through 220 Ω','LED anode, with cathode to GND','Warning light'],
    ['Uno D9','Servo signal','Barrier command'],
    ['Independent regulated 5 V and GND','Servo power and ground','Servo power'],
    ['Servo supply GND','Uno GND','Shared voltage reference between signal and servo'],
  ],
  test:'Open Serial Monitor at 115200 baud. Confirm A CLEAR and B CLEAR with the track empty. Block A, then let A clear while B is still clear. The warning must remain on. Block B and hold it to represent a stopped train. Let B clear and check that the barrier rises. Run the tests again with the train moving slowly by hand.',
  demo:['Approach beam','Clear','Blocked','Gate open','Warning on and gate down'],
};

export const railwayGateProgram = {
  filename:'railway_gate.ino',
  setup:'Start with one model train before beam A and both beams clear. Move the opaque train slowly in one direction. The sketch assumes this tabletop starting position when powered on.',
  source:`#include <Servo.h>

const byte ENTRY_PIN = 2, EXIT_PIN = 3, LAMP_PIN = 6, SERVO_PIN = 9;
const int OPEN_ANGLE = 95, CLOSED_ANGLE = 5;
enum Phase { CLEAR, OCCUPIED, LEAVING };
Phase phase = CLEAR;
Servo barrier;

void setup() {
  pinMode(ENTRY_PIN, INPUT_PULLUP);
  pinMode(EXIT_PIN, INPUT_PULLUP);
  pinMode(LAMP_PIN, OUTPUT);
  barrier.write(OPEN_ANGLE);
  barrier.attach(SERVO_PIN);
  Serial.begin(115200);
}

void loop() {
  const bool entryBlocked = digitalRead(ENTRY_PIN) == HIGH;
  const bool exitBlocked = digitalRead(EXIT_PIN) == HIGH;

  switch (phase) {
    case CLEAR: if (entryBlocked) phase = OCCUPIED; break;
    case OCCUPIED: if (exitBlocked) phase = LEAVING; break;
    case LEAVING: if (!entryBlocked && !exitBlocked) phase = CLEAR; break;
  }

  digitalWrite(LAMP_PIN, phase != CLEAR ? HIGH : LOW);
  barrier.write(phase == CLEAR ? OPEN_ANGLE : CLOSED_ANGLE);

  static unsigned long lastReport = 0;
  if (millis() - lastReport >= 200) {
    lastReport = millis();
    Serial.print(entryBlocked ? "A BLOCKED  " : "A CLEAR  ");
    Serial.print(exitBlocked ? "B BLOCKED  " : "B CLEAR  ");
    Serial.println(phase == CLEAR ? "GATE OPEN" : "GATE CLOSED");
  }
}
`,
};
