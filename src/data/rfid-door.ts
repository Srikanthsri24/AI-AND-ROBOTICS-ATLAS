import type { Build } from './guided-projects';

export const latchMs=3000;
export const rfidDoor:Build={
  id:'directory-23',
  title:'RFID-Based Door Lock System',
  outcome:'Build a tabletop door latch and use two classroom RFID tags to observe enrollment, a match, a rejection, and automatic relocking.',
  parts:[
    ['Arduino Uno R3','1','Compares the presented tag ID against one enrolled ID held in memory.'],
    ['Adafruit PN532 NFC shield','1','Uses a 13.56 MHz antenna to read the tag and sends its ID to the Uno over I²C. Use the shield in its default I²C configuration.'],
    ['13.56 MHz ISO 14443A classroom tags','2','One tag becomes the enrolled example. The other tests how the latch behaves when the ID differs.'],
    ['Positional micro servo','1','Turns a lightweight latch arm away from the model door strike and returns it after three seconds.'],
    ['Regulated 5 V servo supply','1','Powers the servo from an independent low-voltage rail with ground shared with the Uno. Size it for the servo’s stall current.'],
    ['Green and red LEDs with 220 Ω resistors','1 of each LED and 2 resistors','Green shows the release window. Red shows that the most recent scan was rejected.'],
    ['Breadboard and jumper wires','1 set','Holds the LEDs and joins the servo ground. Use stackable shield headers or accessible header pins for D6, D7 and D9.'],
  ],
  assembly:[
    ['Make a demonstration door','Use rigid card to make a small door and stand. Mount the servo beside a strike made from folded card. Fit a lightweight horn tab that turns across the strike in the locked position and clears it in the released position. Keep the door closed while testing the latch.','With the horn disconnected, run the sketch and check travel. The mounted tab should clear both stops without forcing the servo.',[3,4]],
    ['Fit the reader shield','With USB disconnected and the servo supply off, install the shield headers with supervision if soldering is needed. Seat the PN532 shield squarely on the Uno. Keep metal hardware away from the antenna loop and reserve D2, D3, A4 and A5 for the reader configuration. D3 is reserved by the library reset parameter even if the shield does not use a separate reset jumper.','The antenna faces the tags, the shield pins align, and the servo and LED pins remain accessible.',[0,1,2]],
    ['Connect the indicators and servo','Put the red and green LEDs on the breadboard. Wire D6 to the red LED and D7 to the green LED, each through its own 220 Ω resistor. Connect their cathodes to ground. Run D9 to the servo signal, with separate servo power and a shared ground.','All grounds join. The servo supply positive connects only to the servo rail.',[0,3,4,5,6]],
    ['Enroll one classroom tag','Upload the sketch with the servo supply off. Open Serial Monitor at 115200 baud and wait for Reader ready. Start with both tags away. Send e, then present tag A by itself until the monitor says Enrolled. Remove A before scanning again.','Enrollment does not move the latch. Tag B is rejected. Tag A releases the latch for three seconds on a fresh presentation.',[0,1,2,3,5]],
  ],
  wiring:[
    ['Uno shield headers','PN532 5 V, GND, A4/SDA, A5/SCL, D2/IRQ','Stacked I²C reader connections; reserve D3 for the library reset parameter'],
    ['Uno D6 through 220 Ω','Red LED anode, cathode to Uno GND','Rejected tag'],
    ['Uno D7 through 220 Ω','Green LED anode, cathode to Uno GND','Release window'],
    ['Uno D9','Servo signal','Latch angle command'],
    ['Independent regulated 5 V and negative','Servo power and ground','Servo power'],
    ['Servo supply negative','Uno GND','Common signal reference'],
  ],
  test:'Send e with both tags away, present A, and remove it. Scan B and check for Rejected with a stationary latch. Remove B, scan A, and check for Released and the green LED. Hold A at the reader past the three-second relock; it should require removal before it can release the latch again. Power cycling clears enrollment. This is a tabletop demonstration of tag ID matching.',
  demo:['Classroom RFID tag','Other tag','Enrolled tag','Latch stays locked','Latch releases for three seconds'],
};

export const rfidDoorProgram={
  filename:'rfid_model_latch.ino',
  setup:'Install Adafruit PN532 with Adafruit BusIO and Arduino Servo in Library Manager. Use the default I²C shield configuration. Upload with the servo supply off, then power the servo and enroll a tag at 115200 baud.',
  source:`#include <Wire.h>
#include <Adafruit_PN532.h>
#include <Servo.h>
#include <string.h>

const byte RED = 6, GREEN = 7, SERVO_PIN = 9;
const int LOCKED = 35, RELEASED = 105;
const unsigned long RELEASE_MS = ${latchMs};
Adafruit_PN532 reader(2, 3);  // D2 IRQ; reserve D3 for the library reset parameter
Servo bolt;
byte learned[10] = {};
byte learnedLength = 0;
byte misses = 2;
bool enroll = false, unlocked = false, denied = false, available = false;
unsigned long unlockedAt = 0;

void setup() {
  pinMode(RED, OUTPUT);
  pinMode(GREEN, OUTPUT);
  bolt.write(LOCKED);
  bolt.attach(SERVO_PIN);
  Serial.begin(115200);
  reader.begin();
  available = reader.getFirmwareVersion() && reader.SAMConfig()
              && reader.setPassiveActivationRetries(0x01);
  Serial.println(available ? "Reader ready. Send e to enroll." : "Reader unavailable");
}

void loop() {
  if (!available) return;
  if (unlocked && millis() - unlockedAt >= RELEASE_MS) {
    unlocked = false;
    bolt.write(LOCKED);
    Serial.println("Relocked");
  }
  digitalWrite(GREEN, unlocked ? HIGH : LOW);
  digitalWrite(RED, denied && !unlocked ? HIGH : LOW);
  while (Serial.available()) {
    if (Serial.read() == 'e' && !unlocked) {
      enroll = true;
      denied = false;
      Serial.println("Present one classroom tag");
    }
  }

  byte scanned[10] = {}, length = 0;
  if (!reader.readPassiveTargetID(PN532_MIFARE_ISO14443A, scanned, &length, 180)) {
    if (misses < 2) ++misses;
    return;
  }
  const bool fresh = misses >= 2;
  misses = 0;
  if (!fresh || unlocked || length == 0 || length > sizeof(learned)) return;

  if (enroll) {
    memcpy(learned, scanned, length);
    learnedLength = length;
    enroll = false;
    Serial.println("Enrolled");
  } else if (length == learnedLength && memcmp(scanned, learned, length) == 0) {
    unlocked = true;
    denied = false;
    unlockedAt = millis();
    bolt.write(RELEASED);
    Serial.println("Released");
  } else {
    denied = true;
    Serial.println("Rejected");
  }
}
`,
};
