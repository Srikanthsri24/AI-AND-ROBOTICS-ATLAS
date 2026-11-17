// Equipment enclosure monitor · Arduino Uno R3 + two TMP36 sensors.
const uint8_t insidePin = A0;
const uint8_t roomPin = A1;
const uint8_t warningPin = 8;
const float referenceVolts = 5.0;
const float insideCorrectionC = 0.0;
const float roomCorrectionC = 0.0;
const float warningOnC = 34.0;
const float warningOffC = 32.0;
bool warning = false;

float readCelsius(uint8_t pin, float correctionC) {
  analogRead(pin);  // Let the ADC settle after selecting this input.
  unsigned int sum = 0;
  for (uint8_t sample = 0; sample < 16; ++sample) {
    sum += analogRead(pin);
  }
  const float volts = sum * referenceVolts / (16.0 * 1024.0);
  return (volts - 0.500) * 100.0 + correctionC;
}

void setup() {
  pinMode(warningPin, OUTPUT);
  digitalWrite(warningPin, LOW);
  Serial.begin(115200);
  Serial.println(F("case_c,room_c,difference_c,warning"));
}

void loop() {
  const float inside = readCelsius(insidePin, insideCorrectionC);
  const float room = readCelsius(roomPin, roomCorrectionC);
  if (inside >= warningOnC) {
    warning = true;
  } else if (inside <= warningOffC) {
    warning = false;
  }
  digitalWrite(warningPin, warning ? HIGH : LOW);
  Serial.print(inside, 1);
  Serial.print(',');
  Serial.print(room, 1);
  Serial.print(',');
  Serial.print(inside - room, 1);
  Serial.print(',');
  Serial.println(warning ? 1 : 0);
  delay(500);
}
