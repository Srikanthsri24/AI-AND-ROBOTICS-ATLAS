import type { Build } from './guided-projects';

export const growLimits={lightOn:6*60,lightOff:22*60,fanOn:28,fanOff:25,wetDelay:1500} as const;
export const growLit=(minute:number,clockReady:boolean)=>clockReady&&minute>=growLimits.lightOn&&minute<growLimits.lightOff;
export const growFan=(temperature:number|null,previous:boolean)=>temperature===null||temperature>=growLimits.fanOn||(previous&&temperature>growLimits.fanOff);

export const hydroponicChamber:Build={
  id:'directory-93',
  title:'Indoor Farming Hydroponic Plant Grow Chamber',
  outcome:'Build a small recirculating hydroponic grow chamber. Follow water from the reservoir across the roots and back, set a light schedule and test the fan and low-water cutoff independently.',
  parts:[
    ['Arduino Uno R3','1','Controls light, airflow and circulation and reports each state over USB.'],
    ['DFRobot FIT0800 5 V submersible pump and tube','1 set','Moves solution from the covered reservoir to the grow channel. Keep the pump submerged and keep the vertical rise short.'],
    ['SEN0485 capacitive level sensor','1','Senses liquid through the flat reservoir wall. Mount it above the pump’s minimum submerged line.'],
    ['Adafruit DS3231 RTC and CR1220','1 set','Keeps local time for the light program while the Uno is off.'],
    ['Adafruit SHT31-D breakout','1','Measures chamber air temperature and humidity. Temperature controls the fan.'],
    ['Eight 5 V RGBW NeoPixels and input protection','1 set','Eight pixels from an Adafruit 2832 RGBW strip, a 330 Ω data resistor and a 1000 µF capacitor rated 10 V or higher. White LEDs demonstrate the lighting schedule.'],
    ['5 V two-wire cooling fan','1','Mount behind a guard at the upper exhaust vent.'],
    ['STEMMA MOSFET driver and lead','2 sets','One switches the pump and the other switches the fan from an external 5 V rail.'],
    ['Regulated 5 V supply and adapter','1 set','Use a 2 A regulated supply for the specified eight pixels, pump and fan. The Uno is separately USB powered.'],
    ['Momentary tactile start button','1','Toggles circulation pause for supervised maintenance.'],
    ['Breadboard and jumper wires','1 set','Carries dry-zone signals only. Use rated terminal wiring for the 5 V loads.'],
    ['Hydroponic channel, net cups and covered reservoir','1 set','Use a sloped channel with a free gravity return, a covered reservoir, two net cups and a tray for spills.'],
    ['USB-A to USB-B data cable','1','Powers and programs the Uno and sends chamber status to Serial Monitor.'],
  ],
  assembly:[
    ['Build a shallow-flow loop','Set the channel on a slight slope above a covered reservoir. Fit net cups and a gravity drain wider than the inlet. Fit the pump inside the reservoir and keep the tube-rise modest. Secure the tube and drain so they return all water to the reservoir.','With plain water and the electronics outside the tray, the return carries the full pump flow without overflowing. Use a low initial fill and verify room for drain-back.',[1,11]],
    ['Mount the reservoir sensor and air probe','Place the level sensor flat against the dry outer wall at the minimum operating mark. Put the SHT31 in shaded air, away from splashes and exhaust. Keep the controller outside and above the spill tray.','The level signal changes at the mark. The air probe reads room temperature rather than the lamp or fan body.',[0,2,4,11]],
    ['Fit the lamp and exhaust','Mount eight RGBW pixels on a bar above the cups. Insulate exposed cut ends and fit the data resistor and supply capacitor. Guard the fan and leave an inlet on the opposite wall.','Air passes across both cups. The light bar and connectors stay dry with the lid closed.',[5,6,8,11]],
    ['Wire the controller and load rails','Disconnect USB and 5 V. Connect both I²C devices, the level input, two MOSFET drivers and the strip. Join external negative to Uno ground and keep the two positive rails separate. Power the loads before the Uno, or switch them together.','The pump and fan supplies go through their own drivers. The light data wire goes to DIN, and its power comes from the load rail.',[0,2,3,4,5,6,7,8,9,10,12]],
    ['Test water, time and heat separately','Upload with the load supply off. Set the clock, fill above the sensor mark and verify the water return. Test the daytime and nighttime hours and warm the air sensor gently. Lower the water below the sensor mark while the pump body is still submerged.','The pump stops at the mark and needs 1.5 seconds of safe water to resume. Light follows the clock, and the fan starts at 28 °C and stops at 25 °C or below.',[0,1,2,3,4,5,6,9,11,12]],
  ],
  wiring:[
    ['Uno A4 and A5','RTC and SHT31 SDA and SCL','Addresses 0x68 and 0x44'],
    ['Uno 5 V / GND','RTC, SHT31 and SEN0485 logic power','Join external 5 V supply negative to common ground'],
    ['SEN0485 OUT','Uno D2','Low means water detected. Pull-up leaves the pump off if the signal wire is unplugged.'],
    ['Uno D5 and D6','Pump and fan driver SIG','MOSFET logic, active high'],
    ['Driver OUT+ / OUT−','Respective pump or fan leads','Verify both load polarities'],
    ['External regulated 5 V / GND','Driver power and RGBW strip supply','Add the polarized 1000 µF capacitor across the strip terminals. Keep load current off the Uno.'],
    ['Uno D9 through 330 Ω','RGBW strip DIN','Connect the marked input end'],
    ['Uno D3','Maintenance switch → GND','Active-low button toggles circulation'],
    ['Computer USB','Uno USB-B','Upload and status diagnostics'],
  ],
  test:'Use plain water to confirm the entire return path before adding plants. Set the clock to a daytime hour and then a nighttime hour, and compare the lamp state. Verify fan hysteresis at 28 °C and 25 °C. Lower the water below the sensor without exposing the pump body, then refill and watch the restart delay. Toggle maintenance pause and confirm circulation remains off until you resume it. Verify that the light and fan still respond independently.',
  demo:['Time, air and water level','Circulation paused','Water returning to reservoir','Pump stopped on low level','Light, pump and fan have separate controls'],
};
