// Arduino Mega 2560. Upload with true for Robot A, false for Robot B.
constexpr bool robotA = true;
constexpr byte sleepPin = 4, pwmPin = 5;
constexpr unsigned long heartbeat = 100, timeout = 350;
constexpr unsigned long turn = 1600, gap = 450;

enum Command : byte { Stop, DriveA, DriveB };
enum Phase : byte { Idle, TurnA, Handoff, TurnB, Finish };
Phase phase = Idle;
unsigned long lastSend = 0, lastReply = 0, lastCommand = 0, phaseStart = 0;
bool knownLink = false, reported = false;
byte sequence = 0;

void drive(bool enabled) {
  if (enabled) {
    digitalWrite(sleepPin, HIGH);
    analogWrite(pwmPin, 150);
  } else {
    analogWrite(pwmPin, 0);
    digitalWrite(sleepPin, LOW);
  }
}

void setup() {
  pinMode(sleepPin, OUTPUT);
  pinMode(pwmPin, OUTPUT);
  drive(false);
  Serial.begin(115200);
  pinMode(19, INPUT_PULLUP);
  Serial1.begin(57600);
}

void runCoordinator(unsigned long now) {
  while (Serial1.available()) {
    const byte value = Serial1.read();
    if (value != (sequence | 0x80)) continue;
    lastReply = now;
    knownLink = true;
  }

  const bool ready = knownLink && now - lastReply < timeout;
  if (ready != reported) {
    Serial.println(ready ? F("Link ready") : F("Link lost. Both rigs stop."));
    reported = ready;
  }
  bool sendNow = false;
  if (!ready && phase != Idle && phase != Finish) {
    phase = Finish;
    phaseStart = now;
    sendNow = true;
  }
  while (Serial.available()) {
    const char input = Serial.read();
    if (input == 'x') {
      phase = Finish;
      phaseStart = now;
      sendNow = true;
    }
    if (input == 'g' && ready && phase == Idle) {
      phase = TurnA;
      phaseStart = now;
      sendNow = true;
      Serial.println(F("Robot A has the token"));
    }
  }
  const unsigned long elapsed = now - phaseStart;
  if (phase == TurnA && elapsed >= turn) {
    phase = Handoff;
    phaseStart = now;
    sendNow = true;
    Serial.println(F("Both stopped. Passing the token."));
  } else if (phase == Handoff && elapsed >= gap) {
    phase = TurnB;
    phaseStart = now;
    sendNow = true;
    Serial.println(F("Robot B has the token"));
  } else if (phase == TurnB && elapsed >= turn) {
    phase = Finish;
    phaseStart = now;
    sendNow = true;
    Serial.println(F("Trial complete. Both stopped."));
  } else if (phase == Finish && elapsed >= timeout + heartbeat) {
    phase = Idle;
  }

  drive(phase == TurnA && ready);
  if (sendNow || now - lastSend >= heartbeat) {
    const Command command = phase == TurnA ? DriveA : phase == TurnB ? DriveB : Stop;
    sequence = (sequence + 1) & 0x1F;
    Serial1.write(static_cast<byte>((command << 5) | sequence));
    lastSend = now;
  }
}

void runFollower(unsigned long now) {
  if (now - lastCommand >= timeout) drive(false);
  while (Serial1.available()) {
    const byte packet = Serial1.read();
    if (packet >= 0x60) continue;
    const auto command = static_cast<Command>(packet >> 5);
    drive(command == DriveB);
    lastCommand = now;
    Serial1.write(static_cast<byte>((packet & 0x1F) | 0x80));
  }
}

void loop() {
  const auto now = millis();
  if (robotA) runCoordinator(now);
  else runFollower(now);
}
