import {soapSupplyParts} from './soap-dispenser-supply';
import {soapElectronicsParts} from './soap-dispenser-electronics';
import {soapSonarParts} from './soap-dispenser-sonar';
import {soapFrameParts} from './soap-dispenser-frame';
import {soapPumpParts} from './soap-dispenser-pump';
import {soapServoParts} from './soap-dispenser-servo';
import {soapServoLeadParts} from './soap-servo-lead';
export const soapMechanismParts=[...soapSupplyParts,...soapElectronicsParts,...soapSonarParts,...soapFrameParts,...soapPumpParts,...soapServoParts,...soapServoLeadParts];
