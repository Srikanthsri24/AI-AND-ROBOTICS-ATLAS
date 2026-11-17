import type {Build} from './guided-projects';

export const drawerClosedIndicator:Build={
  id:'drawer-closed-indicator',
  title:'Drawer closed indicator',
  outcome:'Build a sliding tabletop drawer and light an indicator only when a tab reaches the fully seated position.',
  parts:[
    ['Arduino Uno R3','1','Reads the roller switch and drives the indicator.'],
    ['Roller-lever microswitch','1','Closes when the drawer tab reaches the end of the guides.'],
    ['LED and 330 Ω resistor','1 pair','Shows stable contact at the fully closed position.'],
    ['Card drawer, guides and end stop','1 set','Aligns the drawer, holds the contact tab and prevents overtravel.'],
    ['Breadboard and jumper wires','1 set','Connects the switch and indicator with a shared ground.'],
    ['USB-A to USB-B data cable','1','Powers the circuit and connects Serial Monitor.'],
  ],
  assembly:[
    ['Make a sliding drawer','Fold a small drawer and build two parallel card guides on a rigid base. Add a tab at the rear of the drawer. Mount the switch so the tab clicks the roller only as the drawer meets the stop.','The drawer slides freely, the tab clears the roller when ajar, and the stop prevents the roller from being forced.',[1,3]],
    ['Connect the closure switch','Unplug USB. Connect microswitch COM to Uno GND and NO to D2. Keep leads out of the guides.','The released switch leaves D2 high through the internal pull-up. The tab pulls it low at the end of travel.',[0,1,4]],
    ['Add the closed indicator','Connect D8 through 330 Ω to the LED anode. Connect the cathode to the shared ground. Place the LED beside the opening where it remains visible.','The LED has a series resistor and the wires stay clear of the drawer.',[0,2,3,4]],
    ['Check open, ajar and seated positions','Upload the sketch. Slide the drawer almost shut and stop. The light should stay off. Seat the drawer and watch it light. Pull gently to release the roller and watch the light go out.','Only the seated position lights the LED. Adjust the tab or switch bracket if it triggers early.',[0,1,2,3,5]],
  ],
  wiring:[
    ['Uno D2','Microswitch NO; COM → GND','Active-low closure input'],
    ['Uno D8','330 Ω → LED anode','Closed indication'],
    ['Uno GND','Switch COM and LED cathode','Shared return'],
  ],
  test:'Leave the drawer open or slightly ajar and verify the LED remains off. Seat the drawer until the roller closes, then open it again. The indicator follows the stable switch state.',
  demo:['Open the drawer','Stop ajar','Seat the drawer','Indicator lights','Release the roller'],
};
