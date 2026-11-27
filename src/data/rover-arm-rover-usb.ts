import routes from'./rover-arm-rover-wire-routes.json';
import{raRoverLayout}from'./rover-arm-rover-layout';
import{bluetoothCarLayout,bluetoothCarPlacedPoint,unoR3Point,type CarPoint}from'./bluetooth-car-layout';
const b=unoR3Point(3.81,38.1,.126);b[0]-=.16;
export const raRoverUsb={id:'ra-rover-wire-usb',name:'USB bank → Uno USB-B',step:24,from:'5 V USB bank · type A',to:'Uno R3 · type B',why:'Powers the Uno, driver logic and sonar. Motor current comes from the separate AA pack. Use a computer USB cable instead when uploading the sketch.',bank:[bluetoothCarLayout.usb.at[0],bluetoothCarLayout.usb.at[1]-.01,bluetoothCarLayout.usb.at[2]-.837]as CarPoint,uno:bluetoothCarPlacedPoint(raRoverLayout.uno.at,raRoverLayout.uno.rotation,b)};
/** Authored routing around the left side of the support; clearance is checked
 * against the assembled physical meshes, not inferred from this control polygon. */
export function raRoverUsbPoints():CarPoint[]{return routes['ra-rover-wire-usb'].map(p=>[...p]as CarPoint);}
