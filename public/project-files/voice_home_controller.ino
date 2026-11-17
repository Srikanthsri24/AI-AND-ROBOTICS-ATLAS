constexpr byte deskPin = 25;
constexpr byte hallPin = 26;
bool desk = false, hall = false;

void setup() {
  pinMode(deskPin, OUTPUT);
  pinMode(hallPin, OUTPUT);
  digitalWrite(deskPin, LOW);
  digitalWrite(hallPin, LOW);
  Serial.begin(115200);
}

void loop() {
  if (!Serial.available()) return;
  const char command = Serial.read();
  switch (command) {
    case 'D': desk = true; break;
    case 'd': desk = false; break;
    case 'H': hall = true; break;
    case 'h': hall = false; break;
    case 'S': desk = hall = false; break;
    case '\r': case '\n': return;
    default: Serial.println("ERR unsupported command"); return;
  }
  digitalWrite(deskPin, desk);
  digitalWrite(hallPin, hall);
  Serial.printf("Desk=%d Hall=%d\n", desk, hall);
}
