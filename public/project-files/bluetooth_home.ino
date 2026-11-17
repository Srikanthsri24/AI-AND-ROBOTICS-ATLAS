#include <SoftwareSerial.h>

constexpr byte UNO_RX = 2, UNO_TX = 3, CTS = 4, RTS = 5;
constexpr byte ROOM = 6, PORCH = 7;
SoftwareSerial radio(UNO_RX, UNO_TX);
bool roomOn = false;
bool porchOn = false;

void sendReply(const char *reply) {
  digitalWrite(CTS, HIGH);
  const unsigned long started = millis();
  for (; *reply; ++reply) {
    while (digitalRead(RTS) == HIGH && millis() - started < 500) delay(1);
    if (digitalRead(RTS) == HIGH) break;
    radio.write(*reply);
  }
  digitalWrite(CTS, LOW);
}

void setup() {
  digitalWrite(CTS, HIGH);
  pinMode(CTS, OUTPUT);
  pinMode(RTS, INPUT);
  pinMode(ROOM, OUTPUT);
  pinMode(PORCH, OUTPUT);
  digitalWrite(ROOM, LOW);
  digitalWrite(PORCH, LOW);
  radio.begin(9600);
  digitalWrite(CTS, LOW);
}

void loop() {
  if (!radio.available()) return;
  switch (radio.read()) {
    case '1': roomOn = true; break;
    case '0': roomOn = false; break;
    case 'P': porchOn = true; break;
    case 'p': porchOn = false; break;
    case 'S': roomOn = porchOn = false; break;
    case '?': break;
    case '\r': case '\n': return;
    default: sendReply("ERR\n"); return;
  }
  digitalWrite(ROOM, roomOn);
  digitalWrite(PORCH, porchOn);
  char reply[] = "R0 P0\n";
  reply[1] = roomOn ? '1' : '0';
  reply[4] = porchOn ? '1' : '0';
  sendReply(reply);
}
