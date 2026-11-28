import '../../src/styles/app.css';
import { createRoot } from 'react-dom/client';
import Bench from '../../src/modules/PickRoverUnloadedBench';
import type { PickUnloadedCalibration } from '../../src/data/pick-rover-unloaded-calibration';
import type { PickUnloadedSceneApi } from '../../src/modules/PickRoverUnloadedScene';
const state = (value: PickUnloadedCalibration) => Object.assign(window, { __pickUnloadedState: value });
const ready = (value: PickUnloadedSceneApi) => Object.assign(window, { __pickUnloadedApi: value });
document.body.style.cssText = 'margin:0;background:#ececf5;padding:clamp(10px,2vw,24px)';
createRoot(document.getElementById('root')!).render(<Bench onState={state} onReady={ready} />);
