/** Independently authored classroom dimensions in mm. Product photographs are shape references, not a measured kit / CAD specification. */
export type VacuumPoint=[number,number,number];
export type VacuumProfile=readonly (readonly [number,number])[]; // [axial x, radius]
export const vacuumMm=1/40;
export const vacuumReferences={bottle:'https://behr-labor.com/en/products/product-details/behroplast_pet_bottles_food_safe_pet_wide_neck_jar_transparent_clear_pet_bottles_with_wide_neck.129.html',bulb:'https://vivfelic.com/products/manual-siphon-pump-kit',grommet:'https://www.lawsonproducts.com/products/rubber-grommet-3-8-id-52654',gas:'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/boyles-law/'};
export const vacuumBottleInner:VacuumProfile=[[-83.8,0],[-83.5,10],[-82.8,21],[-81,32],[-78,40],[-74,45.2],[-70,46.8],[-65,47.2],[45,47.2],[48,47.1],[52,46.5],[57,45.2],[62,42.8],[66,39.2],[69,36],[72,35.5],[86,35.5]];
export const vacuumBottleOuter:VacuumProfile=[[-85,0],[-84.7,10],[-84,21],[-82.2,32],[-79.2,40.8],[-75.2,46],[-70,47.6],[-65,48],[45,48],[48,47.9],[52,47.3],[57,46],[62,43.8],[66,40.8],[69,38],[72,37.5],[86,37.5]];
export const vacuumBulbInner:VacuumProfile=[[-55,3],[-52,3],[-48,8],[-40,15],[-25,19],[0,20],[25,19],[40,15],[48,8],[52,3],[55,3]];
export const vacuumBulbOuter:VacuumProfile=[[-55,8.5],[-50,10],[-40,18],[-25,22.5],[0,23],[25,22.5],[40,18],[50,10],[55,8.5]];
export function vacuumProfileMl(profile:VacuumProfile){let mm3=0;for(let i=1;i<profile.length;i++){const [a,r]=profile[i-1],[b,s]=profile[i];if(b<=a||r<0||s<0)throw Error('Profile stations must increase and radii must be non-negative.');mm3+=Math.PI*(b-a)*(r*r+r*s+s*s)/3;}return mm3/1000;}
export function vacuumBulbProfile(compression:number,outer=false){if(!Number.isFinite(compression)||compression<0||compression>1)throw Error('Bulb compression must be between 0 and 1.');return (outer?vacuumBulbOuter:vacuumBulbInner).map(([x,r])=>[x,r*(1-.43*compression*Math.max(0,Math.min(1,(52-Math.abs(x))/16)))] as const);}
const v0=vacuumProfileMl(vacuumBulbProfile(0)),vh=vacuumProfileMl(vacuumBulbProfile(.5)),v1=vacuumProfileMl(vacuumBulbProfile(1)),qa=2*(v1+v0-2*vh),qb=v1-v0-qa;
/** Same revolved inner profile used by the mesh, integrated as piecewise conical frusta. */
export const vacuumChamberMl=vacuumProfileMl(vacuumBottleInner)+Math.PI*35**2*(87.5-86)/1000;
export function vacuumBulbMl(compression:number){if(!Number.isFinite(compression)||compression<0||compression>1)throw Error('Bulb compression must be between 0 and 1.');return qa*compression*compression+qb*compression+v0;}
export const vacuumLayout={axisY:65,cap:{back:74,face:90,plateBack:87.5,outerR:40.5,innerR:38.2,pitch:3.2},ports:{pickup:{y:51,z:0},outlet:{y:79,z:0},bore:14},grommet:{innerR:5,grooveR:7,flangeR:9,flange:1.2},hose:{innerR:3,outerR:5},pump:{at:[250,60,-75] as VacuumPoint},paper:{side:2.5,thickness:.03,density:800},nozzleGap:2,cradle:{xs:[-55,45],innerR:48.3,outerR:56}};
