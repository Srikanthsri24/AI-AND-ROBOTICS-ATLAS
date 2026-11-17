import type { Build } from './guided-projects';
export const fanTrip={high:600,clear:250,dwell:500};
export const fanInterlock:Build={
 id:'directory-41',title:'Tabletop Fan Load Alert',
 outcome:'Use a tabletop pressure pad to stop a guarded 5 V fan when the load stays high. Remove the load and acknowledge the alert before restarting.',
 parts:[
 ['Arduino Uno R3','1','Measures the pressure input and controls the fan and alert.'],
 ['Round force-sensitive resistor','1','Changes resistance as a small flat test puck presses the sensing area.'],
 ['10 kΩ divider resistor','1','Forms a voltage divider with the pressure pad so A0 can measure its response.'],
 ['5 V two-wire cooling fan','1','A guarded model load for the interlock exercise.'],
 ['STEMMA MOSFET driver and lead','1 set','Switches the fan using the separate 5 V supply.'],
 ['Regulated 5 V pump supply and adapter','1 each','Provides regulated 5 V power to the tabletop fan driver.'],
 ['Red LED and 220 Ω resistor','1 each','Lights when the load alert latches.'],
 ['Momentary tactile button','1','Acknowledges the alert after the pressure reading is low.'],
 ['Breadboard and jumper wires','1 set','Connects the divider, status and shared ground. Use USB to program the Uno.'],
 ],
 assembly:[
 ['Set up the pressure pad','Place the round pressure sensor flat on the bench. Lay a small flat nonmetal puck over its sensing area. Leave the flexible tail flat and use socket contacts for its tabs.','The unpressed reading settles low and rises smoothly when the puck is pressed.',[0,1,2,8]],
 ['Wire the guarded fan','With both supplies disconnected, secure the low-voltage fan to the bench and fit a rigid guard. Connect the fan leads to the MOSFET output and keep the fan power switch accessible.','The guarded fan has its own 5 V supply and shares ground with the Uno.',[0,3,4,5]],
 ['Connect the alert and reset','Wire D6 through 220 Ω to the red LED and D2 through the reset switch to ground. Observe the raw A0 counts and adjust the two sketch thresholds against the tabletop fixture.','The high threshold is above normal unloaded readings. The clear threshold is lower than the trip threshold.',[0,1,2,6,7]],
 ['Test the latched stop','With the pad clear, press Reset and confirm the fan runs. Apply a brief press, then hold pressure for half a second. Try Reset while holding, then remove pressure and press Reset again.','The short press is ignored. Sustained pressure stops the fan and lights the LED. Reset only restarts the fan after the pad clears.',[0,1,3,6,7]],
 ],
 wiring:[
 ['Uno 5 V','FSR first terminal','Divider supply'],
 ['FSR other terminal','A0 and 10 kΩ resistor to GND','Pressure reading'],
 ['Uno D9','MOSFET SIG','Fan command'],
 ['External 5 V and negative','Driver V+ and GND; tie negative to Uno ground','Fan supply'],
 ['MOSFET OUT+ / OUT−','Fan positive / negative','Switched fan power'],
 ['Uno D6 through 220 Ω','LED anode, cathode to GND','Alert lamp'],
 ['Uno D2','Reset switch, other side to GND','Active-low acknowledgment'],
 ],
 test:'Open Serial Monitor at 115200 baud. The fan starts stopped. Clear the pad and press Reset to run it. A reading of 600 counts or above for half a second latches the alert. Lower the reading below 250, then press Reset again. The pad is for light tabletop test loads and reports relative ADC counts.',
 demo:['Pressure','Clear pad','Sustained press','Fan can run','Fan stops and the LED lights'],
};
export const fanInterlockProgram={
 filename:'tabletop_fan_interlock.ino',setup:'Select Arduino Uno. Upload with the fan’s separate 5 V supply off. Check unloaded and pressed ADC readings at 115200 baud before powering the guarded tabletop fan.',
 source:`const byte PAD=A0, FAN=9, ALERT=6, RESET=2;
const int TRIP=${fanTrip.high}, CLEAR=${fanTrip.clear};
const unsigned long DWELL=${fanTrip.dwell};
bool stopped=true, high=false, resetHeld=false;
unsigned long highAt=0, sampleAt=0, printAt=0;
void setup(){
 pinMode(FAN,OUTPUT); pinMode(ALERT,OUTPUT);
 pinMode(RESET,INPUT_PULLUP);
 Serial.begin(115200);
}
void loop(){
 const unsigned long now=millis();
 if(now-sampleAt<10)return;
 sampleAt=now;
 const int reading=analogRead(PAD);
 const bool reset=digitalRead(RESET)==LOW;
 if(!stopped && reading>=TRIP){
  if(!high){ high=true; highAt=now; }
  if(now-highAt>=DWELL){ stopped=true; high=false; }
 }else high=false;
 if(reset && !resetHeld && reading<CLEAR) stopped=false;
 resetHeld=reset;
 digitalWrite(FAN,!stopped);
 digitalWrite(ALERT,stopped);
 if(now-printAt>=200){
  printAt=now; Serial.print(reading);
  Serial.println(stopped?" | STOPPED":" | RUNNING");
 }
}
`,
};
