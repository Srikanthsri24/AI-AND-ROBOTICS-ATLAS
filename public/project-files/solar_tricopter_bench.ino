#include <Servo.h>

Servo solar, tail;
char mode = 'S';
int pan = 90, tilt = 90;
unsigned long movedAt = 0, reportedAt = 0;

void setup() {
  Serial.begin(115200);
  solar.attach(9);
  tail.attach(10);
  solar.write(pan);
  tail.write(tilt);
  Serial.println(F("S: solar, T: propeller-free tail model."));
}
void loop() {
  if (Serial.available()) {
    const char key = Serial.read();
    if (key == 'S' || key == 'T') mode = key;
  }
  const unsigned long now = millis();
  if (now - movedAt < 40) return;
  movedAt = now;
  const int left = analogRead(A0), right = analogRead(A1);
  const int knob = analogRead(A2);
  if (mode == 'S' && (left + right) / 2 > 120 && abs(right - left) > 35) {
    pan = constrain(pan + (right > left ? 1 : -1), 45, 135);
  }
  if (mode == 'T') {
    const int target = map(knob,0,1023,65,115);
    tilt += constrain(target - tilt,-2,2);
  }
  solar.write(pan);
  tail.write(tilt);
  if (now - reportedAt >= 500) {
    reportedAt = now;
    Serial.print(mode); Serial.print(',');
    Serial.print(left); Serial.print(',');
    Serial.print(right); Serial.print(',');
    Serial.print(pan-90); Serial.print(',');
    Serial.println(tilt-90);
  }
}
