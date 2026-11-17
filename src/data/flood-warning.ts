import type { Build } from './guided-projects';

export const floodWarning: Build = {
  id:'directory-8',
  title:'Smart Flood Rescue and Early Warning System',
  outcome:'Build a tabletop water-level station that lights green, amber or red and sounds a warning. Use a model neighborhood to rehearse a route to higher ground.',
  parts:[
    ['Arduino Uno R3','1','Times each echo, converts the remaining air gap to water depth, and drives the alarms.'],
    ['HC-SR04 ultrasonic module','1','Measures the air gap from a dry mounting point down to the water.'],
    ['Signal LEDs and 220 Ω resistors','3 LEDs, 4 resistors','Green indicates normal, amber indicates watch, and red indicates warning. Three resistors limit LED current. The fourth goes in series with the piezo.'],
    ['Passive piezo sounder','1','Pulses during a warning. During a sensor fault, the amber lamp blinks and the sounder stays quiet.'],
    ['Breadboard and jumper wires','1 set','Forms the dry control panel and common ground.'],
    ['Clear basin and dry sensor stand','1 each','Use a basin at least 10.5 cm deep and a stable dry stand beside it. The stand holds the sensor above the center of the water.'],
  ],
  assembly:[
    ['Mark the model basin','Put the basin on a level tray and mark water depths of 0, 5, 8 and 10 cm measured from its inside bottom. Lay out a paper model neighborhood beside the basin, with a low crossing and a marked route to a raised shelter.','The basin is stable and the model route has a dry high-ground path.',[5]],
    ['Mount the sensor above the basin','Secure the HC-SR04 on a rigid dry stand, facing straight down over the center. Measure from the front of the transducers to the empty basin bottom. Start with an air gap of about 23 cm. Keep the board and support away from splashes.','At the 10 cm mark there is still at least 10 cm of air below the sensor. Nothing crosses the echo path.',[1,5]],
    ['Wire the outputs on the dry side','Unplug USB. Place the breadboard, Uno and sounder beside the tray. Wire each LED through its own 220 Ω resistor. Connect the piezo through the fourth resistor and connect all grounds.','Check LED polarity and the pin labels on your HC-SR04. Leave the electronics dry throughout the trial.',[0,1,2,3,4]],
    ['Calibrate before adding water','Upload the sketch, open Serial Monitor and record several stable empty air-gap readings. Set EMPTY_MM to the measured gap in millimeters and re-upload. Add water slowly with the electronics outside the tray.','An empty basin reports approximately 0 cm. Stop filling at the 10 cm mark.',[0,1,5]],
  ],
  wiring:[
    ['Uno 5 V / GND','HC-SR04 VCC / GND','Sensor power and reference'],
    ['Uno D2','HC-SR04 TRIG','Starts the ultrasonic pulse'],
    ['HC-SR04 ECHO','Uno D3','Pulse width encodes round-trip time'],
    ['D5 / D6 / D7','220 Ω each → green / amber / red anodes','Three stage indicators'],
    ['All LED cathodes','Uno GND','LED return'],
    ['Uno D9','220 Ω → passive piezo signal terminal','Audible warning pulses'],
    ['Piezo return','Uno GND','Common ground'],
    ['Computer USB','Uno USB','Controller power and serial readings'],
  ],
  test:'Raise the water slowly through the 5 and 8 cm marks. Confirm the panel changes from green to amber to red and that the red state pulses the piezo. Drain below both thresholds to check recovery. With USB disconnected, remove the ECHO wire, then reconnect USB. The amber lamp should blink and the depth should report unavailable. Reconnect the wire with USB off before continuing.',
  demo:['Water depth','Normal','Warning','Green station','Red station and high-ground drill'],
};

export const floodLimits={watchCm:5,warningCm:8,maxCm:10,emptyMm:230};
export type FloodState='Normal'|'Watch'|'Warning'|'Sensor unavailable';

export function floodState(depth:number|null):FloodState {
  if(depth===null) return 'Sensor unavailable';
  if(depth>=floodLimits.warningCm) return 'Warning';
  return depth>=floodLimits.watchCm ? 'Watch' : 'Normal';
}

export const floodWarningProgram = {
  filename:'flood_warning_station.ino',
  setup:'Open Serial Monitor at 9600 baud. Set EMPTY_MM from the empty basin reading, then re-upload. Confirm green at zero before filling. At the marked thresholds, add water in small increments and wait for the surface and readings to settle.',
  source:`const byte TRIG = 2, ECHO = 3, GREEN = 5, AMBER = 6, RED = 7, PIEZO = 9;
const long EMPTY_MM = ${floodLimits.emptyMm}; // Replace with your empty calibration.
const long WATCH_MM = ${floodLimits.watchCm*10}, WARNING_MM = ${floodLimits.warningCm*10};

void setup() {
  pinMode(ECHO, INPUT);
  const byte outputs[] = {TRIG, GREEN, AMBER, RED, PIEZO};
  for (byte pin : outputs) pinMode(pin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  const unsigned long echo = pulseIn(ECHO, HIGH, 6000);
  const long gap = (echo * 343UL + 1000UL) / 2000UL;
  const bool valid = echo != 0 && gap >= 95 && gap <= EMPTY_MM + 20;
  const long depth = max(0L, EMPTY_MM - gap);
  const bool warning = valid && depth >= WARNING_MM;
  const bool watch = valid && depth >= WATCH_MM && !warning;

  digitalWrite(GREEN, valid && !watch && !warning);
  digitalWrite(AMBER, watch || (!valid && (millis() / 400) % 2 == 0));
  digitalWrite(RED, warning);
  if (warning && (millis() / 400) % 2 == 0) tone(PIEZO, 1800);
  else noTone(PIEZO);

  if (valid) {
    Serial.print("gap mm: "); Serial.print(gap);
    Serial.print("  depth mm: "); Serial.print(depth);
    Serial.println(warning ? "  WARNING" : watch ? "  WATCH" : "  NORMAL");
  } else {
    Serial.println("Sensor unavailable");
  }
  delay(100);
}
`,
};
