# Redesigned Evolution screen

Date: 2026-11-11

The previous two-pane chapter-list/detail implementation was replaced completely. The new static screen has a panoramic editorial hero, six era selectors, an ordered 25-milestone visual journey, timeline/gallery layouts, search, an expanded detail dialog and a before/after comparison.

## Content and order

Stable saved-item IDs remain compatible with the existing catalogue, while display numbers now follow the chronological teaching sequence. The sequence runs from human tools and simple machines through industrial power, electronics, computing, connected devices and AI. Twenty-three historical/current milestones precede two future concepts. Approximate periods can overlap; the page explains that technologies developed in parallel and coexist.

Each milestone includes a distinct high-resolution image, date range, clear summary, the step forward, why it mattered, a practical example, limitations, a reflection question, an expanded explanation and an original Atlas takeaway. AGI and ASI are explicitly speculative/hypothetical, with no assumed arrival dates.

## Browser checks

- Old `.evolution-layout` absent; all 25 new stages render numbered 01–25.
- Six era selections show 2, 4, 8, 5, 4 and 2 stages respectively.
- Searching for microprocessors produces the matching stage.
- Gallery contains all 25 milestones.
- Detail opens, advances from AGI to ASI, and closes with Escape.
- Before/after selectors enforce a later milestone after the earlier selection.
- Mobile test at 390 × 844: document width equals viewport width, with no horizontal page overflow.
- High-resolution local image assets are present for every milestone.

Automated tests additionally validate chronological year order, consecutive display numbers, era order, stable ID uniqueness, future placement, distinct images, asset existence and explanation completeness.

## Source provenance (internal documentation only)

- [Computer History Museum timeline](https://www.computerhistory.org/timeline/)
- [Computer History Museum: CPU on a chip](https://www.computerhistory.org/siliconengine/microprocessor-integrates-cpu-function-onto-a-single-chip/)
- [CERN: the birth of the Web](https://home.cern/science/computing/the-birth-of-the-web)
- [IBM: history of AI](https://www.ibm.com/think/topics/history-of-artificial-intelligence)
- [Smithsonian: Early Stone Age tools](https://humanorigins.si.edu/evidence/behavior/stone-tools/early-stone-age-tools)
- [Science Museum stories and collections](https://www.sciencemuseum.org.uk/objects-and-stories)

The page remains frontend-only. Exact prompts and original assets are recorded in `design-assets/evolution/`.

## Comparison and showcase refinement

The comparison now includes six guided pairs and eight shared dimensions, with custom selectors enforcing chronological order. Journey cards include additional explanatory context. Milestone details add an editorial quotation panel and an input/process/output showcase. All external reference links have been removed from the Evolution interface; source metadata remains in the data for provenance. Editorial takeaways are original Atlas text, not historical quotations.
