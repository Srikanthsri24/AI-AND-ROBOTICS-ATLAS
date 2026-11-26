import {soapUsbSessionAdvance,type SoapUsbSession} from './soap-dispenser-usb-session';
import {soapFluidAdvance,type SoapFluid} from './soap-dispenser-fluid';
import {soapPumpFollower} from './soap-dispenser-pump';
import type {SoapDispenserSettings} from './soap-dispenser-session';
export type SoapWetSession={workbench:SoapUsbSession;fluid:SoapFluid};
/** Small mechanical samples preserve down/return transitions across long display frames. */
export function soapWetSessionAdvance(previous:SoapWetSession,settings:SoapDispenserSettings,elapsedMs:number,sonarFitting=8,circuitFitting=10):SoapWetSession{if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid wet-session elapsed time');let state=previous,left=elapsedMs;do{const dt=Math.min(1,left),workbench=soapUsbSessionAdvance(state.workbench,settings,dt,sonarFitting,circuitFitting),depression=soapPumpFollower(workbench.session.angle).depression;state={workbench,fluid:soapFluidAdvance(state.fluid,depression,dt)};left=Math.max(0,left-dt);}while(left>1e-10);return state;}
