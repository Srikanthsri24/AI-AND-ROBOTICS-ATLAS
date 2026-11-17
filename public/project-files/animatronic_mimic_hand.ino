#include <Servo.h>

constexpr byte Count = 5, ButtonPin = 2;
const byte sensorPins[Count] = {A0,A1,A2,A3,A4};
const byte servoPins[Count] = {3,5,6,9,10};
const int rest[Count] = {90,90,90,90,90};
const int curled[Count] = {115,115,115,115,115};
Servo fingers[Count];
int openReading[Count], curledReading[Count], angle[Count];
enum State { OPEN_CAPTURE, CURL_CAPTURE, LIVE };
State state = OPEN_CAPTURE;
bool raw = false, stable = false;
unsigned long changedAt = 0, stepAt = 0;

int readDigit(byte i) {
  analogRead(sensorPins[i]);
  int total = 0;
  for (byte sample = 0; sample < 4; ++sample) total += analogRead(sensorPins[i]);
  return total / 4;
}
bool press(unsigned long now) {
  const bool pressed = digitalRead(ButtonPin) == LOW;
  if (pressed != raw) { raw = pressed; changedAt = now; }
  if (raw == stable || now - changedAt < 35) return false;
  stable = raw;
  return stable;
}
void setup() {
  pinMode(ButtonPin, INPUT_PULLUP);
  raw = stable = digitalRead(ButtonPin) == LOW;
  Serial.begin(115200);
  for (byte i = 0; i < Count; ++i) {
    angle[i] = rest[i];
    fingers[i].attach(servoPins[i]);
    fingers[i].write(angle[i]);
  }
  Serial.println(F("Open the glove and press Calibrate."));
}
void loop() {
  const unsigned long now = millis();
  if (press(now)) {
    if (state == LIVE) {
      state = OPEN_CAPTURE;
      Serial.println(F("Open the glove and press Calibrate."));
    } else if (state == OPEN_CAPTURE) {
      for (byte i = 0; i < Count; ++i) openReading[i] = readDigit(i);
      state = CURL_CAPTURE;
      Serial.println(F("Curl the glove comfortably and press Calibrate."));
    } else {
      bool valid = true;
      for (byte i = 0; i < Count; ++i) {
        curledReading[i] = readDigit(i);
        if (curledReading[i] - openReading[i] < 25) {
          valid = false;
          Serial.print(F("Check sensor on A")); Serial.println(i);
        }
      }
      state = valid ? LIVE : OPEN_CAPTURE;
      Serial.println(valid ? F("Calibrated. Move one digit at a time.") : F("Open the glove and repeat."));
    }
  }
  if (now - stepAt < 20) return;
  stepAt = now;
  for (byte i = 0; i < Count; ++i) {
    int target = rest[i];
    if (state == LIVE) {
      const int sample = constrain(readDigit(i), openReading[i], curledReading[i]);
      target = map(sample, openReading[i], curledReading[i], rest[i], curled[i]);
    }
    angle[i] += constrain(target - angle[i],-2,2);
    fingers[i].write(angle[i]);
  }
}
