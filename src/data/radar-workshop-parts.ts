import {radarScannerParts} from './radar-scanner-layout';
import {radarUnoParts,radarHarnessParts} from './radar-harness';
import {radarPowerParts} from './radar-power-layout';
import {radarPowerJumperParts} from './radar-power-jumpers';
import {radarUsbParts} from './radar-usb';
import {radarTargetParts} from './radar-target';
/** Search / explanation catalogue for actual owner groups in RadarWorkshopPrototype. */
export const radarWorkshopParts=[...radarScannerParts,...radarUnoParts,...radarHarnessParts,...radarPowerParts,...radarPowerJumperParts,...radarUsbParts,...radarTargetParts].map(([id,name,what,connection])=>({id,name,what,connection}));
