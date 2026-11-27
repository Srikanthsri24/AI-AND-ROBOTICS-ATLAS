/** Scene units: 50 mm per unit. Nominal teaching-kit geometry. */
export const carCasterMount={centreZ:1.52,plateBottom:.87,plateTop:.91,plateWidth:.45,plateDepth:.04,boreRadius:.026,chassisBottom:.91,chassisTop:.99,washerHeight:.008,washerOuter:.052,washerInner:.022,headHeight:.035,headRadius:.048,shaftRadius:.020,shaftLength:.18,nutHeight:.032,nutOuter:.0462,nutInner:.021};
export const carCasterHoles=[-.18,.18].flatMap(x=>[1.34,1.70].map(z=>({x,z})));
export const carCasterFastenerIds=carCasterHoles.flatMap((_,i)=>['caster-screw-'+(i+1),'caster-nut-'+(i+1)]);
