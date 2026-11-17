import type { Build } from './guided-projects';

export const jointNames=['Base yaw','Shoulder pitch','Elbow pitch','Wrist pitch','Wrist roll','Gripper'];
export const roverArm:Build={
  id:'directory-35',
  title:'Obstacle-avoiding car & 6-axis robotic arm',
  outcome:'Use one Arduino sketch for two tabletop builds. The rover turns away from a close obstacle. The arm demonstrates five positioning joints and an independently driven gripper, for six servo channels.',
  parts:[
    ['Arduino Uno R3','1','Run it on either build. A jumper on A2 selects rover mode at power-up.'],
    ['HC-SR04 ultrasonic module','1','Measures the clear space in front of the rover.'],
    ['TB6612FNG breakout','1','Drives the left and right motors independently.'],
    ['6 V geared DC motors and wheels','2','Provide differential drive for straight travel and turns.'],
    ['Chassis and caster','1 set','Holds the rover electronics and keeps its sensor level.'],
    ['Switched 4×AA holder','1','Feeds the rover motor driver VM rail.'],
    ['Six-channel metal robot arm kit','1','Provides five rotary joints and a servo-operated gripper. Use the PWM-servo version.'],
    ['PCA9685 PWM servo driver','1','Sends six independent servo pulses over a single I²C connection.'],
    ['External regulated arm servo supply','1','Use a supply matched to the kit servo voltage and peak current. Feed the PCA9685 V+ terminal only.'],
    ['Breadboard and jumper wires','1 set','Connects the control signals and grounds. A USB data cable powers the stationary setup and uploads the sketch.'],
    ['5 V USB power bank','1','Powers the Uno on the rover after bench testing.'],
  ],
  assembly:[
    ['Build and bench-test the rover','Attach both motors and the caster. Aim the HC-SR04 straight ahead. Wire the TB6612 to the table below with the battery switched off. Plug A2 into ground before powering the Uno. Lift the wheels and confirm both turn forward with a flat wall or card farther than 25 cm. Swap a reversed motor’s two leads with power off.','With the wheels lifted, a close obstacle commands an in-place turn. A missing echo stops both wheels.',[0,1,2,3,4,5,9,10]],
    ['Try an obstacle turn','Unplug USB from the computer and use the power bank on the rover. Start on a flat tabletop test surface with raised edges and keep a hand ready at the motor switch. Use a broad flat card as the obstacle. Move slowly and observe the next heading after the rover turns.','The rover turns for each near reading and samples again before driving forward.',[1,2,3,4,5,10]],
    ['Build the stationary arm','Disconnect both power sources and remove the A2 jumper. Attach the base, shoulder, elbow, wrist joints and gripper in the kit’s assembly order. Secure the base. Connect the driver to A4/A5 with the servo supply off. Fit the servo horns only after checking the neutral pulse on each unloaded servo.','The six servo channels follow the base-to-gripper order. Every horn can move a few degrees around its neutral position without striking a stop.',[0,6,7,8,9]],
    ['Jog one joint at a time','With the gripper empty and the work area clear, send h to center the six servos. Send 1 through 6 one at a time. Each command applies a short pulse change to its channel and returns it to neutral. Adjust center and jog pulse values for your kit before attaching any loaded linkage.','Only the selected servo moves relative to its parent link, and it returns to neutral.',[6,7,8]],
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
  test:'First test the rover with its wheels raised. Clear range should drive both wheels forward, near range should turn them in opposite directions, and no echo should stop them. Then switch off, move the Uno to the arm, and remove the mode jumper. Check h and each of the six jog commands at 115200 baud with the servos unloaded before securing the arm links.',
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
