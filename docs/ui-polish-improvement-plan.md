# UI polish improvement plan

This proposal translates Emil Kowalski-style design engineering principles into the DRAGGON Lab website without turning the site into a flashy demo. The target feeling is a clean scientific software platform: futuristic, precise, readable, and quietly delightful.

## Design principles

1. **Motion must have a job.** Use motion to explain the biodesign loop, confirm interaction, or guide reading order. Do not animate routine navigation or high-frequency tasks just for novelty.
2. **Components should feel designed, not decorated.** Cards, buttons, navigation, and panels use the same border radii, glow intensity, focus rings, and timing tokens.
3. **Invisible details compound.** Respect reduced motion, keep the animation toggle meaningful, make the header readable over content, make card titles the true links, and make focus states obvious.
4. **Futuristic means legible.** Use violet for the primary system language, fluorescent green as a signal accent, and cyan as computational depth. Avoid overwhelming neon surfaces.
5. **The page should read like a product narrative.** Mission -> platform -> DBTL loop -> impact -> scholarly and teaching entry points -> collaboration.

## Implementation loops

### Loop 1: Narrative and hierarchy

- Rebuild the home page as a guided story rather than a list of independent sections.
- Add a hero that clearly frames DRAGGON Lab as a bio-compiler for computational specifications, genetic networks, and intelligent living systems.
- Use data arrays and `.map()` loops for repeated hero signals, metrics, research pillars, workflow details, impact cards, publication cards, and learning loops.

### Loop 2: Component polish

- Convert `SimpleCard` from fully-clickable-card behavior to title-and-CTA links, matching the design specification.
- Add consistent card title underline motion, subtle border glow, and no hover scaling.
- Add button micro-press feedback, arrow movement, focus rings, and external link handling.
- Refactor the footer into grouped data loops for maintainability and consistent link treatment.

### Loop 3: Motion decisions

- Keep the hero scan purposeful: it suggests a signal moving through computational and biological layers.
- Add one-time reveal motion to help the reader flow down the page.
- Keep transitions under a fast, responsive timing scale.
- Preserve the existing animation toggle and reduced-motion behavior.

### Loop 4: Coherence review

- Check that the homepage starts with the research mission and ends with a clear collaboration CTA.
- Check that every visual accent repeats a system role: violet = primary platform language, green = signal/focus, cyan = computational depth.
- Check that interactive states are coherent across cards, navigation, buttons, and toggles.
- Check that dark mode keeps the futuristic feeling without losing contrast.
- Check that the site remains accessible through semantic landmarks, focus states, skip link, and motion preferences.

## Implemented design changes

- New ambient background, glass header, brand lockup, and futuristic hero console.
- Array-driven homepage sections for research pillars, platform loops, impact paths, publications, and learning/collaboration entry points.
- Polished DBTL cycle display with shared stage styling and infrastructure band.
- Improved card/link semantics.
- Refined button, header, footer, card, reveal, dark-mode, and reduced-motion CSS.
