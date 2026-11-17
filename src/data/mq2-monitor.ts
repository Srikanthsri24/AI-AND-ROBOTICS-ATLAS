import type { Build } from './guided-projects';

export const mq2Thresholds={on:90,off:65};
export const mq2Window=8;
export function aboveBaseline(reading:number,baseline:number|null,alert:boolean) {
  return baseline!==null&&(alert?reading-baseline>mq2Thresholds.off:reading-baseline>=mq2Thresholds.on);
}

export const mq2Monitor:Build={
  id:'directory-21',
  title:'Arduino Gas and Perfume Detection System (MQ-2)',
  outcome:'Measure a clean-air baseline and use a supervised bench circuit to show how a change in the sensor signal can turn on an indicator. Explore gas and perfume scenarios in the browser.',
  parts:[
    ['Arduino Uno R3','1','Averages eight A0 readings and compares them with the baseline you capture.'],
    ['Waveshare MQ-2 gas sensor module','1','Heats a sensing element and outputs a changing voltage on AOUT. Use its analog output and supplied four-wire cable.'],
    ['Regulated 5 V sensor supply and adapter','1 each','Provides separate regulated power for the heated sensor. Its negative terminal shares Uno ground.'],
    ['10 kΩ divider resistors','2','Divide AOUT by two before the signal reaches A0. Use equal-value resistors.'],
    ['10 kΩ rotary test potentiometers','1','Provides a substitute signal for a repeatable indicator test without introducing fumes.'],
    ['Red LED and 220 Ω resistor','1 each','The LED lights when the reading rises enough above baseline. The resistor limits current.'],
    ['Breadboard and jumper wires','1 set','Holds the divider, potentiometer, and LED circuit. A USB data cable powers and programs the Uno.'],
  ],
  assembly:[
    ['Build the indicator','With power disconnected, wire D6 through 220 Ω to the red LED anode. Bring the cathode back to ground. Place the potentiometer on a separate section of the breadboard.','The LED cathode goes to the Uno ground rail.',[0,5,6]],
    ['Test the controller with the dial','Wire the outer potentiometer contacts to Uno 5 V and GND. Wire its center contact to A0. Upload the sketch, start with a low reading, capture a baseline, then move the dial slowly in both directions.','The dial changes the reading and the LED follows the specified rise and recovery thresholds.',[0,4,5,6]],
    ['Connect the MQ-2','Disconnect both supplies. Remove the A0 jumper from the dial. Wire AOUT through the first 10 kΩ resistor to A0, then connect the second 10 kΩ resistor from A0 to GND. Use the separate regulated 5 V supply for the module and join grounds. Leave DOUT open. Power the Uno before the module, and switch off the module before disconnecting USB.','The dial is disconnected from A0. The module signal reaches that input through the divider.',[0,1,2,3]],
    ['Observe the clean-air baseline','Place the sensor upright on a nonflammable stand in a ventilated area, clear of hands and loose material. Follow the manufacturer’s conditioning procedure for a new sensor before evaluating the baseline. Watch the clean-air reading until it settles. Use the dial for threshold tests and the browser for exposure scenarios.','The recorded value is a relative reference for this module and setup. Use this experiment to compare ADC counts. The breadboard circuit is unsuitable for gas safety monitoring.',[0,1,5]],
  ],
  wiring:[
    ['Separate regulated +5 V','MQ-2 VCC','Heater and module power'],
    ['Separate supply negative','MQ-2 GND and Uno GND','Shared voltage reference'],
    ['MQ-2 AOUT via first 10 kΩ resistor','Uno A0 · sensor mode','Upper half of the signal divider'],
    ['Uno A0 via second 10 kΩ resistor','Uno GND · sensor mode','Lower half of the signal divider'],
    ['Uno 5 V and GND','Potentiometer outer terminals · dial mode','Test signal endpoints'],
    ['Potentiometer middle terminal','Uno A0 · dial mode only, sensor divider disconnected from A0','Substitute signal'],
    ['Uno D6 through 220 Ω','LED anode; cathode to Uno GND','Threshold indicator'],
  ],
  test:'At 115200 baud, set the test dial low enough to leave room for a 90-count rise. Let the average stabilize and send b to record the baseline. Increase the reading by at least 90 counts to light the LED. Decrease to 65 counts above baseline or below to switch it off. Repeat in the browser to compare two hypothetical sources.',
  demo:['ADC signal','At baseline','Above threshold','Indicator off','Indicator lit'],
};

export const mq2MonitorProgram={
  filename:'mq2_relative_monitor.ino',
  setup:'Start with the dial connected to A0. At 115200 baud, wait for eight samples, send b to capture the baseline, and watch the raw, averaged and relative readings. Lock the baseline in clean air when using the sensor.',
  source:`const byte INPUT_PIN = A0, INDICATOR = 6, COUNT = ${mq2Window};
const int RISE = ${mq2Thresholds.on}, FALL = ${mq2Thresholds.off};
int samples[COUNT] = {};
int filled = 0, next = 0, sum = 0, baseline = -1;
bool alert = false;

void setup() {
  pinMode(INDICATOR, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  const int reading = analogRead(INPUT_PIN);
  sum += reading - samples[next];
  samples[next] = reading;
  next = (next + 1) % COUNT;
  if (filled < COUNT) ++filled;
  const int average = sum / filled;

  while (Serial.available()) {
    if (Serial.read() == 'b' && filled == COUNT) {
      baseline = average;
      alert = false;
    }
  }

  const int delta = baseline < 0 ? 0 : average - baseline;
  if (baseline >= 0) alert = alert ? delta > FALL : delta >= RISE;
  digitalWrite(INDICATOR, alert ? HIGH : LOW);
  Serial.print("A0="); Serial.print(reading);
  Serial.print(" Average="); Serial.print(average);
  Serial.print(" Delta="); Serial.print(delta);
  Serial.println(baseline < 0 ? " | Waiting for baseline" : alert ? " | Above threshold" : " | Indicator off");
  delay(100);
}
`,
};
