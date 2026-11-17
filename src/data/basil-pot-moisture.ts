import type {Build} from './guided-projects';

export const basilPotMoisture:Build={
  id:'basil-pot-moisture-flag',
  title:'Basil pot moisture flag',
  outcome:'Calibrate a soil probe with dry and damp samples from the same potting mix, then use an LED to flag when the soil around a basil plant needs checking.',
  parts:[
    ['Arduino Uno R3','1','Samples the soil probe and controls the warning LED.'],
    ['SEN0193 capacitive soil probe','1','Measures local soil conditions around its blade and sends an analog voltage to A0.'],
    ['Dry and damp soil samples','2 cups','Give the same probe two reference points using the pot’s own soil mix.'],
    ['Basil pot and drainage saucer','1 set','Holds the plant at a fixed probe position and collects runoff.'],
    ['LED and 330 Ω resistor','1 pair','Light the dry-soil flag when the relative index is low.'],
    ['Breadboard and jumper wires','1 set','Connect the probe and LED while keeping the controller off the saucer.'],
    ['USB-A to USB-B data cable','1','Powers the board and streams readings to Arduino Serial Monitor.'],
  ],
  assembly:[
    ['Prepare two samples from the same mix','Set aside two cups with similar amounts of the same potting mix. Keep one dry. Moisten the other evenly and let it drain before measuring.','Both cups are deep enough to cover the sensing area without reaching the connector.',[1,2]],
    ['Connect the probe and dry flag','Unplug USB. Follow the probe connector labels. Connect VCC to 5 V, GND to GND, and analog signal to A0. Connect D8 through 330 Ω to the LED anode and ground the cathode.','The probe and LED share the Uno ground. The breadboard sits away from the saucer.',[0,1,4,5]],
    ['Capture dry and damp reference readings','Upload the sketch and open Serial Monitor at 115200 baud. Place the probe at the same depth in each cup. Let the reading settle before entering d for dry or w for damp. Use a similar packing pressure in both cups.','The serial log confirms both endpoint values and begins showing a relative index.',[0,1,2,6]],
    ['Install the probe in the basil pot','Make a slot near the roots without cutting them. Keep the board and connector above the soil line and away from splashes. After watering, let the moisture spread and the reading settle. Leave the probe at the same depth between checks.','The LED lights at 30 or below and clears at 40 or above. Check the soil by hand before deciding whether to water.',[1,3,4]],
  ],
  wiring:[
    ['Uno 5 V','SEN0193 VCC','Probe supply'],
    ['Uno GND','Probe GND and LED cathode','Shared return'],
    ['Uno A0','SEN0193 analog output','Local soil reading'],
    ['Uno D8','330 Ω resistor → LED anode','Dry-soil flag'],
  ],
  test:'Capture the two references. Verify that the dry cup reads near 0 with the LED lit and the damp cup reads near 100 with the LED off. Between 30 and 40 the LED holds its previous state.',
  demo:['Relative moisture','Check dry soil','Water the pot','Flag cleared','Dry flag lit'],
};
