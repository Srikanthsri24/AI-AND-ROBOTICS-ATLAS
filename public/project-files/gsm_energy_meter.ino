#include <Wire.h>
#include <SoftwareSerial.h>
#include <Adafruit_INA219.h>

// Enter a test number you control, including its country code.
const char recipient[] = "";
SoftwareSerial modem(3, 2);
Adafruit_INA219 meter;
enum Sms { IDLE, SYNC, TEXT_MODE, PROMPT, RESULT };
Sms sms = IDLE;
bool valid = false, accepted = false, syncRetried = false;
unsigned long sampledAt = 0, reportedAt = 0, deadline = 0;
float volts = 0, amps = 0, watts = 0, wh = 0, previousWatts = 0;
float sentWatts = 0, sentWh = 0;
char line[80];
byte used = 0;

void endSms(const __FlashStringHelper* message) {
  sms = IDLE;
  accepted = false;
  Serial.println(message);
}
void requestSms() {
  if (sms != IDLE) { Serial.println(F("SMS pending.")); return; }
  if (!recipient[0] || !valid) {
    Serial.println(F("Set recipient and verify meter readings first."));
    return;
  }
  for (const char* c = recipient; *c; ++c) {
    if ((*c < '0' || *c > '9') && !(c == recipient && *c == '+')) {
      Serial.println(F("Invalid recipient."));
      return;
    }
  }
  sentWatts = watts;
  sentWh = wh;
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
      modem.print(F("Atlas bench: "));
      modem.print(sentWatts, 3);
      modem.print(F(" W, "));
      modem.print(sentWh, 5);
      modem.print(F(" Wh since boot."));
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
  if (!meter.begin()) {
    Serial.println(F("INA219 not found at 0x40."));
    while (true) delay(1000);
  }
  meter.setCalibration_16V_400mA();
  sampledAt = millis();
  Serial.println(F("Load meter ready. M submits a snapshot."));
}
void loop() {
  pollSms();
  if (Serial.available() && Serial.read() == 'M') requestSms();
  const unsigned long now = millis();
  const unsigned long dt = now - sampledAt;
  if (dt >= 250) {
    sampledAt = now;
    volts = meter.getBusVoltage_V();
    const bool busOk = meter.success();
    amps = meter.getCurrent_mA() / 1000.0;
    const bool good = busOk && meter.success();
    watts = max(0.0f, amps * volts);
    if (good && valid && dt <= 1000) wh += (watts + previousWatts) * .5 * dt / 3600000.0;
    previousWatts = watts;
    valid = good;
  }
  if (now - reportedAt >= 1000) {
    reportedAt = now;
    if (!valid) { Serial.println(F("Invalid INA219 sample")); return; }
    Serial.print(volts, 3); Serial.print(F(" V  "));
    Serial.print(amps * 1000, 2); Serial.print(F(" mA  "));
    Serial.print(watts, 3); Serial.print(F(" W  "));
    Serial.print(wh, 5); Serial.println(F(" Wh"));
  }
}
