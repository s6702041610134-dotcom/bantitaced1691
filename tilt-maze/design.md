# Design.md --- Retro-Futuristic Visual Design System

## Design Direction

Create a visual design system inspired by the supplied reference image:
a fictional vintage electronic device with a central CRT screen, warm
ivory casing, compact physical controls, technical labels, and
restrained mint-green display graphics.

The aesthetic combines: - **Retro-Futurism** --- the future imagined
through the visual language of older technology. - **Vintage Industrial
Design** --- tactile buttons, recessed panels, rounded housings, and
subtle material depth. - **CRT / Pixel Aesthetic** --- dark display
surfaces, scanlines, pixel-inspired lettering, and monochrome screen
graphics. - **Swiss / Technical Graphic Design** --- structured
alignment, thin rules, compact labels, and clear visual hierarchy. -
**Minimal Editorial Composition** --- controlled spacing, intentional
negative space, and a small, consistent color palette.

This document defines the visual language only. It does not prescribe a
website topic, information architecture, page count, features, or
content.

## 1. Visual Character

The design should feel: - Retro, but not distressed or excessively
aged. - Futuristic, but not glossy sci-fi. - Technical, precise, and
carefully engineered. - Tactile, as if the interface were a real
physical object. - Quietly playful, with small details that reward
closer inspection.

Avoid generic modern SaaS styling, overly bright gradients, excessive
glassmorphism, neon overload, and decorative clutter.

## 2. Color Palette

Use warm, low-saturation surfaces as the foundation. Reserve the
strongest accent colors for small areas of emphasis.

  -----------------------------------------------------------------------
  Token                   Suggested value         Usage
  ----------------------- ----------------------- -----------------------
  `--ivory`               `#D8D4C7`               Main warm surface

  `--paper`               `#F0EDE3`               Lighter surface
                                                  variation

  `--teal-dark`           `#183D3D`               CRT display and dark
                                                  panels

  `--teal`                `#285B58`               Secondary dark surfaces

  `--mint`                `#91B9A7`               Display text and
                                                  restrained highlights

  `--olive`               `#B4C96A`               Active indicators and
                                                  status accents

  `--charcoal`            `#242525`               Primary text and dark
                                                  outlines

  `--warm-gray`           `#A9A69C`               Secondary text,
                                                  inactive controls,
                                                  borders

  `--off-white`           `#FAF9F4`               Bright surface or
                                                  contrast detail
  -----------------------------------------------------------------------

These are suggested colors based on the visual reference, not measured
values. Adjust them to preserve readable contrast.

### Color balance

-   Let ivory and paper tones occupy most of the composition.
-   Use dark teal for the main visual focal point.
-   Use mint for readable display graphics, not for every element.
-   Use olive sparingly to indicate a selected, active, or important
    detail.
-   Use charcoal for crisp outlines and text.
-   Avoid adding unrelated accent colors unless the design specifically
    needs them.

## 3. Typography

Use a small, purposeful type system with distinct roles.

### Display typography

-   Pixel, bitmap, arcade, or geometric display lettering.
-   Prefer squared forms, blocky silhouettes, and strong vertical
    rhythm.
-   Best for short titles, labels, or prominent display text.
-   Avoid using pixel fonts for long paragraphs.

### Primary typography

-   Compact geometric sans serif or technical grotesque.
-   Use for headings, names, and short interface labels.
-   Favor clear shapes and a confident, functional appearance.

### Body typography

-   Neutral, highly readable sans serif.
-   Comfortable line height and clear differentiation between heading
    and body sizes.
-   Keep paragraphs easy to scan.

### Micro-labels

-   Small uppercase lettering with modest letter spacing.
-   Use for technical metadata, captions, tiny annotations, and
    secondary labels.
-   Micro-labels should remain secondary and must not become essential
    information that is too small to read.

### Typography rules

-   Establish a clear hierarchy through size, weight, spacing, and
    contrast.
-   Use no more than two or three type families.
-   Pair display lettering with plain sans serif text.
-   Avoid excessive tracking, too many font weights, and long passages
    in all caps.

## 4. Shape Language and Geometry

The visual language should combine rigid technical alignment with soft
industrial forms.

-   **Primary silhouette:** broad rectangular forms.
-   **Corners:** gently rounded rather than fully pill-shaped.
-   **Display frame:** deep inset panel with rounded corners.
-   **Controls:** compact rounded rectangles with defined edges.
-   **Small details:** circles, narrow slots, tiny indicators, and fine
    divider lines.
-   **Alignment:** precise rows, columns, and consistent baselines.
-   **Symmetry:** balanced left/right groupings, without requiring every
    detail to be perfectly mirrored.

Avoid overly organic shapes, exaggerated bubble-like cards, and
arbitrary corner radii.

## 5. Surface, Material, and Depth

Create the impression of a physical object through restrained shading
and layered surfaces.

### Warm outer surfaces

-   Matte ivory or warm-gray plastic appearance.
-   Very subtle grain, if used.
-   Gentle tonal shifts rather than strong gradients.

### Recessed display

-   Dark teal surface surrounded by a thick, molded frame.
-   Inner shadows suggest depth.
-   Slight curvature or edge shading can evoke a convex CRT screen.
-   Keep the display text and graphics crisp enough to read.

### Physical controls

-   Slightly raised buttons with fine outlines.
-   Small highlights along top edges and restrained shadows beneath.
-   Active controls may include a muted olive or mint-colored insert.
-   Avoid excessive beveling that makes the interface look like an old
    web button theme.

### Texture

-   Fine CRT scanlines or subtle pixel texture inside dark display
    areas.
-   Very light paper or plastic grain on large surfaces.
-   Thin technical lines and tiny printed labels.
-   Texture should support the visual style without reducing legibility.

## 6. Composition and Visual Hierarchy

Use a clear focal point and a carefully controlled supporting structure.

1.  **Primary focal area:** one dominant display or central visual
    panel.
2.  **Secondary groups:** smaller, aligned control or information groups
    around the focal area.
3.  **Brand or title area:** a compact heading framed by thin horizontal
    rules.
4.  **Micro-details:** tiny labels, indicators, slots, and other
    technical accents.
5.  **Negative space:** preserve breathing room between major groups.

### Layout principles

-   Prefer strong alignment over decorative asymmetry.
-   Keep margins and spacing consistent.
-   Group related elements into clearly separated clusters.
-   Use thin horizontal rules to establish rhythm and structure.
-   Use size and contrast to guide attention, not decoration alone.
-   Keep the overall composition calm even when it contains many small
    details.

## 7. Graphic Language

Use a restrained set of recurring graphic motifs:

-   Thin horizontal rules.
-   Small technical captions.
-   Monochrome or two-tone display graphics.
-   Pixelated or halftone imagery.
-   Fine grids and subtle scanlines.
-   Tiny status dots and indicator bars.
-   Numbered marks or compact technical annotations.
-   Simple geometric symbols.

Use these elements consistently. Do not add random symbols or unreadable
pseudo-text simply to make the design appear technical.

## 8. Buttons and Interface-Like Elements

If the design includes controls, they should look like physical
components rather than generic web buttons.

-   Use compact rectangular shapes with slightly rounded corners.
-   Keep borders thin and precise.
-   Use restrained highlights and shadows to suggest raised surfaces.
-   Provide a clear distinction between normal, hover, pressed,
    selected, and disabled states.
-   Use mint or olive as a small state indicator.
-   Maintain readable labels and sufficient contrast.

The physical appearance should not obscure usability. Interactive
controls must still be recognizable and accessible.

## 9. Motion and Feedback

If motion is used, it should feel deliberate and mechanical rather than
flashy.

-   Prefer short fades, small shifts, and subtle pressed-state feedback.
-   A display may use a very subtle scanline effect.
-   A status indicator may change brightness gently.
-   Avoid rapid blinking, strobing, constant movement, and distracting
    loops.
-   Motion should never be required to understand the visual state.
-   Respect reduced-motion preferences when implementing this style in
    an interactive medium.

Motion is optional; the design should remain convincing as a static
composition.

## 10. Responsive and Scale Considerations

When this design language is applied to different screen sizes or
formats:

-   Preserve the primary focal area.
-   Reduce secondary micro-details before reducing essential text.
-   Keep labels legible at smaller sizes.
-   Simplify control groups when space is limited.
-   Avoid shrinking a complex desktop composition until it becomes
    unreadable.
-   Maintain consistent color, typography, shape, and surface rules
    across sizes.

## 11. Do and Don't

### Do

-   Use warm ivory against dark teal.
-   Pair pixel-inspired display text with clean sans serif typography.
-   Use fine rules and precise alignment.
-   Give the main display a recessed, physical quality.
-   Make controls feel tactile through restrained shading.
-   Keep accents limited and purposeful.
-   Maintain negative space and clear hierarchy.

### Don't

-   Turn the design into a generic dashboard.
-   Use neon gradients as the dominant visual treatment.
-   Apply scanlines or grain so heavily that text becomes difficult to
    read.
-   Use pixel fonts for all content.
-   Add excessive shadows, bevels, or glossy effects.
-   Scatter technical labels without a clear alignment system.
-   Introduce unrelated decorative styles that conflict with the
    reference.

## 12. Design Summary

**Core style:** Retro-Futuristic Analog Interface.

**Supporting influences:** Vintage Industrial Design, CRT Display
Graphics, Pixel Typography, and Swiss-inspired technical layout.

**Signature combination:** warm ivory surfaces + a deep teal focal
display + mint-green graphics + compact tactile controls + fine
technical rules + precise spacing.

Use this visual system as a consistent design language. The subject
matter and content can vary; the defining characteristics are the
palette, typography, geometry, material treatment, graphic details, and
composition.
