// Model letter sorter flap · Arduino Uno R3 and positional servo.
#include <Servo.h>

constexpr uint8_t buttonA = 2;
constexpr uint8_t buttonB = 3;
constexpr uint8_t servoPin = 9;
constexpr uint8_t angleA = 50;
constexpr uint8_t angleB = 130;
constexpr unsigned long debounceMs = 35;

enum class Selection { None, A, B, Both };
Servo flap;
Selection observed = Selection::None;
Selection accepted = Selection::None;
unsigned long changedAt = 0;

// Accept a single choice only after both buttons have been released.
bool armed = true;

Selection readButtons() {
  const bool a = digitalRead(buttonA) == LOW;
  const bool b = digitalRead(buttonB) == LOW;
  if (a && b) return Selection::Both;
  if (a) return Selection::A;
  if (b) return Selection::B;
  return Selection::None;
}

void setup() {
  pinMode(buttonA, INPUT_PULLUP);
  pinMode(buttonB, INPUT_PULLUP);
  Serial.begin(115200);
  flap.attach(servoPin);
  flap.write(90);
  Serial.println(F("Deck centered. Press A or B, then wait for the deck to settle."));
}

void loop() {
  const auto reading = readButtons();
  const auto now = millis();
  if (reading != observed) {
    observed = reading;
    changedAt = now;
  }
  if (observed == accepted || now - changedAt < debounceMs) return;
  accepted = observed;
  if (accepted == Selection::None) {
    armed = true;
    return;
  }
  if (!armed) return;
  armed = false;
  if (accepted == Selection::Both) {
    Serial.println(F("Both pressed. Holding destination."));
    return;
  }
  const bool routeToA = accepted == Selection::A;
  flap.write(routeToA ? angleA : angleB);
  Serial.println(routeToA ? F("Command: Bin A") : F("Command: Bin B"));
}
