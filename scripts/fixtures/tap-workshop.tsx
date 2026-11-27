import{createRoot}from'react-dom/client';
import type{TapTrial}from'../../src/data/tap-trial';
import type{TapWorkflow}from'../../src/data/tap-workflow';
import Workshop from'../../src/modules/AutomaticTapWorkshop';
export function mount(el:HTMLElement,initialState?:TapWorkflow,initialTrial?:TapTrial){el.style.cssText='padding:20px;background:#f7f8fe;color:#1c2948;font:14px Inter,Arial,sans-serif;min-height:100vh';const root=createRoot(el);root.render(<Workshop initialTrial={initialTrial} initialState={initialState} onTrialChange={trial=>Object.assign(window,{__tapTrialState:trial})} onStateChange={state=>Object.assign(window,{__tapWorkshopState:state})} onSceneReady={state=>Object.assign(window,{__tapWorkshopScene:state})}/>);const unmount=()=>root.unmount();Object.assign(window,{__tapWorkshopUnmount:unmount});return unmount;}
