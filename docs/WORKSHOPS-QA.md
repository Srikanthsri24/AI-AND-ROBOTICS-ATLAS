# Workshop delivery and verification

Completed 2026-11-12, after the 2D and representative 3D catalogue phases.

- Circuit & Code Laboratory: ten guided experiments, stated mathematical models, editable source notebooks, related hardware guides, and a supported series LED wiring playground. Verified 660 ohm / 5 V result of 4.55 mA, ultrasonic 1000 microsecond / 20 C result of 17.2 cm, keyboard selection and position editing, and run/stop. Imported circuit structure is validated separately from electrical operation.
- Project Builder: fifteen blueprints across fifteen categories, nine engineering stages, editable brief/BOM/source/test evidence, resume and exports. Verified quantity 2 × INR 123 = INR 246, exported CSV, persistence, deletion and undo. Temporary QA notebook removed.
- AI Robotics: 26 topics in six collections. Verified gradient descent, shortest grid route, typed local message schema and sequence, and search deep link to Machine Learning. Browser speech playback was not exercised. No remote inference or physical robot connection is represented as running.
- Learning & Assessment: five paths, thirty questions with explanations, five practical challenges, progress and self-study records. Verified required answers, five-of-six score of 83%, explanation feedback and preserved 100% best score; downloaded SVG practice record. Teacher notebook creation, date entry, reviewed status, notes and undo verified. Temporary QA activity removed.

All four module overview layouts have document width 390 px at a 390 × 844 mobile viewport. Desktop visual evidence and mobile AI evidence are in docs/screenshots. No browser console errors during final check.

Final automated validation: 32 tests pass; TypeScript project build passes; Vite production build passes. The large Three.js chunk is lazy-loaded. Preview remains at http://127.0.0.1:5190/.

## Scope

Frontend only, English only. User records remain in browser storage with backup/export support and an actual-storage-failure notice. Source notebooks do not compile or execute arbitrary code. Supported browser experiments disclose their assumptions. The 240 hardware guides use representative family-level 2D and 3D constructions, not exact CAD, pinouts or separately measured models for each named commercial variant. Materials, lighting, orbit, zoom, isolation and exploded inspection improve spatial learning without claiming engineering equivalence.

Original built-in-generated image prompts and provenance: design-assets/hardware/manifest.json. Responsive image derivatives are served locally.


## Traffic & parking workshop — 27 November 2026

Rolling workshop total is now 81/150; the current detailed ledger is `docs/3D-WORKSHOP-PROGRESS.md` (older counts above describe earlier milestones). Traffic/parking's registered sixth route passes actual production desktop/phone controls, calibration, car/counter behaviour, exact downloads and back reset. The final 90-pose assembly audit includes 5,668,380 moving vertices and named spring contacts; flat board/base bearing faces and all 66 wire contacts pass. All 1,210 repository tests, full TypeScript build and Vite build pass. Production canvas visibility below the header, no page overflow and no page errors verified at 1200/390. Preview 5191 stopped; local development remains 5190. No AWS deployment.


## Automatic Liquid Soap Dispenser workshop — 27 November 2026

Rolling workshop total is **82/150**, with 68 remaining in Phase 1 and 61 in Phase 2. The registered `directory-26/workshop` route passes built-app desktop and phone checks across all six outer guide stages and the complete assembly-to-hand-delivery flow. All 39 build/wiring operations, bare-shaft calibration, two-stage linkage fitting, empty/fill/prime, two hand presentations, held-hand inhibition, real palm label/highlighting, module-return retention and reset pass. The eight component groups load their references, including an explicitly labelled authored stand/deck render. The final inspector selection restores its explanation to view.

All **1,264 repository tests**, the configured full TypeScript build and Vite production build pass. The existing large-chunk warning remains. Final routed checks verify the toolbar and full canvas below the header, no horizontal overflow and no page errors at 1200/390. Physics/geometry evidence and earlier detailed pose/contact audits are retained in `docs/3D-WORKSHOP-PROGRESS.md`; liquid charges and ideal-axis sensing are disclosed as illustrations rather than calibrated volume or full acoustics. Preview 5191 stopped after QA; development 5190 remains available. No AWS deployment.

### Automatic tap — pump component checkpoint (2026-11-27; not a workshop release)

Added a project-specific peristaltic pump component with selectable motor, head, mounting flange, rotor, rollers, tube, cover and two motor terminals. External reference dimensions retain product 3910's 27.8 mm motor diameter, 66.8 mm depth, 50 mm mounting pitch, 3.7 mm bores and 5/3.5 mm silicone tubing. The three-roller cutaway is explicitly authored teaching geometry, not factory CAD. The tube deforms against rotating rollers without penetrating them and preserves its outer track contact. It is not a fluid-pressure solver.

Validation: ten tap controller/session and pump geometry tests passed, including parity against the downloadable Arduino sketch; targeted strict TypeScript check passed. Native Chrome fixture (`scripts/inspect-tap-pump.cjs`) rendered covered/cutaway states and exercised rotation and part controls without runtime errors. Screenshots inspected locally. Actual mesh raycasting, intake/spout leads, full workbench, assembly, wiring and routed verification remain pending. Completed count remains **82/150**.

Reference: https://www.adafruit.com/product/3910 ; local product photograph `public/images/project-parts/peristaltic-pump.jpg`.

### Automatic tap — tube leads and actual-surface interaction checkpoint

Added separate reservoir inlet and spout outlet leads, with continuous inner/outer end rings across every sampled pump phase and recovery to the reference tubing bore at fixed connection points. Head wall has explicit lead exits; motor neck and roller axles connect the previously separated solids. All eleven part owners now support actual surface selection.

Native Chrome verification now finds unobscured triangles and clicks the canvas for every part (including the fitted cover), checks the selected material colour on actual meshes, and checks an actual clicked roller anchor moves with the roller after rotation. Fixed pointer-down propagation so a rear surface cannot replace the clicked front anchor. Covered/cutaway screenshots inspected. All eleven tap controller/session/geometry tests passed; targeted strict TypeScript passed. This proves component interaction, not a completed routed workshop. Full classroom basin, intake/spout paths, assembly, wiring and working demonstration remain pending; count remains **82/150**.

### Automatic tap — complete plumbing apparatus component checkpoint

Added authored tabletop base/frame, dry pump bracket, thin-wall transparent reservoir and volume-driven water level, raised collection basin, gravity return, submerged intake route, continuous pump-to-spout route, hollow metal support sleeve/clamps and offset echo target. Tube endpoints meet the pump's fixed lead ends exactly. The target is 260 mm below the planned sonar face; the intake is below the 70 mm level-sensor position. The basin drain is clear of the echo target. Added a rear spout support post and pump bracket attachment so the dry supports connect to the frame.

Native Chrome: all thirteen apparatus part owners were selected by actual canvas triangle clicks, with material highlight and real surface label checks. Reservoir empty/refill hides/restores its water mesh. Raycasting down the actual drain bore passes through the basin/return without hitting a cap, while the adjacent solid floor hits at Y=138 mm. Overview screenshot inspected locally. Fourteen tap controller/session/pump/plumbing tests and targeted strict TypeScript passed. Fixture: `scripts/fixtures/tap-plumbing.tsx`; verifier: `scripts/inspect-tap-plumbing.cjs`.

This is still an unpublished workshop component checkpoint. Sensors, control electronics, wiring/assembly lessons, fluid demonstration and routed/mobile verification remain pending. Completed count remains **82/150**.

### Automatic tap — sensor hardware and actual mounting contact checkpoint

Added the project-specific SEN0485 housing, selectable sensing-face region, black cable potting and green/red/black pigtails; the actual 10.6 × 16.9 × 4 mm external envelope follows DFRobot's V1.0 drawing and the local product photograph. The 515 mm factory cable specification is recorded, but the current component shows short pigtails; the complete routed lead is still pending. The sensing-face selection region is authored teaching segmentation of the sealed housing, not an exposed internal electrode. A 25 mm lifted inspection position reveals the face before wall contact.

Mounted standard HC-SR04 hardware with tap-specific connections and explanations, drilled plate, four hollow insulating spacers, shafts, heads, washers and open hex nuts. Added a dry support arm connected to the frame post. Native Chrome verified all twenty-one sensor part owners through actual canvas clicks, selected real mesh materials and surface labels. Geometry checks prove board-to-spacer and spacer-to-plate contact, four unobstructed mounting bores (with fasteners excluded from the bore test), level-face contact at the tank's outer Z=85 mm wall, and both ultrasonic front rims at Y=400 mm, 260 mm above the clear target. Sensor overview and lifted-face screenshots inspected. Seventeen targeted tap tests and strict sensor-module TypeScript passed.

Primary references: https://wiki.dfrobot.com/sen0485/ and https://dfimg.dfrobot.com/wiki/17426/SEN0485_liquid-level-detection-sensor_dimension_V1.0.jpg . These support the envelope, 5 V operation, green OUT/red VCC/black GND, active-low output and nonmetal wall up to 3 mm. Housing trim, fasteners and support geometry are authored teaching details.

Workshop remains unpublished/in progress: control electronics, complete sensor leads and pump harness, guided assembly/wiring, fluid demonstration and routed verification remain pending. Completed count remains **82/150**.

### Automatic tap — dry control electronics checkpoint

Added a tap-specific Uno R3 assembly, 170-contact mini breadboard and detailed STEMMA motor driver on six hollow insulating supports. The driver uses actual Adafruit PCB outline, component/pad positions, top routes and net assignments extracted by `scripts/extract-tap-mosfet.py`; CC BY-SA 3.0 attribution, complete upstream README and license are retained under `docs/third-party/adafruit-mosfet/`. Connector housing heights and internal clamp solids are authored teaching geometry, not factory STEP data. Reference input nets are GND/VIN/SIGNAL; OUT+ is VIN and OUT− is the MOSFET drain. The diode cathode is on VIN, anode on OUT. The two JST non-electrical solder tabs are labelled NC, not falsely treated as mounting bores.

Native Chrome verified all thirty-five electronics part owners via actual mesh clicks, highlighted actual selected materials and surface labels. Geometry checks: support bases meet the dry shelf at Y=223 mm, support tops meet both PCB undersides at Y=230.2 mm, and the mini breadboard meets the shelf. Physical geometry (excluding text-label bounds) has 0.8 mm side and 3.83 mm front clearance between boards. Rays entering the three actual JST openings hit GND/VIN/SIGNAL metal; rays entering both output apertures hit the separate positive/negative contacts. Uno logic ON, driver VIN ON and driver SIG indicators were independently checked, including a HIGH signal with no motor VIN. All twenty targeted tap tests and strict control-module TypeScript passed. Overview screenshot inspected locally.

Verifier: `scripts/inspect-tap-controls.cjs`. Workshop is still unpublished/in progress: external pump supply, full wiring harness and lead routing, guided assembly/wiring lessons, priming/water demonstration, and routed/mobile release checks remain pending. Completed count remains **82/150**.

### Automatic tap — external pump supply and coaxial adapter checkpoint

Added an enclosed nominal 5 V / 2 A motor supply, routed low-voltage cord, moulded barrel grip, separate inner-positive/outer-negative plug contacts and insulating separator, matching female pin/sleeve, and green two-terminal adapter with actual conductor openings, brass barrels and slotted clamp screws. Smooth lathed connector surfaces replace faceted extrusions. Nominal 5.5/2.1 mm connector and 3.5 mm cord diameter follow the reference product; enclosure, routing length and connector internal spring details are authored teaching geometry. No internal mains circuit is exposed. The adapter rests in the dry electronics area, and its barrel can be withdrawn for inspection.

Native Chrome: all fourteen actual part owners passed mesh clicks, material highlighting and surface labels. Vertex geometry checks confirm separated plug metal radii with the insulator between them, separated female pin/sleeve and 6 mm axial clearance after unplugging. Removing the actual barrel pose disables the driver VIN indicator while the nominal source remains enabled; reconnection restores it. This is a completed-fit electrical gate, not a contact-resistance solver. Overview and close-up screenshots inspected. All twenty-two targeted tap tests and strict power-module TypeScript passed. Verifier: `scripts/inspect-tap-power.cjs`.

Primary references: https://www.adafruit.com/product/276 (5 V / 2 A, centre-positive 5.5 mm OD / 2.1 mm ID plug and 3.5 mm cable diameter); https://www.adafruit.com/product/368 (female 2.1 mm jack to positive/negative screw terminals). Local reference photos inspected before modelling.

Workshop remains unpublished: full harness/sensor leads, guided fitting and assembly lessons, priming/fluid/hand demonstration, and routed/mobile release checks remain pending. Completed count remains **82/150**.

### Automatic tap — conductor map and session integration checkpoint

Added fifteen project-specific wire definitions with actual hardware/contact coordinates, labels, colours, connection explanations and distinct breadboard holes. Six wire sources remain factory-attached (three SEN0485 leads and the three STEMMA pigtail conductors); there are twenty-four student-fitted terminations, plus keyed STEMMA mating and the GND-reference header operation. Sensor 5 V and motor VIN are separate nets. The black STEMMA motor return runs directly to the supply negative. A single GND breakout header supplies the separate common-reference jumper; updated the breakout explanation to leave only VIN/SIG/OUT unused.

The conductor graph derives every existing tap-session connectivity input from fitted ends and plug/header state rather than a single generic ready flag. Tests disconnect each of the twenty-four student ends individually, verify the corresponding path fails and restores, verify no direct VIN-to-Uno-5 V bridge, and drive the exact sketch session from the graph. Missing supply, motor wiring, D9 connection or common reference leaves commanded software RUNNING with zero physical powered time; missing sensor paths prevents a valid start. This graph models conductor continuity, not analog voltages or current distribution.

Added the actual GND-only square pin, open insulating header body and underside solder bead. Native Chrome reverified thirty-six control-part owners through actual clicks/highlights/surface labels and confirmed the harness reference endpoint meets the rendered pin tip at [203.19, 239.5, -59.015] mm. All twenty-six targeted tap tests and strict TypeScript passed.

This is a map/session and reference-header checkpoint, not a rendered harness release. Full wire routes, connector fitting animations, replacing short sensor pigtails with routed leads, guided lessons, priming/fluid/hand demonstration and routed/mobile verification remain pending. Completed count stays **82/150**.
