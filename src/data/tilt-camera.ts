import type { Build } from './guided-projects';

export const tiltLimits = { capture: 20, rearm: 10 };
export const tiltCamera: Build = {
  id: 'directory-45',
  title: 'Advanced Microcontroller Setups (ESP32-CAM, MPU6050)',
  outcome: 'Use a motion sensor to trigger a camera. Calibrate a hinged platform, tilt it past 20°, and save one JPEG of a tabletop target over USB.',
  parts: [
    ['AI Thinker ESP32-CAM with OV2640', '1', 'Reads the IMU and captures a JPEG from the ribbon-connected camera. Use the AI Thinker pin layout.'],
    ['Adafruit MPU-6050 IMU', '1', 'Measures the gravity components on the X and Z axes once the platform settles. Use fitted headers or solder the header with instructor help.'],
    ['FTDI Friend USB-to-serial adapter', '1', 'Uploads the firmware and relays readings and JPEGs to the computer. Keep its logic at 3.3 V.'],
    ['Regulated 5 V supply and adapter', '1 each', 'Power the ESP32-CAM at its 5 V pin from a regulated 5 V supply rated for at least 1 A. Match polarity at the terminal adapter.'],
    ['Breadboard and jumper wires', '1 set', 'Join power grounds and carry I²C and serial signals. Add slack for the tilt platform.'],
  ],
  assembly: [
    ['Mount the two modules', 'With power disconnected, seat the OV2640 flex cable and close its latch. Fasten the camera and breakout to a rigid hinged board with removable mounts. Lay the IMU flat at zero and mark a tilt axis parallel to its Y axis. Aim the lens at a toy block or printed marker.', 'Both modules stay fixed to the plate. The camera sees the test object and the wires have room to flex.', [0,1,4]],
    ['Wire the IMU and power', 'Use GPIO13 for SDA and GPIO14 for SCL. Connect the Adafruit breakout VIN to 3.3 V and leave AD0 at its default. Keep the microSD slot empty because the IMU uses two of its pins. Connect the external supply to 5 V and GND with power off.', 'The IMU and ESP32 share ground. No supply feeds the UART pins.', [0,1,3,4]],
    ['Connect the programmer', 'Cross TX and RX between adapter and camera board and join ground. Leave the adapter power pin disconnected. Tie GPIO0 to ground, power up or reset, and upload to AI Thinker ESP32-CAM.', 'With GPIO0 low at reset, the board enters upload mode.', [0,2,3,4]],
    ['Return to run mode', 'Turn off the 5 V supply and remove the GPIO0 jumper. Keep the UART wiring in place. Power up with the board level and still. After starting the Python receiver, reset on a level surface to repeat calibration.', 'At rest the relative angle is near zero. One steady tilt past 20° saves one snapshot. Return within 10° to rearm.', [0,1,2]],
  ],
  wiring: [
    ['ESP32-CAM 3.3 V and GND', 'MPU6050 VIN and GND', '3.3 V I²C supply and reference'],
    ['ESP32-CAM GPIO13 / GPIO14', 'MPU6050 SDA / SCL', 'IMU bus; leave the SD slot empty'],
    ['FTDI TXD / RXD', 'ESP32-CAM U0R / U0T', 'Cross UART signals at 3.3 V logic'],
    ['FTDI GND and supply negative', 'ESP32-CAM GND', 'Shared voltage reference'],
    ['Regulated 5 V positive', 'ESP32-CAM 5 V', 'Camera board power; leave FTDI VCC open'],
    ['ESP32-CAM GPIO0', 'GND for upload only', 'Disconnect the jumper before resetting to run'],
    ['OV2640 ribbon', 'ESP32-CAM camera socket', 'Camera data and clock'],
  ],
  test: 'Start level. Slowly tilt past 20° and hold still. Open the saved JPEG and check that it shows the tabletop target. Hold the angle for three seconds and check that the file count stays unchanged. Return within 10° and tilt again to save a second image.',
  demo: ['Tilt angle','Within 10°','Beyond 20°','Rearms','Captures one JPEG'],
};
