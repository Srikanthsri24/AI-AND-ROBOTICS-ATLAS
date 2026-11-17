import type { Build } from './guided-projects';
export const gpsFreshMs=3500;
export const gpsHoldMs=650;
export const gpsAlert:Build={
 id:'directory-40',title:'Women safety device with GPS Tracking and alert',
 outcome:'Build a consent-based classroom GPS alert prototype. A held button lights a local indicator and sends location updates to a connected computer during a test alert.',
 parts:[
 ['Arduino Uno R3','1','Checks the alert button, tracks the age of GPS fixes, and reports the test over USB.'],
 ['Adafruit Ultimate GPS serial breakout','1','Receives GPS signals and sends timed NMEA fixes. Use the UART breakout, product 746.'],
 ['Momentary tactile button','1','Starts a test alert after a continuous 650 ms hold.'],
 ['Red LED and 220 Ω resistor','1 each','Shows that the local alert is active. The resistor limits LED current.'],
 ['Breadboard and jumper wires','1 set','Connects the sensor and controls. A USB data cable links the Uno to the test receiver.'],
 ],
 assembly:[
  ['Arrange the prototype and receiver','Mount the GPS breakout with its ceramic antenna facing up, away from large metal objects. Keep the test receiver nearby and leave slack in the USB cable. Label the button TEST ALERT.','The button and LED are easy to reach and the GPS antenna has an unobstructed view of the sky.',[0,1,2]],
  ['Wire the GPS serial link','Disconnect USB. Connect the GPS power and ground. Cross the two serial wires: GPS TX goes to Uno D8 and GPS RX to D7. Use the documented UART breakout with its logic-level circuitry.','The GPS and Uno share ground. The Uno USB serial port remains available for the receiver.',[0,1,4]],
  ['Fit the button and local LED','Wire the button between D2 and ground. Confirm the two selected legs connect only while pressed. Wire D6 through 220 Ω to the LED anode, with its cathode to ground.','A stable hold starts the test alert. The LED stays on until the receiver acknowledges it.',[0,2,3,4]],
  ['Run a consented location test','Upload the sketch, open Serial Monitor, and obtain a GPS fix outdoors in a suitable supervised test area. Hold the button and compare the receiver text with the LED. Enter a to acknowledge. Allow the fix to expire or test indoors to check the no-fix message.','Alerts start even before a fix is available. When coordinates are unavailable or stale, the receiver reports that explicitly. Acknowledgment ends the location stream.',[0,1,2,3]],
 ],
 wiring:[
  ['Uno 5 V and GND','GPS VIN and GND','Module power'],
  ['GPS TX','Uno D8, software RX','NMEA input'],
  ['Uno D7, software TX','GPS RX','Configuration commands'],
  ['Uno D2','Button, opposite contact to GND','Active-low alert hold'],
  ['Uno D6 through 220 Ω','LED anode, cathode to GND','Local alert indicator'],
  ['Uno USB','Consenting test operator’s computer','Test alert and location stream'],
 ],
 test:'At 115200 baud, quickly tap the button and verify it stays idle. Hold for at least 650 ms and verify the LED and test alert. While active, a fresh GPS fix produces one location update per second. A missing or older fix produces a no-fresh-fix message. Send a to acknowledge, turn off the LED, and stop sharing coordinates. This USB-connected classroom prototype demonstrates the alert workflow.',
 demo:['Alert button','Idle','Held','No sharing','Local alert and receiver update'],
};
export const gpsAlertProgram={
 filename:'test_gps_alert.ino',
 setup:'Install Adafruit GPS Library. Select Arduino Uno, upload, and open Serial Monitor at 115200 baud. Use a consenting test receiver. Coordinates are printed only while a test alert is active. The connected computer is the receiver for this build.',
 source:`#include <SoftwareSerial.h>
#include <Adafruit_GPS.h>
SoftwareSerial link(8,7);
Adafruit_GPS gps(&link);
const byte BUTTON=2, LAMP=6;
const unsigned long HOLD=${gpsHoldMs}, FRESH=${gpsFreshMs};
bool down=false, consumed=false, active=false, valid=false;
unsigned long began=0, fixAt=0, reported=0;
float latitude=0, longitude=0;
void setup(){
 pinMode(BUTTON,INPUT_PULLUP); pinMode(LAMP,OUTPUT);
 Serial.begin(115200);
 gps.begin(9600);
 gps.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCONLY);
 gps.sendCommand(PMTK_SET_NMEA_UPDATE_1HZ);
 Serial.println(F("Classroom test receiver. Hold button; send a to acknowledge."));
}
void loop(){
 gps.read();
 if(gps.newNMEAreceived() && gps.parse(gps.lastNMEA())){
  valid=gps.fix;
  if(valid){ fixAt=millis(); latitude=gps.latitudeDegrees; longitude=gps.longitudeDegrees; }
 }
 unsigned long now=millis();
 if(Serial.available() && Serial.read()=='a' && active){
  active=false; Serial.println(F("Test alert acknowledged. Location stream stopped."));
 }
 const bool pressed=digitalRead(BUTTON)==LOW;
 if(pressed!=down){
  down=pressed; began=now;
  if(!down) consumed=false;
 }
 if(down && !consumed && now-began>=HOLD){
  consumed=true;
  if(!active){ active=true; reported=now-1000; Serial.println(F("TEST ALERT")); }
 }
 digitalWrite(LAMP,active);
 if(active && now-reported>=1000){
  reported=now;
  if(valid && now-fixAt<=FRESH){
   Serial.print(F("Fresh fix: ")); Serial.print(latitude,5); Serial.print(','); Serial.println(longitude,5);
  }else Serial.println(F("No fresh GPS fix"));
 }
}
`,
};
