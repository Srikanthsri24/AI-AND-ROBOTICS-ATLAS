/** Two horizontal, bored retainers fastened to the dry rear sensor post.
 * Four individual passages follow the actual vertical cable centre lines.
 */
export const aquaLoomHeights=[120,220] as const;
export const aquaLoomHoles=Array.from({length:4},(_,lane)=>({x:230+lane*1.6,z:-130-lane*1.4,radius:.85}));
export const aquaLoomParts=[['aqua-sensor-loom','Rear-post cable retainers','Two bored dry-side retainers support the four individual sensor leads along the back of the post.','Each wire passes through its own open passage. Fit the retainers before threading and seating VCC, TRIG, ECHO and GND. Keep the cable route outside the wet tray.']] as const;
