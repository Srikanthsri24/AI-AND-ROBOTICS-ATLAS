#include <Wire.h>
#include <Adafruit_INA219.h>

Adafruit_INA219 meter(0x40);

void setup() {
  Serial.begin(115200);
  if (!meter.begin()) {
    Serial.println(F("INA219 not found at 0x40. Check VCC, GND, SDA and SCL."));
    while (true) delay(1000);
  }
  meter.setCalibration_16V_400mA();
  Serial.println(F("seconds,load_V,current_mA,load_mW"));
}

void loop() {
  const float loadVolts = meter.getBusVoltage_V();
  const bool voltageOk = meter.success();
  const float milliamps = meter.getCurrent_mA();
  if (!voltageOk || !meter.success()) {
    Serial.println(F("Read failed. Check the I2C leads."));
  } else {
    Serial.print(millis() * 0.001, 3);
    Serial.print(',');
    Serial.print(loadVolts, 3);
    Serial.print(',');
    Serial.print(milliamps, 2);
    Serial.print(',');
    Serial.println(loadVolts * milliamps, 2);
  }
  delay(1000);
}
