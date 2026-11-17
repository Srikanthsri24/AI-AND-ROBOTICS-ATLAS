import type { Build } from './guided-projects';

export const lightCycleMs=8000;
export const lightInterlock:Build={
  id:'directory-57',
  title:'Arduino Disinfection Box · Visible-Light Interlock Model',
  outcome:'Build a tabletop model with a visible white LED. Demonstrate how a controller stops a timed cycle when the lid opens and waits for a fresh Start press before running again.',
  parts:[
    ['Arduino Uno R3','1','Reads the lid contact and Start switch, times the cycle and drives the visible indicator.'],
    ['Magnetic door contact switch','1 pair','Choose a pair whose switch closes when the magnet approaches. The input goes LOW when the lid is closed.'],
    ['Momentary tactile start button','1','Asks the controller to start a single eight-second classroom demonstration.'],
    ['Diffused white LEDs and 220 Ω resistors','1 of each','The white LED makes the timing and cutoff visible. A series resistor limits current.'],
    ['Cardboard interlock enclosure','1','Use a small corrugated box with a hinged flap, paper tape and a dry cardboard platform. Keep the Uno and Start button outside.'],
    ['Breadboard and jumper wires','1 set','Holds the button and resistor and routes the low-voltage signals and ground.'],
    ['USB-A to USB-B data cable','1','Powers and programs the Uno.'],
  ],
  assembly:[
    ['Make a hinged classroom box','Use an empty cardboard box about 20 × 15 cm. Tape the rear edge of the flap to act as a hinge. Set a small dry test object on a removable cardboard platform.','The lid swings freely, and the object stays clear of the wires.',[4]],
    ['Align the contact and magnet','Tape the wired half to the front rim and its magnet to the lid. Check with a multimeter in continuity mode. Move the parts until the contact closes only when the lid meets the rim.','Closed lid gives continuity. Lifting the lid opens the contact.',[1,4]],
    ['Place the LED and Start button','Mount one visible white LED facing into the box and the tactile button on the external breadboard. Use a 220 Ω series resistor. Pass the LED leads through the side wall away from the hinge.','The leads do not snag, and the LED polarity matches the connection map.',[2,3,4,5]],
    ['Connect and check the inputs','Unplug USB while wiring. Follow the connection map and make sure both switches share Uno ground. Upload the sketch, then use Serial Monitor to check the reported lid position.','Opening the lid reads OPEN. Closing reads CLOSED. Closing alone never turns the LED on.',[0,1,2,5,6]],
    ['Run the interlock tests','Try Start with the lid open. Close the lid and start a cycle, then lift it while the LED is lit. Close it again and watch for an automatic restart. Press and release Start for another trial and allow it to finish.','Open lid blocks Start. Opening during a cycle turns off the LED, and closing the lid leaves it off until another press.',[0,1,2,3]],
  ],
  wiring:[
    ['Uno D2','One lead of magnetic contact','Internal pull-up. Open contact reads HIGH.'],
    ['Other contact lead','Uno GND','Magnet nearby closes the contact to ground.'],
    ['Uno D3','One side of Start switch','Internal pull-up. Use contacts on opposite sides of the tactile switch.'],
    ['Other side of Start switch','Uno GND','Press takes the input LOW.'],
    ['Uno D9','220 Ω resistor → white LED anode','Visible cycle indicator'],
    ['LED cathode','Uno GND','Return path'],
    ['Computer USB','Uno USB-B','Power, upload and Serial Monitor'],
  ],
  test:'Start is blocked with the lid open. A fresh press with the lid closed lights the LED for eight seconds. Open the lid during a cycle or disconnect the contact lead and the light goes out. Closing the lid or reconnecting the wire leaves the light off until a new press.',
  demo:['Lid interlock','Open','Running','Start is blocked','Visible LED represents the timed cycle'],
};
