# 2D catalogue validation

Implemented 240 family guides across five modules, preserving all user-supplied family names and example/variant lists: 40 components, 30 controllers/computers, 50 sensors/IoT, 60 robots/mechanisms and 60 anatomy topics. These are family-level educational guides, not separate exact pinouts or operating manuals for every named product variant.

Each guide contains authored descriptions, purpose, three starting steps, three use cases, selection priorities, common mistakes, an interactive three-stage functional flow, annotated representative 2D construction/context and links to related internal guides. Physical illustrations and diagrams are explicitly representative. No invented exact electrical ratings or product specifications are assigned to entire families.

43 generated artwork assets (42 collections plus an Arduino-family illustration) are saved in `design-assets/hardware/`; responsive 640px and 1280px JPEG derivatives are in `public/images/hardware/`. Built-in image generation was used. Prompts and original output paths are in `design-assets/hardware/manifest.json`. The vector construction diagrams are authored directly in the application.

## Checks

- Automated data coverage: exact counts, consecutive numbers, unique IDs, required educational fields, setup/use-case/flow coverage, all collection artwork and provenance, important cross-family distinctions and model aliases.
- TypeScript and Vite production build pass.
- Browser: all five module screens open; Arduino and ToF sensor detail navigation works; ESP32-C5, Schottky, VL53L5CX, planetary and Bowden searches find relevant families.
- Browser: guide save state changes, return navigation works, collection filters and related guides use internal routes.
- 390 × 844 controller-guide test: document width equals viewport width; responsive layout has no page overflow. Temporary viewport reset afterward.
- Legacy lesson-wide header/nav CSS was scoped out of the new guides after visual inspection.

## Editorial source provenance

Primary sources used for hardware distinctions include Arduino hardware documentation, Espressif board-selection documentation and Raspberry Pi microcontroller documentation. The application keeps the learning experience internal.

- https://docs.arduino.cc/hardware/
- https://docs.espressif.com/projects/esp-techpedia/en/latest/esp-friends/get-started/board-selection.html
- https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html

## Limits

Family artwork and construction diagrams explain identification and relationships. They are not dimensionally exact CAD, schematics for building every variant, clinical guidance or certification evidence. Model-specific ratings must be selected for an actual build. Phase 2 adds 3D viewing separately after this 2D foundation.
