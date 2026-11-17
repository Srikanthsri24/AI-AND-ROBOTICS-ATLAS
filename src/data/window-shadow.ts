import type {Build} from './guided-projects';

export const windowShadow:Build={
  id:'window-shadow-detector',title:'Window shadow detector',
  outcome:'Detect a sudden shadow crossing a model windowsill while allowing the light baseline to follow gradual changes.',
  parts:[
    ['Arduino Uno R3','1','Tracks a light baseline, detects a rapid drop and counts separate shadows.'],
    ['Photoresistor','1','Senses light on the windowsill.'],
    ['10 kΩ divider resistor','1','Makes the sensor voltage readable on A0.'],
    ['LED and 330 Ω resistor','1 pair','Marks a detected shadow until the light returns.'],
    ['Card window frame and shadow paddle','1 set','Holds the sensor and provides a repeatable moving shadow.'],
    ['Breadboard and jumper wires','1 set','Connects the sensor and indicator circuits.'],
    ['USB-A to USB-B data cable','1','Powers and programs the Uno.'],
  ],
  assembly:[
    ['Make a model window and place the sensor','Stand a card window frame on a base. Place the sensor face up on the sill and use a steady lamp or indirect window light. Keep the indicator away from the sensor.','An opaque card passed over the sill produces a visible shadow at the sensor.',[1,4]],
    ['Connect the divider','With USB unplugged, connect the photoresistor from 5 V to A0 and the 10 kΩ resistor from A0 to ground.','Covering the sensor drops the A0 reading.',[0,1,2,5]],
    ['Wire the event indicator','Connect D8 through the 330 Ω resistor to the LED anode and the cathode to the shared ground.','The LED faces the observer and cannot illuminate A0.',[0,3,5]],
    ['Compare a shadow with gradual dimming','Upload the sketch and reset under clear light. Pass a card over the sensor, remove it, and repeat. Then change the light in small increments without passing a card.','Each separate shadow counts once. Slow dimming does not trigger the example detector.',[0,1,3,4,6]],
  ],
  wiring:[
    ['Uno 5 V','One photoresistor lead','Divider supply'],
    ['Uno A0','Other photoresistor lead and one end of 10 kΩ','Sill light reading'],
    ['Uno GND','Other end of 10 kΩ and LED cathode','Shared return'],
    ['Uno D8','330 Ω resistor → LED anode','Active shadow indicator'],
  ],
  test:'Reset with the sill exposed. A drop of at least 180 ADC counts triggers once. Keep the sensor covered to verify the count holds, then uncover it to rearm. Compare with small changes spread across multiple samples.',
  demo:['Sill shadow','Clear','Covered','Baseline adapts','Shadow detected'],
};
