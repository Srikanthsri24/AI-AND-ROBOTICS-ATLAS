import type { Build } from './guided-projects';

export const pianoKeys = [
  { note:'C4', pitch:262, pin:2, shortcut:'A' },
  { note:'D4', pitch:294, pin:3, shortcut:'S' },
  { note:'E4', pitch:330, pin:4, shortcut:'D' },
  { note:'F4', pitch:349, pin:5, shortcut:'F' },
  { note:'G4', pitch:392, pin:6, shortcut:'G' },
  { note:'A4', pitch:440, pin:7, shortcut:'H' },
  { note:'B4', pitch:494, pin:8, shortcut:'J' },
  { note:'C5', pitch:523, pin:9, shortcut:'K' },
];

export const electronicPiano: Build = {
  id:'directory-19',
  title:'Arduino Electronic Piano',
  outcome:'Build a USB-powered eight-key piano that plays the C-major scale on a passive piezo. See how a switch press becomes a frequency.',
  parts:[
    ['Arduino Uno R3','1','Reads eight button inputs and produces a square wave on D10.'],
    ['Momentary tactile piano switches','8','Each switch closes to ground while held. One switch plays each note of the scale.'],
    ['Passive piezo sounder','1','Vibrates at the frequency supplied by D10. Use a passive piezo element rated for 5 V operation.'],
    ['220 Ω piezo series resistor','1','Sits in series between D10 and the piezo and limits the brief charging current at a pulse edge.'],
    ['Breadboard and jumper wires','1 set','Holds the switches and distributes their common ground. A USB data cable powers and programs the Uno.'],
  ],
  assembly:[
    ['Lay out eight keys','Place eight tactile switches across the breadboard center gap, or use two small breadboards. Label them C4, D4, E4, F4, G4, A4, B4 and C5. Use a continuity meter to find two switch legs that connect only while pressed.','Each switch is open across the chosen legs at rest and closed when pressed.',[1,4]],
    ['Wire the input pins','With USB disconnected, run one switching contact from each key to D2 through D9 in ascending note order. Connect the other contacts to the ground rail and join it to Uno GND. Bridge the grounds if using two boards.','Each input has one switch to GND. The sketch enables its internal pull-up so an idle key reads HIGH.',[0,1,4]],
    ['Connect the piezo output','Connect D10 to the 220 Ω resistor. Connect the resistor’s other lead to the piezo signal lead and the piezo return to the common ground. Keep the piezo sound opening clear.','D10 reaches the piezo through the resistor. The ground rail is shared with the switches.',[0,2,3]],
    ['Check the scale','Upload the Arduino sketch. Play one key at a time from C4 to C5. Release each key before playing the next, then try holding C4 and G4 together.','Eight pitches rise in order. Release stops the sound, and when two keys are held the lower note has priority.',[0,1,2]],
  ],
  wiring:[
    ...pianoKeys.map(({ pin, note }): [string,string,string] => [`Uno D${pin}`, `${note} switch, other contact to GND`, 'Active-low key input']),
    ['Uno D10 through 220 Ω','Piezo signal lead','Square-wave audio'],
    ['Piezo return','Uno GND rail','Audio ground'],
    ['Uno USB','Computer USB','Upload and power'],
  ],
  test:'Open Serial Monitor at 115200 baud. Press and hold A4. Expect 440 Hz and one steady pitch, then silence on release. Play C4 through C5 in order, then hold G4 and press C4. Expect C4 while both are held and G4 again when C4 is released.',
  demo:['Key','Released','Pressed','Silent','Piezo plays the selected pitch'],
};

export const electronicPianoProgram = {
  filename:'electronic_piano.ino',
  setup:'Open Serial Monitor at 115200 baud. If a key plays without a press, rotate that switch or move its wires to contacts that are open at rest. If the sounder keeps one fixed pitch, check that it is a passive piezo.',
  source:`const byte KEY_PINS[] = {${pianoKeys.map(key=>key.pin).join(', ')}};
const unsigned int PITCHES[] = {${pianoKeys.map(key=>key.pitch).join(', ')}};
const byte PIEZO = 10;
const byte KEYS = sizeof(KEY_PINS);
bool candidates[KEYS] = {};
bool pressed[KEYS] = {};
unsigned long lastChange[KEYS] = {};
int currentNote = -1;

void setup() {
  for (byte pin : KEY_PINS) pinMode(pin, INPUT_PULLUP);
  pinMode(PIEZO, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  const unsigned long now = millis();
  int nextNote = -1;
  for (byte i = 0; i < KEYS; ++i) {
    const bool down = digitalRead(KEY_PINS[i]) == LOW;
    if (down != candidates[i]) {
      candidates[i] = down;
      lastChange[i] = now;
    } else if (now - lastChange[i] >= 15) {
      pressed[i] = down;
    }
    if (pressed[i] && nextNote < 0) nextNote = i;
  }

  if (nextNote == currentNote) return;
  currentNote = nextNote;
  if (currentNote < 0) {
    noTone(PIEZO);
    Serial.println("Released");
  } else {
    tone(PIEZO, PITCHES[currentNote]);
    Serial.print("Hz: ");
    Serial.println(PITCHES[currentNote]);
  }
}
`,
};
