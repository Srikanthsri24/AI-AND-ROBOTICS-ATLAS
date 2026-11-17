import type { Build } from './guided-projects';

export const fixLifetime=10000;
export const checkpoints=[
  {name:'Open yard',lat:'28.00000',lon:'-15.00000',x:-1.9,z:.65},
  {name:'Path bend',lat:'28.00024',lon:'-14.99975',x:-.30,z:.12},
  {name:'Shelter',lat:'28.00041',lon:'-14.99946',x:1.57,z:-.31},
] as const;
export const gpsGsm:Build={
  id:'directory-67',title:'GPS and GSM Location Tracker',
  outcome:'Build a portable classroom tracker that reads a GPS position and sends one SMS snapshot when you press a button. See how it handles missing or stale fixes.',
  parts:[
    ['Arduino Mega 2560 Rev3','1','Uses separate hardware UARTs for GPS and GSM, while USB stays available for diagnostics.'],
    ['Adafruit Ultimate GPS serial breakout','1','Reads satellites and sends fix status and coordinates. Keep the ceramic antenna facing the sky.'],
    ['Adafruit FONA 800 GSM breakout and antenna','1 set','Submits the requested SMS. Bring a compatible active SIM and verify local 2G SMS coverage.'],
    ['Protected 3.7 V LiPo for FONA','1','Use a supported pack of matching connector polarity for modem transmit peaks.'],
    ['Momentary tactile start button','1','Requests a single SMS snapshot only when a recent fix is available.'],
    ['Breadboard and jumper wires','1 set','Routes logic on an insulated tabletop or portable base. Keep antennas and loose leads clear of metal and each other.'],
    ['USB-A to USB-B data cable','1','Powers the Mega and connects it to the Arduino IDE.'],
    ['5 V USB power bank','1 optional','Powers the Mega for a short supervised outdoor trial after USB bench checks. The FONA still has its own battery.'],
  ],
  assembly:[
    ['Mount the receiver with sky view','Fit the GPS to an insulated tray with its ceramic face upward. Leave the FONA battery disconnected while fitting its antenna and SIM.','Both antenna connections are clear and the test button is reachable.',[1,2,3,4,5]],
    ['Wire the GPS on Serial1','Connect GPS TX to Mega RX1 at pin 19, and GPS RX to TX1 at pin 18. Connect VIN to Mega 5 V and ground to Mega ground.','The console stays on USB while GPS traffic uses Serial1.',[0,1,5,6]],
    ['Wire the modem on Serial2','Connect FONA TX to Mega RX2 at pin 17 and FONA RX to TX2 at pin 16. Connect both grounds, Vio to Mega 5 V and KEY to ground. Fit the supported LiPo to the modem only.','The modem has an independent battery and shares logic ground with the Mega.',[0,2,3,5]],
    ['Fit Send and test the fix','Connect the switch from D7 to ground. Upload with the test number blank. Start indoors, then move the antenna to a clear-sky spot you control and monitor fix status.','The log distinguishes a fresh fix from an unavailable or stale position.',[0,1,4,6,7]],
    ['Send one authorized test report','Set a destination number you control. Confirm network registration, wait for a fresh fix and press Send. Check the phone inbox and then repeat with GPS input unavailable.','A fresh fix submits a single snapshot. A blocked fix produces only a local message.',[0,1,2,3,4]],
  ],
  wiring:[
    ['Mega 5 V / GND','GPS VIN / GND and FONA Vio / GND','Logic supplies and shared ground'],
    ['GPS TX / RX','Mega 19 RX1 / 18 TX1','Serial1 at 9600 baud'],
    ['FONA TX / RX','Mega 17 RX2 / 16 TX2','Serial2 at 9600 baud'],
    ['FONA KEY','Mega GND','Power-on strap'],
    ['Protected LiPo','FONA JST battery port only','Observe connector polarity'],
    ['Mega D7','Send button → GND','Internal pull-up, active low'],
    ['Computer USB or USB bank','Mega USB-B','5 V power, upload and diagnostics'],
  ],
  test:'With the GPS disconnected before powering up, press Send and confirm it blocks. Reconnect with power off. Once the receiver reports a location with a fresh fix, press once and confirm the expected position arrives on your phone. The tracker sends only on request.',
  demo:['Freshness gate','Unavailable','GPS fix fresh','No position is shared','A button press captures one coordinate pair'],
};
