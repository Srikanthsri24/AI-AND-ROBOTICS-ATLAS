import uno from './uno-r3-board-layout.json';
import {floodAdd,floodPlacement} from './flood-wiring';
import type{FloodPoint}from'./flood-workshop-layout';
export const floodUnoFeet=uno.holes.map(h=>floodAdd(floodPlacement.uno,[+h.x-34.29,-9,26.67- +h.y]));
const usb=uno.elements.find(e=>e.name==='X2')!;
export const floodUsbCentre=floodAdd(floodPlacement.uno,[+usb.x-34.29,6.3,26.67- +usb.y]);
export const floodHost={at:[-445,10,-90] as FloodPoint,size:[38,20,44] as FloodPoint};
export const floodControllerParts=[
 ['flood-controller-feet','Insulating Uno mounting feet','Four drilled nylon spacers support the board at its CAD mounting-hole positions, keeping solder joints clear of the dry bench.','The spacers end at the board underside; the metal screws pass through the existing mounting holes.'],
 ['flood-usb-cable','USB power and programming cable','The USB-B plug seats in the Uno socket. Its cable connects the illustrated host USB supply and provides upload / Serial Monitor communication.','Disconnect USB before changing a wire. In this static workshop the host is a teaching model, not a connection to a real device.'],
 ['flood-usb-host','Illustrated USB host','Represents the computer USB connection used to power the Uno and upload the published Arduino C++ sketch.','The actual project uses your computer and Serial Monitor at 9600 baud; this browser does not program physical hardware.'],
] as const;
