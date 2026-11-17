#include <Adafruit_Fingerprint.h>
#include <Servo.h>
#include <SoftwareSerial.h>

constexpr byte DOOR_PIN = 4, SERVO_PIN = 9;
constexpr byte LOCKED_ANGLE = 20, RELEASED_ANGLE = 85;
constexpr unsigned long RELEASE_MS = 5000;
SoftwareSerial link(2, 3);  // Uno RX, TX
Adafruit_Fingerprint sensor(&link);
Servo latch;

bool ready = false, waitingForRemoval = false;
bool released = false, opened = false;
unsigned long releasedAt = 0, nextScanAt = 0;

void lockDoor() {
  released = false;
  latch.write(LOCKED_ANGLE);
  Serial.println(F("Locked"));
}

void setup() {
  Serial.begin(115200);
  pinMode(DOOR_PIN, INPUT_PULLUP);
  opened = digitalRead(DOOR_PIN) == HIGH;
  released = opened;
  latch.write(opened ? RELEASED_ANGLE : LOCKED_ANGLE);
  latch.attach(SERVO_PIN);
  sensor.begin(57600);
  ready = sensor.verifyPassword();
  Serial.println(ready ? F("Reader ready") : F("Reader unavailable. Check UART and power."));
}

void loop() {
  const bool doorOpen = digitalRead(DOOR_PIN) == HIGH;
  const unsigned long now = millis();
  if (released) {
    if (doorOpen) opened = true;
    else if (opened || now - releasedAt >= RELEASE_MS) lockDoor();
  }
  if (!ready || released || doorOpen || now - nextScanAt < 120) return;
  nextScanAt = now;
  const byte image = sensor.getImage();
  if (image == FINGERPRINT_NOFINGER) {
    waitingForRemoval = false;
    return;
  }
  if (image != FINGERPRINT_OK || waitingForRemoval) return;
  waitingForRemoval = true;
  const bool match = sensor.image2Tz() == FINGERPRINT_OK &&
    sensor.fingerFastSearch() == FINGERPRINT_OK && sensor.fingerID == 1;
  if (match && digitalRead(DOOR_PIN) == LOW) {
    latch.write(RELEASED_ANGLE);
    released = true;
    opened = false;
    releasedAt = millis();
    Serial.println(F("ID 1 accepted. Latch released."));
  } else {
    Serial.println(F("Access denied or scan incomplete. Lift finger and retry."));
  }
}
