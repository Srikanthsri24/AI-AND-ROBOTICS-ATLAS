#include <WiFi.h>
#include <WiFiUdp.h>

constexpr char NETWORK[] = "Atlas-Model-Rail";
constexpr char PASSWORD[] = "AtlasRailLab84";
constexpr uint16_t PORT = 4210;
constexpr byte SWITCH_PIN = 25, RED_PIN = 26, GREEN_PIN = 27;
WiFiUDP radio;
bool red = true;
bool previousRaw = HIGH, stable = HIGH;
unsigned long changedAt = 0;

void showMast() {
  digitalWrite(RED_PIN, red);
  digitalWrite(GREEN_PIN, !red);
}
void setup() {
  Serial.begin(115200);
  pinMode(SWITCH_PIN, INPUT_PULLUP);
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  showMast();
  WiFi.mode(WIFI_AP);
  if (WiFi.softAP(NETWORK, PASSWORD) && radio.begin(PORT)) {
    Serial.print("Trackside address: ");
    Serial.println(WiFi.softAPIP());
  } else {
    Serial.println("Network startup failed. Check power and restart.");
  }
}
void loop() {
  const bool raw = digitalRead(SWITCH_PIN);
  if (raw != previousRaw) {
    previousRaw = raw;
    changedAt = millis();
  }
  if (raw != stable && millis() - changedAt >= 35) {
    stable = raw;
    if (stable == LOW) {
      red = !red;
      showMast();
      Serial.println(red ? "RED" : "GREEN");
    }
  }
  const int packetSize = radio.parsePacket();
  if (packetSize != 5) {
    if (packetSize > 0) radio.flush();
    return;
  }
  uint8_t packet[6];
  if (radio.read(packet, 5) != 5 || packet[0] != 'Q') return;
  packet[0] = 'A';
  packet[5] = red ? 'R' : 'G';
  if (radio.beginPacket(radio.remoteIP(), radio.remotePort())) {
    radio.write(packet, sizeof(packet));
    radio.endPacket();
  }
}
