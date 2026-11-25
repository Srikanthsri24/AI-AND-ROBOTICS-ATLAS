/** 170-contact board: two isolated five-hole banks per column; no continuous rails. Native mm. */
export const aquaPanelAt=[-310,0,72] as const;
export function aquaPanelHole(column:number,bank:-1|1,row:number):[number,number,number]{if(!Number.isInteger(column)||column<0||column>16||!Number.isInteger(row)||row<0||row>4||![1,-1].includes(bank))throw Error('Unknown panel contact');return[aquaPanelAt[0]+(column-8)*2.54,10,aquaPanelAt[2]+(bank<0?-3.81-(4-row)*2.54:3.81+row*2.54)];}
export const aquaButtonPins=([-1,1] as const).flatMap(bank=>[7,9].map(column=>({id:bank===-1?'aqua-button-signal':'aqua-button-ground',column,bank,row:bank===-1?4:0})));
export const aquaPanelNets={
 logic:[['Uno 5 V',1,-1,0],['Sensor VCC',1,-1,1],['Driver VCC',1,-1,2]],
 ground:[['Uno GND',1,1,0],['Sensor GND',1,1,1],['Button return jumper',1,1,2],['Driver logic GND',1,1,3],['Ground extension jumper',1,1,4]],
 extension:[['Ground bridge arrival',3,1,0],['PWMB',3,1,1],['BIN1',3,1,2],['BIN2',3,1,3],['AIN2',3,1,4]],
 button:[['D7 signal jumper',7,-1,0],['Button return jumper',7,1,4]],
} as const;
export const aquaPanelParts=[
 ['aqua-breadboard','Dry 170-contact breadboard','Each column has two separate groups of five connected holes. The centre trench separates the banks; its coloured edges are not power rails.','Column 2 negative bank distributes logic 5 V. Column 2 positive bank is ground; a jumper extends ground to column 4 positive bank. Motor current bypasses this board.'],
 ['aqua-button-body','Start / Stop switch body','Holds the two normally separate contact sides. This is a momentary, spring-return switch.','The sketch uses D7 INPUT_PULLUP; pressing joins D7 to ground.'],
 ['aqua-button-cover','Switch metal retaining cover','Retains the cap mechanism; the central opening lets the stem travel.','The outer retaining cover is not a student signal terminal.'],
 ['aqua-button-cap','Moving Start / Stop cap','Moves down during a press and returns on release. Holding it does not repeatedly toggle the motor.','The controller accepts one falling edge after 30 ms of stable contact.'],
 ['aqua-button-signal','D7 switch contact pair','The two same-side legs are internally joined; opposite sides remain separate until pressed.','Negative bank holes in columns 8 and 10. The D7 jumper enters column 8, negative-bank row 1.'],
 ['aqua-button-ground','Ground switch contact pair','The other two same-side legs are internally joined. They sit across the breadboard trench from D7.','Positive bank holes in columns 8 and 10. Column 8 row 5 returns to the common-ground group.'],
] as const;
