#include <Servo.h>
Servo tendon;
int angle=80,target=80;
unsigned long lastStep=0;
void setup() {
  Serial.begin(115200);
  tendon.write(80);
  tendon.attach(9);
}
void loop() {
  while(Serial.available()){
    const char c=Serial.read();
    if(c=='0') target=80;
    if(c=='1') target=105;
  }
  if(angle!=target&&millis()-lastStep>=25){
    lastStep=millis();
    angle+=target>angle?1:-1;
    tendon.write(angle);
    if(angle==target) Serial.println(angle==80?F("Open"):F("Curl"));
  }
}
