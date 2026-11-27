import type { Build } from './guided-projects';

export const jointNames=['Base yaw','Shoulder pitch','Elbow pitch','Wrist pitch','Wrist roll','Gripper'];
export const roverArm:Build={
  id:'directory-35',
  title:'Obstacle-avoiding car & 6-axis robotic arm',
  outcome:'Choose one of two alternative builds using the same Uno sketch. The rover turns away from a close obstacle; the stationary arm has five positioning joints and a servo gripper. Disconnect both supplies before moving the shared controller between builds.',
  parts:[
    ["Arduino Uno R3", "1", "Share the controller between two alternative builds. A2 is sampled only at startup: ground selects rover mode; open selects the arm. Disconnect both supplies before moving it."],
    ["HC-SR04 ultrasonic module", "1", "The forward-facing transmit/receive pair supplies the rover range reading through A0 TRIG and A1 ECHO."],
    ["TB6612FNG breakout", "1", "The authored two-channel carrier drives the two motors. Logic VCC, motor VM and the shared ground are distinct connections."],
    ["6 V geared DC motors and wheels", "2 motors + 2 wheels", "One TT-style gearbox and matching tyre per side. Each case is retained by two cradles; the hub slides onto the output shaft."],
    ["Rover chassis and caster mounting set", "1 set", "The drilled plate and rear caster include four caster screws, washers and underside nuts. Use the matching hole pattern; the workshop geometry is not a stock drilling template."],
    ["Switched 4×AA holder", "1 holder + 4 cells", "Four alkaline cells provide nominal 6 V to the motor VM circuit through the switch. Fit the holder with its retaining strap; keep motor current out of the mini breadboard."],
    ["Six-servo arm, links and gripper kit", "1 kit with 6 servos", "The authored kit has six MG996R-style PWM servos, five positioning joints, a rack-driven gripper, horns, retainers and matching link/ear fasteners. Check every unloaded servo before fitting a horn."],
    ["PCA9685 PWM servo driver", "1", "At address 0x40 and 50 Hz, channels 0–5 command base, shoulder, elbow, wrist pitch, wrist roll and gripper. The V+ rail is separate from logic VCC."],
    ["Matched 6 V arm actuator supply", "1", "The virtual MG996R-style bench uses a separate regulated 6.00 V source with two seated leads and clamped driver ends. Match the physical servo kit voltage and peak-current requirement."],
    ["170-point mini breadboard and jumper leads", "1 mini board + 23 rover leads", "The rover uses two separate five-contact ties for logic 5 V and ground. Its 23 leads include the mode link and prepared motor/supply connections; four logic jumpers can be reused for the alternative arm."],
    ["5 V USB power bank", "1 with retaining strap", "Powers the rover Uno through USB after upload. It remains independent of the AA motor source and does not power VM directly."],
    ["Rover motor cradles and contact pads", "4 cradles + 4 pads + 4 bolt sets", "Each motor rests on two U-shaped cradles against two adhesive contact pads. Four captive screws with washers go in before the PCBs; four lower nuts later retain the cradle flanges."],
    ["Rover insulated board mounting sets", "6 complete stacks", "Four Uno and two driver positions each use a hollow post, insulating washer, through-bolt and lower nut. Fit all lower nuts before the motors obstruct underside access."],
    ["Ultrasonic support and fastening kit", "1 bracket + 6 retaining sets", "Four hollow spacers and four small screw/washer/nut sets retain the sensor PCB. Two larger screw/washer/nut sets retain the bracket foot on the chassis."],
    ["Arm fixture and board mounting hardware", "1 fixture + 12 retaining sets", "Four base anchor sets secure the arm. Eight PCB sets provide insulating posts, washers, through-screws and underside nuts for the Uno and PWM driver. The fixture includes three preassembled adhesive-footed guide posts and twelve loose cable eyes. Match the actual kit bores."],
    ["Three-wire servo extension leads", "6 × 1 m", "Each final arm joint uses its nominal 320 mm attached lead plus one 1 m extension. Preserve brown GND, red V+ and orange signal through every coupling. The unloaded calibration jig uses the attached lead directly."],
    ["USB-A to USB-B data cable", "1", "Carries upload/serial data and logic power from the computer to the Uno. Move the Type-A end to the power bank for the rover; this cable does not carry motor or servo V+ current."],
    ["Computer with USB and Arduino IDE", "1", "Uploads the C++ Arduino sketch and provides the 115200-baud Serial Monitor for arm commands. The standalone browser workshop models this process without uploading to a physical board."],
    ["Wheel-test stand and flat obstacle cards", "1 stable stand + 2 cards", "Support the rover chassis with both drive wheels clear for the first test. Use broad flat cards for clear/near readings, measured from the sensor face, then repeat on a flat floor course."],
  ],
  assembly:[
    ["Prepare the hidden fasteners and boards", "With both sources disconnected, support the bare chassis on its stand. Insert the four motor screws and washers before a PCB can cover their heads. Fit the six insulating posts, align the Uno and driver holes, then fit each board washer, bolt and underside nut. Complete these lower nuts before adding the motors.", "The PCBs sit flat on their posts. The four captive motor shafts point down through their own bores, ready for the cradle flanges.", [0, 2, 4, 11, 12, 18]],
    ["Retain the motors, wheels and caster", "Press two adhesive contact pads under each motor position. Raise the gearboxes with shafts pointing outwards, then raise each U-cradle over its captive screw and retain its flange with a lower nut. Fit the wheels only after the cases are secure. Hold the rear caster plate against its four chassis bores, insert its four screw/washer sets and retain all four nuts below the plate.", "Each gearbox is supported below and padded above. Cases do not rock; both tyres and the caster roll freely without rubbing.", [3, 4, 11, 18]],
    ["Mount the supplies and range sensor", "Seat the mini breadboard, switched AA holder and USB bank in their marked areas and secure both supply straps with all outputs off. Fit the sensor bracket foot with its two retained anchors. Hold four hollow spacers against the upright, align the sensor PCB, insert the four small screws and washers, then retain their rear nuts evenly.", "Both transducers point forward. The sensor board is flat and clear of the metal bracket; ports, tabs and switches remain accessible.", [1, 4, 5, 9, 10, 13]],
    ["Connect the rover and upload", "Keep AA motor power off. Follow the wiring table and the workshop’s individual connection ends: A2 to GND before startup, D2 to STBY, A0/A1 to TRIG/ECHO and the independent left/right driver channels. Use separate mini-board ties for logic 5 V and GND; connect the motor return directly to the driver ground. Follow Program & test to upload through the computer USB cable before using the power bank.", "Trace every lead by its printed contact names. No logic tie bridges into the other rail, and neither motor current nor VM enters the Uno 5 V socket.", [0, 1, 2, 5, 9, 16, 17]],
    ["Check the lifted wheels", "Start USB logic, then AA motor power. With a broad flat card farther than 25 cm from the sensor face, confirm both wheels request forward drive. A valid reading from 4 to 25 cm requests opposite wheel directions for a timed turn; a missing or very close echo requests stop. If a motor is reversed, switch both sources off before swapping its two leads.", "The chassis stays on the stand while the wheels respond. Switch AA off, then USB off, and let the wheels stop before moving the rover.", [1, 2, 3, 5, 10, 16, 18]],
    ["Try a floor obstacle trial", "With both sources off and the wheels stopped, move the rover from the stand to a flat floor course. Use the USB bank for logic. Start logic before AA motor power and place a broad card ahead. Compare a clear path with a near card; observe the short timed turn and the next sampled heading rather than expecting continuous steering during that turn.", "The car samples again after turning. The browser shows its last sampled beam; it does not model tyre slip, contact collisions or acoustic reflections.", [1, 2, 3, 5, 10, 18]],
    ["Check all six unloaded servos", "Disconnect rover supplies, remove the A2 ground link and set up the prechecked arm service jig. Connect one horn-free servo at a time: brown to GND, red to V+ and orange to the selected channel signal. Start USB logic, then the matched actuator source. Check neutral, the small jog and timed return, record the result, then switch actuator output off before USB and before changing servos.", "All six channels have an unloaded result before assembly. The virtual response is authored; adjust a physical kit’s centre/jog values before attaching its linkages.", [0, 6, 7, 8, 9, 16, 17]],
    ["Assemble and secure the stationary arm", "With both sources off, secure the arm base to its fixture using all four retained anchors. Follow the workshop from base through shoulder, elbow, wrist pitch, wrist roll and gripper. Seat horns at the checked neutral orientation and retain their centre screws. Mount both PCBs on the eight insulated fixture stacks. Add one 1 m extension to each attached servo lead without reversing its three conductors. Route each lead through its labelled incoming eye and its service-loop return eye; leave the two broad slack turns loose, never taut.", "The base stays flat. Each case is fixed to its parent cradle while its horn moves the next link; slack follows the joints rather than pulling a plug.", [6, 7, 8, 14, 15]],
    ["Wire and test one arm channel at a time", "Leave A2 open at startup. Connect Uno A4/A5 to SDA/SCL, Uno 5 V to logic VCC and GND to the shared reference. Clamp the separate actuator supply into V+ and GND, then seat servo extensions on channels 0–5 in base-to-gripper order. Start USB logic before actuator output. In the 115200-baud Serial Monitor send h, then 1–6 individually with the gripper empty.", "Only the selected servo changes relative to its parent link and returns to neutral. Shut actuator output down before USB; never change a connection while either source is on.", [0, 6, 7, 8, 9, 15, 16, 17]],
  ],
  wiring:[
    ['A2 to Uno GND at startup','Rover mode','Leave A2 open for arm mode'],
    ['Uno 5 V and GND','HC-SR04 and TB6612 logic power','Rover logic rail'],
    ['A0 / A1','HC-SR04 TRIG / ECHO','Rover range input'],
    ['D5 / D6','TB6612 PWMA / PWMB','Wheel speed'],
    ['D4, D7 / D8, D12','TB6612 AIN1, AIN2 / BIN1, BIN2','Direction'],
    ['D2','TB6612 STBY','Motor enable'],
    ['Battery + / negative','TB6612 VM / shared GND','Motor supply'],
    ['TB6612 A01/A02 and B01/B02','Left and right motor pairs','Motor outputs'],
    ['A4 SDA and A5 SCL','PCA9685 SDA and SCL','Arm I²C commands'],
    ['Uno 5 V and GND','PCA9685 VCC and GND','Driver logic and shared reference'],
    ['Matched external servo + and negative','PCA9685 V+ and GND','Servo power rail'],
    ['PCA9685 channels 0–5','Base, shoulder, elbow, wrist pitch, wrist roll, gripper','Match signal, V+ and ground orientation'],
  ],
  test:'Rover: start with lifted wheels, test clear (>25 cm), near (4–25 cm) and missing/very close echoes, then shut both sources down before moving to the floor. Arm: with A2 open, record each unloaded servo’s neutral/jog/return before fitting horns. After assembly, use h and 1–6 at 115200 baud, one empty-gripper joint test at a time. Start logic before actuator power and shut actuator power off first.',
  demo:['Rover range','Clear path','Obstacle close','Drives forward','Turns to clear the obstacle'],
};
export const roverArmProgram={
  filename:'rover_and_robot_arm.ino',
  setup:'Install Adafruit PWM Servo Driver Library and its dependencies. Upload with motor and servo power off. Select the build with the A2 jumper before boot. Open Serial Monitor at 115200 baud for the arm test. Start with the arm horns disconnected.',
  source:`#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>
Adafruit_PWMServoDriver servos;
const byte SELECT=A2, TRIG=A0, ECHO=A1, STBY=2;
const byte PWM[]={5,6}, FIRST[]={4,8}, SECOND[]={7,12};
const int center[]={1500,1500,1500,1500,1500,1500};
const int jog[]={60,60,60,60,60,60};
bool rover=false, homed=false, turning=false;
int active=-1;
unsigned long changed=0, sampled=0;
void wheel(byte i,int speed){
  digitalWrite(FIRST[i],speed>0);
  digitalWrite(SECOND[i],speed<0);
  analogWrite(PWM[i],abs(speed));
}
int distance(){
  digitalWrite(TRIG,LOW); delayMicroseconds(2);
  digitalWrite(TRIG,HIGH); delayMicroseconds(10); digitalWrite(TRIG,LOW);
  unsigned long echo=pulseIn(ECHO,HIGH,10000);
  return echo ? (echo*343UL+10000UL)/20000UL : -1;
}
void setup(){
  pinMode(SELECT,INPUT_PULLUP);
  rover=digitalRead(SELECT)==LOW;
  Serial.begin(115200);
  if(rover){
    pinMode(TRIG,OUTPUT); pinMode(ECHO,INPUT); pinMode(STBY,OUTPUT);
    for(byte i=0;i<2;++i){ pinMode(PWM[i],OUTPUT); pinMode(FIRST[i],OUTPUT); pinMode(SECOND[i],OUTPUT); }
    wheel(0,0); wheel(1,0); digitalWrite(STBY,HIGH);
  }else{
    if(!servos.begin()){ Serial.println("Driver unavailable"); while(true) delay(1000); }
    servos.setPWMFreq(50);
    for(byte i=0;i<6;++i) servos.setPWM(i,0,4096);
    Serial.println("With horns clear, send h for neutral, then 1–6 to jog.");
  }
}
void loop(){
  const unsigned long now=millis();
  if(rover){
    if(turning && now-changed<320) return;
    if(turning){ turning=false; wheel(0,0); wheel(1,0); }
    if(now-sampled<70) return;
    sampled=now;
    const int cm=distance(); Serial.println(cm);
    if(cm<4){ wheel(0,0); wheel(1,0); }
    else if(cm<=25){ turning=true; changed=millis(); wheel(0,112); wheel(1,-112); }
    else { wheel(0,116); wheel(1,116); }
    return;
  }
  if(active>=0 && now-changed>=650){ servos.writeMicroseconds(active,center[active]); active=-1; }
  if(!Serial.available()) return;
  const char command=Serial.read();
  if(command=='h'){
    for(byte i=0;i<6;++i) servos.writeMicroseconds(i,center[i]);
    homed=true; active=-1;
  }else if(homed && active<0 && command>='1' && command<='6'){
    active=command-'1'; servos.writeMicroseconds(active,center[active]+jog[active]); changed=now;
  }
}
`,
};
