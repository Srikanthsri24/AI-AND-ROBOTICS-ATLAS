import type { Build } from './guided-projects';

export const industrialLimits={temperature:75,vibration:65,port:4214,staleMs:2000};
export const industrialMonitor:Build={
  id:'directory-13',
  title:'Industrial IoT Safety Monitoring System',
  outcome:'Build a classroom control panel that monitors simulated temperature and vibration, latches an alarm, and reports status over a local network. The 3D model shows what those signals mean for a conveyor.',
  parts:[
    ['Arduino Uno R3','1','Reads the test inputs and controls the local indicators.'],
    ['Arduino Ethernet Shield 2','1','Broadcasts readings and state to a local monitor.'],
    ['10 kΩ rotary test potentiometers','2','Generate temperature and vibration indices. The knobs represent synthetic signals.'],
    ['Roller-lever microswitch','1','Its normally closed contact opens when pressed, simulating a stop request or broken stop-loop wire.'],
    ['Momentary tactile start button','1','Acknowledges a cleared trip on the first press. A second press starts the model.'],
    ['Green and red LEDs with 220 Ω resistors','2 LEDs, 2 resistors','Green represents conveyor running. Red represents a latched trip.'],
    ['Breadboard and jumper wires','1 set','Connect the safe low-voltage test inputs and outputs.'],
  ],
  assembly:[
    ['Build the two input knobs','With USB disconnected, wire each potentiometer’s outer legs to 5 V and ground. Connect the center wipers to A0 and A1. Label them Temperature and Vibration.','Each input can sweep across its own 0–100 synthetic scale.',[0, 2, 6]],
    ['Wire the stop and acknowledgement controls','Connect the roller switch COM to GND and NC to D2. Connect the reset/start button between D3 and GND. The sketch enables internal pull-ups on both inputs.','The unpressed stop switch connects D2 to ground. Pressing it opens that connection.',[0, 3, 4, 6]],
    ['Add the local indicators','Connect each LED through a separate 220 Ω resistor. Stack the Ethernet shield on the disconnected Uno with its headers aligned. Connect Ethernet to a trusted local router.','Green is connected to D5 and red to D6. D4 and D10 are reserved by the shield.',[0, 1, 5, 6]],
    ['Check the bench panel','Upload the sketch and start with both knobs below their thresholds. Press the button and check green. Raise either knob and check red. Clear the condition and test the required two presses.','The first press clears red without lighting green. The second press lights green.',[2, 3, 4, 5]],
  ],
  wiring:[
    ['Uno 5 V / GND','Both potentiometer outer terminals','Test voltage reference'],
    ['Temperature / vibration center wipers','Uno A0 / A1','Independent simulated inputs'],
    ['Stop COM / NC','Uno GND / D2','Open connection requests a stop'],
    ['Reset/start button','Uno D3 and GND','Active-low acknowledgement and start'],
    ['Uno D5 / D6','220 Ω each → green / red LED anodes','Run and trip indicators'],
    ['LED cathodes','Uno GND','Shared return'],
    ['Arduino Ethernet Shield 2','Uno ICSP and D10','Ethernet data and select'],
    ['Shield RJ45 port','Trusted local router','Read-only telemetry'],
  ],
  test:'Start the model, move the temperature index to 75 and check that green turns off and red stays on. Lower it and confirm no automatic restart. Acknowledge, then start with a second press. Repeat with vibration at 65 and with the stop loop open. Disconnect Ethernet and verify the local indicators still respond. This test panel uses LEDs to represent equipment state.',
  demo:['Simulated condition','Normal','Trip','Start is permitted','Alarm stays latched until cleared and acknowledged'],
};

export const industrialProgram={
  filename:'industrial_monitor_training.ino',
  setup:'Install the Ethernet library by Arduino. This bench circuit uses the green LED to represent equipment running. Open Serial Monitor at 9600 baud and compare the status lines before and after opening the stop loop.',
  source:`#include <SPI.h>
#include <Ethernet.h>
#include <EthernetUdp.h>

const byte STOP=2, RESET_START=3, RUN_LED=5, TRIP_LED=6;
const byte TEMP_LIMIT=${industrialLimits.temperature}, VIB_LIMIT=${industrialLimits.vibration};
byte mac[]={0x02,0x41,0x54,0x4c,0x41,0x13};
EthernetUDP feed;
bool network=false, running=false, tripped=false, rawButton=HIGH, stableButton=HIGH;
unsigned long changed=0, lastSend=0;

void setup() {
  pinMode(STOP,INPUT_PULLUP);
  pinMode(RESET_START,INPUT_PULLUP);
  pinMode(RUN_LED,OUTPUT);
  pinMode(TRIP_LED,OUTPUT);
  pinMode(4,OUTPUT);
  digitalWrite(4,HIGH);
  Serial.begin(9600);
  network=Ethernet.begin(mac,5000,800) && feed.begin(4215);
}

void loop() {
  const unsigned long now=millis();
  const int temperature=(analogRead(A0)*100L+511)/1023;
  const int vibration=(analogRead(A1)*100L+511)/1023;
  const bool stopOpen=digitalRead(STOP)==HIGH;
  const bool unsafe=stopOpen || temperature>=TEMP_LIMIT || vibration>=VIB_LIMIT;
  if(unsafe) {running=false;tripped=true;}

  const bool button=digitalRead(RESET_START);
  if(button!=rawButton) {rawButton=button;changed=now;}
  if(button!=stableButton && now-changed>=30) {
    stableButton=button;
    if(button==LOW && !unsafe) {
      if(tripped) tripped=false;
      else running=!running;
    }
  }
  digitalWrite(RUN_LED,running);
  digitalWrite(TRIP_LED,tripped);

  if(now-lastSend>=500) {
    lastSend=now;
    const char* state=tripped?"TRIPPED":running?"RUNNING":"READY";
    char packet[60];
    snprintf(packet,sizeof(packet),"%lu,%d,%d,%d,%s",now,temperature,vibration,stopOpen,state);
    Serial.println(packet);
    if(network && Ethernet.linkStatus()!=LinkOFF && feed.beginPacket(IPAddress(255,255,255,255),${industrialLimits.port})) {
      feed.write((const uint8_t*)packet,strlen(packet));
      feed.endPacket();
    }
  }
}
`,
};

export const industrialReceiver={
  filename:'industrial_training_monitor.py',
  source:`"""Display the classroom panel's read-only telemetry."""
import socket

with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as receiver:
    receiver.bind(("", ${industrialLimits.port}))
    receiver.settimeout(2)
    print("Listening on UDP ${industrialLimits.port}. Press Ctrl+C to stop.")
    try:
        while True:
            try:
                packet, _ = receiver.recvfrom(64)
                ms, temp, vibration, stop, state = packet.decode("ascii").strip().split(",")
                ms, temp, vibration, stop = map(int, (ms, temp, vibration, stop))
                if ms < 0 or not (0 <= temp <= 100 and 0 <= vibration <= 100) or stop not in (0, 1):
                    continue
                if state not in ("RUNNING", "READY", "TRIPPED"):
                    continue
                print(f"{ms} ms | temperature {temp} | vibration {vibration} | stop loop {'open' if stop else 'closed'} | {state}")
            except ValueError:
                continue
            except socket.timeout:
                print("STALE: no new telemetry")
    except KeyboardInterrupt:
        print("Monitor closed.")
`,
};
