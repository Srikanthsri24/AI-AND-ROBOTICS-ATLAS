# Scientific scope and asset provenance

## Original teaching design
All robot meshes, scene arrangements, diagrams, scripts and UI were authored for this project. There are no downloaded third-party humanoid meshes, stock textures or manufacturer marks. The electric humanoid concept contains stereo cameras, an IMU, joint encoders, motors, representative reduction transmissions, controllers, computing, power distribution and battery. It has no specified lifting load, voltage, battery capacity or actuator rating.

The visible materials use standard metallic/roughness shading and scene lights. Reflections are limited to local material lighting, not a captured laboratory HDR environment. The GLB is an interchange snapshot; procedural React geometry is the editable runtime asset. Gear teeth and cabling are explanatory, not engineering drawings. The front panel explodes while the load-bearing frame remains in place. Transparency is an illustrative cutaway, not an X-ray simulation.

## Motion and perception
The elbow demonstrates one axis with a 0–125 degree educational range. The shoulder shows selected axes, not every human shoulder degree of freedom. The fingers are simplified. The walk uses analytic two-link inverse kinematics, planted support foot targets, a small lateral pelvis shift and flat foot orientation. Its center-of-mass dot and support region are **illustrative**, not derived from a mass model. Dynamics, force contacts, collision clearance, torque feasibility and physical stability have not been validated. The scene must not be presented as proof that this machine could walk.

Camera frusta, object boxes, data pulses and label overlays are illustrations. No actual camera feed, object detection network, stereo matcher, state estimator or robot controller runs in this application. A camera records light; perception interprets pixels. An IMU measures acceleration and angular velocity; orientation requires estimation. AI may support recognition or planning, while many low-level motor loops use conventional feedback. A language model is not necessary for every motor command.

## References consulted
- Lynch & Park, *Modern Robotics*, Northwestern University: https://hades.mech.northwestern.edu/images/7/7e/MR-2up-v2.pdf — kinematics, joint coordinates, dynamics and feedback.
- EPFL BioRob humanoid balancing: https://www.epfl.ch/labs/biorob/research/humanoid/walkman/page-99798-en-html/ — balance, small support regions, dynamics and joint torque coordination.
- ROBOTIS DYNAMIXEL actuator documentation: https://www.robotis.us/dynamixel-y/ — representative motor, encoder, transmission and control integration. This project does not depict or claim that specific actuator.
- ST humanoid reference guide: https://www.st.com/resource/en/brochure/humanoid-robot-reference-guide.pdf — sensing, compute, power and motor control subsystems.

## Speech licensing and quality
Saved audio was generated from original text with eSpeak NG, GPL-3.0-or-later: https://github.com/espeak-ng/espeak-ng . The engine is installed separately and not redistributed in this project. GNU output guidance: https://www.gnu.org/licenses/gpl-faq.html#WhatCaseIsOutputGPL . Generated original narration is not a copy of the engine source. Preserve eSpeak licensing obligations if you redistribute its binary or source.

Apple system voices were tested during environment discovery but rejected for the deliverable after reviewing restrictions on their recorded output: https://www.apple.com/legal/sla/docs/macOSSequoia.pdf . All deliverable WAVs were subsequently overwritten using eSpeak NG. The local TTS fallback is intentionally identified as synthetic. Professional natural narration with commercial publication rights remains outstanding.

Three.js: MIT. React: MIT. React Three Fiber: MIT. Drei: MIT. Zustand: MIT. Vite: MIT. The application optionally loads DM Sans and Space Grotesk via Google Fonts (OFL); system sans-serif fallback works without network. Do not represent these fonts as company-owned. FFmpeg and its bundled codecs have their own licensing requirements; the encoder is installed separately through imageio-ffmpeg and not redistributed with this source tree. Review the exact FFmpeg build before distributing an encoder binary.
