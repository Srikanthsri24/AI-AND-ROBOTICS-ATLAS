import type { Build } from './guided-projects';

export const piBench = { threshold: 28, address: 0x44, input: 17, output: 27 };
export const piPrototyping: Build = {
  id: 'directory-43',
  title: 'Raspberry Pi 5 Advanced Hardware Prototyping',
  outcome: 'Build a local climate bench. Read an I²C temperature and humidity sensor, light a GPIO indicator above a temperature threshold, and use a pushbutton to save timestamped readings.',
  parts: [
    ['Raspberry Pi 5', '1', 'Runs Raspberry Pi OS and Python. The 40-pin header connects the I²C sensor and GPIO circuit.'],
    ['Pi 5 active cooler', '1', 'Fits onto the Pi and gets power from its dedicated fan connector.'],
    ['27 W USB-C power supply', '1', 'Powers the Pi through its USB-C power port. Match the wall plug to your region.'],
    ['microSD card', '1', 'A 32 GB card holds Raspberry Pi OS, the Python script and the local CSV. A computer with a card reader writes the OS image.'],
    ['Adafruit SHT31-D breakout', '1', 'Measures the air temperature and relative humidity over I²C. Use a breakout with headers already fitted or solder the supplied header with instructor help.'],
    ['Red LED and 220 Ω resistor', '1 each', 'The resistor limits GPIO current. The red LED turns on when a fresh reading crosses the chosen threshold.'],
    ['Momentary tactile button', '1', 'Pulls GPIO17 to ground when pressed. One accepted press saves the latest reading.'],
    ['Breadboard and jumper wires', '1 set', 'Holds the LED and button circuit. Use female-to-male leads from the Pi header and male-to-male jumpers on the board.'],
  ],
  assembly: [
    ['Prepare the Pi', 'With USB-C disconnected, attach the active cooler and its dedicated fan plug. Use Raspberry Pi Imager to write Raspberry Pi OS to the microSD, and insert the card. For a first desktop setup, connect a monitor with a micro-HDMI cable, keyboard and mouse.', 'The cooler is secure, the fan lead is clear of the blades, and the card is seated.', [0,1,2,3]],
    ['Connect the four I²C leads', 'Identify physical pin 1 on the Pi and count along the two rows. Run physical pin 1 to VIN, pin 6 to GND, pin 3 to SDA and pin 5 to SCL. Leave the breakout address-select pad at its default. Keep the sensor out of the Pi fan exhaust.', 'The sensor shares a ground with the Pi and runs from 3.3 V. SDA and SCL connect to distinct pins.', [4,0,7]],
    ['Wire the threshold indicator', 'Place the LED across separate breadboard rows. Run physical pin 13 through the 220 Ω resistor to the anode (long lead). Connect the cathode (short lead or flat side) to the ground rail. Link physical pin 9 to that rail.', 'The resistor and LED are in series, and the LED cathode returns to Pi ground.', [5,7,0]],
    ['Add the capture switch', 'Put the four-leg button across the breadboard gap. Use one terminal from each switched side, checked with a continuity meter if orientation is unclear. Connect one side to physical pin 11 and the other to the shared ground rail. Power the Pi through USB-C only after checking the connections.', 'Pressing the button connects GPIO17 to ground. Releasing it lets the internal pull-up restore a high level.', [6,7,2]],
  ],
  wiring: [
    ['Pin 1 · 3.3 V', 'SHT31-D VIN', 'Sensor power.'],
    ['Pin 6 · GND', 'SHT31-D GND', 'Sensor reference.'],
    ['Pin 3 · GPIO2 SDA', 'SHT31-D SDA', 'I²C data.'],
    ['Pin 5 · GPIO3 SCL', 'SHT31-D SCL', 'I²C clock.'],
    ['Pin 9 · GND', 'Breadboard ground rail', 'Return path for the LED and switch.'],
    ['Pin 13 · GPIO27', '220 Ω resistor → LED anode; cathode → ground rail', 'Threshold output.'],
    ['Pin 11 · GPIO17', 'Button → ground rail', 'Active-low capture input.'],
  ],
  test: 'Set the threshold a few degrees above or below the current temperature and restart the script. The LED is off below the threshold and on at or above it. Press the button once and check for a single timestamped row in climate_log.csv. Run the hardware-free self-test to check that a damaged sensor frame is rejected.',
  demo: ['Air temperature', 'Below threshold', 'At threshold', 'LED off', 'LED on'],
};
