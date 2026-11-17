import type { Build } from './guided-projects';

export function roomFanOn(current:boolean,temperature:number,target:number,sensor:boolean){
  if(!sensor)return false;
  return current?temperature>target-.5:temperature>=target+.5;
}
export const roomController:Build={
  id:'directory-76',title:'Smart Room Temperature Controller',
  outcome:'Build a thermostat for a model room. Set a target temperature, watch a low-voltage fan turn on as the room warms, and see why it stays on until the room cools below the lower threshold.',
  parts:[
    ['Arduino Uno R3','1','Reads the temperature and target, then switches the fan driver.'],
    ['Adafruit SHT31-D breakout','1','Measures air temperature. Mount away from the fan blast and sources of heat.'],
    ['10 kΩ rotary test potentiometers','1','Sets the target between 18 and 32 °C.'],
    ['STEMMA MOSFET driver and lead','1 set','Switches the fan using a low-voltage signal from the Uno.'],
    ['5 V two-wire cooling fan','1','Exhausts air from the cardboard model room. Fit a guard and keep the wire clear.'],
    ['Regulated 5 V supply and adapter','1 set','Powers the fan through the MOSFET driver. Choose a supply sized for fan startup.'],
    ['Cardboard room shell and vent guard','1 set','Use stiff card for the walls and an open-top or mesh inlet. Mark the sensor and exhaust locations.'],
    ['Breadboard and jumper wires','1 set','Connects the sensor and dial to the controller.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and carries serial readings.'],
  ],
  assembly:[
    ['Make a ventilated room model','Cut an exhaust opening and a separate inlet into the card shell. Mount the fan to exhaust outward and fit the guard.','Air can enter from the opposite side and wires cannot reach the blades.',[4,6]],
    ['Place the sensor and target dial','Mount the sensor in the room at mid-height. Keep the dial outside and wire its wiper to A0.','The sensor can read room air away from the outlet, and the dial is accessible.',[0,1,2,6,7]],
    ['Wire the fan driver','Disconnect both supplies. Connect the external 5 V to the MOSFET power input and the fan to the output terminals. Join the supply negative to the Uno ground and take D6 to the driver signal input.','Uno power and fan power have separate positive rails and a shared ground.',[0,3,4,5]],
    ['Upload and check the thermostat','Connect I²C, upload the sketch and open Serial Monitor. With the fan supply on, set the dial above and below the measured temperature.','The fan follows the upper and lower thresholds and stays in its previous state between them.',[0,1,2,3,4,8]],
    ['Observe a fault and recovery','With both supplies disconnected, unplug the sensor and restart. Check the log and fan. Reconnect with power off and repeat the working test.','The fan output turns off and the controller reports that the sensor is unavailable.',[0,1,3,4]],
  ],
  wiring:[
    ['Uno 5 V / GND','SHT31 VIN / GND and dial outer terminals','Logic and analog reference'],
    ['Uno A4 / A5','SHT31 SDA / SCL','I²C address 0x44'],
    ['Dial wiper','Uno A0','Target range 18–32 °C'],
    ['Uno D6','STEMMA driver signal','HIGH switches the fan on'],
    ['External regulated 5 V / GND','Driver VIN / GND','Fan power'],
    ['Driver output + / −','Fan red / black','Switched load'],
    ['External negative','Uno GND','Shared reference'],
    ['Computer USB','Uno USB-B','Upload, power and log'],
  ],
  test:'Set the target about 1 °C below the measured temperature and confirm the fan turns on. Raise the target above the measured temperature and watch the fan turn off. Bring the target within 0.5 °C of the reading from both directions and check that its previous state holds. Test with the sensor unplugged before powering up. The fan should stay off.',
  demo:['Temperature and target band','Fan off','Fan on','No cooling airflow','Air moves across the model room'],
};
