constexpr byte leftPin=5, rightPin=6, sleepPin=4;
constexpr unsigned long expiry=350;
unsigned long received=0;

void drive(byte left, byte right) {
  digitalWrite(sleepPin,left||right);
  analogWrite(leftPin,left);
  analogWrite(rightPin,right);
}
void setup() {
  pinMode(leftPin,OUTPUT);
  pinMode(rightPin,OUTPUT);
  pinMode(sleepPin,OUTPUT);
  drive(0,0);
  Serial.begin(115200);
}
void loop() {
  int next=-1;
  while (Serial.available()) next=Serial.read();
  if (next>=0) {
    received=millis();
    switch (next) {
      case 'L': drive(80,135); break;
      case 'R': drive(135,80); break;
      case 'F': drive(115,115); break;
      default: drive(0,0); break;
    }
  }
  if (millis()-received>=expiry) drive(0,0);
}
