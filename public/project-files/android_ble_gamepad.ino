#include <BLEDevice.h>
#include <BLEHIDDevice.h>
#include <BLESecurity.h>

constexpr byte PINS[] = {25,26,27,32,33,14}; // Up, Down, Left, Right, A, B.
constexpr byte COUNT=6;
bool raw[COUNT]={}, stable[COUNT]={};
unsigned long changedAt[COUNT]={};
BLECharacteristic* inputs;
volatile bool connected=false;
volatile bool freshConnection=false;
bool needsNeutral=true;
byte lastHat=8,lastButtons=0;

// Report ID 1 has a four-bit hat, four constant padding bits,
// two button bits, and six more constant padding bits.
uint8_t descriptor[]={
  0x05,0x01, 0x09,0x05, 0xA1,0x01, 0x85,0x01,
  0x09,0x39, 0x15,0x00, 0x25,0x07, 0x35,0x00, 0x46,0x3B,0x01,
  0x65,0x14, 0x75,0x04, 0x95,0x01, 0x81,0x42,
  0x65,0x00, 0x75,0x04, 0x95,0x01, 0x81,0x03,
  0x05,0x09, 0x19,0x01, 0x29,0x02, 0x15,0x00, 0x25,0x01,
  0x35,0x00, 0x45,0x01, 0x75,0x01, 0x95,0x02, 0x81,0x02,
  0x75,0x06, 0x95,0x01, 0x81,0x03, 0xC0
};
class LinkEvents:public BLEServerCallbacks {
  void onConnect(BLEServer*) override {freshConnection=true;connected=true;}
  void onDisconnect(BLEServer*) override {connected=false;BLEDevice::startAdvertising();}
};
void publish(byte hat,byte buttons) {
  uint8_t report[]={hat,buttons};
  inputs->setValue(report,sizeof report);
  inputs->notify();
  lastHat=hat;lastButtons=buttons;
}
byte direction(int x,int y){
  if(y<0)return x<0?7:x>0?1:0;
  if(y>0)return x<0?5:x>0?3:4;
  return x<0?6:x>0?2:8;
}
void setup(){
  Serial.begin(115200);
  for(byte i=0;i<COUNT;i++)pinMode(PINS[i],INPUT_PULLUP);
  BLEDevice::init("Atlas Gamepad");
  BLEServer* server=BLEDevice::createServer();
  server->setCallbacks(new LinkEvents());
  auto* hid=new BLEHIDDevice(server);
  inputs=hid->inputReport(1);
  hid->manufacturer()->setValue("VisionariesAI Labs");
  hid->hidInfo(0,1);
  hid->reportMap(descriptor,sizeof descriptor);
  hid->startServices();
  auto* security=new BLESecurity();
  security->setAuthenticationMode(ESP_LE_AUTH_BOND);
  security->setCapability(ESP_IO_CAP_NONE);
  security->setInitEncryptionKey(ESP_BLE_ENC_KEY_MASK|ESP_BLE_ID_KEY_MASK);
  BLEAdvertising* advert=server->getAdvertising();
  advert->setAppearance(0x03C4);
  advert->addServiceUUID(hid->hidService()->getUUID());
  advert->start();
  hid->setBatteryLevel(100);
  uint8_t neutral[]={8,0};
  inputs->setValue(neutral,sizeof neutral);
  Serial.println("Advertising Atlas Gamepad.");
}
void loop(){
  const unsigned long now=millis();
  bool anyDown=false;
  for(byte i=0;i<COUNT;i++){
    const bool pressed=digitalRead(PINS[i])==LOW;
    if(raw[i]!=pressed){raw[i]=pressed;changedAt[i]=now;}
    if(now-changedAt[i]>=20)stable[i]=raw[i];
    anyDown|=raw[i]||stable[i];
  }
  if(!connected){delay(5);return;}
  if(freshConnection){
    freshConnection=false;
    needsNeutral=true;
    publish(8,0);
    Serial.println("Connected. Release all controls to begin.");
  }
  if(needsNeutral){
    if(anyDown){delay(5);return;}
    needsNeutral=false;
  }
  const int x=int(stable[3])-int(stable[2]);
  const int y=int(stable[1])-int(stable[0]);
  const byte hat=direction(x,y);
  const byte buttons=stable[4]|(stable[5]<<1);
  if(hat!=lastHat||buttons!=lastButtons){
    publish(hat,buttons);
    Serial.printf("Hat %u, buttons %u\n",hat,buttons);
  }
  delay(5);
}
