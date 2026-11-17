constexpr byte triggerPin=2, echoPin=3;

void setup() {
  pinMode(triggerPin,OUTPUT);
  pinMode(echoPin,INPUT);
  digitalWrite(triggerPin,LOW);
  Serial.begin(115200);
}
void loop() {
  digitalWrite(triggerPin,HIGH);
  delayMicroseconds(10);
  digitalWrite(triggerPin,LOW);
  const auto duration=pulseIn(echoPin,HIGH,25000);
  if (!duration) Serial.println(F("NO_ECHO"));
  else Serial.println((duration*343UL+1000UL)/2000UL);
  delay(300);
}
