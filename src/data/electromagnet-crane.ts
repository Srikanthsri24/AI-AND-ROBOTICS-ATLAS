import type { Build } from './guided-projects';

export const coilMaxMs = 8000;

export const electromagnetCrane: Build = {
  id:'directory-20',
  title:'Electromagnet Crane Working Model',
  outcome:'Build a hand-operated gantry crane that picks up a steel washer with a 5 V electromagnet and releases it into a receiving tray.',
  parts:[
    ['Arduino Uno R3','1','Reads the hold button on D2 and commands the magnet driver on D9.'],
    ['P20/15 5 V electromagnet','1','A coil inside the steel housing produces a magnetic field while powered. This model draws about 220 mA at 5 V.'],
    ['STEMMA MOSFET driver and lead','1 each','The driver switches the coil current. Its built-in flyback diode handles the brief current after switch-off. Use the 3-wire JST PH input lead.'],
    ['Momentary tactile button','1','Connects D2 to ground while held. Releasing the button stops the current.'],
    ['Regulated 5 V coil supply and adapter','1 each','Powers the magnet independently of the Uno. The screw terminal adapter exposes the low-voltage positive and negative connections.'],
    ['Breadboard and jumper wires','1 set','Connect the button, logic signal and shared ground. USB powers and programs the Uno.'],
    ['Plain steel washer','1','A flat magnetic load. Check it with a household magnet before using it.'],
  ],
  assembly:[
    ['Build a short gantry','Use a rigid card or craft-stick frame with a base, two braced uprights and a smooth crossbar. Make a loose sliding saddle for the crossbar. Thread nonstretch cord through the saddle and tie it to the magnet’s rear mount using a bracket fastened with the correct mounting screw. Mark pickup and delivery spots, then place a shallow tray underneath.','The frame stands without tipping. The saddle slides by hand, and the coil hangs from the cord with slack in its wires.',[1,6]],
    ['Wire the low-voltage coil circuit','Unplug USB and the 5 V supply. Connect the coil leads to driver OUT+ and switched OUT−. Connect the driver V+ and GND to the 5 V adapter terminals. Connect driver GND to Uno GND, and its signal to D9. Follow the pin labels on the driver and adapter.','The independent supply feeds the driver and coil. D9 reaches only the driver signal input.',[0,1,2,4,5]],
    ['Add the momentary hold button','Place the button across a breadboard gap. Use two contacts that connect only when pressed. Run one contact to D2 and the other to ground. Connect the USB cable, upload the sketch, then connect the coil supply with the button released.','With the button released, the driver activity LED is off and the coil is idle.',[0,2,3,5]],
    ['Lift and release the washer','Lower the unpowered magnet until its flat face touches the steel washer. Hold the button, lift just above the tray and slide the saddle by hand. Set the washer down over the receiving tray and release. Keep the load low and allow the coil to cool between repeated lifts.','The washer follows the powered magnet and stays in the tray when the coil switches off.',[1,3,6]],
  ],
  wiring:[
    ['Regulated supply +5 V','Driver V+','Coil power'],
    ['Regulated supply negative','Driver GND, also joined to Uno GND','Shared return and signal reference'],
    ['Uno D9','Driver SIG','Logic command only'],
    ['Driver OUT+','Coil positive lead','Feeds the coil'],
    ['Driver switched OUT−','Coil negative lead','MOSFET switches this return'],
    ['Uno D2','One normally open button contact','Active-low input'],
    ['Other button contact','Uno GND','Completes the input circuit on a press'],
  ],
  test:'At 115200 baud, expect Idle when the button is released, Holding while the coil is powered, and Timeout if the button stays down for 8 seconds. Test the timeout with the washer resting in the tray. Release and press again to rearm. Then transfer the washer with the magnet low over the tray.',
  demo:['Coil','Idle','Holding','Washer rests on the tray','Washer sticks to the magnet face'],
};

export const electromagnetCraneProgram = {
  filename:'electromagnet_crane.ino',
  setup:'Upload with the independent supply disconnected. Reconnect it with the button released. Keep the washer on the tray during the electrical checks and use Serial Monitor at 115200 baud.',
  source:`const byte BUTTON = 2, DRIVER = 9;
const unsigned long MAX_HOLD_MS = ${coilMaxMs};
bool armed = false;
bool wasPressed = false;
bool candidate = false;
unsigned long candidateSince = 0;
unsigned long started = 0;
int previous = -1;

void setup() {
  digitalWrite(DRIVER, LOW);
  pinMode(DRIVER, OUTPUT);
  pinMode(BUTTON, INPUT_PULLUP);
  Serial.begin(115200);
}

void loop() {
  const unsigned long now = millis();
  // Enforce the hold limit even while the button is bouncing.
  if (wasPressed && armed && now - started >= MAX_HOLD_MS) {
    armed = false;
    digitalWrite(DRIVER, LOW);
    if (previous != 2) {
      previous = 2;
      Serial.println("Timeout or release to arm");
    }
  }
  const bool rawPressed = digitalRead(BUTTON) == LOW;
  if (candidate != rawPressed) {
    candidate = rawPressed;
    candidateSince = now;
  }
  if (now - candidateSince < 20) return;
  const bool pressed = candidate;
  if (!pressed) armed = true;
  else if (!wasPressed) started = now;
  wasPressed = pressed;

  const bool enabled = pressed && armed && now - started < MAX_HOLD_MS;
  if (pressed && !enabled) armed = false;
  digitalWrite(DRIVER, enabled ? HIGH : LOW);

  const int state = enabled ? 1 : pressed ? 2 : 0;
  if (state == previous) return;
  previous = state;
  if (state == 0) Serial.println("Idle");
  else if (state == 1) Serial.println("Holding");
  else Serial.println("Timeout or release to arm");
}
`,
};
