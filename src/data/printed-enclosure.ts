import type { Build } from './guided-projects';

export const enclosure = {
  length: 86, width: 67, height: 27, wall: 2.4, floor: 2.4, lidThickness: 2.4,
  usbCenter: 48, usbWidth: 18, usbBottom: 6.5, lidGap: .35,
};

export const printedEnclosure: Build = {
  id: 'directory-42',
  title: '3D Printed Custom Enclosures and Project Packaging',
  outcome: 'Print a vented, lift-off case for an Arduino Uno R3. Check the USB opening with a small test print, then power and program the board with the lid fitted.',
  parts: [
    ['Arduino Uno R3', '1', 'The reference board. Use the Uno R3 form factor and measure your board before printing.'],
    ['PLA filament', '1 spool', 'Prints the open-top base, vented lid and USB fit gauge. Use the diameter supported by your printer.'],
    ['Adhesive PCB supports', '4', 'Low-profile nonconductive supports lift the solder joints off the base. Choose a snap post that fits your board holes and supports the measured PCB thickness.'],
    ['USB-A to USB-B data cable', '1', 'Provides power and data through the wall notch. Use a host adapter if needed.'],
    ['Digital calipers', '1', 'Measure the plug, board and supports before editing or printing.'],
  ],
  assembly: [
    ['Measure the board and plug', 'Unplug the Uno and measure its largest outline, underside projections and the USB plug housing. Start with the default 86 × 67 × 27 mm outer base and 18 mm notch. Measure the plug with the cable fully seated so its molded shoulder is included.', 'The board and support feet fit the cavity. The plug has at least 1 mm clearance per side at the wall.', [0,3,4]],
    ['Print the gauge and trial-fit the plug', 'Select gauge in OpenSCAD and export an STL. Print the gauge flat and slide the disconnected plug housing into the notch. If it rubs, increase usb_width and print another gauge.', 'The plug slides through without scraping or forcing it.', [1,3,4]],
    ['Mount the board in the base', 'Print the base floor-down. Seat the supports in the board holes, leave the adhesive liners on and dry-fit the stack with the cable fully seated. Adjust the notch center or bottom if needed. Then peel the liners and press the feet onto the clean floor. Handle the board by its edges.', 'There is air beneath the solder joints. The board does not rock or shift when the cable is removed.', [0,2,3]],
    ['Fit the lid and label the package', 'Print the lid exterior-face-down, then flip it over. Align its four locating tabs with the inside long walls and set it down without forcing it. Add a board name and USB label beside the port. Keep the vent slots open.', 'The lid sits flush and lifts by hand. The USB cable seats straight with the lid closed.', [1,0,3]],
  ],
  wiring: [
    ['Uno mounting holes', 'Nylon supports → enclosure floor', 'Keep solder joints clear of the case and prevent board movement.'],
    ['Computer USB host', 'USB-A to USB-B data cable → Uno USB-B jack', 'Supply USB power and upload sketches with the lid closed.'],
    ['Lid locating tabs', 'Inside faces of the long walls', 'Register the removable lid without fasteners.'],
    ['Open USB notch', 'Molded plug shoulder and case opening', 'Leave clearance where the plug crosses the front wall.'],
  ],
  test: 'Dry-fit the gauge, lid and cable first. With the lid seated, connect USB and upload Blink to the Uno R3 in Arduino IDE. Lift the lid to check the status LED blinks and that the connector and board stay still when plugging and unplugging gently.',
  demo: ['USB plug width', 'Fits with clearance', 'Rubs the notch', 'USB can seat', 'Resize the notch'],
};
