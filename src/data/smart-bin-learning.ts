import{smartBinProgram}from'./smart-waste-bin';
export const binFillLesson=[
 {gap:500,title:'Empty reference',explanation:'The closed sensor sees 500 mm to the empty floor. A new settled sample gives 0%, so the collection indicator is off.'},
 {gap:300,title:'A growing load',explanation:'The level target rises and its gap becomes smaller. At 300 mm, the example calibration gives about 53% fill.'},
 {gap:196,title:'Collection requested at 80%',explanation:'The 196 mm gap reaches 80%. The Uno stores the collection-needed state and lights the separate red LED.'},
 {gap:215,title:'Still on at 75%',explanation:'Removing a little load gives 75%. The indicator stays on: the separate clearing threshold prevents flicker around the pickup point.'},
 {gap:234,title:'Cleared at 70%',explanation:'At 234 mm the computed fill is 70%. The stored state clears and the LED turns off. Remote status follows the next report.'},
] as const;
export function binCalibrationValid(empty:number,full:number){return Number.isInteger(empty)&&Number.isInteger(full)&&empty>=100&&empty<=1000&&full>=100&&full<empty;}
export function binConfiguredProgram(empty:number,full:number){if(!binCalibrationValid(empty,full))throw Error('Use integer references: 100–1000 mm empty and 100 mm to below empty for full.');return{...smartBinProgram,source:smartBinProgram.source.replace(/const long EMPTY_MM=\d+, REFERENCE_FULL_MM=\d+;/,`const long EMPTY_MM=${empty}, REFERENCE_FULL_MM=${full};`)};}
