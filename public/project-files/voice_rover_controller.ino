#include <BluetoothSerial.h>

constexpr uint8_t LEFT_PWM=25, RIGHT_PWM=26, ENABLE=23, LINK_MODE=27;
constexpr uint8_t LEFT_IN1=32, LEFT_IN2=33, RIGHT_IN1=18, RIGHT_IN2=19;
constexpr uint8_t SPEED=110;
constexpr unsigned long PULSE_MS=850;

BluetoothSerial radio;
Stream *input=&Serial;
unsigned long motionAt=0;
bool moving=false;

void wheel(uint8_t pwm,uint8_t first,uint8_t second,int direction) {
  digitalWrite(first,direction>0);
  digitalWrite(second,direction<0);
  analogWrite(pwm,direction!=0?SPEED:0);
}
void drive(int left,int right) {
  digitalWrite(ENABLE,LOW);
  wheel(LEFT_PWM,LEFT_IN1,LEFT_IN2,left);
  wheel(RIGHT_PWM,RIGHT_IN1,RIGHT_IN2,right);
  moving=left!=0||right!=0;
  if(moving) {
    motionAt=millis();
    digitalWrite(ENABLE,HIGH);
  }
}
void setup() {
  const uint8_t outputs[]={ENABLE,LEFT_PWM,RIGHT_PWM,LEFT_IN1,LEFT_IN2,RIGHT_IN1,RIGHT_IN2};
  for(uint8_t pin:outputs)pinMode(pin,OUTPUT);
  drive(0,0);
  pinMode(LINK_MODE,INPUT_PULLUP);
  Serial.begin(115200);
  if(digitalRead(LINK_MODE)==LOW) {
    if(radio.begin("Atlas-Voice-Rover"))input=&radio;
    else input=nullptr;
  }
}
void loop() {
  if(moving&&millis()-motionAt>=PULSE_MS)drive(0,0);
  if(input==nullptr||!input->available())return;
  switch(input->read()) {
    case 'F':drive(1,1);break;
    case 'B':drive(-1,-1);break;
    case 'L':drive(-1,1);break;
    case 'R':drive(1,-1);break;
    default:drive(0,0);break;
  }
}
