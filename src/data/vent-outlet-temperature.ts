import type {Build} from './guided-projects';

export const ventOutletTemperature:Build={
  id:'vent-outlet-temperature-indicator',
  title:'Vent outlet temperature indicator',
  outcome:'Compare air at a tabletop vent with the room and light an indicator when the outlet is both warm and measurably warmer than its surroundings.',
  parts:[
    ['Arduino Uno R3','1','Samples both probes and drives the warm-outlet indicator.'],
    ['Pair of TMP36 air sensors','2','One probe samples the outlet and the other measures room air.'],
    ['LED and 330 Ω resistor','1 pair','Indicates warm outlet air and limits LED current.'],
    ['Card vent duct and probe stands','1 set','Makes a short model duct and holds both probes in free air.'],
    ['Digital reference thermometer','1','Checks both probes together in stable room air.'],
    ['Breadboard and jumper wires','1 set','Connects the probes and flag.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and connects it to Serial Monitor.'],
  ],
  assembly:[
    ['Build the model duct','Fold a short card duct with an open mouth and fit a loose grille. Place the outlet probe in the opening and the room probe beside the duct, out of the stream.','Air reaches both probes and neither touches a wall or a heat source.',[1,3]],
    ['Wire and label both probes','Disconnect USB. Verify the TMP36 pinout. Run both supplies to 5 V and both grounds to GND. Put the outlet signal on A0 and the room signal on A1.','Both probes share power. Their output leads stay separate.',[0,1,5]],
    ['Install the flag and check the baseline','Connect D8 through 330 Ω to the LED anode and ground the cathode. Put both probes beside the reference thermometer long enough to settle and record any offsets.','Both probes report close to the same value in stable room air.',[0,1,2,4,6]],
    ['Compare a warm outlet with a warm room','Return the probes to their labeled positions. Put a sealed bottle of warm water near the open duct to warm the outlet area without touching the probes. Compare with both probes in the same warm air, or use the browser presets.','Only a warm outlet with enough difference over the room reading raises the flag.',[1,2,3,4]],
  ],
  wiring:[
    ['Uno 5 V','Both TMP36 supply leads','Sensor supply'],
    ['Uno A0','Outlet TMP36 signal','Outlet air measurement'],
    ['Uno A1','Room TMP36 signal','Room reference'],
    ['Uno GND','Both TMP36 grounds and LED cathode','Shared ground'],
    ['Uno D8','330 Ω resistor → LED anode','Warm-outlet flag'],
  ],
  test:'At 30 °C outlet and 26 °C room, the flag lights. At 30 °C outlet and 28 °C room it clears. It also clears if the outlet cools to 28 °C or below.',
  demo:['Outlet difference','Equal readings','Warm outlet','Indicator off','Indicator on'],
};
