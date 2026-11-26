import type { Build } from './guided-projects';

export const schoolBellSchedule=[
  {hour:8,minute:30,name:'Classes begin'},
  {hour:10,minute:30,name:'Morning break'},
  {hour:15,minute:0,name:'End of school'},
];

export const bellNotes=[{pitch:880,duration:180},{pitch:0,duration:95},{pitch:660,duration:270}];
export const bellLength=bellNotes.reduce((total,note)=>total+note.duration,0);

export const schoolBell:Build={
  id:'directory-24',
  title:'Smart Digital School Bell',
  outcome:'Build a desktop school bell that displays the time and sounds at three scheduled times on school days. Use a battery-backed clock to keep time when USB power is disconnected.',
  parts:[
    ['Arduino Uno R3','1','Reads the clock, matches weekday schedule entries and drives the piezo output on D9.'],
    ['Adafruit DS3231 RTC and CR1220','1 each','The breakout supplies calendar time over I²C. The coin cell keeps the clock running while USB power is off.'],
    ['Red 0.56-inch I²C clock display','1','An HT16K33 backpack drives the four digits and center colon over I²C.'],
    ['Passive piezo sounder','1','Plays the two notes generated at different frequencies by D9. Use a passive 5 V piezo.'],
    ['220 Ω piezo series resistor','1','Limits the brief charging current at each edge of the drive signal.'],
    ['Breadboard and jumper wires','1 set','Shares 5 V, GND, SDA and SCL between both I²C boards. A USB data cable powers and programs the Uno. The workshop’s insulating stands and fasteners are optional display fixtures.'],
  ],
  assembly:[
    ['Lay out the clock panel','Mount the display upright on a card or insulating stand with its digits facing forward. The workshop also illustrates optional board supports and a sounder cradle. Place the RTC and breadboard behind or beside it, leaving access to the coin-cell holder. Keep all exposed pins away from metal hardware.','You can see all four digits and unplug the USB cable without disturbing the wiring.',[1,2,5]],
    ['Connect the I²C bus','Disconnect USB. Route A4 to SDA and A5 to SCL on both modules. Link their GND and 5 V terminals to the corresponding Uno rails. Leave the RTC interrupt and square-wave pins open. Fit the CR1220 as marked on its holder with adult supervision.','Both devices share the same two signal lines. The display uses address 0x70 and the clock uses 0x68.',[0,1,2,5]],
    ['Add the two-tone bell','Connect D9 through 220 Ω to one piezo lead. Connect the other lead to the common ground. Mount the sounder with its opening unobstructed.','The sounder has a ground return and the resistor is in series with D9.',[0,3,4,5]],
    ['Check Monday against Saturday','Install the libraries, upload the sketch, and open Serial Monitor. Send t to set a Monday test just before 08:30, then send w to run the same test on Saturday. Use n afterward to restore the sketch compile time or upload a fresh build first.','Monday makes one two-tone chime as the display reaches 08:30. Saturday shows the same time and stays quiet.',[0,1,2,3]],
  ],
  wiring:[
    ['Uno 5 V','RTC VIN and display VCC','Shared power'],
    ['Uno GND','RTC GND, display GND, and piezo return','Common reference'],
    ['Uno A4 / SDA','RTC SDA and display SDA','I²C data'],
    ['Uno A5 / SCL','RTC SCL and display SCL','I²C clock'],
    ['Uno D9 through 220 Ω','Piezo signal lead','Square-wave tone output'],
    ['Uno USB','Computer USB','Programming and power'],
  ],
  test:'At 115200 baud send t. Expect 08:29 followed by a single two-tone bell at 08:30. Observe the remainder of that minute to verify it stays quiet. Send w and check that Saturday 08:30 does not ring. After restoring the time, disconnect USB briefly and verify the battery-backed clock advanced before reconnecting.',
  demo:['Clock','Weekend','Scheduled weekday minute','Silent','Two-tone bell'],
};

export const schoolBellProgram={
  filename:'school_bell.ino',
  setup:'In Arduino IDE, install RTClib and Adafruit LED Backpack Library with their dependencies. Open Serial Monitor at 115200 baud. The classroom test commands t and w temporarily set the hardware clock, and n restores the sketch compile time.',
  source:`#include <Wire.h>
#include <RTClib.h>
#include <Adafruit_GFX.h>
#include <Adafruit_LEDBackpack.h>

RTC_DS3231 rtc;
Adafruit_7segment face;
const byte PIEZO = 9;
const uint16_t schedule[] = {${schoolBellSchedule.map(({hour,minute})=>hour*60+minute).join(', ')}};
const uint16_t pitches[] = {${bellNotes.map(({pitch})=>pitch).join(', ')}};
const uint16_t lengths[] = {${bellNotes.map(({duration})=>duration).join(', ')}};
uint32_t lastSlot = 0;
unsigned long noteStarted = 0;
int phase = -1;
bool ready = false;

void showTime(const DateTime &now) {
  face.writeDigitNum(0, now.hour() / 10);
  face.writeDigitNum(1, now.hour() % 10);
  face.writeDigitNum(3, now.minute() / 10);
  face.writeDigitNum(4, now.minute() % 10);
  face.drawColon(true);
  face.writeDisplay();
}

bool scheduled(const DateTime &now) {
  const byte day = now.dayOfTheWeek(); // Sunday is 0
  if (day == 0 || day == 6) return false;
  const unsigned int minute = now.hour() * 60 + now.minute();
  for (auto slot : schedule) if (slot == minute) return true;
  return false;
}

void soundPhase() {
  noTone(PIEZO);
  if (phase >= 0 && pitches[phase]) tone(PIEZO, pitches[phase]);
  noteStarted = millis();
}

void setClock(const DateTime &time) {
  rtc.adjust(time);
  lastSlot = time.unixtime() / 60;
  showTime(time);
  phase = -1;
  soundPhase();
}

void setup() {
  pinMode(PIEZO, OUTPUT);
  Serial.begin(115200);
  ready = rtc.begin();
  if (!ready) { Serial.println("RTC unavailable"); return; }
  face.begin(0x70);
  if (rtc.lostPower()) rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  DateTime now = rtc.now();
  lastSlot = now.unixtime() / 60;
  showTime(now);
  Serial.println("t = Monday test; w = Saturday test; n = compile time");
}

void loop() {
  if (!ready) return;
  while (Serial.available()) {
    const char command = Serial.read();
    if (command == 't') setClock(DateTime(2026, 11, 16, 8, 29, 55));
    else if (command == 'w') setClock(DateTime(2026, 11, 21, 8, 29, 55));
    else if (command == 'n') setClock(DateTime(F(__DATE__), F(__TIME__)));
  }

  DateTime now = rtc.now();
  const uint32_t slot = now.unixtime() / 60;
  if (slot != lastSlot) {
    lastSlot = slot;
    showTime(now);
    if (scheduled(now)) {
      phase = 0;
      soundPhase();
      Serial.println("Scheduled bell");
    }
  }
  if (phase >= 0 && millis() - noteStarted >= lengths[phase]) {
    if (++phase >= int(sizeof(pitches) / sizeof(pitches[0]))) phase = -1;
    soundPhase();
  }
  delay(25);
}
`,
};
