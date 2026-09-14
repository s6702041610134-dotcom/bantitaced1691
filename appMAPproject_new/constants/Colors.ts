// ─── Brand Color System ───────────────────────────────────────────────────────
// Citron      #CAD183  → Main Light Background / Surface
// Tyrian Purple #66023C → Primary Brand / Button / Header / CTA
// Pistachio   #BADD7F  → Accent / Highlight / Success / Interactive
// Chocolate Brown #391D01 → Main Text / Dark Surface / Secondary
// ─────────────────────────────────────────────────────────────────────────────

export const Colors = {
  // ── Core Palette ──────────────────────────────────────────────────────────
  citron: '#CAD183',          // Light background / surface
  purple: '#66023C',          // Primary brand / buttons / headers
  pistachio: '#BADD7F',       // Accent / highlight / success
  brown: '#391D01',           // Main text / dark elements

  // ── Derived: Transparent tints ────────────────────────────────────────────
  citronLight: 'rgba(202, 209, 131, 0.28)',   // Card glass overlay
  citronMid: 'rgba(202, 209, 131, 0.55)',     // Heavier citron tint
  purpleLight: 'rgba(102, 2, 60, 0.12)',      // Subtle purple tint
  purpleMid: 'rgba(102, 2, 60, 0.22)',        // Medium purple tint
  pistachioLight: 'rgba(186, 221, 127, 0.35)',// Accent wash
  brownFaint: 'rgba(57, 29, 1, 0.08)',        // Shadow / separator
  brownLight: 'rgba(57, 29, 1, 0.14)',        // Border light
  brownMid: 'rgba(57, 29, 1, 0.55)',          // Secondary text
  brownStrong: 'rgba(57, 29, 1, 0.80)',       // Heading secondary

  // ── Neutral ───────────────────────────────────────────────────────────────
  white: '#FFFFFF',
  offWhite: '#F9F6EF',        // Warm white for light surfaces

  // ── Legacy aliases (for components that still reference old names) ─────────
  // @deprecated use the new names above
  oldLace: '#F9F6EF',
  freshlyRoasted: '#391D01',
  butter: '#CAD183',
  oysterBay: '#BADD7F',
  borderLight: 'rgba(57, 29, 1, 0.14)',
  borderLightStrong: 'rgba(57, 29, 1, 0.25)',
  shadowSoft: 'rgba(57, 29, 1, 0.08)',
};
