export const pickGripFrameClampX=[-23,44]as const;
export const pickGripFrameClampParts=pickGripFrameClampX.flatMap((_,i)=>[
 {id:`pick-grip-frame-clamp-${i}-body`,label:`Jaw-frame retaining clamp ${i+1}`,description:'The lower jaw sits beneath the guide floor, and the forked upper jaw clears the vertical frame post. Slide it sideways from the open guide clearance before tightening. It captures the servo-frame foot and guide together without placing a solid bolt through a moving rack.'},
 {id:`pick-grip-frame-clamp-${i}-screw`,label:`Jaw-frame clamp screw ${i+1}`,description:'Raise the screw tip while sliding the clamp over the joint. Lower it onto the wide frame foot after the clamp is seated. Its pressure holds the fixed servo frame against the guide; it does not drive either rack.'},
]);
