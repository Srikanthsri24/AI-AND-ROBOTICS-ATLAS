import type { Build } from './guided-projects';

export const exhibitCode='2580';
export const relockDelay=3000;
export const keypadKeys=['1','2','3','4','5','6','7','8','9','*','0','#'];
export const exhibitionLock:Build={
 id:'directory-39',title:'Smart Door Lock project (Exhibition working model)',
 outcome:'Build a tabletop door with a keypad, sliding bolt and magnetic contact. Enter the exhibit code, open the model door and verify that the bolt waits for a stable closure before relocking.',
 parts:[
 ['Arduino Uno R3','1','Scans the keypad and reads the position of the door.'],
 ['3×4 membrane matrix keypad','1','Uses four row and three column connections for all twelve keys.'],
 ['Magnetic door contact switch','1 pair','The reed contact and its matching magnet tell the Uno when the door has closed.'],
 ['Positional micro servo','1','Moves a lightweight sliding bolt through a short wire link.'],
 ['Green and red LEDs with 220 Ω resistors','1 of each LED and 2 resistors','Green indicates the retracted bolt. Red shows an incorrect code.'],
 ['Regulated 5 V servo supply','1','Powers the servo from a separate regulated rail, with ground shared with the Uno.'],
 ['Breadboard and jumper wires','1 set','Connect the keypad ribbon, indicators and ground. Use a USB data cable for power and programming.'],
 ],
 assembly:[
 ['Build a lightweight door and strike','Hinge a card door to its frame. Mount a light sliding bolt on the fixed jamb so it enters a guide on the closed door. Use a short bent wire link from the servo horn to the slider. Keep the movement free of pinch points and avoid fitting the horn until you have checked the servo travel.','The door opens freely with the bolt retracted. Try the bolt by hand and verify it enters the guide when the door is fully closed.',[3,5]],
 ['Align the door contact','Fix the wired reed switch to the frame and its magnet to the door. Close the door, align both halves within the documented sensing distance, and test for continuity. Reopen and confirm the contact opens.', 'The Uno reads LOW only when the door is shut at the guide. Secure wires on the fixed frame.',[0,2,6]],
 ['Fit the keypad and wire controls','Mount the membrane keypad near the frame with its ribbon flat. Identify C1–C3 and R1–R4 from the part pin diagram; use the mapping below. Connect the contact, status LEDs and shared ground. Plug in the servo and verify both positions without the link fitted.','Each key registers once. The servo supply positive stays separate from the Uno’s 5 V.',[0,1,2,3,4,5,6]],
 ['Run a visitor demonstration','Start with the door closed and allow the bolt to lock. Enter 1111 then #. Clear with * if needed. Enter 2580 then # and open the door before the three-second delay. Leave it open for several seconds, then close it.', 'An incorrect entry leaves the door locked. After a correct entry, the bolt stays retracted while the door is open and extends only after three continuous seconds closed.',[0,1,2,3,4]],
 ],
 wiring:[
 ['D2, D3, D5, D6','Keypad rows R1, R2, R3, R4','Matrix row scan'],
 ['A0, A1, A2','Keypad columns C1, C2, C3','Pulled-up inputs'],
 ['Uno D4','Reed contact, other lead to GND','LOW when door is shut'],
 ['Uno D7 / D8 through separate 220 Ω resistors','Red / green LED anodes, cathodes to GND','Code and bolt status'],
 ['Uno D9','Servo signal','Bolt position'],
 ['Separate regulated 5 V and negative','Servo power and ground; join negative to Uno GND','Servo supply and shared reference'],
 ],
 test:'Use Serial Monitor at 115200 baud. Enter 1111# and verify Rejected, then enter 2580# and verify Accepted. Open the door within three seconds, hold it open, then close it. The bolt should extend only after the closure delay. Briefly reopen during that delay and verify the delay restarts. This exposed tabletop mechanism uses a public exhibit code.',
 demo:['Exhibit code','Wrong','Correct','Bolt remains locked','Bolt retracts while the door is open'],
};

export const exhibitionLockProgram={
 filename:'exhibition_door_lock.ino',
 setup:'Install the Arduino Servo library. Upload with servo supply off and initially leave the horn disconnected. Start with the door closed. Use a rigid guide so the unloaded bolt moves cleanly at both servo angles.',
 source:`#include <Servo.h>
#include <string.h>
const byte rows[]={2,3,5,6}, columns[]={A0,A1,A2};
const char keys[]="${keypadKeys.join('')}";
const char code[]="${exhibitCode}";
const byte REED=4, RED=7, GREEN=8, MOTOR=9;
const int RETRACTED=35, EXTENDED=78;
const unsigned long WAIT_MS=${relockDelay};
Servo bolt;
char buffer[5]={}, rawKey=0, stableKey=0;
byte length=0;
bool released=true, rejected=false, closed=false, candidate=false;
unsigned long keyAt=0, doorAt=0, closedAt=0;

char scan(){
  char hit=0;
  for(byte row=0;row<4;++row){
    digitalWrite(rows[row],LOW); pinMode(rows[row],OUTPUT);
    delayMicroseconds(6);
    for(byte col=0;col<3;++col){
      if(digitalRead(columns[col])==LOW) hit=hit?'!':keys[row*3+col];
    }
    pinMode(rows[row],INPUT);
  }
  return hit;
}
void enter(char key,unsigned long now){
  if(key=='*'){ length=0; rejected=false; return; }
  if(key=='#'){
    if(!released){
      if(length==4 && !memcmp(buffer,code,4)){
        released=true; rejected=false; closedAt=now; bolt.write(RETRACTED);
        Serial.println(F("Accepted"));
      }else{
        rejected=true; Serial.println(F("Rejected"));
      }
    }
    length=0;
  }else if(key>='0'&&key<='9'){
    if(length<4) buffer[length++]=key;
    else length=5;
  }
}
void setup(){
  for(byte col:columns) pinMode(col,INPUT_PULLUP);
  pinMode(REED,INPUT_PULLUP); pinMode(RED,OUTPUT); pinMode(GREEN,OUTPUT);
  bolt.write(RETRACTED); bolt.attach(MOTOR);
  Serial.begin(115200);
}
void loop(){
  const unsigned long now=millis();
  const bool next=digitalRead(REED)==LOW;
  if(next!=candidate){ candidate=next; doorAt=now; }
  if(!next){
    closed=false;
  }else if(candidate && !closed && now-doorAt>=35){
    closed=true; closedAt=now;
  }
  const char key=scan();
  if(key!=rawKey){ rawKey=key; keyAt=now; }
  if(key!=stableKey && now-keyAt>=25){
    stableKey=key;
    if(key && key!='!') enter(key,now);
  }
  if(released && closed && now-closedAt>=WAIT_MS){
    released=false; rejected=false; length=0; bolt.write(EXTENDED);
    Serial.println(F("Relocked"));
  }
  digitalWrite(RED,rejected&&!released); digitalWrite(GREEN,released);
}
`,
};
