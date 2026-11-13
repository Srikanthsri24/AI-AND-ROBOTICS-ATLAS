# 3D studio coverage

All 240 family guides use their own local GLB and 2D reference image. The GLBs model the pictured representative hardware. The guide text also covers related variants in each family.

The viewer includes orbit/pan/zoom, perspective/front/rear/top/side cameras, selectable construction groups, isolation, transparent materials, group separation, reset, fullscreen (with an unavailable-state message), auto-rotation and illustrative articulation on supported mechanisms. It loads lazily. Static scenes render on demand; auto-rotation opts into continuous frames.

Selecting geometry highlights the associated part and opens its function and connection explanation. Isolate a part to inspect geometry normally hidden by the assembled model.

Automated coverage checks compare asset hashes, verify mesh ownership for each named part and raycast the models from multiple angles. Each named part must be directly reachable in isolation. The picking test also reports which parts were reached in the sampled assembled views. These checks verify asset coverage and interaction. Visual alignment and the technical accuracy of part explanations require comparison with the individual references.

Earlier browser checks covered board, resistor, hand, delta and ultrasonic models. The screenshots in `docs/screenshots/` record those checks.

A dependency compatibility issue caused the original contact-shadow helper to show an opaque plane; the studio now uses a transparent native shadow receiver instead.

The models are locally authored educational reconstructions. Geometry and finish are based on the pictured examples, with dimensions estimated from references where engineering drawings are unavailable.
