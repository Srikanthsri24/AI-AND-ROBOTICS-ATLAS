type Photo = { path: string; label: string; product: number };
const catalog = (file: string, label: string, product: number): Photo => ({
  path: `./images/project-parts/${file}.jpg`, label, product,
});
const atlas = (id: string, label: string, product: number): Photo => ({
  path: `./images/${id.startsWith('sensors') ? 'sensors' : 'components'}/${id}.webp`, label, product,
});
const photos: Record<string, Photo[]> = {
  'Arduino Uno R3': [catalog('uno-r3','Arduino Uno R3',4806)],
  'HC-SR04 ultrasonic module': [atlas('sensors-08','HC-SR04 ultrasonic rangefinder',3942)],
  'TB6612FNG breakout': [catalog('driver','TB6612 motor driver breakout',2448)],
  '6 V geared DC motors and wheels': [catalog('motor','TT geared DC motor',3777),catalog('wheel','TT motor wheel',3757)],
  'Chassis and caster': [catalog('chassis','Example two-wheel chassis kit',3244)],
  'Switched 4×AA holder': [catalog('battery','Switched 4×AA battery holder',830)],
  'Breadboard and jumper wires': [atlas('components-25','Solderless breadboard',65),atlas('components-24','Jumper wires',266)],
  'LED and 330 Ω resistor': [atlas('components-20','Red LED example',299),atlas('components-01','Axial resistor example',2780)],
  '330 Ω resistors': [atlas('components-01','Axial resistor example',2780)],
  '10 kΩ resistor': [atlas('components-01','Axial resistor example',2780)],
  'Positional micro servo': [catalog('servo','TowerPro SG92R positional micro servo',169)],
  'Regulated 5 V servo supply': [catalog('supply','Example regulated 5 V supply',276)],
  '5 V-compatible analog capacitive probe': [catalog('moisture','MonkMakes Plant Monitor with analog moisture output',5587)],
  'TMP36 analog temperature sensor': [catalog('temperature','TMP36 temperature sensor',165)],
  'Photoresistor': [atlas('sensors-21','CdS photoresistor',161)],
  'Momentary tactile button': [atlas('components-06','Momentary tactile buttons',367)],
  'Red, amber and green LEDs': [atlas('components-20','Red LEDs',299),catalog('led-pack','Diffused LED assortment with yellow and green',4203)],
  'USB webcam': [catalog('camera','USB webcam example',5733)],
};
export const projectPartPhotos = (name: string) => photos[name] ?? [];
