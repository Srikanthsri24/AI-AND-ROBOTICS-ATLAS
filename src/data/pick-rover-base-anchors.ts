/** Shared M4 clamp axes, in millimetres. The steel stack spans the 3 mm
 * acrylic chassis and 3 mm lift plate; washers/nuts seat outside both. */
export const pickBaseAnchors=[
 ...[-34,34].flatMap(x=>[-21,21].map(z=>({id:`pick-base-anchor-${x<0?'left':'right'}-${z<0?'front':'rear'}`,x,z,target:'pick-lift-base',label:`${x<0?'Left':'Right'} ${z<0?'front':'rear'} lift-base bolt`}))),
 ...[-21,21].map(z=>({id:`pick-outrigger-anchor-${z<0?'front':'rear'}`,x:-54,z,target:'pick-lift-outrigger',label:`${z<0?'Front':'Rear'} servo-foot bolt`})),
]as const;
export const pickBaseAnchorParts=pickBaseAnchors.map(a=>({id:a.id,label:a.label,description:`This M4 through-bolt aligns the ${a.target==='pick-lift-base'?'central lift plate':'side servo support foot'} with its matching acrylic chassis bore. The upper washer and bolt head sit above the plate; the hollow nut seats beneath the chassis. Tighten evenly rather than crushing acrylic.`}));
