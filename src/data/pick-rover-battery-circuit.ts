import{CatmullRomCurve3,Vector3}from'three';
export const pickBatteryCircuitParts=[
 {id:'pick-wheel-battery-feed',label:'Cell positive → switch input',description:'This insulated internal path carries the last cell positive to one fixed switch contact. It does not touch the external positive lug. The other three series bridges remain unchanged.'},
 {id:'pick-wheel-battery-switched-return',label:'Switch output → positive lug',description:'This is the switched positive conductor, not battery negative. It joins the other fixed switch contact to the external red-output lug. The two internal conductors remain separated when the bridge is open.'},
 {id:'pick-wheel-battery-fixed-contacts',label:'Two isolated switch contacts',description:'The two insulated conductors pass through separate holes in the holder and switch case. Inside, their bare ends join separate fixed contact pins. The plastic frame keeps the two pins separate.'},
 {id:'pick-wheel-battery-contact-bridge',label:'Moving switch contact bridge',description:'In the illustrative contact view, ON seats the metal bridge across both fixed contacts. OFF lifts it clear, breaking the positive path. The slider and bridge positions follow the same source state; this is authored teaching geometry, not manufacturer switch CAD.'},
];
export const pickBatteryCircuitPaths=[
 new CatmullRomCurve3([[-25.7,12.3,23.25],[-25.4,12.3,23.25],[-25.4,12.3,30.5],[-3,12.3,30.5],[-3,11.5,30.5],[-3,11.5,32.6],[-3,9.7,32.6]].map(p=>new Vector3(...p)),false,'catmullrom',.005),
 new CatmullRomCurve3([[3,9.7,32.6],[3,11.5,32.6],[3,11.5,30.5],[3,14.8,30.5],[-26.5,14.8,30.5],[-26.5,14.8,23.25],[-26.5,9.7,23.25]].map(p=>new Vector3(...p)),false,'catmullrom',.005),
];
