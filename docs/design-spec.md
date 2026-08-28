# DRAGGON Lab design specification

## Visual identity

The site should feel like a clean scientific software platform: confident, technical, accessible, modern, and not flashy.

The dragon-G is the identity seed: a double-dragon silhouette that supplies both Gs in the
DRAGGON wordmark. Extend its offset circular geometry into restrained arcs, crops, and framing
devices rather than repeating a large literal logo throughout a layout.

### Logo system

- Primary wordmark: `DRA` + dragon-G + `ON Lab`, set with the Futura heading stack.
- Standalone mark: use where the lab name is already clear, including the favicon.
- Minimum digital size: 24 px for the standalone mark and 150 px wide for the wordmark.
- Clear space: keep at least one-quarter of the mark's width free on every side.
- Use the full-color artwork on light or dark brand surfaces. Do not stretch, rotate, recolor,
  outline, or add effects to the mark.
- Decorative copies must be hidden from assistive technology. Meaningful copies expose one
  concise `DRAGGON Lab` accessible label.

## Palette

- Base light: #F8FAFC
- Surface: #FFFFFF
- Text: #0F172A
- Muted text: #475569
- Logo violet: #995CD0
- Deep violet: #3B1A7A
- Logo green: #8EDF5F
- Soft green: #DCF6CC
- Computational cyan: #06B6D4
- Dark background: #020617
- Dark surface: #0F172A
- Dark text: #E2E8F0

The exact logo colors carry identity, decoration, and high-signal accents. Use a darker derived
violet for small text and controls where the raw logo violet does not meet WCAG AA contrast. Never
use the logo green for body text on a light surface.

### Brand extensions

- Paired violet/green circular arcs may frame page introductions, diagrams, and editorial art.
- The homepage DNA remains the scientific motif and is framed by the same offset circular geometry.
- Patterns stay low-opacity and secondary to content; they are not substitutes for information.
- New extensions should reuse the mark's circle, offset, and two-color relationship before
  introducing unrelated decorative geometry.

## Interaction rules

- Prose links are underlined.
- Cards, buttons, badges, navigation, and CTAs are not underlined by default.
- Cards are not fully clickable.
- Card titles link to internal detail pages when available.
- Card hover uses a very subtle fluorescent-green shine, no scale transform.
- Active filters and active navigation use violet as the main state with a small fluorescent-green accent.
- Primary buttons are violet. Green appears only as a small focus or hover accent.

## External links

External action/resource links open in a new tab with target="_blank" and rel="noopener noreferrer".

## Mobile navigation

Desktop nav is compact. Mobile nav uses labels plus short descriptions. Mobile bottom row includes GitHub, Scholar, LinkedIn, and RSS.

## Footer

Footer includes identity, grouped navigation, external links, legal/technical links, and the bottom line with current year, technical stack, source link, and license summary.

## Accessibility

Target practical WCAG 2.2 AA: contrast, keyboard navigation, focus states, semantic landmarks, alt text, diagram summaries, reduced motion, and mobile-readable layouts.
