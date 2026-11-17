import type { Build } from './guided-projects';

export const binLimits={emptyMm:500,referenceFullMm:120,minGapMm:100,pickupPercent:80,clearPercent:70,port:4212};

export const smartWasteBin:Build={
  id:'directory-11',
  title:'IoT-Based Smart Waste Bin Monitoring System',
  outcome:'Build a fill monitor that reads the gap below a bin lid, calls for collection at 80%, and reports status to a local network viewer.',
  parts:[
    ['Lidded waste bin','1','Provides a repeatable distance between the sensor, bin bottom and full reference target.'],
    ['HC-SR04 ultrasonic module','1','Measures the gap to the top of a clean, flat test load when the lid is closed.'],
    ['Roller-lever microswitch','1','Pulls the lid input to ground when pressed by the closed lid. Opening the lid suspends measurement.'],
    ['Arduino Uno R3','1','Converts the measured gap into a calibrated fill estimate and updates the collection indicator.'],
    ['Arduino Ethernet Shield 2','1','Sends read-only status packets to a monitor on the local subnet.'],
    ['Red LED and 220 Ω resistor','1 each','Indicates that collection is needed. The resistor limits current.'],
    ['Breadboard and jumper wires','1 set','Connects the low-voltage parts and keeps the external wiring accessible.'],
  ],
  assembly:[
    ['Mark an empty and full reference','Use a clean lift-top bin and a flat cardboard target. Measure from the sensor’s intended position to the bottom. Set a second target position near the top, at least 10 cm below the sensor. Measure both gaps in millimeters.','The target is broad enough to reflect the sound. The sensor sees the target rather than the walls at both reference positions.',[0,1]],
    ['Mount the range sensor and lid switch','Tape or bracket the sonar to the underside of the lid, facing down when the lid is closed. Set the roller switch so the closing lid presses it without crushing it. Leave a slack loop at the hinge and keep the electronics outside the bin.','Open and close the lid slowly. The cable stays clear of the hinge and the switch clicks once at closure.',[0,1,2]],
    ['Stack and wire the dry station','Unplug USB. Stack the Ethernet shield on the Uno with all headers aligned, then wire the sonar, LED and switch. Use the switch’s COM and NO terminals. Connect Ethernet to a trusted local router.','With the switch pressed, D7 has continuity to GND. Nothing shares D4 or D10 with the sensing hardware.',[1,2,3,4,5,6]],
    ['Calibrate and run a dry fill trial','Enter the empty gap and full reference gap in the sketch. Upload and use clean, flat cardboard targets at different heights. Close the lid and let it settle before recording each reading.','The empty reference gives about 0%. The full reference gives about 100%. A tilted lid reports Lid open.',[0,1,3,5]],
  ],
  wiring:[
    ['Uno 5 V / GND','HC-SR04 VCC / GND','Ultrasonic module power'],
    ['Uno D2','HC-SR04 TRIG','Start measurement'],
    ['HC-SR04 ECHO','Uno D3','Measure the echo time'],
    ['Switch COM','Uno GND','Switch return'],
    ['Switch NO','Uno D7 with INPUT_PULLUP','Closed lid pulls the input low'],
    ['Uno D6','220 Ω → LED anode','Collection-needed indicator'],
    ['LED cathode','Uno GND','Indicator return'],
    ['Stacked Ethernet shield','Uno ICSP and D10','SPI data and shield selection'],
    ['Shield RJ45 port','Trusted local router via Ethernet','Local status broadcast'],
    ['Computer USB','Uno USB','Power and serial readings'],
  ],
  test:'With the lid closed, move a flat target from the empty reference to 80% of the way up. Check the red collection indicator. Lower the target to 75% and confirm it stays on, then lower it to 70% and confirm it clears. Open the lid and check that no fill reading is shown. Close it, wait for a new sample, and disconnect the Ethernet cable. The Python monitor should report stale data while the Uno still measures and updates the local indicator.',
  demo:['Calibrated fill','Below threshold','At threshold','Collection indicator off','Collection indicator on'],
};

export const smartBinProgram={
  filename:'smart_waste_bin.ino',
  setup:'Install Arduino’s Ethernet library. Set EMPTY_MM and REFERENCE_FULL_MM from your two measurements. The example values are 500 and 120 mm. Use Serial Monitor at 9600 baud and run the Python receiver on the same trusted subnet.',
  source:`#include <SPI.h>
#include <Ethernet.h>
#include <EthernetUdp.h>

const byte TRIG=2, ECHO=3, COLLECTION_LED=6, LID=7;
const long EMPTY_MM=${binLimits.emptyMm}, REFERENCE_FULL_MM=${binLimits.referenceFullMm};
const int ALERT_PCT=${binLimits.pickupPercent}, CLEAR_PCT=${binLimits.clearPercent};
byte mac[]={0x02,0x41,0x54,0x4c,0x41,0x11}; // Assign a unique address to each station.
EthernetUDP telemetry;
bool network=false, collection=false, lidWasOpen=true;
unsigned long closedSince=0, lastSample=0, lastSend=0;
long gap=-1;
int percent=-1;
const char* state="LID_OPEN";

long readGap() {
  digitalWrite(TRIG,LOW); delayMicroseconds(2);
  digitalWrite(TRIG,HIGH); delayMicroseconds(10); digitalWrite(TRIG,LOW);
  unsigned long echo=pulseIn(ECHO,HIGH,6500);
  long measured=(echo*343UL+1000UL)/2000UL;
  return echo && measured>=${binLimits.minGapMm} && measured<=EMPTY_MM+40 ? measured : -1;
}

void setup() {
  pinMode(TRIG,OUTPUT);
  pinMode(ECHO,INPUT);
  pinMode(COLLECTION_LED,OUTPUT);
  pinMode(LID,INPUT_PULLUP);
  pinMode(4,OUTPUT);
  digitalWrite(4,HIGH); // Deselect the Ethernet shield's unused microSD.
  Serial.begin(9600);
  network=Ethernet.begin(mac,5000,800) && telemetry.begin(4213);
  if(network) {Serial.print(F("Station address: ")); Serial.println(Ethernet.localIP());}
  else Serial.println(F("Network unavailable. Serial and local measurement remain active."));
}

void loop() {
  const unsigned long now=millis();
  const bool lidOpen=digitalRead(LID)==HIGH;
  if(!lidOpen && lidWasOpen) closedSince=now;
  lidWasOpen=lidOpen;

  if(lidOpen || now-closedSince<500) {
    gap=percent=-1;
    state=lidOpen?"LID_OPEN":"SETTLING";
  } else if(now-lastSample>=200) {
    lastSample=now;
    gap=readGap();
    percent=-1;
    if(gap<0 || REFERENCE_FULL_MM>=EMPTY_MM || REFERENCE_FULL_MM<${binLimits.minGapMm}) state="SENSOR_FAULT";
    else {
      percent=constrain((100L*(EMPTY_MM-gap)+(EMPTY_MM-REFERENCE_FULL_MM)/2)/(EMPTY_MM-REFERENCE_FULL_MM),0,100);
      if(percent>=ALERT_PCT) collection=true;
      else if(percent<=CLEAR_PCT) collection=false;
      state=collection?"COLLECTION_NEEDED":"AVAILABLE";
    }
  }
  digitalWrite(COLLECTION_LED,percent>=0 && collection);
  if(now-lastSend>=500) {
    lastSend=now;
    char packet[64];
    snprintf(packet,sizeof(packet),"%lu,%ld,%d,%s",now,gap,percent,state);
    Serial.println(packet);
    if(network && Ethernet.linkStatus()!=LinkOFF && telemetry.beginPacket(IPAddress(255,255,255,255),${binLimits.port})) {
      telemetry.write((const uint8_t*)packet,strlen(packet));telemetry.endPacket();
    }
  }
}
`,
};

export const smartBinReceiver={
  filename:'smart_bin_monitor.py',
  source:`"""Monitor waste-bin telemetry on a trusted local subnet."""
import socket

STATES = {"AVAILABLE", "COLLECTION_NEEDED", "LID_OPEN", "SETTLING", "SENSOR_FAULT"}

with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as receiver:
    receiver.bind(("", ${binLimits.port}))
    receiver.settimeout(2)
    print("Listening on UDP ${binLimits.port}. Press Ctrl+C to stop.")
    try:
        while True:
            try:
                message, sender = receiver.recvfrom(64)
                stamp, gap, fill, state = message.decode("ascii").strip().split(",")
                stamp, gap, fill = int(stamp), int(gap), int(fill)
                if stamp < 0 or gap < -1 or not -1 <= fill <= 100 or state not in STATES:
                    continue
                reading = "fill unavailable" if fill == -1 else f"{fill}% full ({gap} mm gap)"
                print(f"{sender[0]} | {stamp} ms | {reading} | {state}")
            except ValueError:
                continue
            except socket.timeout:
                print("STALE: no telemetry for 2 seconds")
    except KeyboardInterrupt:
        print("Monitor closed.")
`,
};
