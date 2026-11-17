#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

constexpr byte WIDTH = 128, HEIGHT = 64;
constexpr byte TIME_PIN = 2, HOLD_PIN = 3, SOURCE_PIN = 9;
constexpr unsigned long DEBOUNCE_MS = 28;
Adafruit_SSD1306 oled(WIDTH, HEIGHT, &Wire, -1);
byte frame[WIDTH];
byte sampleIndex = 0;
bool hasFrame = false, hold = false;
unsigned int intervalUs = 2000, lastIntervalUs = 2000;
unsigned long nextSampleUs = 0;

struct Button {
  bool raw = false, stable = false;
  unsigned long changedAt = 0;
  bool pressed(byte pin) {
    const bool value = digitalRead(pin) == LOW;
    const unsigned long now = millis();
    if (value != raw) {
      raw = value;
      changedAt = now;
    }
    if (raw == stable || now - changedAt < DEBOUNCE_MS) return false;
    stable = raw;
    return stable;
  }
} timeButton, holdButton;

void drawFrame(bool updateTrace) {
  if (updateTrace) oled.clearDisplay();
  else oled.fillRect(0, 0, WIDTH, 10, SSD1306_BLACK);
  oled.setCursor(0, 0);
  oled.print(hold ? F("HOLD  ") : F("LIVE  "));
  oled.print((hasFrame ? lastIntervalUs : intervalUs) / 1000);
  oled.print(F(" ms/sample"));
  if (updateTrace) {
    for (byte x = 0; x < WIDTH; x += 16)
      for (byte y = 12; y < HEIGHT; y += 4) oled.drawPixel(x, y, SSD1306_WHITE);
    for (byte y = 12; y < HEIGHT; y += 17)
      for (byte x = 0; x < WIDTH; x += 4) oled.drawPixel(x, y, SSD1306_WHITE);
    if (hasFrame)
      for (byte x = 1; x < WIDTH; x++)
        oled.drawLine(x - 1, frame[x - 1], x, frame[x], SSD1306_WHITE);
  }
  oled.display();
}

void setup() {
  Serial.begin(115200);
  pinMode(TIME_PIN, INPUT_PULLUP);
  pinMode(HOLD_PIN, INPUT_PULLUP);
  Wire.begin();
  byte address = 0x3C;
  Wire.beginTransmission(address);
  if (Wire.endTransmission() != 0) {
    address = 0x3D;
    Wire.beginTransmission(address);
    if (Wire.endTransmission() != 0) {
      Serial.println(F("OLED not found. Check power and I2C."));
      while (true) delay(1000);
    }
  }
  if (!oled.begin(SSD1306_SWITCHCAPVCC, address)) {
    Serial.println(F("OLED buffer allocation failed."));
    while (true) delay(1000);
  }
  oled.setTextSize(1);
  oled.setTextColor(SSD1306_WHITE);
  pinMode(SOURCE_PIN, OUTPUT);
  // Classic 16 MHz ATmega328P: Timer1 toggles OC1A (D9) every 50 ms.
  TCCR1B = 0;
  TCCR1A = _BV(COM1A0);
  TCNT1 = 0;
  OCR1A = 12499;
  TCCR1B = _BV(WGM12) | _BV(CS11) | _BV(CS10);
  drawFrame(true);
  nextSampleUs = micros();
}

void loop() {
  if (timeButton.pressed(TIME_PIN) && !hold) {
    intervalUs = intervalUs == 2000 ? 4000 : 2000;
    sampleIndex = 0;
    nextSampleUs = micros();
  }
  if (holdButton.pressed(HOLD_PIN) && hasFrame) {
    hold = !hold;
    drawFrame(false);
    sampleIndex = 0;
    nextSampleUs = micros();
  }
  if (hold) return;
  const unsigned long now = micros();
  if ((long)(now - nextSampleUs) < 0) return;
  nextSampleUs = now + intervalUs;
  const unsigned int sample = analogRead(A0);
  frame[sampleIndex++] = 63 - ((unsigned long)sample * 51 + 511) / 1023;
  if (sampleIndex == WIDTH) {
    lastIntervalUs = intervalUs;
    hasFrame = true;
    drawFrame(true);
    sampleIndex = 0;
    nextSampleUs = micros();
  }
}
