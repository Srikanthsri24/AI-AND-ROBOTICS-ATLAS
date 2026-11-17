#include <Wire.h>
#include <SoftwareSerial.h>
#include <Adafruit_PWMServoDriver.h>

constexpr byte COUNT = 6;
constexpr int STEP = 2;
SoftwareSerial radio(2, 3); // RX from Bluefruit TXO; TX is unused.
Adafruit_PWMServoDriver driver(0x40);
const int neutralUs[COUNT] = {1500,1500,1500,1500,1500,1500};
const int sign[COUNT] = {1,1,1,1,1,1};
const int low[COUNT]  = {-42,-25,-25,-30,-30,0};
const int high[COUNT] = {42,25,25,30,30,24};
int target[COUNT] = {}, current[COUNT] = {};
bool armed = false;
unsigned long movedAt = 0;

void writeJoint(byte i) {
  driver.writeMicroseconds(i, neutralUs[i] + sign[i] * 8 * current[i]);
}
void command(char key) {
  if (key == 'H') {
    for (byte i = 0; i < COUNT; ++i) {
      target[i] = 0;
      if (!armed) writeJoint(i);
    }
    armed = true;
  } else if (key == 'S') {
    for (byte i = 0; i < COUNT; ++i) target[i] = current[i];
  } else if (armed && ((key >= 'a' && key <= 'f') || (key >= 'A' && key <= 'F'))) {
    const bool positive = key >= 'a';
    const byte i = positive ? key - 'a' : key - 'A';
    target[i] = constrain(target[i] + (positive ? STEP : -STEP), low[i], high[i]);
  } else {
    return;
  }
  Serial.print(F("Command ")); Serial.println(key);
}

void setup() {
  Serial.begin(115200);
  radio.begin(9600);
  if (!driver.begin()) {
    Serial.println(F("Servo driver unavailable at 0x40."));
    while (true) delay(1000);
  }
  driver.setPWMFreq(50);
  for (byte i = 0; i < COUNT; ++i) driver.setPWM(i, 0, 4096);
  Serial.println(F("Clear the bench. Send H to enable unloaded neutral checks."));
}
void loop() {
  if (radio.available()) command(radio.read());
  const unsigned long now = millis();
  if (!armed || now - movedAt < 25) return;
  movedAt = now;
  for (byte i = 0; i < COUNT; ++i) {
    if (current[i] == target[i]) continue;
    current[i] += constrain(target[i] - current[i],-1,1);
    writeJoint(i);
  }
}
