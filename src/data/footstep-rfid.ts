import type { Build } from './guided-projects';

export const storageCapacitance = 22e-6;
export const loadMinimumVolts = 2.45;
export const loadWindowMs = 180;
export const accessWindowMs = 8000;
export const chargeCeiling = 4.7;

export const footstepRfid:Build={
  id:'directory-88',
  title:'Advanced Footstep Power Generation System using RFID',
  outcome:'Build a hand-operated model of a piezoelectric floor tile. Collect small pulses in a capacitor, then tap an enrolled RFID tag to authorize a short test of the harvested energy on an LED.',
  parts:[
    ['Arduino Uno R3','1','Reads the storage voltage and controls the load switch. USB supplies its power.'],
    ['Adafruit PN532 NFC shield','1','Reads classroom tag IDs over I²C. Use the shield in its default I²C configuration.'],
    ['13.56 MHz ISO 14443A classroom tags','2','Enroll one tag. Use the second to test a denied request.'],
    ['SparkFun SEN-10293 piezo element','2','Convert gentle deflection of the model tile into voltage pulses. Give each disc its own bridge.'],
    ['1N4001 rectifier diodes','8','Make two full-wave bridges so pressing and releasing can both charge the same storage capacitor.'],
    ['22 µF 16 V storage capacitor and 4.7 V Zener','1 each','Use a polarized capacitor to store the charge and a 1N4732A reverse-biased clamp across it.'],
    ['Voltage-divider resistors and filter capacitor','2 × 470 kΩ, 1 × 100 nF','Halve the storage voltage for A0. The ceramic capacitor stabilizes the divider output.'],
    ['Logic-level N-channel MOSFET and 100 kΩ resistor','1 each','A through-hole IRLB8721 closes the test load return. The resistor keeps its gate low at startup.'],
    ['Red load LED and 4.7 kΩ resistor','1 each','Use an efficient red LED in low ambient light. This LED gets current from the storage capacitor.'],
    ['Green and red LEDs with 220 Ω resistors','1 set','These two USB-powered indicators show tag accepted or rejected. Keep them separate from the load LED.'],
    ['Momentary tactile start button','1','Starts a single discharge pulse after authorization when enough voltage is stored.'],
    ['Card tile, foam supports and rubber bumpers','1 set','Support the disc edges on foam. A soft contact and travel stops limit bending when you press the model by hand.'],
    ['Breadboard and jumper wires','1 set','Holds the two bridges, the storage circuit and the control wiring. Use a digital multimeter to check polarity and voltage.'],
    ['USB-A to USB-B data cable','1','Powers and programs the Uno and carries voltage reports to the Serial Monitor.'],
  ],
  assembly:[
    ['Assemble the model floor tile','Mount the two discs on insulating supports with their brass rims supported. Use a soft contact over each center, with rigid stops limiting the travel to slight flex. Test by pressing the tile by hand.','The plate returns on release, and the stops limit travel before either disc bends sharply.',[3,11]],
    ['Rectify each piezo and join the DC sides','Make a bridge per disc. For each AC lead, connect one diode from the lead to storage + and one from storage − to the lead. Join corresponding DC rails. Fit the storage capacitor and Zener before pressing.','Each storage + diode has its band toward storage +. Each storage − diode has its band toward its AC lead. The Zener band faces storage +.',[3,4,5,12]],
    ['Wire the measurement and isolated load path','With USB disconnected, connect the storage negative to Uno GND. Fit the divider, then connect its center to A0. Run the load from storage + through 4.7 kΩ and the red LED to MOSFET drain. Connect source to GND and gate to D9 with its pull-down.','The load LED has no positive connection to USB. Check stored voltage with a high-impedance meter as you gently press and release.',[0,5,6,7,8,12]],
    ['Fit the classroom RFID controls','Seat the PN532 shield and leave its antenna clear of metal. Wire the two status lamps and D4 test button. Upload, open Serial Monitor, send e, tap tag A, and move it away.','Tag A is enrolled. Tag B leaves the load disabled. The status lamps run from the Uno.',[0,1,2,9,10,13]],
    ['Authorize and compare the voltage before and after','Press the tile repeatedly while watching the voltage. When it reaches about 2.45 V, tap tag A and press the load button within eight seconds. Re-tap after each test.','The load LED gives a small flash and storage voltage drops. Try without a valid tag, then with too little charge.',[1,2,3,5,8,10]],
  ],
  wiring:[
    ['Each piezo lead','Junction between one lower and one upper 1N4001 diode','Two isolated AC inputs per bridge. Keep the two piezos separate on their AC sides.'],
    ['Each bridge DC+ / DC−','Storage positive / storage negative','Upper cathodes join positive. Lower anodes join negative.'],
    ['Storage positive / negative','Electrolytic + / − and Zener cathode / anode','4.7 V nominal shunt. Verify storage polarity and stay below 5 V before connecting the Uno.'],
    ['Storage + → 470 kΩ → A0 → 470 kΩ → GND','Uno A0 and 100 nF to GND','Storage negative, MOSFET source and Uno ground share a reference.'],
    ['Storage + through 4.7 kΩ','Red load LED anode. Cathode to MOSFET drain.','The LED consumes harvested energy.'],
    ['Uno D9','MOSFET gate, with 100 kΩ gate to GND','Pulse enables the load. Verify gate, drain and source on your part.'],
    ['PN532 shield headers','5 V, GND, A4/SDA, A5/SCL and IRQ D2','Reserve D3 for the library reset parameter.'],
    ['Uno D7 / D6','Each → 220 Ω → green / red status LED','Cathodes to Uno GND'],
    ['Uno D4','Load test switch → GND','Internal pull-up'],
  ],
  test:'First verify polarity and voltage on the capped storage node. Enroll tag A, then try a wrong tag, an expired authorization and an authorized request with low voltage. Press the tile until you measure at least about 2.45 V. Tap A and press the test button within eight seconds. Verify that the load LED briefly lights and that the storage voltage drops.',
  demo:['Stored voltage and energy','Waiting for a tag','Load authorized','Load pulse refused','Harvested energy briefly powers the red load LED'],
};
