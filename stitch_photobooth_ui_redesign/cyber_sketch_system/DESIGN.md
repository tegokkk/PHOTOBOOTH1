---
name: Cyber-Sketch System
colors:
  surface: '#14121c'
  surface-dim: '#14121c'
  surface-bright: '#3b3743'
  surface-container-lowest: '#0f0d17'
  surface-container-low: '#1d1a25'
  surface-container: '#211e29'
  surface-container-high: '#2b2834'
  surface-container-highest: '#36333f'
  on-surface: '#e7e0ef'
  on-surface-variant: '#cbc3d9'
  inverse-surface: '#e7e0ef'
  inverse-on-surface: '#322f3a'
  outline: '#948ea2'
  outline-variant: '#494456'
  surface-tint: '#cdbdff'
  primary: '#cdbdff'
  on-primary: '#370095'
  primary-container: '#6320ee'
  on-primary-container: '#d6c8ff'
  inverse-primary: '#692bf4'
  secondary: '#ffffff'
  on-secondary: '#2c3400'
  secondary-container: '#d2f000'
  on-secondary-container: '#5d6b00'
  tertiary: '#c6c6c7'
  on-tertiary: '#2f3131'
  tertiary-container: '#575959'
  on-tertiary-container: '#cfd0d0'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e8deff'
  primary-fixed-dim: '#cdbdff'
  on-primary-fixed: '#20005f'
  on-primary-fixed-variant: '#5000d0'
  secondary-fixed: '#d2f000'
  secondary-fixed-dim: '#b8d300'
  on-secondary-fixed: '#191e00'
  on-secondary-fixed-variant: '#414c00'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#14121c'
  on-background: '#e7e0ef'
  surface-variant: '#36333f'
  ink-black: '#0F0F0F'
  cyber-purple: '#6320EE'
  neon-yellow: '#DFFF00'
  stark-white: '#FFFFFF'
  error-red: '#FF3131'
typography:
  headline-xl:
    fontFamily: Bricolage Grotesque
    fontSize: 80px
    fontWeight: '800'
    lineHeight: '1.0'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.1'
  headline-md:
    fontFamily: Bricolage Grotesque
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Courier Prime
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Courier Prime
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Courier Prime
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  tech-mono:
    fontFamily: Courier Prime
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.2'
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
  border-thick: 3px
  border-thin: 1px
---

## Brand & Style

The design system embodies a "Cyber-Sketch" or "Tech-Punk" aesthetic—a high-energy collision between hand-drawn rawness and futuristic digital precision. It is designed for a modern photobooth experience that feels decentralized, experimental, and "built for the future." 

The visual language draws heavily from **Brutalism** and **Cyberpunk** movements, utilizing:
- **Thick, aggressive borders** and **hard shadows** to create physical depth.
- **Pixel-art accents** and glitched geometric shapes to ground the interface in a retro-futuristic digital reality.
- **Dynamic asymmetry**, where elements feel "built" rather than perfectly aligned.

The target audience is tech-savvy, expressive, and seeking a photobooth experience that feels more like a creative laboratory than a traditional photo kiosk. The UI should evoke a sense of controlled chaos, urgency, and high-tech craftsmanship.

## Colors

The palette is anchored by a high-vibrancy contrast between **Cyber Purple** and **Neon Yellow**, set against a **Stark Black** base to ensure maximum visual impact.

- **Primary (Cyber Purple):** Used for large surface areas, background containers, and primary brand moments. It provides the "night-city" depth.
- **Secondary (Neon Yellow):** The primary action color. Used for CTA buttons, critical status indicators, and highlights. It must always be paired with `ink-black` text for legibility.
- **Neutral (Ink Black & Stark White):** Black is used for the base background and all "sketch" borders. White is used for secondary surfaces and high-contrast technical data.

Avoid gradients unless they are "stepped" (pixel-art style). Colors should be applied as solid, unyielding blocks of ink.

## Typography

Typography functions as a hierarchy of "Expression" vs. "Information."

- **Bricolage Grotesque** is the voice of the system. It should be used for massive headlines, button labels, and high-impact messaging. It should often be displayed in all-caps for a more aggressive, structural feel.
- **Courier Prime** serves as the functional layer. It mimics terminal output and technical documentation. Use it for body text, data points (e.g., "Frame 1/4"), and small navigational labels.

For the "Cyber-Sketch" feel, headlines can occasionally be skewed or given a "glitch" offset, but body text must remain strictly legible and aligned to a baseline grid.

## Layout & Spacing

This design system uses a **fixed-grid layout** that feels like a structured "dashboard" or "terminal interface."

- **Grid Model:** A 12-column grid for desktop, 4-column for mobile.
- **Rhythm:** All spacing is based on a **4px base unit**. Gaps between components should feel tight and intentional (16px or 24px).
- **Hard-Edges:** Avoid fluid scaling where possible; prefer distinct steps in size.
- **Modular Blocks:** Components should look like distinct "chips" or "modules" plugged into the purple background. Use varying container widths to create a jagged, non-uniform silhouette that reinforces the "sketch" aesthetic.

## Elevation & Depth

Depth is conveyed through **Hard Shadows** and **Border Stacking**, never through blurs or soft shadows.

1.  **Level 0 (Base):** The `cyber-purple` background.
2.  **Level 1 (Surface):** Containers with `stark-white` or `ink-black` fills. They must have a `3px` solid border in `ink-black`.
3.  **Level 2 (Shadow):** Every interactive component or container features a **Hard Shadow** (`hard-shadow`). This is a solid black block offset by `4px` or `8px` to the bottom-right.
4.  **Level 3 (Interactive):** When a button or card is active/pressed, the shadow disappears and the element shifts `4px` down and right to simulate a physical "click" (the `jiggle-active` effect).

Use **Pixel-art accents** (like tiny squares at corner intersections) to suggest a technical, blueprint-like depth.

## Shapes

The shape language is strictly **Sharp (0px roundedness)**. 

- **Hard Angles:** All buttons, cards, and input fields must have square corners. 
- **Sketch Borders:** While the corners are sharp, the border lines themselves should have a slight "jitter" or "serrated" texture (`sketch-border`) to mimic a hand-drawn technical ink pen.
- **Cut-outs:** Use "dog-ear" folds or 45-degree chamfered corners on specific UI elements (like the "Connect Wallet" or "Capture" button) to reinforce the tech-punk look.

## Components

- **Buttons:** 
  - *Primary:* Neon Yellow background, Ink Black text, 3px Black border, Hard Shadow.
  - *Secondary:* White background, Black text, 3px Black border.
  - *Effect:* Must use the `jiggle-active` state where the button moves to cover its shadow on click.
- **Cards (Modules):** 
  - Solid White or Black background. 
  - Must feature a header bar with "Window Controls" (three small pixel-art squares: minimize, maximize, close) to mimic an OS window.
- **Inputs:** 
  - White background, 2px solid border. 
  - Use Courier Prime for the input text. Focus state should change the border to Neon Yellow.
- **Chips / Labels:** 
  - Small rectangular blocks of color (Purple or Yellow) with Courier Prime text.
- **Photobooth Frame Preview:** 
  - Frames should be displayed within a grid of containers that have "tape" corner accents (diagonal black blocks at 45 degrees).
- **Loading State:** 
  - A "Scribble Loader" that cycles through 4-5 hand-drawn frames of a camera icon or a "loading" glitch animation.
- **QR Codes:** 
  - Always rendered in high-contrast Black and White, encased in a Neon Yellow border.