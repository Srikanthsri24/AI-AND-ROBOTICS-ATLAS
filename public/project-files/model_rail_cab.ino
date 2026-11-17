#include <WiFi.h>
#include <WiFiUdp.h>
#include <esp_system.h>

constexpr char NETWORK[] = "Atlas-Model-Rail";
constexpr char PASSWORD[] = "AtlasRailLab84";
constexpr uint16_t PORT = 4210;
constexpr byte RED_PIN = 26, GREEN_PIN = 27, AMBER_PIN = 33;
constexpr unsigned long INTERVAL = 250, TIMEOUT = 1000;
const IPAddress trackside(192, 168, 4, 1);
WiFiUDP radio;
unsigned long sentAt = 0, updatedAt = 0;
uint8_t request[5] = {'Q',0,0,0,0};
char aspect = '?';
bool bound = false, waiting = false;

void showCab(char next) {
  if (aspect != next) Serial.println(next == 'R' ? "STOP" : next == 'G' ? "CLEAR" : "NO UPDATE");
  aspect = next;
  digitalWrite(RED_PIN, next == 'R');
  digitalWrite(GREEN_PIN, next == 'G');
  digitalWrite(AMBER_PIN, next == '?');
}
void setup() {
  Serial.begin(115200);
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(AMBER_PIN, OUTPUT);
  showCab('?');
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(NETWORK, PASSWORD);
}
void loop() {
  const unsigned long now = millis();
  if (now - updatedAt >= TIMEOUT) showCab('?');
  if (WiFi.status() != WL_CONNECTED) {
    if (bound) radio.stop();
    bound = waiting = false;
    return;
  }
  if (!bound) {
    bound = radio.begin(PORT);
    if (!bound) return;
    sentAt = now - INTERVAL;
  }
  const int packetSize = radio.parsePacket();
  if (packetSize > 0) {
    uint8_t reply[6];
    if (packetSize == 6 && radio.remoteIP() == trackside && radio.remotePort() == PORT
        && radio.read(reply, sizeof(reply)) == sizeof(reply)
        && waiting && now - sentAt < INTERVAL && reply[0] == 'A'
        && memcmp(reply + 1, request + 1, 4) == 0 && (reply[5] == 'R' || reply[5] == 'G')) {
      waiting = false;
      updatedAt = now;
      showCab(reply[5]);
    }
    radio.flush();
  }
  if (now - sentAt < INTERVAL) return;
  sentAt = now;
  waiting = false;
  const uint32_t nonce = esp_random();
  memcpy(request + 1, &nonce, sizeof(nonce));
  if (radio.beginPacket(trackside, PORT)) {
    radio.write(request, sizeof(request));
    waiting = radio.endPacket() == 1;
  }
}
