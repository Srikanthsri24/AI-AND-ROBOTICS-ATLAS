#include <Adafruit_GPS.h>

// Enter a test number you control, including its country code.
const char recipient[] = "";
HardwareSerial& modem = Serial2;
Adafruit_GPS gps(&Serial1);
constexpr byte SEND_PIN = 7;
constexpr unsigned long FRESH_MS = 10000;
bool rawPressed = false, stablePressed = false;
unsigned long changedAt = 0, fixAt = 0;
float latitude = 0, longitude = 0;
enum Sms { IDLE, SYNC, TEXT_MODE, PROMPT, RESULT };
Sms sms = IDLE;
bool valid = false, accepted = false, syncRetried = false;
unsigned long reportedAt = 0, deadline = 0;
float sentLat = 0, sentLon = 0;
char line[80];
byte used = 0;

void endSms(const __FlashStringHelper* message) {
  sms = IDLE;
  accepted = false;
  Serial.println(message);
}
void requestSms() {
  if (sms != IDLE) { Serial.println(F("SMS pending.")); return; }
  if (!valid || millis() - fixAt >= FRESH_MS) {
    Serial.println(F("Send blocked: no fresh GPS fix."));
    return;
  }
  if (!recipient[0]) {
    Serial.println(F("Set a destination number first."));
    return;
  }
  for (const char* c = recipient; *c; ++c) {
    if ((*c < '0' || *c > '9') && !(c == recipient && *c == '+')) {
      Serial.println(F("Invalid recipient."));
      return;
    }
  }
  sentLat = latitude;
  sentLon = longitude;
  sms = SYNC;
  syncRetried = false;
  used = 0;
  deadline = millis() + 1300;
  modem.println(F("AT"));
  Serial.println(F("Submitting snapshot to modem."));
}
void acceptLine() {
  if (sms == IDLE) return;
  if (strstr(line, "ERROR") || !strcmp(line, "NO CARRIER")) {
    endSms(F("Modem declined SMS. Check SIM, antenna and registration."));
    return;
  }
  if (sms == RESULT && !strncmp(line, "+CMGS:", 6)) accepted = true;
  if (strcmp(line, "OK")) return;
  if (sms == SYNC) {
    sms = TEXT_MODE;
    deadline = millis() + 2000;
    modem.println(F("AT+CMGF=1"));
  } else if (sms == TEXT_MODE) {
    sms = PROMPT;
    deadline = millis() + 5000;
    modem.print(F("AT+CMGS=\""));
    modem.print(recipient);
    modem.println('"');
  } else if (sms == RESULT && accepted) {
    endSms(F("Modem accepted SMS. Check the destination phone."));
  }
}
void pollSms() {
  while (modem.available()) {
    const char c = modem.read();
    if (sms == PROMPT && c == '>') {
      used = 0;
      accepted = false;
      sms = RESULT;
      deadline = millis() + 45000UL;
      modem.print(F("Atlas test location: "));
      modem.print(sentLat, 5);
      modem.print(F(", "));
      modem.print(sentLon, 5);
      modem.write(26);
    } else if (c == '\r' || c == '\n') {
      if (used) {
        line[used] = 0;
        acceptLine();
      }
      used = 0;
    } else if (used < sizeof line - 1 && (used || c != ' ')) {
      line[used++] = c;
    }
  }
  if (sms != IDLE && (long)(millis() - deadline) >= 0) {
    if (sms == SYNC && !syncRetried) {
      syncRetried = true;
      deadline = millis() + 1500;
      modem.println(F("AT"));
    } else {
      if (sms == PROMPT) modem.write(27);
      endSms(F("SMS timed out. Verify network and delivery before retrying."));
    }
  }
}

void setup() {
  Serial.begin(115200);
  modem.begin(9600);
  gps.begin(9600);
  gps.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCONLY);
  gps.sendCommand(PMTK_SET_NMEA_UPDATE_1HZ);
  pinMode(SEND_PIN, INPUT_PULLUP);
  rawPressed = stablePressed = digitalRead(SEND_PIN) == LOW;
  Serial.println(F("Waiting for GPS. Press Send for one report."));
}
void loop() {
  while (Serial1.available()) {
    gps.read();
    if (!gps.newNMEAreceived()) continue;
    char* sentence = gps.lastNMEA();
    if (strlen(sentence) >= 7 && !strncmp(sentence + 3, "RMC,", 4) && gps.parse(sentence)) {
      valid = gps.fix;
      if (valid) {
        latitude = gps.latitudeDegrees;
        longitude = gps.longitudeDegrees;
        fixAt = millis();
      }
    }
  }
  pollSms();
  const unsigned long now = millis();
  const bool pressed = digitalRead(SEND_PIN) == LOW;
  if (pressed != rawPressed) { rawPressed = pressed; changedAt = now; }
  if (rawPressed != stablePressed && now - changedAt >= 35) {
    stablePressed = rawPressed;
    if (stablePressed) requestSms();
  }
  if (now - reportedAt >= 2000) {
    reportedAt = now;
    if (!valid || now - fixAt >= FRESH_MS) {
      Serial.println(F("No fresh GPS fix."));
    } else {
      Serial.print(F("Fix: "));
      Serial.print(latitude, 5);
      Serial.print(F(", "));
      Serial.println(longitude, 5);
    }
  }
}
