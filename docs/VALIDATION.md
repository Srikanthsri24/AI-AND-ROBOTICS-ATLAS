# Executed validation — 28 October 2026

## Environment
Intel MacBook Pro, 8-core Core i9, 16 GB RAM. Node 24.19.0 from the Codex workspace runtime. Tested in the in-app Chromium browser. Vite development server ran at 127.0.0.1:5191 because port 5190 was occupied by an existing process; that process was preserved.

## Automated checks
Nine Node tests executed successfully:
1. Eight contiguous 60-second chapters, total exactly 480 seconds.
2. All 96 script/audio references exist; PCM WAV slot lengths are exactly 15 seconds.
3. Animation poses are finite and deterministic throughout the lesson, including repeated seeks.
4. The chapter-three exploded shell opens and closes at the specified times.
5. Two-link inverse kinematics reaches its authored foot targets; support feet have no longitudinal sliding in the analytic target calculation.
6. Quiz answers reference valid options.
7. Original binary GLB header, length and named educational nodes are valid.
8. All narration files contain nonzero signal; the manifest records eSpeak NG voices en-in, te and hi.
9. Label cues refer to defined components.

Strict TypeScript compilation and the Vite production build executed successfully. Vite reported a large Three.js viewer chunk; the viewer is lazy-loaded, but further bundle optimization is outstanding.

## Browser checks executed
- App startup, play and pause; the timeline advances at normal speed from a clean load.
- Chapter navigation reached all eight chapters in both 16:9 and 9:16 (16 navigation checks).
- A paused language change and aspect-ratio change preserved the exact position at 10.5 seconds.
- English, Telugu and Hindi each loaded the appropriate real WAV path and reached media readyState 4 while playing, with currentTime aligned to the corresponding segment. This is a playback check, not a fluent pronunciation review.
- Explore mode opens Inspector. Selecting Battery displays its explanation. Isolation visibly removes the remaining robot parts. Restore is available.
- Classroom entered actual fullscreen and displayed play, scene replay, chapter selection and language switching controls.
- Labels were observed on the head, battery, elbow and ankle; a first-load visibility issue was fixed by replacing nested HTML roots with a projected DOM label layer.
- A landscape browser recording downloaded as an actual MP4. It decoded successfully with FFmpeg: 1280×720, 16:9, H.264 High, AAC stereo at 48 kHz. A constant 30 fps encoding pass removes variable-capture timestamp irregularities. Missing rendered frames are repeated, not newly simulated.

## Performance
The in-app measured FPS varied with loading, tab visibility, recording resolution and scene complexity: approximately 1–30 FPS was observed, with many interactive samples in the teens/twenties. The 60 FPS target was **not achieved or certified**. Auto quality steps down after repeated slow visible-tab samples; manual High/Low is available. Export requests the actual target framebuffer resolution, which increases GPU cost. A 30 fps output file does not establish 30 unique rendered frames per second.

## Remaining acceptance gaps
- Synthetic eSpeak narration does not meet the requested natural, human-like narrator quality. All three scripts and real audio exist; professional voice recording/TTS and fluent Telugu/Hindi review remain needed.
- The original humanoid is an inspectable procedural teaching model, not an ultra-detailed production art asset. Reflections, laboratory dressing and use-case cinematography need further art direction.
- Walking is kinematic and illustrative. There is no validated physical locomotion, contact-force solver or safety certification. The current center-of-mass cue is not a mass-model computation. Small lateral body offsets are illustrative and are not part of the longitudinal no-slip test.
- Word-level multilingual alignment is not provided. Alignment is by 15-second authored segments and shared offset within the current segment.
- 1080p export is implemented, but the tested export files use 720p. 4K is not offered. Full browser/OS combinations and projector/smart-TV hardware have not been certified.
- Component labels are English; narration and subtitles have all three language variants. Labels can still crowd in extreme user-selected exploration views.
- Keyboard shortcuts and native controls are provided, but a comprehensive screen-reader and WCAG audit has not been performed. WebGL failure fallback is implemented but not verified by deliberately disabling WebGL.
- The lesson format is reusable, but a new robot lesson still needs its own authored scene implementation and camera direction. Animation cue metadata is not a general-purpose visual scripting language.

This is a functioning implementation with explicit production gaps, not a declaration that every premium-quality acceptance criterion has been met.
