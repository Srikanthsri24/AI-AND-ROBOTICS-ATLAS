#include <Wire.h>
#include "esp_camera.h"
#include "mbedtls/base64.h"

constexpr int IMU = 0x68, BAUD = 115200;
constexpr float CAPTURE_ANGLE = 20, REARM_ANGLE = 10;
bool ready = false, armed = true;
float zeroAngle = 0, filteredAngle = 0;
unsigned long lastSample = 0;

bool readAngle(float &angle) {
  Wire.beginTransmission(IMU);
  Wire.write(0x3B);
  if (Wire.endTransmission(false) != 0 || Wire.requestFrom(IMU, 6) != 6) return false;
  const auto nextAxis = []() -> int16_t {
    const unsigned int hi = Wire.read();
    return static_cast<int16_t>((hi << 8) | Wire.read());
  };
  const int16_t x = nextAxis();
  nextAxis();  // Y is parallel to the hinge.
  const int16_t z = nextAxis();
  if (abs(static_cast<int>(x)) + abs(static_cast<int>(z)) < 4096) return false;
  angle = atan2f(x, z) * 180 / PI;
  return true;
}

bool startCamera() {
  camera_config_t c = {};
  c.ledc_channel = LEDC_CHANNEL_0;
  c.ledc_timer = LEDC_TIMER_0;
  c.pin_d0 = 5;  c.pin_d1 = 18; c.pin_d2 = 19; c.pin_d3 = 21;
  c.pin_d4 = 36; c.pin_d5 = 39; c.pin_d6 = 34; c.pin_d7 = 35;
  c.pin_xclk = 0; c.pin_pclk = 22; c.pin_vsync = 25; c.pin_href = 23;
  c.pin_sccb_sda = 26; c.pin_sccb_scl = 27;
  c.pin_pwdn = 32; c.pin_reset = -1;
  c.xclk_freq_hz = 20000000;
  c.pixel_format = PIXFORMAT_JPEG;
  c.frame_size = FRAMESIZE_QQVGA;
  c.jpeg_quality = 15;
  c.fb_count = 1;
  c.fb_location = CAMERA_FB_IN_DRAM;
  c.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  return esp_camera_init(&c) == ESP_OK;
}

void sendSnapshot() {
  camera_fb_t *frame = esp_camera_fb_get();
  if (frame) esp_camera_fb_return(frame);  // discard frame queued before the event
  frame = esp_camera_fb_get();
  if (!frame) {
    Serial.println("ERROR camera capture");
    return;
  }
  constexpr size_t MAX_JPEG = 32768;
  if (frame->len > MAX_JPEG) {
    esp_camera_fb_return(frame);
    Serial.println("ERROR frame too large");
    return;
  }
  const size_t capacity = 4 * ((frame->len + 2) / 3) + 1;
  unsigned char *encoded = static_cast<unsigned char *>(malloc(capacity));
  size_t bytes = 0;
  if (encoded && mbedtls_base64_encode(encoded, capacity, &bytes, frame->buf, frame->len) == 0) {
    Serial.print("JPEG ");
    Serial.write(encoded, bytes);
    Serial.println();
  } else Serial.println("ERROR JPEG encoding");
  free(encoded);
  esp_camera_fb_return(frame);
}

void setup() {
  Serial.begin(BAUD);
  Wire.begin(13, 14, 100000);
  Wire.beginTransmission(IMU);
  Wire.write(0x6B); Wire.write(0); // Wake the sensor in its default ±2 g mode.
  if (Wire.endTransmission() != 0) {
    Serial.println("ERROR MPU6050 did not respond");
    return;
  }
  if (!startCamera()) {
    Serial.println("ERROR camera initialization");
    return;
  }
  delay(250);
  if (!readAngle(zeroAngle)) {
    Serial.println("ERROR keep the plate level and reset");
    return;
  }
  ready = true;
  Serial.println("READY");
}

void loop() {
  if (!ready || millis() - lastSample < 100) { delay(2); return; }
  lastSample = millis();
  float angle;
  if (!readAngle(angle)) { Serial.println("ERROR IMU read"); return; }
  const float delta = remainderf(angle - zeroAngle, 360);
  filteredAngle += .28f * (delta - filteredAngle);
  Serial.printf("TILT %.1f %s\n", filteredAngle, armed ? "ARMED" : "HOLD");
  if (!armed && fabsf(filteredAngle) <= REARM_ANGLE) armed = true;
  if (armed && fabsf(filteredAngle) >= CAPTURE_ANGLE) {
    armed = false;
    sendSnapshot();
  }
}
