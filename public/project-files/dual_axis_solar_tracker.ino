#include <Wire.h>
#include <Servo.h>
#include <Adafruit_SHT31.h>

constexpr byte PINS[] = {A0, A1, A2, A3}; // TL, TR, BL, BR
constexpr int DARK = 140, DEADBAND = 36, STEP = 2;
// Reverse a sign if an axis moves away from the lit quadrant.
constexpr int PAN_SIGN = 1, TILT_SIGN = 1;
constexpr byte PAN_MIN = 45, PAN_MAX = 135, TILT_MIN = 55, TILT_MAX = 125;
constexpr unsigned long TRACK_MS = 50, REPORT_MS = 1000;
Servo panMotor, tiltMotor;
Adafruit_SHT31 weather;
bool weatherReady = false;
int pan = 90, tilt = 90, level = 0, panError = 0, tiltError = 0;
unsigned long lastStep = 0, lastReport = 0;

int follow(int angle, int error, int direction, int low, int high) {
  if (abs(error) <= DEADBAND) return angle;
  return constrain(angle + direction * (error > 0 ? STEP : -STEP), low, high);
}

void setup() {
  Serial.begin(115200);
  panMotor.write(pan);
  tiltMotor.write(tilt);
  panMotor.attach(9);
  tiltMotor.attach(10);
  weatherReady = weather.begin(0x44);
  Serial.println(F("light,pan_error,tilt_error,pan_deg,tilt_deg,temp_C,humidity_pct"));
}

void loop() {
  const unsigned long now = millis();
  if (now - lastStep >= TRACK_MS) {
    lastStep = now;
    int light[4];
    for (byte i = 0; i < 4; ++i) {
      analogRead(PINS[i]); // Let the ADC multiplexer settle before reading.
      light[i] = analogRead(PINS[i]);
    }
    level = (light[0] + light[1] + light[2] + light[3]) / 4;
    panError = (light[1] + light[3] - light[0] - light[2]) / 2;
    tiltError = (light[0] + light[1] - light[2] - light[3]) / 2;
    if (level >= DARK) {
      pan = follow(pan, panError, PAN_SIGN, PAN_MIN, PAN_MAX);
      tilt = follow(tilt, tiltError, TILT_SIGN, TILT_MIN, TILT_MAX);
      panMotor.write(pan);
      tiltMotor.write(tilt);
    }
  }
  if (now - lastReport >= REPORT_MS) {
    lastReport = now;
    float temperature = NAN, humidity = NAN;
    if (weatherReady) weather.readBoth(&temperature, &humidity);
    Serial.print(level); Serial.print(',');
    Serial.print(panError); Serial.print(',');
    Serial.print(tiltError); Serial.print(',');
    Serial.print(pan); Serial.print(',');
    Serial.print(tilt); Serial.print(',');
    Serial.print(temperature, 1); Serial.print(',');
    Serial.println(humidity, 1);
  }
}
