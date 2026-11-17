import type { Build } from './guided-projects';

export const lightLimits={darkOn:30,brightOff:42,pulseMs:500};
export const emergencyLighting:Build={
  id:'directory-14',
  title:'Emergency Warning and Lighting System',
  outcome:'Build a low-voltage tabletop corridor with light-sensitive path markers and a manually latched warning beacon.',
  parts:[
    ['Arduino Uno R3','1','Reads the light sensor and both buttons, then controls the path lights and warning outputs.'],
    ['Photoresistor','1','Changes resistance as the ambient light changes. The divider makes that change measurable at A0.'],
    ['10 kΩ divider resistors','1','Connects A0 to ground and forms a voltage divider with the photoresistor.'],
    ['Red and white LEDs with 220 Ω resistors','1 red, 3 white, 5 resistors','Three white LEDs mark the route and one red LED signals a warning. Use a separate resistor for each LED and the remaining resistor for the piezo.'],
    ['Momentary tactile start button','2','Label them Alarm and Reset. Both use active-low inputs.'],
    ['Passive piezo sounder','1','Sounds a short repeated pulse during the latched alarm.'],
    ['Breadboard and jumper wires','1 set','Routes USB-powered low-voltage connections in the model.'],
  ],
  assembly:[
    ['Place the corridor indicators','Lay out a dry cardboard corridor with three white LEDs along the path and one red LED at the entrance. Use separate resistor branches and label the two buttons Alarm and Reset.','The LED flat edges face the ground return and every LED has its own 220 Ω resistor.',[3,4,6]],
    ['Mount the ambient light sensor','Connect the photoresistor between 5 V and A0, and connect the 10 kΩ resistor from A0 to ground. Put the sensor above the model so it reads the room, away from the path LEDs.','Covering the sensor lowers the A0 reading. Turning a path LED on does not directly illuminate it.',[0,1,2,6]],
    ['Wire the local alarm controls','With USB unplugged, connect both switches and the piezo using the map below. Place the fifth 220 Ω resistor in series with the piezo.','Pressing each switch joins its own input to ground. The piezo’s return and the LED returns share Uno GND.',[0,3,4,5,6]],
    ['Check bright and dark calibration','Upload the sketch. Compare A0 percentages in Serial Monitor under the brightest and darkest conditions you can reproduce. If needed, adjust DARK_ON and BRIGHT_OFF, keeping DARK_ON lower than BRIGHT_OFF.','The white lamps turn on in darkness and turn off in bright conditions. The two thresholds leave a band where the last lighting state is held.',[0,1,3]],
  ],
  wiring:[
    ['Uno 5 V','Photoresistor first leg','Divider supply'],
    ['Photoresistor second leg and 10 kΩ resistor','Uno A0','Light measurement'],
    ['Other end of 10 kΩ resistor','Uno GND','Divider return'],
    ['Alarm / Reset buttons','D2 / D3 to GND','Active-low controls'],
    ['D5 / D6 / D7','220 Ω each → white LED anodes','Three path lights'],
    ['D8','220 Ω → red LED anode','Warning beacon'],
    ['D9','220 Ω → passive piezo signal','Warning tone'],
    ['All LED cathodes and piezo return','Uno GND','Shared return'],
    ['Computer USB','Uno USB','Power and serial monitor'],
  ],
  test:'Under bright conditions verify that the path lights are off. Cover the photoresistor until the index drops to 30%, then uncover it slowly. The lights should stay on at 35% and turn off at 42%. Press Alarm in bright conditions. The path lights should turn on and the red beacon and sounder should pulse. Release Alarm, then press Reset and check that the path lights follow the ambient reading again.',
  demo:['Ambient light','Bright','Dark','Path lamps off in normal mode','Path lamps on in dark mode'],
};

export const emergencyProgram={
  filename:'emergency_warning_lighting.ino',
  setup:'Open Serial Monitor at 9600 baud. The percentage is the A0 reading scaled to 0–100 and represents your test setup. Check bright and dark behavior with the paper corridor on a table.',
  source:`const byte ALARM=2, RESET=3, BEACON=8, PIEZO=9;
const byte PATHS[]={5,6,7};
const int DARK_ON=${lightLimits.darkOn}, BRIGHT_OFF=${lightLimits.brightOff};
const unsigned long PULSE_MS=${lightLimits.pulseMs};
bool dark=false, latched=false, resetRaw=HIGH, resetStable=HIGH;
unsigned long lastResetChange=0, started=0, lastPrint=0;

void setup() {
  pinMode(ALARM,INPUT_PULLUP);
  pinMode(RESET,INPUT_PULLUP);
  pinMode(BEACON,OUTPUT);
  pinMode(PIEZO,OUTPUT);
  for(byte pin:PATHS) pinMode(pin,OUTPUT);
  Serial.begin(9600);
}

void loop() {
  const unsigned long now=millis();
  const int brightness=(analogRead(A0)*100L+511)/1023;
  if(brightness<=DARK_ON) dark=true;
  else if(brightness>=BRIGHT_OFF) dark=false;

  const bool pressed=digitalRead(ALARM)==LOW;
  if(pressed && !latched) {latched=true;started=now;}
  const bool reset=digitalRead(RESET);
  if(reset!=resetRaw) {resetRaw=reset;lastResetChange=now;}
  if(reset!=resetStable && now-lastResetChange>=30) {
    resetStable=reset;
    if(resetStable==LOW && !pressed) latched=false;
  }

  const bool pulse=latched && ((now-started)/PULSE_MS)%2==0;
  for(byte pin:PATHS) digitalWrite(pin,latched||dark);
  digitalWrite(BEACON,pulse);
  if(pulse) tone(PIEZO,1250);
  else noTone(PIEZO);

  if(now-lastPrint>=250) {
    lastPrint=now;
    Serial.print("Brightness index: ");Serial.print(brightness);
    Serial.println(latched?"  ALARM":dark?"  NIGHT LIGHTING":"  STANDBY");
  }
}
`,
};
