import type { Build } from './guided-projects';

export const streetLightLimits = { on:330, off:470 };
export function lampsOn(reading:number, previous:boolean) {
  return reading <= streetLightLimits.on || (reading < streetLightLimits.off && previous);
}

export const streetLight: Build = {
  id:'directory-18',
  title:'DIY Automatic Street Light System',
  outcome:'Build three USB-powered model street lamps that turn on at dusk and switch off again when daylight returns.',
  parts:[
    ['Arduino Uno R3','1','Measures the light at A0 and switches three independent LED circuits.'],
    ['Photoresistor','1','Its resistance rises in darkness. Mount its face toward room light.'],
    ['10 kΩ divider resistor','1','Works with the photoresistor to set the voltage at A0.'],
    ['Diffused white LEDs and 220 Ω resistors','3 each','Each lamp has a dedicated resistor and output pin.'],
    ['Breadboard and jumper wires','1 set','Joins the divider and lamp circuits to the Uno. Use a USB data cable to power and program the board.'],
  ],
  assembly:[
    ['Build a model street','Make a road and three lamp posts from card. Tape an LED under each lamp head with its leads separated. Set aside a position for the light sensor at the edge of the base, facing up.','The sensor has a clear view of the room. Light from the model street lamps does not shine directly on it.',[1,3]],
    ['Build the light divider','With USB disconnected, wire the photoresistor between 5 V and a breadboard row. Wire the 10 kΩ resistor from that row to ground. Connect the junction to A0.','The A0 jumper goes to the junction shared by both parts. Covering the sensor lowers the reading.',[0,1,2,4]],
    ['Wire three lamp circuits','Run D5, D6 and D7 to separate 220 Ω resistors. Connect each resistor to its own lamp’s anode. Connect each cathode to the ground rail. Check LED polarity before bending or trimming the leads.','Each lamp has its own resistor. The cathodes share the Uno ground.',[0,3,4]],
    ['Measure daylight and darkness','Upload the sketch and open Serial Monitor. Measure with the sensor uncovered and then fully shaded. If the readings do not cross both limits, adjust the thresholds between your measured dark and bright values. Keep the turn-on value lower than the turn-off value.','All three lamps light when the reading drops to the lower threshold. They stay on through twilight until the higher threshold is reached.',[0,1,3]],
  ],
  wiring:[
    ['Uno 5 V','Photoresistor lead 1','Divider power'],
    ['Photoresistor lead 2','Uno A0 and one end of 10 kΩ resistor','Analog divider junction'],
    ['Other end of 10 kΩ resistor','Uno GND rail','Divider return'],
    ['Uno D5 through its own 220 Ω resistor','Lamp 1 anode','First lamp output'],
    ['Uno D6 through its own 220 Ω resistor','Lamp 2 anode','Second lamp output'],
    ['Uno D7 through its own 220 Ω resistor','Lamp 3 anode','Third lamp output'],
    ['All lamp cathodes','Uno GND rail','Lamp return'],
  ],
  test:'At 115200 baud, record the raw A0 reading in bright light and with an opaque card over the sensor. Verify that the lamps switch on at 330 or below, stay in their last state from 331 to 469, and switch off at 470 or above. Approach the middle band once from dark and once from bright. At the same reading, the lamps should remember which side they came from.',
  demo:['Daylight','Bright','Dark','Lamps off','Three lamps on'],
};

export const streetLightProgram = {
  filename:'automatic_street_lights.ino',
  setup:'Power the Uno through USB and open Serial Monitor at 115200 baud. Start in bright light. If you change the thresholds, upload again and repeat the dusk and dawn tests.',
  source:`const byte LIGHT_INPUT = A0;
const byte LAMP_PINS[] = {5, 6, 7};
const int NIGHT_ON = ${streetLightLimits.on};
const int DAY_OFF = ${streetLightLimits.off};
bool lightsOn = false;

void setup() {
  for (byte pin : LAMP_PINS) pinMode(pin, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  const int reading = analogRead(LIGHT_INPUT);
  if (reading <= NIGHT_ON) lightsOn = true;
  else if (reading >= DAY_OFF) lightsOn = false;
  for (byte pin : LAMP_PINS) digitalWrite(pin, lightsOn ? HIGH : LOW);
  Serial.print("A0 = ");
  Serial.print(reading);
  Serial.println(lightsOn ? " | LAMPS ON" : " | LAMPS OFF");
  delay(100);
}
`,
};
