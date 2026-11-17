import type { Build } from './guided-projects';

export const motionWindowMs = 1000;
export const detectionBench: Build = {
  id: 'directory-44',
  title: 'Interactive Detection Systems (Radar, Ultrasonic, RFID)',
  outcome: 'Build three detection stations on one Uno and compare the answers they give: motion, distance and classroom tag identity.',
  parts: [
    ['Arduino Uno R3', '1', 'Samples radar transitions, measures the ultrasonic pulse and polls the RFID shield. USB carries power and serial readings.'],
    ['DFRobot SEN0192 radar and lead', '1 set', 'Detects motion in the test area using Doppler radar. Its digital output reports motion events.'],
    ['HC-SR04 ultrasonic module', '1', 'Measures the range to a rigid target using the time between a sound burst and its echo.'],
    ['Adafruit PN532 NFC shield', '1', 'Reads the identifier of a supported tag at short range. Fit the shield with stackable headers.'],
    ['13.56 MHz ISO 14443A classroom tags', '2', 'Present A and B individually to compare identifiers. Use a plain card of similar size as the control.'],
    ['Breadboard and jumper wires', '1 set', 'Connects sonar and radar power and signals. Mount the sensors with removable tape or nonmetal brackets.'],
  ],
  assembly: [
    ['Set up three marked test areas', 'Set the Uno on a dry bench. Mark a distance lane in front of the ultrasonic sensor, a tag position over the reader and a clear motion area facing the microwave sensor. Reserve a couple of meters for the radar trial and keep people away from its field when testing a stationary scene.', 'A rigid card can face the sonar squarely at two marked distances, and a tag can rest flat over the shield.', [0,1,2,3,4]],
    ['Fit the reader shield', 'Unplug USB. Fit the PN532 shield with stackable headers and set it to I²C using the selector markings for your revision. Keep metal away from the antenna. Reserve D2 for IRQ and D4 for the library reset parameter.', 'The shield sits squarely and D3, D5 and D6 are accessible.', [0,3,4]],
    ['Wire sonar and radar', 'Face the HC-SR04 into the measured lane. Connect 5 V, ground, TRIG and ECHO using the map. Face the metal antenna side of the SEN0192 toward the separate motion area and connect VCC, GND and signal using the board labels. Share Uno ground.', 'The sonar uses D5 and D6. The radar output goes to the D3 interrupt input.', [1,2,5]],
    ['Run one change at a time', 'With nothing near the tag antenna, place a large rigid card at 40 cm and then at 80 cm. Next, compare a still scene with motion in the radar field. Finally, hold A, B and a plain card over the RFID antenna one at a time.', 'The sonar reports two distances. The radar counts transitions in a motion trial. The reader prints two different UIDs and no UID for plain card.', [1,2,3,4]],
  ],
  wiring: [
    ['Uno 5 V and GND', 'SEN0192 VCC and GND; HC-SR04 VCC and GND', 'Shared power and reference'],
    ['SEN0192 signal', 'Uno D3', 'Falling edge counter'],
    ['Uno D5', 'HC-SR04 TRIG', 'Request an ultrasonic burst'],
    ['HC-SR04 ECHO', 'Uno D6', 'Measure flight time'],
    ['Uno shield headers', 'PN532 power, A4/SDA, A5/SCL and D2/IRQ', 'Classroom tag read; leave D4 free'],
    ['Computer USB', 'Uno USB', 'Upload and inspect serial output'],
  ],
  test: 'At 115200 baud compare a still scene against sustained motion. Move a flat card between the 40 and 80 cm marks, then remove it. Present classroom tags A and B separately, then a plain card. Record which fields changed. Motion reports edge counts per sample window, sonar reports distance or no echo, and a readable tag returns its identifier.',
  demo: ['Test target','Still or plain card','Motion or readable tag','Unchanged fields','Only the matching output changes'],
};
