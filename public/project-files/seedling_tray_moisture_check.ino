// Seedling tray moisture check · Arduino Uno R3 + two SEN0193 probes.
struct Cell {
  const uint8_t sensorPin;
  const uint8_t ledPin;
  int dry;
  int damp;
  bool flag;
};

Cell cells[] = {{A0, 8, -1, -1, false}, {A1, 9, -1, -1, false}};

int readSoil(uint8_t pin) {
  analogRead(pin);  // Discard the first sample after switching channels.
  unsigned int sum = 0;
  for (uint8_t sample = 0; sample < 16; ++sample) {
    sum += analogRead(pin);
  }
  return (sum + 8) / 16;
}

void printCell(Cell& cell, int reading) {
  Serial.print(reading);
  if (cell.dry < 0 || cell.damp < 0) {
    cell.flag = false;
    Serial.print(F(" | capture d and w"));
  } else if (abs(cell.damp - cell.dry) < 12) {
    cell.flag = false;
    Serial.print(F(" | reference gap too small"));
  } else {
    const long index = constrain(100L * (reading - cell.dry) / (cell.damp - cell.dry), 0L, 100L);
    if (index <= 35) {
      cell.flag = true;
    } else if (index >= 45) {
      cell.flag = false;
    }
    Serial.print(F(" | index "));
    Serial.print(index);
    Serial.print(cell.flag ? F(" | check cell") : F(" | flag off"));
  }
  digitalWrite(cell.ledPin, cell.flag ? HIGH : LOW);
}

void setup() {
  for (Cell& cell : cells) {
    pinMode(cell.ledPin, OUTPUT);
    digitalWrite(cell.ledPin, LOW);
  }
  Serial.begin(115200);
  Serial.println(F("Send d in dry mix, w in damp mix, or r to clear both channels."));
}

void loop() {
  const int edge = readSoil(cells[0].sensorPin);
  const int inner = readSoil(cells[1].sensorPin);
  while (Serial.available()) {
    switch (Serial.read()) {
      case 'd':
        cells[0].dry = edge;
        cells[1].dry = inner;
        Serial.println(F("Dry references stored for EDGE and INNER."));
        break;
      case 'w':
        cells[0].damp = edge;
        cells[1].damp = inner;
        Serial.println(F("Damp references stored for EDGE and INNER."));
        break;
      case 'r':
        for (Cell& cell : cells) {
          cell.dry = cell.damp = -1;
          cell.flag = false;
        }
        Serial.println(F("References cleared."));
        break;
    }
  }
  Serial.print(F("EDGE "));
  printCell(cells[0], edge);
  Serial.print(F("  ||  INNER "));
  printCell(cells[1], inner);
  Serial.println();
  delay(400);
}
