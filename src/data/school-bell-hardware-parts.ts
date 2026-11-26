import {schoolBellDisplayParts,type SchoolBellDisplayPart} from './school-bell-display-parts';
import {schoolBellRtcPins} from './school-bell-rtc-pins';
import {schoolBellBatteryParts} from './school-bell-battery';
import {schoolBellSounderParts} from './school-bell-sounder';
import {schoolBellUsbParts} from './school-bell-usb';
import {schoolBellWires} from './school-bell-wires';
const p=(id:string,label:string,what:string,connection:string):SchoolBellDisplayPart=>({id,label,what,connection});
export const schoolBellHardwareParts:SchoolBellDisplayPart[]=[
 ...schoolBellUsbParts,...schoolBellDisplayParts,...schoolBellBatteryParts,...schoolBellSounderParts,
 ...schoolBellWires.map(w=>({id:w.id,label:w.label,what:w.what,connection:w.connection})),
 ...schoolBellRtcPins.map(pin=>p(pin.id,pin.label+' · RTC',pin.what,pin.connection)),
 p('school-rtc-board','RTC circuit board','Supports the calendar chip, backup cell and connection header.','Its copper routes join the DS3231 to main supply, ground, I²C and backup battery. The two mounting holes are mechanical.'),
 p('school-rtc-plating','RTC solder pads','Provide metal surfaces for reliable soldered joints.','Each ring belongs to its own connection. The two mounting-hole rings are not extra power inputs.'),
 p('school-rtc-copper','RTC copper tracks','Carry the calendar module’s signals and supplies.','Top and bottom routes follow the original Eagle board layout. Board material separates tracks on opposite faces.'),
 p('school-rtc-ic','DS3231 calendar chip','Keeps seconds, minutes, hours and the calendar using its compensated oscillator.','The Uno reads the calendar at I²C address 0x68. The backup cell keeps time while main USB power is off.'),
 p('school-rtc-r1','RTC R1 · data pull-up','Holds the SDA bus line high while no device pulls it low.','Connects the data line toward VIN. This school-bell build supplies VIN from Uno 5 V.'),
 p('school-rtc-r2','RTC R2 · clock pull-up','Holds the SCL bus line high while no device pulls it low.','Connects the clock line toward VIN. The display and RTC share this bus and the same logic supply.'),
 p('school-rtc-c1','RTC C1 · bypass capacitor','Reduces short supply changes close to the clock chip.','Connected between the main supply and common ground. The coin cell serves a different backup-timekeeping role.'),
 p('school-rtc-header-body','RTC header moulding','Holds eight separate metal pins at the correct spacing.','The moulding is an insulator. Only VIN, GND, SDA and SCL are wired for this project.'),
 p('school-uno-pcb','Uno R3 board','Holds the microcontroller, USB interface and connection sockets.','USB supplies the school-bell circuit. A4 and A5 form the shared I²C bus; D9 commands the piezo through 220 Ω.'),
 p('school-uno-mcu','ATmega328P controller','Runs the weekday timetable and two-note chime program.','Reads the DS3231 calendar, updates the HT16K33 display and generates tone() on D9. It does not obtain time from the internet.'),
 p('school-uno-headers','Uno female sockets','Accept the jumper pins for power and signals.','Use 5 V, GND, A4/SDA, A5/SCL and D9. The named sockets correspond to the board’s actual header positions.'),
 p('school-uno-usb','USB-B connector','Provides USB power and a connection for programming and serial commands.','The school_bell.ino sketch uses 115200 baud. In the browser, the simulation represents these commands without uploading to a physical device.'),
 p('school-uno-bridge','USB serial interface','Links the computer’s USB connection to the main controller’s serial port.','Serial t selects the Monday test, w the Saturday test, and n the represented compile time. This chip is separate from the ATmega328P.'),
 p('school-uno-power','Uno power components','Condition the board’s supply for the controller and modules.','Use USB for this guided build. Leave the barrel input unused and keep the RTC/display grounds common.'),
 p('school-uno-reset','Uno reset button','Restarts setup and clears the program’s temporary state.','The RTC calendar continues if its backup cell has power. Startup records the current minute so resetting during a bell minute does not trigger it again.'),
 p('school-uno-tracks','Uno copper traces','Carry power and signals between the processor and sockets.','The model follows the original Uno board routing. Use sockets for student connections, not exposed tracks.'),
 p('school-uno-programming','ICSP programming headers','Provide dedicated programming contacts for the two AVR chips.','Leave these headers unconnected. This build uses the normal USB Arduino upload path.'),
 p('school-uno-leds','Uno power and activity lights','Show board power and USB serial activity.','The ON light follows the logic supply. The piezo is driven on D9; its notes are not represented by lighting the sounder.'),
 p('school-work-mat','Insulated workshop mat','Keeps the parts arranged in a clear working area.','A visual work surface rather than an electrical connection. The circuit still needs its ground wires.'),
 p('school-uno-supports','Uno insulating supports','Raise the board at its actual mounting-hole locations.','Keep solder joints above the mat. These supports do not provide a ground or supply path.'),
 p('school-rtc-supports','RTC insulating supports','Hold the clock board above its underside battery and connectors.','Use the two mounting holes. Leave the header pins and battery clip accessible below the board.'),
 p('school-breadboard-base','Breadboard support','Provides a flat base beneath the mini breadboard.','This base is mechanical. The metal spring strips inside the breadboard make the electrical connections.'),
 p('school-breadboard','Mini solderless breadboard','Groups each column of five contacts into one connected strip.','5 V, GND, SDA and SCL occupy separate columns in the rear bank. The series resistor occupies separate front-bank input and output columns; the centre gap isolates the banks.'),
 p('school-display-stand','Clock display stand','Holds the display upright so the four digits face the learner.','Rear supports meet the lower mounting positions. Keep the four header contacts and rear driver components clear for wiring.'),
];
export function schoolBellHardwarePart(id:string){return schoolBellHardwareParts.find(p=>p.id===id);}
