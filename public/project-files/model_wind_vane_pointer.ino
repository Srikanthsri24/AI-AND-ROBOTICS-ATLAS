// Model wind vane pointer · Arduino Uno R3 + Adafruit AS5600 breakout.
#include <Wire.h>
constexpr uint8_t address = 0x36;
constexpr int countsPerTurn = 4096;
int north = -1;
int orientation = 0;

bool readRegister(uint8_t first, uint8_t* values, uint8_t length) {
  Wire.beginTransmission(address);
  Wire.write(first);
  if (Wire.endTransmission(false) != 0) return false;
  if (Wire.requestFrom(address, length) != length) return false;
  for (uint8_t i = 0; i < length; ++i) values[i] = Wire.read();
  return true;
}

int wrapCounts(int counts) {
  return (counts + countsPerTurn) % countsPerTurn;
}

void setup() {
  Wire.begin();
  Serial.begin(115200);
  Serial.println(F("Point at N and send n. Point at E and send e."));
}

void loop() {
  char command = 0;
  while (Serial.available()) {
    const int value = Serial.read();
    if (value == 'n' || value == 'e') command = value;
  }
  uint8_t status;
  uint8_t angle[2];
  if (!readRegister(0x0B, &status, 1) || !readRegister(0x0C, angle, 2)) {
    Serial.println(F("I2C read failed. Check wiring."));
  } else if (!(status & 0x20) || (status & 0x18)) {
    Serial.println(F("Adjust the magnet alignment or gap."));
  } else {
    const int raw = ((angle[0] & 0x0F) << 8) | angle[1];
    if (command == 'n') {
      north = raw;
      orientation = 0;
      Serial.println(F("North saved."));
    } else if (command == 'e' && north >= 0) {
      const int delta = wrapCounts(raw - north + 2048) - 2048;
      if (abs(abs(delta) - 1024) <= 256) {
        orientation = delta > 0 ? 1 : -1;
        Serial.println(F("East saved."));
      } else {
        Serial.println(F("East must be near a quarter turn from north."));
      }
    }
    Serial.print(F("Raw "));
    Serial.print(raw);
    if (orientation) {
      const int heading = wrapCounts((raw - north) * orientation);
      Serial.print(F(" | Heading "));
      Serial.print(heading * 360.0 / countsPerTurn, 1);
      Serial.print(F(" deg"));
    } else {
      Serial.print(F(" | Capture N then E."));
    }
    Serial.println();
  }
  delay(200);
}
