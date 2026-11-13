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
