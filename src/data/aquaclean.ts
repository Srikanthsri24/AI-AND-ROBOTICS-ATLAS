import type { Build } from './guided-projects';

export const aquaLimits={fullMm:115,minMm:100,maxMm:260,port:4210};
export const aquaclean:Build={
  id:'directory-10',
  title:'AQUACLEAN IoT — River Waste Cleaning & Monitoring',
  outcome:'Build a tabletop skimmer that sweeps floating litter into a draining basket and reports its status over a local network.',
  parts:[
    ['Arduino Uno R3','1','Reads the basket sensor and start button, and stops the paddle when the basket reaches its limit.'],
    ['Arduino Ethernet Shield 2','1','Sends one-way telemetry from the Uno to a viewer on the same local subnet.'],
    ['HC-SR04 ultrasonic module','1','Measures the gap to a flat follower card above the scraps in the basket. A smaller gap means the stack is nearer the sensor.'],
    ['TB6612FNG breakout','1','Switches the independent motor supply using the Uno’s speed and enable signals.'],
    ['6 V geared DC motors and wheels','1 motor and hub','Turns a low-speed paddle. The hub holds lightweight strips that sweep floating foam chips onto the ramp.'],
    ['Switched 4×AA holder','1','Powers the skimmer motor. Its onboard switch cuts motor power.'],
    ['Breadboard and jumper wires','1 set','Routes control, 5 V logic and the common ground on the dry side.'],
    ['Momentary tactile start button','1','Starts a pass after the basket is checked. Press it again to stop.'],
    ['Model river tray, ramp and mesh basket','1 set','The tray carries a shallow stream. A plastic ramp guides foam chips into a mesh basket so water can drain back into the tray.'],
  ],
  assembly:[
    ['Build the channel and drain basket','Place a clear shallow tray on a level work surface. Fit a smooth removable ramp at one end. Put a small mesh basket beyond the ramp with a clear path for drainage back into the tray. Use a few lightweight floating foam chips as litter.','A foam chip slides up the ramp without jamming, and drained water returns to the tray.',[8]],
    ['Fit the skimmer paddle','Secure the TT gearmotor on a dry side bracket. Fit the hub and four flexible plastic strips from a clean lid. Shield the hub and set blade tips to skim the water. Keep the motor and bearings above the waterline.','The rotor turns freely by hand. No strip rubs the ramp, support or basket.',[4,8]],
    ['Mount the fill sensor and network shield','Stack the shield on the disconnected Uno. Mount the ultrasonic sensor above the basket, with about 20 cm of gap to an empty basket. Use a lightweight, removable flat card as a target on top of the collected chips. Keep the target out of the incoming ramp path.','The sensor reads the target from directly above. A 11.5 cm gap can be tested with a dry card before putting any water in the tray.',[0,1,2,8]],
    ['Wire the dry control panel','Disconnect USB and the motor supply. Wire the driver, sensors and push button. Keep the AA positive isolated from the Uno 5 V rail. Run the Ethernet cable to a trusted local router and leave the motor switch off for the first upload.','Motor power goes to VM and logic power goes to VCC. All grounds share a reference. The motor supply is within the motor and driver ratings.',[0,1,2,3,4,5,6,7]],
  ],
  wiring:[
    ['Uno 5 V / GND','HC-SR04 VCC / GND','Sensor power'],
    ['Uno D2','HC-SR04 TRIG','Start range sample'],
    ['HC-SR04 ECHO','Uno D3','Measure echo pulse'],
    ['Uno 5 V / GND','TB6612 VCC / GND','Driver logic power'],
    ['Uno D5 / D6 / D8','PWMA / AIN1 / STBY','Paddle speed, direction and enable'],
    ['Uno GND','AIN2, BIN1, BIN2 and PWMB','Fixed direction, unused channel off'],
    ['TB6612 A outputs','TT motor two leads','Paddle motor power'],
    ['AA positive through its switch','TB6612 VM','Separate motor supply'],
    ['AA negative','Uno and driver GND','Common return'],
    ['Momentary button','D7 and GND','Active-low Start/Stop'],
    ['Stacked Ethernet shield','Uno ICSP plus D10','Ethernet data and select'],
    ['Shield RJ45 port','Trusted local router via Ethernet','Broadcast monitoring data'],
  ],
  test:'Start with the motor supply off. Use a flat card at 20 cm and at 11.5 cm to verify the clear and full readings in Serial Monitor and the local receiver. Lift the rotor clear before enabling motor power. With a clear basket, press Start and confirm the paddle turns toward the ramp. Bring the card to 11.5 cm to confirm it stops. Move the card back and verify a new button press is required. With USB and motor power disconnected, remove ECHO and confirm the sensor fault before running a shallow-water trial.',
  demo:['Collection basket','Clear','Full','Paddle can run','Paddle stops until the basket is emptied and restarted'],
};

export const aquacleanProgram={
  filename:'aquaclean_skimmer.ino',
  setup:'Install the Ethernet library by Arduino. Open Serial Monitor at 9600 baud. Connect the shield and computer to the same trusted local subnet, then note the address printed at startup. Run the downloadable Python receiver on that subnet. Keep motor power off while checking the gap readings.',
  source:`#include <SPI.h>
#include <Ethernet.h>
#include <EthernetUdp.h>

const byte TRIG=2, ECHO=3, PWM=5, DIRECTION=6, BUTTON=7, ENABLE=8;
const long MIN_MM=${aquaLimits.minMm}, MAX_MM=${aquaLimits.maxMm}, FULL_MM=${aquaLimits.fullMm};
byte mac[] = {0x02,0x41,0x51,0x55,0x41,0x10}; // Use a unique MAC for each station.
EthernetUDP telemetry;
bool network=false, running=false, rawButton=HIGH, stableButton=HIGH;
long gap=-1;
unsigned long lastSample=0, lastSend=0, buttonChanged=0;

void drive(bool enabled) {
  digitalWrite(ENABLE,enabled?HIGH:LOW);
  analogWrite(PWM,enabled?105:0);
}

long readGap() {
  digitalWrite(TRIG,LOW); delayMicroseconds(2);
  digitalWrite(TRIG,HIGH); delayMicroseconds(10); digitalWrite(TRIG,LOW);
  unsigned long echo=pulseIn(ECHO,HIGH,5000);
  long mm=(echo*343UL+1000UL)/2000UL;
  return echo && mm>=MIN_MM && mm<=MAX_MM ? mm : -1;
}

void setup() {
  const byte outputs[]={TRIG,PWM,DIRECTION,ENABLE,4};
  for(byte pin:outputs) pinMode(pin,OUTPUT);
  drive(false);
  digitalWrite(DIRECTION,HIGH);
  digitalWrite(4,HIGH); // Deselect the shield's unused SD card.
  pinMode(ECHO,INPUT);
  pinMode(BUTTON,INPUT_PULLUP);
  Serial.begin(9600);
  network=Ethernet.begin(mac,5000,800) && telemetry.begin(4211);
  if(network) {Serial.print(F("Station address: ")); Serial.println(Ethernet.localIP());}
  else Serial.println(F("Local network unavailable. Serial readings remain active."));
}

void loop() {
  const unsigned long now=millis();
  if(now-lastSample>=100) {
    lastSample=now;
    gap=readGap();
    if(gap<0 || gap<=FULL_MM) {running=false;drive(false);}
  }
  const bool button=digitalRead(BUTTON);
  if(button!=rawButton) {rawButton=button;buttonChanged=now;}
  if(button!=stableButton && now-buttonChanged>=30) {
    stableButton=button;
    if(button==LOW) {
      running=!running && gap>FULL_MM;
      drive(running);
    }
  }
  if(now-lastSend>=500) {
    lastSend=now;
    const char* status=gap<0?"SENSOR_FAULT":gap<=FULL_MM?"FULL":running?"RUNNING":"STOPPED";
    char packet[56];
    snprintf(packet,sizeof(packet),"%lu,%ld,%s",now,gap,status);
    Serial.println(packet);
    if(network && Ethernet.linkStatus()!=LinkOFF && telemetry.beginPacket(IPAddress(255,255,255,255),${aquaLimits.port})) {
      telemetry.write((const uint8_t*)packet,strlen(packet));
      telemetry.endPacket();
    }
  }
}
`,
};

export const aquacleanReceiver={
  filename:'aquaclean_monitor.py',
  source:`"""Listen for AQUACLEAN telemetry on the same local subnet."""
import socket

PORT = ${aquaLimits.port}
VALID = {"SENSOR_FAULT", "FULL", "RUNNING", "STOPPED"}

with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as receiver:
    receiver.bind(("", PORT))
    receiver.settimeout(2)
    print(f"Listening on UDP {PORT}. Press Ctrl+C to stop.")
    try:
        while True:
            try:
                packet, sender = receiver.recvfrom(64)
                uptime, gap, state = packet.decode("ascii").strip().split(",")
                uptime, gap = int(uptime), int(gap)
                if uptime < 0 or state not in VALID or not -1 <= gap <= 260:
                    continue
                value = "unavailable" if gap < 0 else f"{gap} mm"
                print(f"{sender[0]} | {uptime:>8} ms | Gap {value:>11} | {state}")
            except (ValueError, UnicodeError):
                continue
            except socket.timeout:
                print("No fresh data for 2 seconds. Check the network or Serial Monitor.")
    except KeyboardInterrupt:
        print("Monitor closed.")
`,
};
