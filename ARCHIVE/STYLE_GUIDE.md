# Photoboother - Visual Style Guide

## Overview

**Photoboother** is a playful, nostalgic digital photobooth application that bridges the gap between modern convenience and the tactile, imperfect charm of vintage physical photobooths. The design style is a hybrid of **Brutalism** and **Sketch-Retro**, creating an interface that feels like a zine or private sketchbook—intentional, raw, and high-energy.

The brand personality celebrates:
- **Playfulness**: Fun, energetic, and experimental
- **Nostalgia**: Inspired by vintage photobooths and analog aesthetics
- **Creativity**: Positioned as an accessible creative playground
- **Authenticity**: Raw, unrefined visual language with hand-drawn elements

---

## Design System Architecture

### 1. Color Palette

The color system is built on a **monochromatic high-contrast base** to ensure photos remain the focal point, with strategic accent colors for calls-to-action and utility functions.

#### Core Colors

| Color | Value | Usage | Role |
|-------|-------|-------|------|
| **Ink Black** | `#0F0F0F` | Hand-drawn borders, sketchy icons, dark text | Primary outline & contrast |
| **Paper White** | `#FFFFFF` | Backgrounds, negative space | Primary background & container |
| **Curtain Red** | `#E61D2B` | Primary action buttons (Take Photo, Snap, Capture) | Hero accent color |
| **Blueprint Blue** | `#2B59FF` | Secondary actions (Download, Share) | Utility accent color |

#### Surface Color Palette

The surface colors follow a **warm, peachy-pink theme** to create a friendly, retro atmosphere:

| Color Token | Value | Primary Use |
|-------------|-------|-------------|
| `surface` | `#fff8f7` | Main background |
| `surface-dim` | `#f4d2cf` | Dimmed surfaces |
| `surface-bright` | `#fff8f7` | Highlight surfaces |
| `surface-container-lowest` | `#ffffff` | Deepest containers |
| `surface-container-low` | `#fff0ef` | Low-depth containers |
| `surface-container` | `#ffe9e7` | Default containers |
| `surface-container-high` | `#ffe2df` | Raised containers |
| `surface-container-highest` | `#fddbd8` | Floating containers |
| `background` | `#fff8f7` | Page background |

#### Text Color Palette

| Color Token | Value | Primary Use |
|-------------|-------|-------------|
| `on-surface` | `#291715` | Primary text |
| `on-surface-variant` | `#5d3f3d` | Secondary text |
| `inverse-surface` | `#402b29` | Inverse backgrounds |
| `inverse-on-surface` | `#ffedeb` | Inverse text |
| `outline` | `#926e6b` | Borders & dividers |
| `outline-variant` | `#e7bdb9` | Light borders |

#### Primary Action Colors

| Color Token | Value | Context |
|-------------|-------|---------|
| `primary` | `#bd001b` | Primary buttons (default) |
| `on-primary` | `#ffffff` | Text on primary |
| `primary-container` | `#e61d2b` | Primary container |
| `on-primary-container` | `#fffdff` | Text on primary container |
| `inverse-primary` | `#ffb3ad` | Inverse primary |
| `primary-fixed` | `#ffdad7` | Fixed primary (light) |
| `primary-fixed-dim` | `#ffb3ad` | Fixed primary (dimmed) |

#### Secondary & Tertiary Colors

**Secondary (Neutral Gray)**:
- `secondary`: `#5e5e5e` - Main secondary color
- `on-secondary`: `#ffffff` - Text on secondary
- `secondary-container`: `#e2e2e2` - Secondary container
- `on-secondary-container`: `#646464` - Text on secondary container

**Tertiary (Blueprint Blue Variants)**:
- `tertiary`: `#006486` - Main tertiary
- `on-tertiary`: `#ffffff` - Text on tertiary
- `tertiary-container`: `#007ea8` - Tertiary container
- `on-tertiary-container`: `#fdfdff` - Text on tertiary container

#### Error States

| Color Token | Value | Usage |
|-------------|-------|-------|
| `error` | `#ba1a1a` | Error indicators |
| `on-error` | `#ffffff` | Text on error |
| `error-container` | `#ffdad6` | Error container |
| `on-error-container` | `#93000a` | Text on error container |

---

### 2. Typography

Typography follows a **"Typewriter meets Marker"** aesthetic, combining characterful headlines with monospaced body text.

#### Font Families

**Primary Headline Font**: [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque)
- Quirky, characterful, expressive
- Used for page titles and "hero" callouts
- Supports variable weights (600, 700, 800)
- Often displayed italic or with slight rotation (-2° to 2°) for sketchbook vibe

**Body & Label Font**: [Courier Prime](https://fonts.google.com/specimen/Courier+Prime)
- Monospaced typewriter aesthetic
- Evokes vintage photo-strip metadata or typewriter-printed receipts
- Reinforces technical yet retro nature
- Available in regular (400) and bold (700)
- Supports italic variants

#### Typography Scale

| Style Name | Font Family | Size | Weight | Line Height | Letter Spacing | Use Cases |
|------------|------------|------|--------|------------|----------------|-----------| 
| `headline-xl` | Bricolage Grotesque | 48px | 800 | 1.1 | -0.02em | Large hero headlines |
| `headline-lg` | Bricolage Grotesque | 32px | 700 | 1.2 | normal | Section titles, page headers |
| `headline-lg-mobile` | Bricolage Grotesque | 24px | 700 | 1.2 | normal | Mobile headlines |
| `body-md` | Courier Prime | 16px | 400 | 1.5 | normal | Body text, descriptions |
| `label-caps` | Courier Prime | 14px | 700 | 1.0 | normal | Labels, captions |
| `interactive-btn` | Bricolage Grotesque | 18px | 600 | 1.0 | normal | Button text |

#### Typography Usage Guidelines

**Headlines**:
- Use Bricolage Grotesque for all main headings
- Apply tight line-height (1.1-1.2) for bold, editorial look
- Consider subtle italic slant (5-15°) on hero text for playfulness
- Maintain consistent capitalization with design intent (Title Case, ALL CAPS, or lowercase)

**Body & Labels**:
- Use Courier Prime for all metadata, descriptions, and instructional text
- Monospaced nature helps with alignment and retro feel
- Pair with generous line-height (1.5) for readability
- Use bold (700) sparingly for emphasis within body copy

**Interactive Elements**:
- Button text uses Bricolage Grotesque at 18px/600 weight
- Labels and input hints use Courier Prime at 14px/700 weight
- Maintain consistent capitalization across all buttons

---

### 3. Spacing & Layout

The spacing system follows a **base-8 scale** with intentionally generous margins to simulate the whitespace of a physical photo album.

#### Spacing Scale

| Token | Value | Primary Use |
|-------|-------|------------|
| `stack-sm` | 0.5rem (8px) | Minimal spacing between elements |
| `stack-md` | 1rem (16px) | Standard vertical/horizontal spacing |
| `gutter` | 1.5rem (24px) | Column gutters, moderate gaps |
| `margin-page` | 2rem (32px) | Page margins, large spacing |
| `touch-target` | 3rem (48px) | Minimum interactive element size |

#### Layout Systems

**Desktop Layout** (12-column grid):
- Camera Preview: spans 8 columns (main content area)
- Control Panel/Gallery: spans 4 columns (right sidebar)
- Provides natural hierarchy with photo as primary focus
- Generous horizontal gutters (1.5rem) between sections

**Mobile Layout** (single column):
- Camera Preview pinned at top with fixed aspect ratio
- Horizontally scrolling frame gallery below preview
- Stacked controls with full-width buttons
- Touch targets minimum 48px for comfortable interaction
- Generous vertical spacing (2rem) between major sections

**Grid & Alignment**:
- Base unit: 8px
- Prefer divisible by 8 for all measurements
- Generous margins create visual breathing room
- Align with "album page" concept through whitespace

---

### 4. Border Radius & Shape

The shape language is **soft yet imperfect**, avoiding mathematical perfection in favor of hand-drawn character.

#### Border Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 0.125rem (2px) | Minimal rounding |
| `DEFAULT` | 0.25rem (4px) | Standard buttons, inputs |
| `md` | 0.375rem (6px) | Medium containers |
| `lg` | 0.5rem (8px) | Large cards, frames |
| `xl` | 0.75rem (12px) | Extra-large containers |
| `full` | 9999px | Fully rounded (circles, pills) |

#### Shape Guidelines

**Hand-drawn Corners**:
- Prioritize slightly irregular, sketched appearance over mathematical perfection
- Use SVG masks or CSS `border-image` to create asymmetric corner treatments
- Corners should appear drawn with a felt-tip marker, not computer-precise

**Button Shapes**:
- Use `DEFAULT` (0.25rem) border-radius with thick 3px black stroke
- Maintain rectangular form with soft edges
- Never use sharp 90° corners

**Photo Frames**:
- Apply Polaroid-style treatment: wider bottom margin (variable, ~30-40% of width)
- Use sketchy border aesthetic throughout
- Include subtle perspective/skew on frame for 3D effect

**Container Cards**:
- Standard `lg` (0.5rem) rounding for most containers
- Asymmetric corners when possible to enhance hand-drawn feel
- Consistent 2px sketchy border treatment

---

### 5. Shadow & Elevation

This design system **eschews modern drop shadows** in favor of **tonal layers** and **bold outlines**.

#### Depth Techniques

**Stacked Depth**:
- Create hierarchy through overlapping sketchy borders
- Stack containers vertically with offset positioning
- Use 2-4px hard black "shadow" (offset black box) for floating elements
- Double-border technique for modals and floating panels

**Hard Shadows**:
- Use solid black (#0F0F0F) offset 2-4px down and right
- No blur or softness—sharp, defined edges
- Creates "stamped" appearance

**Glassmorphism** (Limited Use):
- Restricted exclusively to camera preview frame overlays
- Use `backdrop-filter: blur(4px)` with low-opacity black tint
- Ensures UI controls remain legible over live video
- Alpha typically 0.08-0.15 for subtle effect

**Border Emphasis**:
- Every interactive surface must feature a hand-drawn SVG border
- Borders should have intentional "wiggle" or slight irregularity
- 2-3px stroke width for consistency
- Use ink-black (#0F0F0F) for all borders

---

## Component Library

### 1. Buttons

Buttons are the primary interactive elements and follow clear visual hierarchy.

#### Primary Button (Hero Action)

**Appearance**:
- Background: Curtain Red (`#E61D2B`)
- Text: Paper White (`#FFFFFF`) using Bricolage Grotesque 18px/600
- Border: 3px solid Ink Black (`#0F0F0F`) with hand-drawn appearance
- Border-radius: 0.25rem
- Padding: 0.75rem 1.5rem (12px 24px)
- Minimum touch target: 3rem (48px) height

**States**:
- **Default**: Solid curtain red with black border
- **Hover**: Subtle "jiggle" animation (±1-2px rotation), slight scale increase (1.02x)
- **Active/Pressed**: Darker shade or hard shadow offset increases (3-4px)
- **Disabled**: 50% opacity with greyed text

**Typography**:
- Font: Bricolage Grotesque
- Weight: 600
- Size: 18px
- Transform: UPPERCASE or Title Case (consistent with design intent)

**Interaction Pattern**: 
```
Primary buttons trigger immediate actions (Snap, Edit & Save, Download, Apply)
```

**Examples from UI**:
- "SNAP" button in camera capture
- "Edit & Save" button in photo preview
- "Download High-Res PNG" in export screen
- "Apply" button in edit adjustments

#### Secondary Button

**Appearance**:
- Background: Paper White (`#FFFFFF`)
- Text: Ink Black (`#0F0F0F`) using Bricolage Grotesque 18px/600
- Border: 3px solid Ink Black (`#0F0F0F`) with hand-drawn appearance
- Border-radius: 0.25rem
- Padding: 0.75rem 1.5rem (12px 24px)

**States**:
- **Default**: Solid white with black border
- **Hover**: Background shifts to surface-container-low, scale increases (1.02x)
- **Active**: Harder shadow or increased border weight
- **Disabled**: 50% opacity

**Usage**:
- Secondary actions (Reset, Retake, Download Quick JPG)
- Navigation and utility functions
- Less critical interactions

#### Tertiary Button (Utility/Icon)

**Appearance**:
- Background: Transparent or surface color
- Border: 2-3px sketchy black border (hand-drawn SVG)
- Size: Square or circular, min 48px
- Icon: Material Symbols Outlined in Ink Black

**Examples**:
- Rotate buttons (↻ icons)
- Filter buttons (← → icons)
- Crop buttons (⊞ icons)
- Settings button (⚙ icon)

#### Button Sizing

| Size | Height | Padding | Font Size | Use Case |
|------|--------|---------|-----------|----------|
| Large | 48px+ | 0.75rem 1.5rem | 18px | Primary actions, CTA |
| Medium | 40px | 0.625rem 1.25rem | 16px | Secondary actions |
| Small | 32px | 0.5rem 1rem | 14px | Tertiary, compact layouts |
| Icon | 40-48px | 8px | — | Circular buttons, utilities |

---

### 2. Input Fields & Forms

Input fields maintain the sketchy, hand-drawn aesthetic while ensuring usability.

#### Text Input

**Appearance**:
- Background: Paper White (`#FFFFFF`)
- Border: 2px sketchy hand-drawn border in Ink Black
- Text: Courier Prime 16px/400 in Ink Black
- Padding: 0.75rem (12px)
- Border-radius: 0.25rem

**States**:
- **Default**: Unfocused, outline only
- **Focus**: Thicker border (3px), blueprint blue outline
- **Filled**: Shows entered text in Courier Prime
- **Error**: Red outline with error text below
- **Disabled**: 50% opacity, greyed border

**Label**:
- Position: Above input field
- Font: Courier Prime 14px/700 (UPPERCASE)
- Color: Ink Black
- Spacing: stack-sm (8px) below label

#### Slider Control

**Components**:
- **Track**: Single sketchy line (2px), Ink Black, full width
- **Thumb (Handle)**: Hand-drawn circle or blob shape
  - Size: 20-24px diameter
  - Background: Curtain Red (`#E61D2B`)
  - Border: 2px Ink Black
  - Cursor: grab/grabbing

**Styling**:
- Track has slight curve or irregularity
- Thumb casts subtle hard shadow
- Smooth transition on hover (slight grow)

**Usage Examples**:
- Brightness slider
- Contrast slider  
- Saturation slider
- Generic adjustment sliders

#### Checkbox

**Appearance**:
- Box: Hand-drawn square 20×20px
- Border: 2px Ink Black, sketchy style
- Background: Paper White unchecked, Curtain Red checked
- Border-radius: 2px

**Checked State**:
- Background: Curtain Red (`#E61D2B`)
- Mark: Sketchy X or checkmark in Paper White
- Animated transition (slight rotate, 200ms)

**Label**:
- Font: Courier Prime 16px/400
- Color: Ink Black
- Position: Right of checkbox with 8px spacing

---

### 3. Cards & Containers

Cards form the main content organizing principle throughout the interface.

#### Standard Card

**Appearance**:
- Background: Paper White or surface-container
- Border: 2px hand-drawn SVG border in Ink Black
- Corner radius: 0.5rem (lg)
- Shadow: 2-3px hard black offset shadow
- Padding: 1rem-1.5rem (16-24px)

**Variations**:
- Floating cards may have increased offset (3-4px)
- Cards may have double-border effect for emphasis

#### Polaroid-Style Frame Card

**Appearance**:
- Mimics vintage Polaroid photo cards
- Top border: Standard 8-12px
- Side borders: Standard 8-12px  
- Bottom border: 30-40% wider than top (40-50px for standard photo)
- White background with subtle texture
- Hand-drawn border aesthetic

**Content**:
- Photo centered with margin from top/sides
- Metadata (frame name, date) printed at bottom in Courier Prime
- Optional "taped" corner effect (semi-transparent overlay)

**Nested Elements**:
- Frame overlay graphics positioned absolutely
- Icons, decorations, text overlaid on photo
- All overlay elements within card hierarchy

#### Gallery/Preview Cards

**Grid Layout**:
- 2-4 columns depending on screen size
- Consistent spacing (gutter 1.5rem)
- Each card thumbnail is clickable
- Active selection indicated by thick scribble border or highlight

**Thumbnail Style**:
- Maintain aspect ratio (typically square or 4:3)
- Border: 2px sketchy line
- On hover: Border emphasis or shadow increase
- Selected state: Thick hand-drawn circle/scribble overlay

---

### 4. Navigation Elements

Navigation maintains consistency with hand-drawn aesthetic while ensuring clarity.

#### Header/Navigation Bar

**Layout**:
- Fixed top position on desktop
- Background: Paper White or surface color
- Border-bottom: 3px solid Ink Black
- Height: 64-72px
- Horizontal padding: 2rem

**Logo**:
- Font: Bricolage Grotesque 24-32px/800
- Color: Curtain Red with italic slant
- Hand-drawn underline or wavy decoration

**Navigation Items** (if applicable):
- Font: Courier Prime 14px/700
- Color: Ink Black
- Spacing: 1.5rem-2rem between items
- Underline on active state

#### Back Button

**Appearance**:
- Circular or pill-shaped container
- 40-48px diameter
- Background: Curtain Red
- Icon: ← in Paper White
- Border: 2px solid Ink Black
- Positioned top-left or inline with navigation

#### Bottom Action Bar

**Mobile Layout**:
- Fixed to bottom
- Full-width buttons or button group
- Padding: 1rem all sides
- Border-top: 2px sketchy black line
- Background: surface color

---

### 5. Modals & Overlays

Modals maintain visual hierarchy through border emphasis and overlay techniques.

#### Modal Container

**Appearance**:
- Background: Paper White
- Border: 3px hand-drawn border in Ink Black
- Border-radius: 0.5rem
- Hard shadow: 4px offset (down-right)
- Max-width: 80vw or 600px
- Centered on screen

**Backdrop**:
- Semi-transparent dark overlay (rgba(0,0,0,0.3-0.4))
- Optional blur filter on background content

#### Modal Header

**Components**:
- Title: Bricolage Grotesque 28-32px/700
- Close button: Circular icon button (⊗)
- Border-bottom: 2px Ink Black separator

#### Modal Footer

**Components**:
- Action buttons (typically Primary + Secondary)
- Border-top: 2px Ink Black separator
- Padding: 1rem all sides
- Horizontal button spacing: 1rem

---

### 6. Frames & Gallery Systems

The frame gallery is central to the Photoboother experience.

#### Frame Selection UI

**Visual Hierarchy**:
- **Left Sidebar**: Vertical list of available frame kits
- **Preview Area**: Centered large preview with frame applied
- **Right Panel**: Quick switch gallery with thumbnails

**Frame Kit List**:
- Font: Courier Prime or Bricolage Grotesque
- Selected item: Full-width red background (Curtain Red)
- Non-selected: White background with left border
- Icons: Material Symbols Outlined paired with text
- Hover state: Slightly raised or border emphasis

**Active Frame Indicator**:
- Thick hand-drawn circle or scribble around selection
- Pulse or subtle animation
- Color: Curtain Red or Ink Black

#### Quick Switch Gallery

**Grid Layout**:
- 2×2 or 3×2 grid of frame thumbnails
- Each thumbnail 120-160px square
- Border: 2px sketchy line
- Thumbnail shows frame with sample photo

**Interaction**:
- Click to preview
- Hover: Slight scale increase or border thickening
- Selected: Thick red border or overlay badge

---

### 7. Adjustment Controls

Edit panel with sliders and filter options.

#### Adjustment Panel Layout

**Structure**:
- Card container with "Adjustments" title
- Vertical stack of controls (stack-md spacing)
- Title: Bricolage Grotesque 20px/700
- Dividing line: 2px Ink Black

**Individual Adjustment**:
- Label: Courier Prime 14px/700 (e.g., "Brightness", "Contrast")
- Icon: Material Symbol paired with label
- Slider control below label
- Value display: Courier Prime 12px/400 (numeric value)

**Control Spacing**:
- Label to slider: stack-sm (8px)
- Slider to next control: stack-md (16px)

#### Filter Grid

**Layout**:
- 4-column grid of circular or square buttons
- Each 48-56px square
- Icon: Material Symbols Outlined or custom SVG
- Label below icon: Courier Prime 12px

**Filter Options** (example):
- Filters (clover/pattern icon)
- Crop (crop icon)
- Adjust (sliders icon)
- Vignette (circle/gradient icon)

---

### 8. Feedback Elements

Toasts, alerts, and status messages.

#### Toast Notification

**Appearance**:
- Background: surface-container-highest or soft yellow/white
- Border: 2px sketchy Ink Black
- Border-radius: 0.25rem
- Padding: 1rem
- Min-width: 300px, max-width: 500px
- Fixed position: bottom-right with 1rem margin

**Content**:
- Font: Courier Prime 14px/400
- Icon: Left-aligned Material Symbol (optional)
- Message: Clear, concise text
- Duration: 3-5 seconds auto-dismiss

**States**:
- Success: Paper White background with checkmark icon
- Error: Error-container background with error icon
- Info: surface-container background with info icon
- Warning: Warm background with caution icon

#### Status Messages

**Inline Status**:
- Font: Courier Prime 12px/400
- Color: Matches intent (success=green, error=red, info=blue)
- Icon: Optional left alignment
- Padding: 0.5rem
- Border: 1px border matching color

---

## Usage Patterns & Interaction Design

### 1. Primary User Flow

**Capture Phase**:
1. User sees camera preview with selected frame
2. Frame gallery on left shows available options
3. "SNAP" button (primary, red, large) is most prominent
4. Clear hierarchy guides to photo capture action

**Edit Phase**:
1. Preview shows captured photo with applied frame
2. Adjustments panel on right shows sliders
3. Frame quick-switch gallery for frame experimentation
4. "Edit & Save" primary button to confirm

**Export Phase**:
1. Final photo displayed in Polaroid-style card
2. Multiple export options (PNG, JPG, print, share)
3. Share options in separate card ("SHARE THE VIBE")
4. Action buttons prominently placed

### 2. Visual Feedback

**Hover States**:
- Buttons: Subtle scale (1.02x) and jiggle animation
- Cards: Border emphasis or hard shadow offset increase
- Sliders: Thumb grows slightly, cursor changes to grab

**Active/Pressed States**:
- Increased shadow offset (3-4px)
- Button color darkens or background changes
- Selection indicators (circles, scribbles, badges)

**Disabled States**:
- 50% opacity across element
- Cursor changes to not-allowed
- Text color becomes outline-variant

### 3. Transitions & Animation

**Timing**:
- Standard transitions: 200-300ms
- Hover effects: Immediate to 200ms
- Modal entrance: 300-400ms (fade + slide)

**Easing**:
- Interactive: `cubic-bezier(0.4, 0, 0.2, 1)` (material standard)
- Playful elements: Slight bounce or overshoot

**Specifics**:
- Button jiggle: Subtle rotation (±2-3°) on hover
- Slider thumb: Smooth grow and shadow change
- Frame selection: Pulse or float animation
- Modal: Fade background with scale+fade on card

---

## Responsive Design Breakpoints

### Desktop (1024px+)
- 12-column grid layout
- Camera preview: 8 columns, right sidebar: 4 columns
- Generous spacing and margins
- Horizontal navigation

### Tablet (768px - 1023px)
- 8-column grid layout
- Adjusted column spans (camera: 6/8)
- Stack controls vertically on narrow layouts
- Touch targets minimum 48px

### Mobile (< 768px)
- Single column, full-width layout
- Camera preview pinned at top
- Horizontal frame gallery scroll
- Full-width buttons with vertical stacking
- Generous vertical spacing (2rem between sections)
- 48px+ touch targets mandatory

### Touch Optimization
- All interactive elements minimum 48px
- Adequate spacing between touch targets (8px minimum)
- Double-tap friendly (avoid conflicts)
- Swipe gestures for gallery navigation

---

## Accessibility Considerations

### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Ink Black (#0F0F0F) on Paper White (#FFFFFF): 21:1 ✓
- Curtain Red on white backgrounds verified
- Secondary text uses outline-variant for sufficient contrast

### Focus Indicators
- Focus states use contrasting border color (blueprint blue)
- Focus ring thickness: 2-3px
- Keyboard navigation fully supported
- Tab order follows logical flow

### Typography Accessibility
- Minimum font size: 14px body text
- Line-height minimum 1.5 for body
- Courier Prime monospace for technical clarity
- No critical information conveyed by color alone

### Interactive Elements
- All buttons have text labels (not icon-only)
- Form labels properly associated with inputs
- Error messages clearly displayed with remediation guidance
- Skip navigation links for keyboard users

### Semantic HTML
- Proper heading hierarchy (h1, h2, h3)
- Semantic button and link elements
- Form elements with labels and fieldsets
- ARIA attributes where needed

---

## Brand Voice in Design

### Playfulness in Visual Design
- Asymmetric borders ("wiggle" effect)
- Slight italic slant on headlines
- Color combinations that feel energetic (red + pink + blue)
- Animated hover states with subtle joy

### Retro Nostalgia
- Polaroid frame treatments
- Monospaced typewriter fonts
- Sketch-like hand-drawn borders
- Vintage color palette (warm pinks, muted tones)

### Accessibility of Creativity
- Large, clear primary action (SNAP button)
- Intuitive frame gallery navigation
- Visible adjustment sliders with real-time preview
- Encouraging language ("Strike a pose!", "It's a wrap!")

---

## Implementation Guidelines

### CSS Architecture
- Tailwind CSS with custom configuration
- Design tokens defined in `tailwind.config.js`
- Utility classes for consistent spacing and sizing
- SVG-based hand-drawn borders using CSS masks

### Component Development
- Each component maintains sketchy border aesthetic
- Consistent padding within components (stack-md default)
- Hover/active states implement specified animations
- Responsive classes for mobile/tablet/desktop

### Color Usage
- Use CSS custom properties for theme colors
- Maintain sufficient contrast ratios
- Test color combinations for accessibility
- Avoid color-only differentiation

### Typography Implementation
- Load Bricolage Grotesque and Courier Prime from Google Fonts
- Set font-smoothing for crisp rendering
- Adjust letter-spacing for large headlines
- Use consistent font-weight within style tier

### Border & Shadow
- Hand-drawn SVG borders for primary containers
- CSS border-image for asymmetric effects where needed
- Hard shadow using `box-shadow: 2px 2px 0 #0F0F0F`
- Sketchy effect achieved through SVG filter or slight path irregularity

---

## Design Tokens Quick Reference

```yaml
colors:
  primary: curtain-red (#E61D2B)
  secondary: blueprint-blue (#2B59FF)
  neutral-dark: ink-black (#0F0F0F)
  neutral-light: paper-white (#FFFFFF)
  background: surface (#fff8f7)
  text-primary: on-surface (#291715)
  text-secondary: on-surface-variant (#5d3f3d)
  border: ink-black (#0F0F0F)
  border-light: outline-variant (#e7bdb9)

typography:
  headline: Bricolage Grotesque (800, 700, 600)
  body: Courier Prime (400, 700)
  
spacing:
  xs: 8px (stack-sm)
  sm: 16px (stack-md)
  md: 24px (gutter)
  lg: 32px (margin-page)
  touch: 48px (touch-target)

radius:
  sm: 2px
  md: 4px
  lg: 8px
  xl: 12px
  full: 9999px

shadows:
  hard: 2-4px offset in ink-black
  floating: 4px offset
```

---

## Future Enhancements

- Dark mode variant with adjusted color palette
- Animation library documenting all micro-interactions
- Custom SVG border generator for consistent sketchy effect
- Frame customization tool for user-created frames
- Additional color themes (retro green, vintage blue, etc.)

---

**Version**: 1.0  
**Last Updated**: 2024  
**Design System**: Sketch-Retro Brutalism Hybrid  
**Status**: Active & Maintained
