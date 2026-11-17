#include <Wire.h>
#include <Servo.h>
#include <math.h>

constexpr byte IMU = 0x68, ENABLE = 2, STBY = 12;
constexpr byte LEFT_PWM = 5, RIGHT_PWM = 6;
constexpr byte LEFT_A = 4, LEFT_B = 7, RIGHT_A = 8, RIGHT_B = 11;
constexpr float DEADBAND = 15, SEPARATION = 4, MAX_TILT = 55;
constexpr byte SPEED = 90, GRIP_MODE = 3, TRIG = A0, ECHO = A1;
Servo lift, jaw;
int liftAngle = 90, jawAngle = 70;
long clearance = -1;
unsigned long pingAt = 0;
bool modeAtEnable = false, wasEnabled = false, modeInterlock = false;
float pitchZero = 0, rollZero = 0;
bool calibrated = false;

bool readPad(float &pitch, float &roll) {
  Wire.beginTransmission(IMU);
  Wire.write(0x3B);
  if (Wire.endTransmission(false) != 0 || Wire.requestFrom(IMU, byte(6)) != 6) return false;
  const auto readAxis = []() -> float {
    const unsigned int first = Wire.read();
    return static_cast<int16_t>((first << 8) | Wire.read());
  };
  const float x = readAxis(), y = readAxis(), z = readAxis();
  const float g = sqrtf(x*x + y*y + z*z) / 16384.0f;
  if (g < .75f || g > 1.25f || z <= 0) return false;
  pitch = atan2f(x, z) * 180 / PI;
  roll = atan2f(y, z) * 180 / PI;
  return true;
}

bool calibrate() {
  float lowPitch = 90, highPitch = -90, lowRoll = 90, highRoll = -90;
  for (byte i = 0; i < 24; i++) {
    float pitch, roll;
    if (digitalRead(ENABLE) == LOW || !readPad(pitch, roll) || fabsf(pitch) > 10 || fabsf(roll) > 10) return false;
    lowPitch = min(lowPitch, pitch); highPitch = max(highPitch, pitch);
    lowRoll = min(lowRoll, roll); highRoll = max(highRoll, roll);
    pitchZero += pitch / 24; rollZero += roll / 24;
    delay(20);
  }
  return highPitch-lowPitch <= 4 && highRoll-lowRoll <= 4;
}

void outputMotor(byte pwm, byte a, byte b, int8_t direction) {
  digitalWrite(a, direction > 0);
  digitalWrite(b, direction < 0);
  analogWrite(pwm, direction ? SPEED : 0);
}

void drive(int8_t left, int8_t right) {
  static int8_t lastLeft = 2, lastRight = 2;
  if (left == lastLeft && right == lastRight) return;
  lastLeft = left;
  lastRight = right;
  digitalWrite(STBY, LOW);
  outputMotor(LEFT_PWM, LEFT_A, LEFT_B, left);
  outputMotor(RIGHT_PWM, RIGHT_A, RIGHT_B, right);
  if (left || right) digitalWrite(STBY, HIGH);
}

void setup() {
  pinMode(ENABLE, INPUT_PULLUP);
  pinMode(GRIP_MODE, INPUT_PULLUP);
  pinMode(TRIG,OUTPUT);
  pinMode(ECHO,INPUT);
  lift.attach(9);
  jaw.attach(10);
  lift.write(liftAngle);
  jaw.write(jawAngle);
  const byte outputs[] = {STBY, LEFT_PWM, RIGHT_PWM, LEFT_A, LEFT_B, RIGHT_A, RIGHT_B};
  for (byte pin : outputs) pinMode(pin, OUTPUT);
  drive(0, 0);
  Serial.begin(115200);
  Wire.begin();
  Wire.setWireTimeout(3000, true);
  Wire.beginTransmission(IMU);
  Wire.write(0x6B);
  Wire.write(0);
  if (Wire.endTransmission() == 0) {
    delay(150);
    calibrated = calibrate();
  }
  Serial.println(calibrated ? F("READY") : F("LEVEL PAD, RELEASE ENABLE, RESET"));
}

void loop() {
  float pitch = 0, roll = 0;
  const bool valid = calibrated && readPad(pitch, roll);
  if (!valid) calibrated = false;

  pitch -= pitchZero;
  roll -= rollZero;
  const float p = fabsf(pitch), r = fabsf(roll), dominant = max(p, r);
  const bool enabled = digitalRead(ENABLE) == LOW;
  const bool gripper = digitalRead(GRIP_MODE) == LOW;
  if (!enabled) modeInterlock = false;
  else if (!wasEnabled) modeAtEnable = gripper;
  else if (modeAtEnable != gripper) modeInterlock = true;
  wasEnabled = enabled;
  if (millis() - pingAt >= 65) {
    pingAt = millis();
    digitalWrite(TRIG,HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG,LOW);
    const unsigned long echo=pulseIn(ECHO,HIGH,12000);
    clearance=echo ? echo/58 : -1;
  }
  int8_t left = 0, right = 0;
  bool blocked = false;
  if (valid && enabled && !modeInterlock && dominant >= DEADBAND && dominant <= MAX_TILT && fabsf(p-r) >= SEPARATION) {
    if (gripper) {
      if (p > r) liftAngle=constrain(liftAngle+(pitch>0?1:-1),70,112);
      else jawAngle=constrain(jawAngle+(roll>0?1:-1),70,110);
      lift.write(liftAngle);
      jaw.write(jawAngle);
    } else if (p > r) {
      if (pitch < 0) left = right = -1;
      else if (clearance >= 18) left = right = 1;
      else blocked = true;
    } else { left = roll > 0 ? 1 : -1; right = -left; }
  }
  drive(left, right);
  static unsigned long lastPrint = 0;
  if (millis() - lastPrint >= 180) {
    lastPrint = millis();
    if (!valid) Serial.print(F("NO VALID PAD READING | "));
    else { Serial.print(pitch,1); Serial.print(','); Serial.print(roll,1); Serial.print(F(" | ")); }
    if (modeInterlock) Serial.println(F("RELEASE ENABLE BEFORE CHANGING MODE"));
    else if (blocked) Serial.println(F("BLOCKED"));
    else if (gripper) { Serial.print(F("LIFT/JAW ")); Serial.print(liftAngle); Serial.print('/'); Serial.println(jawAngle); }
    else Serial.println(!left ? F("STOP") : left == right ? (left > 0 ? F("FORWARD") : F("REVERSE")) : (left > 0 ? F("RIGHT") : F("LEFT")));
  }
  delay(18);
}
