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

### Automatic tap — first three visible jumper routes and fitting animations

Rendered the sensor-supply, sensor-ground and GND-reference jumpers from the actual harness map. Each has coloured insulation, an inner conductor and independently selectable end connectors. Male pins extend into the actual sockets while their grips remain above the openings. The GND-header end uses an open female housing with two metal leaves and a rear contact bridge. Routes use separate raised bends above the dry shelf and deform as either end is lifted or fitted.

Native Chrome verified all nine actual wire/connector owners via canvas clicks, material highlights and surface labels. Six sequential insertion animations return to seated coordinates; a clicked endpoint anchor follows an independent 10 mm withdrawal and returns after fitting. Actual mesh bounds show 5 mm male insertion and 1 mm grip clearance; the female leaves meet the reference pin faces and the contact bridge meets its tip. Sampled route centreline separation is 2.54 mm minimum for 0.9 mm wire jackets (not a global collision/physics proof). Close-up screenshot inspected. All twenty-eight targeted tap tests and strict jumper-module TypeScript passed. Verifier: `scripts/inspect-tap-dry-jumpers.cjs`.

Only three of fifteen full harness routes are rendered at this checkpoint. The twelve remaining routes, keyed STEMMA plug, complete sensor leads, power interlocks in the final lesson UI, whole-build assembly, water/hand demonstration and routed/mobile release checks remain pending. No completed-workshop count change: **82/150**.

### Automatic tap — four overhead sonar leads and cable guides

Added separate VCC/TRIG/ECHO/GND routes with eight independently fitting connectors, using the same actual harness contacts as the continuity graph. Female connectors are oriented on the real horizontal HC-SR04 pins. The four leads escape outside the sensor plate and mounting arm, follow separate overhead lanes and pass through two open four-channel guides. The existing connector renderer now accepts project-specific wire/pose data and actual port axes; the first three dry jumpers retain their own routes.

Raised the rear pump rail from Y=260 to 270 mm to clear rear Uno connector withdrawal, extended the pump bracket rear attachment to meet it, and widened the dry shelf 4 mm to meet the upright. Native geometry verifies bracket-to-rail face contact with 12 mm overlap and zero shelf-to-upright gap.

Native Chrome: fourteen sonar wire/connector/guide owners passed actual clicks, material highlights and surface labels. All eight insertion animations complete; a clicked sensor connector anchor follows 10 mm withdrawal and returns to the seated surface. Female leaves meet each actual square pin and their rear bridges meet the pin tips. All eight cable-guide bores are open. Route samples clear the frame/support/plate at fitted, half-withdrawn and withdrawn poses, with pose updates verified before probing; this is sampled structural clearance, not a complete collision solver. Fitted centreline clearance from those structural bounds is 4 mm minimum for 0.9 mm jackets. Overview and connector screenshots inspected. Existing dry-jumper and thirteen-part plumbing native checks passed again. Thirty targeted tests and strict TypeScript passed.

Seven of fifteen full harness routes are now rendered. Eight remain (three level-sensor leads, three STEMMA pigtail paths and two motor leads), alongside keyed plug fitting, full lesson UI, priming/fluid/hand demonstration and routed/mobile checks. Completed workshop count stays **82/150**.

### Automatic tap — intact level-sensor factory cable and connector

Preserved the three-position factory connector visible in the SEN0485 reference photo instead of depicting its conductors as three separate cut leads. Added routed green OUT/red VCC/black GND cable geometry, an open three-channel housing with individual metal contact leaves, and a dry shelf support/guide. The short sensor stubs now remain insulated when the full cable is rendered. Nominal cable-envelope length is retained as the sensor moves into its lifted inspection position; this is authored flexible routing, not a cable-gravity solver.

Corrected the continuity map: the factory cable permanently joins sensor nodes to the three connector sockets. Three male jumper extensions will connect those sockets to the Uno/breadboard. Both ends of those extensions are student-fitted, changing the termination count from 24 to **27**; only the three STEMMA sources remain fixed within the fifteen jumper definitions. Every one of the 27 terminations is covered by disconnect/restore tests, and the exact sketch-session integration still passes. The new connector/socket coordinates are shared by the map and model.

Native Chrome: eight factory-cable/plug/contact/guide owners passed actual clicks, selected-material highlights and surface labels. Actual curve length plus exposed stub and connector is 515.002 mm for all three channels (nominal 515 mm), both mounted and with the sensor lifted 25 mm. Actual cable endpoints meet the rendered stub ends; three guide bores remain open and plug/support bottoms meet the Y=223 mm shelf. Overview screenshot inspected. Thirty-two targeted tap tests and strict changed-module TypeScript passed. Verifier: `scripts/inspect-tap-level-cable.cjs`.

The factory cable is complete, but its three jumper extensions are not yet rendered. Seven of fifteen student harness routes remain rendered, with eight still pending: three level extensions, three STEMMA routes and two motor leads. Full fitting lessons, fluid/hand demo and routed/mobile checks remain pending. Completed workshops: **82/150**.

### Automatic tap — three level-connector jumper extensions

Added separate OUT/VCC/GND extensions from the intact factory connector to D4 and the sensor supply/return strips, with six independently fitting male connectors. Shifted the factory connector and its support 10 mm along X to provide grip withdrawal clearance from the power adapter; all contact coordinates derive from the same connector layout. The factory cable routes adjust while retaining their nominal length.

Native Chrome verified nine wire/connector owners via actual mesh clicks, selected-material highlights and surface labels. Six sequential insertions return to seated coordinates, and the selected endpoint anchor follows 10 mm withdrawal and returns. Actual source pins contact the two factory socket leaves with 4 mm axial overlap; their grips stay 1 mm outside the factory housing. Fitted, withdrawn and half-fitted routes pass sampled hardware/wire clearance checks, and withdrawal separates the metal contacts. Fitted samples report 1.27 mm hardware centreline clearance and 2.54 mm separation from the other tested wire paths for 0.9 mm jackets; this is sampled clearance, not a complete cable collision solver. Re-ran the factory-cable native checks with extensions withdrawn for contact inspection: all eight owners pass, all three guide bores remain open, the plug/support meet the shelf, and nominal cable-envelope length remains 515.002 mm with continuous stub attachment before/after sensor lifting. Screenshot inspected. Thirty-four targeted tests and strict changed-module TypeScript passed.

**10/15 student harness routes rendered.** Remaining: three STEMMA pigtail routes/keyed plug and two motor leads. The whole-build lesson UI, USB/programming connection, power interlocks, fluid/hand demonstration and routed/mobile release verification remain pending. Completed workshops stay **82/150**.

### Automatic tap — keyed STEMMA plug and mating motion

Added an open three-channel plug housing, keyed top rib, three pairs of female contact leaves/crimps and attached coloured tails. Tail positions match the existing harness map. Refined the authored host socket floor/wall section so the plug rests on the floor while fitting around the actual driver pins; PCB footprints/nets remain unchanged. The withdrawal pose pulls free before lifting, and insertion lowers in free space before entering the socket, clearing the adjacent power adapter.

Native Chrome: all eight plug/contact/tail owners pass actual click/highlight/surface-label checks when unplugged; the mated body remains directly selectable. Actual metal faces meet all three host pins with 4.6 mm axial overlap and the rear bridges meet the pin tips. The housing meets the socket floor and its key meets the housing. Sampled fitting phases avoid adapter overlap. A clicked tail label follows the 12 mm horizontal / 6 mm vertical move; the completed fit reconnects nominal driver VIN/SIG indications while Uno USB logic remains independent. This fixture uses completed-fit contact gating, not contact resistance or live analog voltage simulation. Re-ran all thirty-six control-part native checks with the plug withdrawn for contact inspection, then restored mating for indicator checks. Screenshot inspected after refocusing the mated body. Thirty-six targeted tap tests and strict changed-module TypeScript passed.

Verified the reference lead at https://www.adafruit.com/product/3893 : it is a JST PH 2 mm three-pin cable with three male-header free ends, approximately 200 mm including connectors. The upcoming three full lead routes must retain those male ends (including suitable clamp seating), rather than pretend the supplied ends are bare stripped wire. Connector housing heights and spring details are authored teaching geometry, not manufacturer STEP data.

Keyed mating is implemented, but the three long STEMMA routes and two motor leads are still pending: **10/15 full harness routes rendered**. USB/programming connection, whole lesson UI/interlocks, fluid/hand demonstration and routed/mobile release verification also remain pending. Completed workshops stay **82/150**.

### Automatic tap — full STEMMA lead routes and factory male ends

Added three independently routed stock-style 200 mm STEMMA leads with retained factory male-header ends. The signal pin seats in Uno D9; VIN and GND square pins seat in the supply screw clamps with grips outside the block. Clamp screws release during fitting and meet the seated metal pin. The keyed plug motion carries all three cable sources, retaining cable length. The route solver now computes quadratic lengths without temporary point arrays.

Native Chrome passed actual clicks, material highlights and following surface labels for all six wire/destination owners, three sequential fitting animations and 10 mm selected-end withdrawal/return. Actual geometry measures 200.002–200.003 mm including connector envelopes, 1 mm grip clearance, clamp shank/pin contact within floating-point tolerance, at least 1 mm centreline clearance from unrelated hardware and 2 mm centreline separation from the other rendered wires. The collision audit excludes only each wire’s intentionally joined own tail/contact; all unrelated hardware remains checked. Screenshot reviewed. All 31 tap-prefixed tests and targeted strict TypeScript checks pass. These checks concern fitted geometry and the fixture animation, not a released complete workshop.

**13/15 full student harness routes rendered.** Two motor leads, USB/programming connection, full lesson UI/interlocks, fluid/hand demonstration and routed/mobile release checks remain pending. Completed published workshops remain **82/150**. No deployment.

### Automatic tap — moving STEMMA lead clearance follow-up

Expanded native wire audits to five keyed-plug fitting phases. This caught a genuine 0.05 mm insulation overlap at the intermediate pose, despite the seated route being clear. Moved the first lead bend nearer the source so it rises before passing the adapter. All five sampled poses now retain source attachment and stock length, with at least 0.666 mm centreline clearance (0.216 mm beyond the 0.45 mm jacket radius) and 2 mm centreline wire separation. The six actual-part click checks and three destination insertion animations still pass. The separate keyed-plug regression also passes actual spring/pin contact, socket floor, key attachment, ten sampled body/adapter poses, all eight selectable owners, moving labels and final VIN/SIG indication. All 31 tap-prefixed tests pass again. These are component-level checks; the workshop remains unpublished at 82/150 complete.

### Automatic tap — two motor leads, spring clamps and protected rear routing

Added the two dedicated motor-current routes, each with a custom-cut 800 mm insulated path. Bare copper enters each driver's spring opening and touches the lower contact; the upper clamp lifts 1 mm during fitting and closes onto the conductor. The release lever moves with it. Corrected the pump tabs so they project out of the motor rear face instead of being buried in it. Open female tab connectors fit their real faces and stops. Added two bored rear-bracket openings with protective grommets, plus four two-channel cable supports seated on the rear rail. Long routes follow those supports instead of appearing suspended. The connector dimensions/interiors are authored teaching geometry, not vendor STEP data.

Native Chrome passes all 14 actual motor wire/end, spring, grommet and support owner clicks, highlights and following labels, plus all four endpoint fitting animations. Actual fitted jackets measure 800.003 mm; centreline clearances are >=0.7 mm for 0.65 mm radius insulation, motor wires remain 4 mm apart and other wire centreline separation is >=6.28 mm. At sampled fitting phases 0/0.5/1, jacket lengths, hardware clearance and wire separation remain valid. Actual conductor/spring and female/tab faces and end stops meet within floating-point tolerance; actual clamp opening is 1 mm. Bracket/grommet centre rays are open. All eight support-channel rays are open and actual cable line segments pass through their centres; support feet touch the rail. Whole-bench and close-up screenshots reviewed. All 33 tap-prefixed hardware tests, seven exact controller/session tests and targeted strict changed-module TypeScript pass.

**15/15 student harness routes now rendered and component-verified.** This is still an internal fixture, not a completed published workshop: USB/programming connection, whole assembly/wiring lesson UI, electrical interlocks, fluid/receiving-hand demonstration, guide alignment and routed/mobile production checks remain pending. Published count remains **82/150**. No AWS deployment.
