import { bluetoothCar } from './bluetooth-car';
import type { Build } from './guided-projects';

const rover = bluetoothCar.parts;
export const solarSweeper: Build = {
  id:'directory-4',
  title:'Solar-Powered Floor-Cleaning Robot',
  outcome:'Build a rover that sweeps a short lane with a solar-powered felt disc. Watch it stop when shade leaves too little power for the cleaning head.',
  parts:[
    ['Regulated 5 V USB solar panel','1','Supplies the cleaning head. Choose a panel that can start the brush motor in direct sunlight.'],
    ['USB Micro-B breakout','1','Breaks out regulated USB VBUS and GND. Connect it with a USB-A to Micro-B cable.'],
    ['TT sweep motor, wheel hub and felt pads','1 set','A vertically mounted gearmotor spins a soft felt wheel to nudge dry paper scraps out of the lane.'],
    rover[0],
    ['TB6612FNG breakout','2','One driver switches AA power to the wheels. The other switches solar USB power to the cleaning motor.'],
    rover[3],rover[4],rover[5],rover[6],rover[7],
    ['10 kΩ divider resistors','2','Halve the solar USB voltage so A0 can measure it safely.'],
    ['Momentary tactile start button','1','Starts a timed pass. Press again to stop early.'],
  ],
  assembly:[
    ['Build the rolling base','Fit the wheel motors and rear caster to the chassis. Install lightweight crossbars wide enough to support the panel level.','Check that both wheels spin freely and the panel will be centered over the wheelbase.',[5,6]],
    ['Mount the sweeping head','Mount the third TT motor vertically on a front bracket with its shaft pointing down. Fit a matching wheel hub and attach three evenly spaced thin felt pads to its lower face. Use a small guard above the disc and set the clearance on a smooth tray.','Turn the disc by hand. The pads just skim the tray and the disc clears the wheels and guard.',[2,6]],
    ['Install the three supplies','Mount the panel above the deck with its USB connector supported. Secure the AA pack and USB power bank. With the panel covered and other supplies off, wire both drivers and the USB breakout.','Check motor stall current against the driver and supply limits. Solar VBUS goes to the brush driver only. AA positive goes to the wheel driver only.',[0,1,3,4,7,9]],
    ['Wire the voltage divider and start button','Join two 10 kΩ resistors in series from solar VBUS to common ground. Connect the midpoint to A0. Wire D2 to one side of the button and common ground to the other.','Check that the USB breakout reads about 5 V in full sun and its divider midpoint is about half that. Check with a multimeter before connecting A0.',[1,3,8,10,11]],
    ['Secure and inspect the finished chassis','Tie cables clear of the wheels and felt disc. Add a marked, dry, level test lane with loose paper scraps. Leave the AA pack off until the wheel stand check.','The brush can be lifted off the tray, all grounds are shared, and each positive supply remains separate.',[0,2,5,6,7]],
  ],
  wiring:[
    ['Solar USB port','USB-A to Micro-B cable → USB breakout','Regulated solar supply'],
    ['USB breakout VBUS','Brush driver VM / Vmotor','Solar power for cleaning head'],
    ['AA pack positive through its switch','Wheel driver VM / Vmotor','Battery power for propulsion'],
    ['Power bank USB','Uno USB','Controller power during untethered run'],
    ['Uno 5 V','Both driver VCC inputs','Logic power'],
    ['All supply negatives and driver GND pins','Uno GND','Common reference'],
    ['D5 / D6','Wheel driver PWMA / PWMB','Wheel speed'],
    ['D4 / D7 and D8 / D11','Wheel driver AIN1 / AIN2 and BIN1 / BIN2','Wheel direction'],
    ['D12','Wheel driver STBY','Wheel driver enable'],
    ['Wheel driver A and B outputs','Left and right wheel motors','Wheel power'],
    ['D3 / D9','Brush driver PWMA / STBY','Brush speed and enable'],
    ['Uno 5 V / GND','Brush driver AIN1 / AIN2','Fixed brush direction'],
    ['GND','Brush driver BIN1, BIN2, PWMB','Keep unused output idle'],
    ['Brush driver A outputs','Third TT motor leads','Brush power'],
    ['Solar VBUS → 10 kΩ → A0 → 10 kΩ → GND','Divider midpoint at A0','Monitor regulated USB voltage under load'],
    ['Start button','Uno D2 and GND','Active-low start or stop'],
  ],
  test:'Lift the wheels and brush on a stand. Try a full-sun start, then shade the panel while running and verify both drivers stop. Uncover it and verify motion stays stopped until you press Start again. In full sun, make two short passes at the same starting mark, first with the brush lifted and then with it skimming the tray. Compare how many scraps move outside the marked lane.',
  demo:['Solar panel','Shaded','Direct sun','Pass stops','Brush spins and the rover sweeps a lane'],
};

export const solarSweepLimits = {cutoffMv:4400,settleMs:700,passMs:3000};
export const solarSweeperProgram = {
  filename:'solar_sweeper.ino',
  setup:'Use a multimeter and Serial Monitor at 9600 baud. Keep propulsion switched off and the brush raised for the first test. Power the Uno before exposing the panel, and cover or unplug the panel before disconnecting the Uno. Check stable solar USB voltage with the brush spinning in direct sunlight. Use a guarded brush and a clear, level test tray.',
  source:`const byte START = 2, BRUSH_PWM = 3, BRUSH_STBY = 9, DRIVE_STBY = 12;
const byte LEFT_PWM = 5, RIGHT_PWM = 6;
const byte A1_PIN = 4, A2_PIN = 7, B1_PIN = 8, B2_PIN = 11;
const long MIN_SOLAR_MV = ${solarSweepLimits.cutoffMv};
const unsigned long SPIN_UP = ${solarSweepLimits.settleMs}, PASS = ${solarSweepLimits.passMs};
enum State { READY, SPINNING_UP, SWEEPING };
State state = READY;
unsigned long since = 0, lastChange = 0, lastPrint = 0;
bool lastReading = HIGH, stableButton = HIGH;

void stopAll() {
  digitalWrite(DRIVE_STBY, LOW);
  digitalWrite(BRUSH_STBY, LOW);
  analogWrite(LEFT_PWM, 0);
  analogWrite(RIGHT_PWM, 0);
  analogWrite(BRUSH_PWM, 0);
  state = READY;
}

void setup() {
  pinMode(START, INPUT_PULLUP);
  const byte outputs[] = {BRUSH_PWM,BRUSH_STBY,DRIVE_STBY,LEFT_PWM,RIGHT_PWM,
                          A1_PIN,A2_PIN,B1_PIN,B2_PIN};
  for (byte pin : outputs) pinMode(pin, OUTPUT);
  stopAll();
  digitalWrite(A1_PIN, HIGH);
  digitalWrite(B1_PIN, HIGH);
  Serial.begin(9600);
}

void loop() {
  const unsigned long now = millis();
  long solarMv = 0;
  for (byte i = 0; i < 8; ++i) solarMv += analogRead(A0);
  solarMv = solarMv * 10000L / (8L * 1023L); // 5 V ADC reference, 2:1 divider.
  if (now - lastPrint >= 250) {
    Serial.print("Solar USB (mV): ");
    Serial.println(solarMv);
    lastPrint = now;
  }

  const bool button = digitalRead(START);
  if (button != lastReading) {
    lastReading = button;
    lastChange = now;
  }
  if (button != stableButton && now - lastChange >= 30) {
    stableButton = button;
    if (stableButton == LOW) {
      if (state != READY) stopAll();
      else if (solarMv >= MIN_SOLAR_MV) {
        analogWrite(BRUSH_PWM, 210);
        digitalWrite(BRUSH_STBY, HIGH);
        state = SPINNING_UP;
        since = now;
      }
    }
  }

  if (state == SPINNING_UP && now - since >= SPIN_UP) {
    if (solarMv < MIN_SOLAR_MV) stopAll();
    else {
      analogWrite(LEFT_PWM, 105);
      analogWrite(RIGHT_PWM, 105);
      digitalWrite(DRIVE_STBY, HIGH);
      since = now;
      state = SWEEPING;
    }
  } else if (state == SWEEPING && (solarMv < MIN_SOLAR_MV || now - since >= PASS)) {
    stopAll();
  }
}
`,
};
