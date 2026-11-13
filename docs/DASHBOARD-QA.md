# Static dashboard delivery

Date: 2026-11-11

## Final composition

The dashboard is an atlas landing screen rather than a learner activity dashboard. Continue Learning, My Learning Path, progress bars and resume percentages have been removed from the dashboard. The header/sidebar remain stable. The screen contains a hero, featured project, ten linked collections, an illustrated eight-stage overview with access to the 25-stage technology journey, and direct tool links.

The Explore the Atlas heading has a distinct book icon, editorial eyebrow, violet title accent, a factual collection count and a laboratory action. Mobile retains an accessible label on the compact action.

## Artwork

Twenty standalone generated images replace low-resolution screenshot crops in all dashboard illustrations. Collection, project and timeline originals are 1536 × 1024 pixels; the hero is 2172 × 724 pixels. Images are original educational illustrations, not manufacturer photographs or dimensionally accurate hardware references.

The featured project uses a detailed rover portrait at its native 3:2 proportions. It occupies the full panel width on desktop and mobile, with adequate height instead of a small centered thumbnail. Artwork uses responsive 512/1024/1536-pixel delivery variants, a 2048-pixel hero variant, explicit dimensions, async decoding and lazy loading below the fold.

Originals and exact prompts: `design-assets/dashboard/`. Public web variants: `public/images/dashboard/`. Tool: built-in image generation. JPEG conversion and proportional delivery sizing use native image utilities; no screenshot upscaling is used.

## Validation

Desktop and mobile visual checks: no removed learning panels, no horizontal page overflow, ten collection links, eight timeline buttons, native technology-stage dialog with Escape dismissal, working featured-project action, and direct 2D/3D tool routes. Verify the current build before deployment using the commands in README.md.

This record concerns the dashboard. It does not certify unsupported hardware integrations, exact CAD coverage or physical simulation accuracy.
