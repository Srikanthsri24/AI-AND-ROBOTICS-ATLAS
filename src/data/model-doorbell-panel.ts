import type {Build} from './guided-projects';

export const modelDoorbellPanel:Build={
  id:'model-doorbell-panel',
  title:'Model doorbell panel',
  outcome:'Press a model doorbell to trigger one two-note chime and light a visual indicator until the sound sequence finishes.',
  parts:[
    ['Arduino Uno R3','1','Debounces the button and times the chime and light.'],
    ['Momentary tactile button','1','Sends the visitor’s press to D2.'],
    ['Passive piezo sounder','1','Plays both pitches from the signal on D9.'],
    ['220 Ω piezo series resistor','1','Sits between D9 and one piezo lead.'],
    ['LED and 330 Ω resistor','1 pair','Provides a visible chime indicator on D8.'],
    ['Model doorway and chime housing','1 set','Holds the button near a model door and keeps the chime and LED visible.'],
    ['Breadboard and jumper wires','1 set','Connects the button, piezo and LED with a shared ground.'],
    ['USB-A to USB-B data cable','1','Powers the tabletop circuit and carries the serial log.'],
  ],
  assembly:[
    ['Make the model doorway','Mount the button beside a card door. Place the piezo above the door in an open-backed housing with a few sound openings. Leave the LED and breadboard visible.','The button is easy to press and the piezo opening is unobstructed.',[1,2,4,5]],
    ['Wire the visitor switch','Disconnect USB. Check the tactile terminals and connect one switched terminal to D2 and the other to GND.','The input has a high idle level and goes low when pressed.',[0,1,6]],
    ['Wire the chime and light','Connect D9 through 220 Ω to the passive piezo input, with its return to GND. Connect D8 through 330 Ω to the LED anode, with its cathode to GND. Follow the sounder’s markings if it identifies the leads.','The sounder and the LED share the Arduino ground. Each output has its own series resistor.',[0,2,3,4,6]],
    ['Run a press and release test','Upload the sketch. Tap once and listen for a high note, a short pause, and a lower note. Hold the button and verify the chime finishes without repeating. Release, then press again to try another cycle.','The indicator lights for the full sequence and goes out when the chime stops.',[0,1,2,4,7]],
  ],
  wiring:[
    ['Uno D2','Button → GND','Active-low input with INPUT_PULLUP'],
    ['Uno D9','220 Ω → passive piezo','Two timed pitches'],
    ['Uno D8','330 Ω → LED anode','Visual chime indicator'],
    ['Uno GND','Switch, piezo return and LED cathode','Shared return'],
  ],
  test:'Expect 880 Hz, a short pause, and 660 Hz on one clean press. Presses during the sequence do not restart it. Release and press after the sequence to play it again.',
  demo:['Model entrance','Press the doorbell','High note','Pause and lower note','Indicator turns off'],
};
