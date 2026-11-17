import type {Build} from './guided-projects';

export const wardrobeLight:Build={
  id:'wardrobe-light',title:'Wardrobe light',outcome:'Light a model wardrobe when the door opens in a dim room. Check all four door and room-light combinations.',
  parts:[
    ['Arduino Uno R3','1','Combines the two inputs and commands the LED.'],
    ['Magnetic door contact switch','1 pair','A magnet closes the reed contact when the door is shut.'],
    ['Photoresistor','1','Measures room light from outside the cabinet.'],
    ['10 kΩ divider resistor','1','Turns the photoresistor response into a voltage on A0.'],
    ['Diffused white LED and 220 Ω resistor','1 pair','Lights the shelf. The resistor limits LED current.'],
    ['Card wardrobe and hinge','1 set','Card panels, a tape hinge and a shelf support the door and light.'],
    ['Breadboard and jumper wires','1 set','Connects the inputs, LED and shared ground.'],
    ['USB-A to USB-B data cable','1','Powers and programs the Uno.'],
  ],
  assembly:[
    ['Build the cabinet and fit its contact','Make a card cabinet with a shelf and a tape hinge. Place the magnet on the door edge and the wired reed switch on the opposing frame. With USB disconnected, check that the contact closes only when the magnet approaches.','The door moves freely, and the switch goes open when the door opens.',[1,5]],
    ['Wire the door input','Connect the reed switch between D2 and GND. The sketch enables the internal pull-up, so the closed door reads LOW and the open door reads HIGH.','The wires stay on the frame and clear the hinge.',[0,1,6]],
    ['Install the room sensor and shelf lamp','Place the photoresistor outside the cabinet. Connect it between 5 V and A0, and connect the 10 kΩ resistor between A0 and ground. Connect D8 through 220 Ω to the LED anode and the cathode to ground.','The shelf light points inside and does not shine on the outside sensor.',[0,2,3,4,5,6]],
    ['Calibrate and try all four conditions','Attach USB and upload the sketch. Record shaded and bright A0 values, enter them in the sketch, then test with the door open and shut in both light levels.','Only an open door in a dim room lights the shelf.',[0,1,2,4,7]],
  ],
  wiring:[
    ['Uno D2','Reed contact → GND','Door closed pulls the input LOW'],
    ['Uno 5 V','Photoresistor supply lead','Room-light divider supply'],
    ['Uno A0','Photoresistor other lead and one end of 10 kΩ','Divider midpoint'],
    ['Uno GND','Other end of 10 kΩ and LED cathode','Shared return'],
    ['Uno D8','220 Ω resistor → LED anode','Shelf light'],
  ],
  test:'Try closed and open in a bright room, then closed and open in a dim room. Only dim plus open lights the shelf. Close the door again and verify the light goes off.',
  demo:['Room light','Bright','Dim','The open wardrobe is unlit','The open wardrobe is illuminated'],
};
