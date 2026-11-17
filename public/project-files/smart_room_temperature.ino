#include <Wire.h>
#include <Adafruit_SHT31.h>
Adafruit_SHT31 roomSensor;
constexpr byte FAN_PIN=6, TARGET_PIN=A0;
constexpr float HALF_BAND=.5;
unsigned long sampledAt=0;
bool fan=false,sensorReady=false;

void setup() {
  pinMode(FAN_PIN,OUTPUT);
  digitalWrite(FAN_PIN,LOW);
  Serial.begin(115200);
  Wire.begin();
  Wire.setWireTimeout(4000,true);
  sensorReady=roomSensor.begin(0x44);
  Serial.println(F("temperature_C,target_C,fan"));
}
void loop() {
  const unsigned long now=millis();
  if(now-sampledAt<750)return;
  sampledAt=now;
  if(!sensorReady)sensorReady=roomSensor.begin(0x44);
  const float temperature=sensorReady?roomSensor.readTemperature():NAN;
  const float target=18+14.0f*analogRead(TARGET_PIN)/1023;
  if(!isfinite(temperature)){
    sensorReady=false;
    fan=false;
    digitalWrite(FAN_PIN,LOW);
    Serial.println(F("Sensor unavailable. Fan off."));
    return;
  }
  if(fan&&temperature<=target-HALF_BAND)fan=false;
  else if(!fan&&temperature>=target+HALF_BAND)fan=true;
  digitalWrite(FAN_PIN,fan);
  Serial.print(temperature,2);
  Serial.print(',');
  Serial.print(target,2);
  Serial.print(',');
  Serial.println(fan?F("ON"):F("OFF"));
}
