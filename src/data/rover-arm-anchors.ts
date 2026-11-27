/** Authored M4-style fixture hardware; no manufactured thread/strength model. */
export const raArmAnchors=[{key:'rear-left',label:'Rear left',x:-42,z:-32},{key:'front-left',label:'Front left',x:-42,z:32},{key:'rear-right',label:'Rear right',x:42,z:-32},{key:'front-right',label:'Front right',x:42,z:32}]as const;
export const raArmAnchorParts=raArmAnchors.flatMap(a=>[
 {id:`ra-arm-anchor-${a.key}-bolt`,label:a.label+' base bolt and washer',description:'The washer spreads the clamping force around the base-plate hole. The bolt passes through both the metal base and the drilled fixture.'},
 {id:`ra-arm-anchor-${a.key}-nut`,label:a.label+' underside anchor nut',description:'The nut retains the anchor beneath the fixture. Hold the top bolt while tightening; the base must remain flat and steady.'},
]);
export const raArmAnchorFits=raArmAnchors.flatMap(a=>[
 {id:`anchor-${a.key}-bolt`,part:`ra-arm-anchor-${a.key}-bolt`,title:a.label+' · insert base anchor',instruction:'Align the washer and bolt with this base hole and the matching fixture bore. Seat the washer flat on the metal base.',why:'The anchor passes through both layers so the base can be clamped to the fixture.',check:'The shank passes freely through both holes and the washer covers the base opening.'},
 {id:`anchor-${a.key}-nut`,part:`ra-arm-anchor-${a.key}-nut`,title:a.label+' · retain underneath',instruction:'Support the top bolt and bring the nut up from beneath the fixture. Tighten it against the underside without lifting the base.',why:'The underside nut and top washer clamp the base and fixture together.',check:'The nut meets the fixture underside and the base remains flat.'},
]);
