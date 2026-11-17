import type {Build} from './guided-projects';

export const modelElevatorCallLight:Build={
  id:'model-elevator-call-light',
  title:'Model elevator call light',
  outcome:'Latch a call light with a pushbutton, then clear it when a hand-moved model lift reaches the landing switch.',
  parts:[
    ['Arduino Uno R3','1','Debounces the call and landing inputs and stores the waiting state.'],
    ['Momentary tactile button','1','Makes the request at D2.'],
    ['Roller-lever microswitch','1','Closes the landing input when the car reaches the floor.'],
    ['LED and 330 Ω resistor','1 pair','Shows that the request is waiting.'],
    ['Card lift shaft and sliding car','1 set','A tabletop shaft guides the hand-moved car past the landing switch.'],
    ['Breadboard and jumper wires','1 set','Connects the switches and indicator with a shared return.'],
    ['USB-A to USB-B data cable','1','Powers the model controller and carries the serial log.'],
  ],
  assembly:[
    ['Build the tabletop shaft','Make a card track with two guides and a lightweight car that slides by hand. Mark the landing and fit the microswitch so the car gently presses its roller at the mark.','The car travels freely and activates the roller only at the landing.',[2,4]],
    ['Connect the two inputs','Disconnect USB. Connect the call button between D2 and GND. Connect microswitch COM to GND and NO to D3. Verify the switch is open away from the floor.','Both inputs are high when released and low when their switches close.',[0,1,2,5]],
    ['Add the call indicator','Connect D8 through 330 Ω to the LED anode and connect its cathode to GND. Mount the LED beside the call button.','The resistor is in series and all inputs and outputs share ground.',[0,3,4,5]],
    ['Run a call and an arrival','Upload the sketch. Move the car away, tap CALL, and confirm the lamp stays on after release. Slide the car to the landing and watch the lamp clear. Move it away and start another call.','A call while the car is at the landing leaves the lamp off. A fresh press away from the landing can latch it again.',[0,1,2,3,4,6]],
  ],
  wiring:[
    ['Uno D2','Call button → GND','Active-low request input'],
    ['Uno D3','Microswitch NO; COM → GND','Active-low arrival input'],
    ['Uno D8','330 Ω → LED anode','Pending call indicator'],
    ['Uno GND','Switch returns and LED cathode','Shared return'],
  ],
  test:'Press CALL with the car away and verify that the LED stays lit after release. Move the model car to the landing and verify that the LED clears. Try calling while the car remains at the landing.',
  demo:['Car away','Call requested','Light stays on','Car arrives','Request clears'],
};
