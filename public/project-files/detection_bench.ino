#include <Wire.h>
#include <Adafruit_PN532.h>

const byte RADAR = 3, TRIG = 5, ECHO = 6;
Adafruit_PN532 reader(2, 4);
volatile uint16_t radarEdges = 0;
bool readerReady = false;
unsigned long lastReport = 0;

void motionEdge() { ++radarEdges; }

void setup() {
  Serial.begin(115200);
  pinMode(RADAR, INPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  digitalWrite(TRIG, LOW);
  reader.begin();
  readerReady = reader.getFirmwareVersion() && reader.SAMConfig()
                && reader.setPassiveActivationRetries(0x01);
  attachInterrupt(digitalPinToInterrupt(RADAR), motionEdge, FALLING);
  lastReport = millis();
  Serial.println(F("radar_edges,sonar_cm,tag_uid"));
}

void loop() {
  if (millis() - lastReport < 1000) return;
  noInterrupts();
  const uint16_t edges = radarEdges;
  radarEdges = 0;
  interrupts();
  lastReport = millis();

  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  const unsigned long echo = pulseIn(ECHO, HIGH, 13000);
  const unsigned long cm = (echo * 343UL + 10000UL) / 20000UL;
  uint8_t uid[10] = {};
  uint8_t count = 0;
  const bool found = readerReady &&
    reader.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &count, 180);

  Serial.print(edges);
  Serial.print(',');
  if (!echo || cm < 5 || cm > 200) Serial.print(F("no echo"));
  else Serial.print(cm);
  Serial.print(',');
  if (!readerReady) Serial.print(F("reader unavailable"));
  else if (!found) Serial.print(F("no tag"));
  else for (uint8_t i = 0; i < count && i < sizeof(uid); ++i) {
    if (uid[i] < 0x10) Serial.print('0');
    Serial.print(uid[i], HEX);
  }
  Serial.println();
}
