# PHOTOBOOTH APPLICATION - COMPREHENSIVE ANALYSIS & CORRECTION PLAN

**Analysis Date:** August 10, 2026  
**Current Status:** Pre-Style Guide Implementation  
**Priority Level:** CRITICAL - Full Restructure Needed

---

## EXECUTIVE SUMMARY

The current Photobooth application has a **functional foundation but significant architectural and flow issues** that prevent it from meeting the "Sketch-Retro Brutalism" design vision and the PRD requirements. This document outlines:

1. **Critical Issues** - Flow, architecture, and feature gaps
2. **Missing Features** - Essential functionality not implemented
3. **Style Guide Violations** - Inconsistencies with the visual design system
4. **System Architecture Problems** - Backend/Frontend misalignment
5. **Detailed Correction Plan** - Step-by-step fixes with code examples

---

## 1. CRITICAL FLOW ISSUES

### 1.1 Missing "Frame Selection Before Capture"

**Current Flow:**
```
Home → Camera Preview → SNAP → Show Photo → Select Frame → Edit
```

**Problems:**
- Users must take photo FIRST, then choose a frame
- Per PRD: "user can change frame on photo without re-shooting"
- This implies frames should be selectable BEFORE shooting
- Current UX is one-directional, not experimental

**Correct Flow:**
```
Home → Frame Selection (Sidebar) → Camera Preview (with frame live preview) 
→ SNAP → Edit Adjustments → Re-frame Option → Download/Export
```

---

### 1.2 Missing "Re-frame Without Retake" Feature

**Current State:**
- Users can switch frames in "Quick Switch" panel
- BUT this is ONLY after photo is taken
- No way to retake WITH a different frame without full reset

**Expected Per PRD:**
- User takes photo with Frame A
- User wants Frame B without retaking
- Should be able to click "Switch Frame" and frame changes instantly
- Should be able to THEN retake with Frame B if desired

**Fix Required:**
```
Add new state: "allowRetakeWithCurrentFrame" 
When frame is switched, provide option:
- [ ] Keep This Photo + Apply New Frame
- [ ] Take New Photo With This Frame
- [ ] Retake With Current Frame
```

---

### 1.3 Unclear "Edit vs Export" States

**Current Issues:**
- After taking photo, user sees "Edit Foto" panel
- Then download button
- No clear separation between:
  - "Editing adjustments" (brightness, contrast, saturation)
  - "Choosing export options" (PNG, JPG, Print, Share)

**Current UI Problem:**
- Download goes straight to single format
- No option to choose PNG vs JPG vs other formats
- No print option
- No social media share integration
- No "export/share" flow shown to user

**Per PRD, Missing Export Options:**
- [ ] Download High-Res PNG
- [ ] Download Quick JPG
- [ ] Print Strip (Polaroid-style)
- [ ] Share to Social (Instagram, Twitter, WhatsApp)
- [ ] QR Code for phone transfer
- [ ] Email/Cloud save

---

### 1.4 Missing Multi-Step User Journey

**Expected User Flow (Per PRD & Visual Guide):**

**Step 1: FRAME SELECTION**
- User enters booth
- Sees frame gallery (desktop: sidebar, mobile: carousel)
- Selects desired frame
- Preview shows selected frame

**Step 2: PHOTO CAPTURE**
- Camera preview shows live frame overlay
- "Strike a pose!" prompt visible
- Large red "SNAP" button prominent
- Optional: Countdown timer (3-2-1)

**Step 3: PHOTO PREVIEW**
- Captured photo shown with frame applied
- Frame name/metadata visible
- Quick switch frame gallery available
- Options: Edit, Retake, Proceed

**Step 4: EDITING**
- Sliders for brightness, contrast, saturation
- Filter options (if implemented)
- Crop/rotate options (if implemented)
- Real-time preview
- "Reset" and "Apply" buttons

**Step 5: RE-FRAME OPTION** ⚠️ MISSING
- User can switch to different frame
- Photo remains captured
- Option to retake with new frame or keep photo

**Step 6: EXPORT/SHARE** ⚠️ INCOMPLETE
- Multiple export formats
- Social media sharing
- Print options
- Confirmation/receipt screen showing selected options

**Step 7: COMPLETION** ⚠️ MISSING
- Show metadata (timestamp, frame name, size)
- Offer "Try Again" button
- Return to frame selection

---

## 2. MISSING FEATURES

### 2.1 Frame Kits System

**Current State:**
- Backend fetches frames from `/api/frames`
- Frontend displays only 2-column grid in "Quick Switch"
- No category system

**Missing:**
- [ ] Frame categorization (Classic, Vintage, Doodle, Neon, Zine)
- [ ] Frame details (name, description, category)
- [ ] Frame preview before use
- [ ] Category filtering
- [ ] "See All Frames" modal/page
- [ ] Frame search functionality
- [ ] Frame favorites/bookmarks
- [ ] Premium frame indicators

**Database Schema Issue:**
- Current: `id`, `name`, `category`, `imageUrl`, `cssPlaceholder`
- Missing: `description`, `isPremium`, `frameSize`, `aspectRatio`, `createdAt`

---

### 2.2 Export/Download Options

**Current Implementation:**
```javascript
// Single PNG download via base64
const dataUrl = await compositeAndDownload(...)
```

**Missing Export Formats:**
- [ ] High-Res PNG (max quality)
- [ ] Quick JPG (compressed for social)
- [ ] WebP (modern format)
- [ ] SVG export (vector frames)
- [ ] Polaroid-strip PDF (4-in-1 format)
- [ ] Print-ready format (300 DPI)

**Missing Export Features:**
- [ ] Format selection dialog
- [ ] Quality/compression slider
- [ ] Size presets (Instagram, Twitter, WhatsApp, Email)
- [ ] Watermark options
- [ ] File naming/metadata

---

### 2.3 Social Media Sharing

**Current State:**
- Buttons exist in sidebar but non-functional
- No integration with share APIs

**Missing:**
- [ ] Instagram share (deep link with image)
- [ ] Twitter/X share
- [ ] WhatsApp share
- [ ] Facebook share
- [ ] LinkedIn share
- [ ] QR code generation (for phone transfer)
- [ ] Email share link
- [ ] Cloud storage (Google Drive, Dropbox)

---

### 2.4 Print Functionality

**Current State:**
- Not implemented

**Missing:**
- [ ] Print dialog
- [ ] Polaroid-strip format (4 photos vertical)
- [ ] Full-page format
- [ ] Custom size options
- [ ] Print preview
- [ ] Color profile management

---

### 2.5 Photo History/Gallery

**Current State:**
- No photo history system
- Backend has uploads folder but no retrieval endpoint
- No gallery view

**Missing:**
- [ ] List all user photos (requires auth)
- [ ] Gallery grid view
- [ ] Photo details (timestamp, frame, size)
- [ ] Re-download existing photos
- [ ] Delete functionality
- [ ] Favorites
- [ ] Photo sharing from history

---

### 2.6 User Authentication

**Current State:**
- No authentication system
- Photos saved to backend but no user tracking
- All photos anonymous

**Missing:**
- [ ] User sign-up/login
- [ ] User profile
- [ ] Photo history per user
- [ ] Saved preferences
- [ ] Account settings
- [ ] Privacy controls

---

### 2.7 Settings/Configuration

**Current State:**
- Settings button exists in header but non-functional
- No settings page

**Missing:**
- [ ] Camera selection (if multiple devices)
- [ ] Resolution/quality settings
- [ ] Default frame selection
- [ ] Theme/language settings
- [ ] Sound on/off toggle
- [ ] Countdown timer toggle
- [ ] Accessibility options

---

## 3. STYLE GUIDE VIOLATIONS

### 3.1 Navigation Structure Issues

**Problem:** Desktop & Mobile layouts are **completely different**
- Desktop: Side navigation (left 256px)
- Mobile: Top bar + Bottom navigation
- No consistency in interaction patterns

**Style Guide Says:**
- Navigation should feel "stamped" and hand-drawn
- Consistent touch targets (48px minimum)
- Clear visual hierarchy

**Current Violations:**
```
Desktop Header: ✓ Exists, but incomplete
Mobile Header: ✓ Has branding, but confusing icon labels (hidden text)
Desktop Sidebar: ✓ Good structure, but frame categories hardcoded
Mobile Bottom Nav: ✗ Icon-only buttons (no labels visible)
Frame Selection: ✗ Not prominently placed on mobile
Camera Preview: ✗ Wrong aspect ratio handling
```

**Fix:**
- Make frame selection FIRST screen on mobile
- Ensure consistent navigation on all devices
- Show proper labels for bottom nav
- Add camera on bottom nav only after frames selected

---

### 3.2 Button Styling Inconsistencies

**Problem:** Multiple button implementations with inconsistent styles

**Current:**
- CameraPreview uses custom `hover-wiggle jiggle-active` classes
- EditPanel uses shadcn button component
- FrameSelector uses inline click handlers
- Download button has custom styling

**Style Guide Says:**
- Primary buttons: Red background, white text, 3px black border
- Secondary buttons: White background, black text, 3px black border
- All buttons should have sketch-border and hard-shadow
- Hover: jiggle animation (±2-3° rotation)
- Active: Increased shadow offset

**Current Violations:**
```jsx
// WRONG - Mixing shadcn with custom classes
<Button onClick={...}>Text</Button>

// WRONG - No sketch-border, using rounded-full
className="bg-curtain-red text-paper-white rounded-full border-[3px] border-ink-black"

// WRONG - Generic hover behavior
className="hover:bg-surface-container-low"
```

**Fix:**
```jsx
// RIGHT - Consistent primary button
<button className="
  bg-curtain-red text-paper-white 
  font-interactive-btn text-interactive-btn
  px-6 py-4
  border-3 border-ink-black
  sketch-border
  hard-shadow
  hover:jiggle-active
  active:hard-shadow-lg
  transition-all
  disabled:opacity-50
">
  {children}
</button>
```

---

### 3.3 Card & Container Issues

**Problem:** Inconsistent border styles and depths

**Current:**
- Some cards use `sketch-border` class
- Some use `border-2 border-ink-black`
- Tape corners implemented but inconsistently
- No clear elevation system

**Style Guide Says:**
- Every interactive surface must have hand-drawn SVG border (2-3px)
- Stacked depth with overlapping borders
- Hard shadows (2-4px offset)
- Polaroid-style frames with wider bottom

**Current Violations:**
- FrameSelector: Uses `sketch-border-thin` (what does thin mean?)
- EditPanel: No explicit border styling shown
- CameraPreview: Mixing `sketchy-border` and `sketchy-border-alt`

**Fix:**
- Define clear CSS classes:
  ```css
  .sketch-border-2px { /* 2px hand-drawn black border */ }
  .sketch-border-3px { /* 3px hand-drawn black border */ }
  .hard-shadow-sm { /* 2px offset */ }
  .hard-shadow { /* 3px offset */ }
  .hard-shadow-lg { /* 4px offset */ }
  ```

---

### 3.4 Typography Inconsistencies

**Problem:** Not all headings use Bricolage Grotesque; Body text not always Courier Prime

**Current Usage:**
- Header logo: ✓ Red italic (good)
- Section titles: Sometimes Bricolage, sometimes default
- Labels: Mix of styles
- Body text: Mostly Courier Prime but not forced

**Style Guide Says:**
- ALL headlines: Bricolage Grotesque (800, 700, or 600)
- ALL body/labels: Courier Prime (400 or 700)
- Font family enforcement critical for brand

**Current Violations:**
```jsx
// WRONG - No font family specified
<h2 className="text-headline-lg">Title</h2>

// WRONG - Using default sans-serif
<p>Some text</p>

// WRONG - Mixing font weights inappropriately
<label className="font-bold">Label</label>
```

**Fix:**
```jsx
// RIGHT - Explicit font class
<h2 className="font-headline-lg text-headline-lg text-ink-black">Title</h2>

// RIGHT - Always use Courier Prime for body
<p className="font-body-md text-body-md text-on-surface">Text</p>

// RIGHT - Label with correct weight
<label className="font-label-caps text-label-caps text-ink-black">Label</label>
```

---

### 3.5 Color Palette Not Fully Utilized

**Problem:** Not using all defined colors strategically

**Current:**
- Primary (Red): ✓ Used for CTA buttons
- Secondary (Gray): ✗ Rarely used
- Tertiary (Blue): ✗ Not used (supposed to be for downloads)
- Surface colors: Partially used
- Outline colors: Not explicitly used

**Style Guide Says:**
- Curtain Red: PRIMARY actions (Take Photo, Capture, Snap)
- Blueprint Blue: SECONDARY/utility actions (Download, Share, Upload)
- Gray: Form inputs, metadata, secondary text
- Pink/peachy: Surface/background layers

**Current Violations:**
- "Download Foto" button is RED (should be BLUE for utility action)
- Edit panel sliders: No clear color coding
- Share buttons: Not color-coded by platform

**Fix:**
```jsx
// Primary action - Capture photo
<button className="bg-curtain-red">SNAP</button>

// Secondary action - Download
<button className="bg-blueprint-blue">Download</button>

// Utility button - Edit/Reset
<button className="bg-paper-white border-ink-black">Reset</button>
```

---

## 4. SYSTEM ARCHITECTURE PROBLEMS

### 4.1 State Management Issues

**Current Problem:**
- Using Zustand for global state
- But state is NOT persistent
- When page refreshes, all state lost
- No local storage fallback

**Issues:**
- User edits adjustments → Refreshes → All edits lost
- User selects frame → Refreshes → Frame reset to first
- No undo/redo functionality
- No state snapshots

**Fix:**
```typescript
// Add persistence to Zustand store
const useAppStore = create<AppState>(
  persist(
    (set) => ({
      // ... state definitions
    }),
    {
      name: "photoboother-storage",
      storage: localStorage, // Persist to localStorage
      partialize: (state) => ({
        // Only persist certain values
        selectedFrameId: state.selectedFrameId,
        brightness: state.brightness,
        contrast: state.contrast,
        saturation: state.saturation,
      }),
    }
  )
);
```

---

### 4.2 Backend API Structure Issues

**Current Routes:**
```
GET  /api/frames          - Get all frames
POST /api/photos          - Save composite photo
```

**Missing Endpoints:**

```
// Frames
GET    /api/frames                    - List all frames ✓
GET    /api/frames/:id                - Get frame details ✗
GET    /api/frames/category/:cat      - Filter by category ✗
GET    /api/frames/search?q=term      - Search frames ✗
POST   /api/frames (admin only)       - Create frame ✗
PUT    /api/frames/:id (admin only)   - Update frame ✗
DELETE /api/frames/:id (admin only)   - Delete frame ✗

// Photos
POST   /api/photos                    - Save photo ✓
GET    /api/photos                    - List user photos ✗
GET    /api/photos/:id                - Get photo details ✗
DELETE /api/photos/:id                - Delete photo ✗
GET    /api/photos/:id/download       - Download with format options ✗

// Export/Share
POST   /api/export/png                - Export as PNG ✗
POST   /api/export/jpg                - Export as JPG ✗
POST   /api/export/pdf                - Export as PDF ✗
POST   /api/export/print              - Print format ✗
POST   /api/share/social              - Generate share links ✗

// Users
POST   /api/auth/signup               - Register ✗
POST   /api/auth/login                - Login ✗
POST   /api/auth/logout               - Logout ✗
GET    /api/users/profile             - Get profile ✗
GET    /api/users/:id/photos          - Get user's photos ✗

// Admin
GET    /api/admin/stats               - App statistics ✗
GET    /api/admin/photos              - All photos ✗
```

---

### 4.3 Frontend Component Organization

**Current Structure:**
```
src/
├── app/
│   ├── layout.tsx          (Navigation + Layout)
│   └── page.tsx            (Main app logic)
├── components/
│   ├── camera/
│   │   └── CameraPreview.tsx
│   ├── frame/
│   │   └── FrameSelector.tsx
│   ├── editor/
│   │   └── EditPanel.tsx
│   └── ui/                 (ShadCN components)
├── hooks/
│   └── useCamera.ts
├── lib/
│   ├── compositor.ts
│   └── utils.ts
└── store/
    └── useAppStore.ts
```

**Problems:**
- Everything goes through `page.tsx` - **no proper routing**
- No dedicated pages for gallery, export, settings
- No modal/drawer components for workflows
- UI component library incomplete

**Fix: Proper Next.js App Router Structure:**
```
src/
├── app/
│   ├── layout.tsx                 (Root layout + nav)
│   ├── page.tsx                   (Home - frame selection + capture)
│   ├── gallery/
│   │   └── page.tsx               (Photo history)
│   ├── export/
│   │   └── [photoId]/
│   │       └── page.tsx           (Export/share screen)
│   ├── settings/
│   │   └── page.tsx               (User settings)
│   └── not-found.tsx              (404 page)
├── components/
│   ├── shared/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── Footer.tsx
│   ├── booth/
│   │   ├── FrameSelector.tsx
│   │   ├── CameraPreview.tsx
│   │   ├── PhotoPreview.tsx
│   │   └── EditPanel.tsx
│   ├── export/
│   │   ├── ExportDialog.tsx
│   │   ├── FormatSelector.tsx
│   │   └── SocialShare.tsx
│   ├── gallery/
│   │   ├── PhotoGrid.tsx
│   │   ├── PhotoCard.tsx
│   │   └── FilterBar.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Slider.tsx
│       └── ... (shadcn components)
├── hooks/
│   ├── useCamera.ts
│   ├── useDownload.ts
│   └── useShare.ts
├── lib/
│   ├── compositor.ts
│   ├── download.ts
│   ├── share.ts
│   └── api.ts
├── store/
│   ├── useAppStore.ts
│   ├── usePhotoStore.ts
│   └── useUserStore.ts
└── types/
    └── index.ts
```

---

### 4.4 Camera Hook Issues

**Current State:**
- `useCamera.ts` handles video stream and capture
- Works but missing features

**Missing:**
- [ ] Camera device selection (front/back)
- [ ] Resolution options
- [ ] Flash simulation
- [ ] Countdown timer
- [ ] Mirror/flip option
- [ ] Screenshot quality settings
- [ ] Error handling for permission denial

---

### 4.5 Image Compositor Issues

**Current:**
- `compositor.ts` composites photo with frame
- Single download format

**Missing:**
- [ ] Multiple export formats
- [ ] Quality/compression settings
- [ ] Metadata embedding (EXIF)
- [ ] Watermark support
- [ ] PDF generation
- [ ] Print layout (4-up strip)

---

## 5. UX/UI FLOW ISSUES

### 5.1 Mobile Layout Problems

**Current Mobile Flow:**
```
Top Bar (logo + icons) → Camera → Bottom Nav (icons only)
```

**Problems:**
- Frame selection not visible on mobile
- Must scroll/tap to see frames
- Bottom nav icons have hidden labels (confusing)
- Camera takes full height, frames hidden

**Correct Mobile Flow:**
```
1. FRAME SELECTION SCREEN
   - Full-width frame gallery carousel
   - Tap to select frame
   - Live preview of selected frame

2. CAMERA SCREEN
   - Camera preview with frame overlay
   - "SNAP" button below
   - Back button to frames

3. PHOTO PREVIEW
   - Full-width photo with frame
   - Adjustment sliders below (scrollable)
   - "Retake" / "Edit & Save" buttons

4. EXPORT SCREEN
   - Export format options
   - Social share buttons
   - Download button
```

---

### 5.2 Desktop Layout Problems

**Current:**
- Sidebar frame categories hardcoded
- No actual frame filtering by category
- Frame gallery only in right panel

**Correct Desktop Flow:**
```
Sidebar (Frame Categories) → Main Area (Camera) → Right Panel (Quick Switch + Edit)
```

---

### 5.3 Missing Feedback & Error Handling

**Current:**
- No loading states
- No error messages
- No success confirmations
- No permission error handling

**Missing:**
- [ ] Loading spinner during frame fetch
- [ ] Toast notifications for actions
- [ ] Error messages for failed uploads
- [ ] Camera permission denial modal
- [ ] Network error handling
- [ ] File size warnings
- [ ] Confirmation dialogs for destructive actions

---

### 5.4 Accessibility Issues

**Current:**
- Buttons lack proper ARIA labels
- Icon-only buttons without text
- No keyboard navigation apparent
- Focus states unclear
- No loading indicators for screen readers

**Missing:**
- [ ] ARIA labels on all buttons
- [ ] Semantic HTML (proper headings, etc.)
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus indicators
- [ ] Alt text on images
- [ ] Loading indicator announcements
- [ ] Error message associations with fields

---

## 6. MISSING CRITICAL FLOWS

### 6.1 "Export & Share" Workflow - COMPLETELY MISSING

**What should happen:**

1. User finishes photo with frame and edits
2. Clicks "Export / Share" button
3. Modal shows export options:
   - [ ] Download High-Res PNG
   - [ ] Download Quick JPG
   - [ ] Share to Instagram
   - [ ] Share to Twitter
   - [ ] Share to WhatsApp
   - [ ] Get QR Code
   - [ ] Email Link

4. User selects option (can select multiple)
5. System generates/sends files
6. Confirmation screen shows results
7. Option to return to booth or download

**Current State:**
- Single "Download Foto" button
- Only downloads PNG to default location
- No format choice
- No export options shown

---

### 6.2 "Photo History/Gallery" - COMPLETELY MISSING

**What should happen:**

1. User clicks "Gallery" button
2. Shows grid of all their photos
3. Each photo shows thumbnail with frame name, timestamp
4. Tap photo to see details
5. Options: Download again, Delete, Share, Print

**Current State:**
- Gallery button in bottom nav exists
- No implementation behind it
- Backend saves files but no retrieval
- No user tracking

---

### 6.3 "Settings" Workflow - STUB ONLY

**What should happen:**

1. User clicks Settings button
2. Options for:
   - Camera selection / device
   - Default frame
   - Export quality
   - Sound on/off
   - Language
   - Theme (light/dark)
   - Accessibility options

**Current State:**
- Settings button exists
- No settings page/modal
- No settings functionality

---

### 6.4 "Retake / Re-frame" Workflow - PARTIALLY BROKEN

**What should happen:**

1. Photo taken with Frame A
2. User clicks "Switch Frame" → Frame changes to B
3. Options appear:
   - Keep Photo + Apply New Frame B
   - Retake Photo With Frame B
   - Keep Editing With Frame B

4. If "Retake", go back to camera with Frame B selected
5. If "Keep", update preview with new frame

**Current State:**
- "Retake" button goes back to camera
- Frame selection available
- But no explicit "Keep this photo, change frame" option
- Confusing UX

---

## 7. DETAILED CORRECTION PLAN

### PHASE 1: ARCHITECTURE & STATE MANAGEMENT (Week 1)

#### Task 1.1: Restructure Component Architecture
**File:** `src/components/`

```
Create new structure:
✓ booth/
  - FrameSelection.tsx (new - dedicated frame chooser)
  - CameraPreview.tsx (refactored)
  - PhotoPreview.tsx (new - after capture, before export)
  - EditPanel.tsx (already exists)
  
✓ export/
  - ExportDialog.tsx (new - format selection)
  - SocialShare.tsx (new - social sharing UI)
  - PrintPreview.tsx (new - print layout)

✓ gallery/
  - PhotoGrid.tsx (new)
  - PhotoCard.tsx (new)
  - PhotoDetails.tsx (new)

✓ shared/
  - Header.tsx (refactored from layout)
  - Navigation.tsx (refactored from layout)
  - Button.tsx (standardized)
  - Modal.tsx (new - for dialogs)
  - Toast.tsx (new - notifications)
  - Spinner.tsx (new - loading)
```

#### Task 1.2: Create Proper Page Structure
**File:** `src/app/`

```
Update structure:
✓ (layout).tsx - Global layout
✓ page.tsx - Main booth page (frame + camera)
✓ gallery/page.tsx - Photo history
✓ export/[photoId]/page.tsx - Export screen
✓ settings/page.tsx - Settings
✓ not-found.tsx - 404
```

#### Task 1.3: Enhance Zustand Store with Persistence
**File:** `src/store/useAppStore.ts`

```typescript
// Add persistence plugin
import { persist } from 'zustand/middleware';

// Separate concerns into multiple stores
- useAppStore (global app state)
- usePhotoStore (captured photo + exports)
- useEditorStore (brightness, contrast, etc.)
- useUIStore (modals, loading, errors)
- useUserStore (user profile, history)
```

#### Task 1.4: Add Error Handling & Loading States
**File:** `src/store/useUIStore.ts` (new)

```typescript
interface UIState {
  isLoading: boolean;
  error: string | null;
  toast: ToastMessage | null;
  openModals: string[];
  // methods...
}
```

---

### PHASE 2: BACKEND ENHANCEMENT (Week 1-2)

#### Task 2.1: Create Missing API Endpoints
**File:** `backend/src/routes/`

```
Create new routes:
✓ /api/frames/:id - Get single frame
✓ /api/frames/category/:cat - Filter by category
✓ /api/photos/:id - Get photo details
✓ /api/photos/:id/download - Download with format
✓ /api/export/* - Export format endpoints
✓ /api/share/* - Social share endpoints
```

#### Task 2.2: Add Authentication System
**File:** `backend/src/auth/`

```
Create:
✓ authController.js - signup/login/logout
✓ authRoutes.js - /api/auth/* routes
✓ authMiddleware.js - JWT verification
✓ User model in Prisma
```

#### Task 2.3: Extend Frame Database
**File:** `backend/prisma/schema.prisma`

```prisma
model Frame {
  id String @id @default(cuid())
  name String
  category String
  description String?
  imageUrl String
  cssPlaceholder String
  isPremium Boolean @default(false)
  frameSize String // e.g., "1080x1080"
  aspectRatio String // e.g., "1:1"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Photo {
  id String @id @default(cuid())
  userId String
  frameId String
  compositeImageUrl String
  brightness Int @default(100)
  contrast Int @default(100)
  saturation Int @default(100)
  metadata Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

### PHASE 3: UI/UX IMPLEMENTATION (Week 2-3)

#### Task 3.1: Create Frame Selection Screen
**File:** `src/components/booth/FrameSelection.tsx`

```
Features:
✓ Category tabs/buttons
✓ Frame gallery grid/carousel (responsive)
✓ Live preview of selected frame
✓ Search box
✓ Filter buttons (premium, recent, popular)
✓ "See all frames" link
```

#### Task 3.2: Implement Proper Export Workflow
**File:** `src/components/export/ExportDialog.tsx`

```
Flow:
1. Format Selection
   - High-Res PNG
   - Quick JPG
   - Polaroid PDF (4-up)
   - Print Preview

2. Quality Options
   - Resolution slider
   - Compression slider
   - Size presets (Instagram, Twitter, etc.)

3. Action Selection
   - Download
   - Share to Social
   - Print
   - Email
   - QR Code

4. Confirmation
   - Shows what will happen
   - Initiates action
   - Shows success/error
```

#### Task 3.3: Implement Photo Gallery
**File:** `src/components/gallery/PhotoGrid.tsx`

```
Features:
✓ Grid layout (auto-responsive)
✓ Photo thumbnails
✓ Frame name badge
✓ Timestamp
✓ Click to expand details
✓ Delete button
✓ Re-download button
✓ Share from history
✓ Filter by frame
✓ Sort by date/recent
```

#### Task 3.4: Implement Settings Page
**File:** `src/app/settings/page.tsx`

```
Settings:
✓ Camera device selection
✓ Default frame selection
✓ Export quality preference
✓ Sound on/off
✓ Language selection
✓ Theme (light/dark)
✓ Accessibility options
✓ Clear cache button
```

---

### PHASE 4: STYLE GUIDE IMPLEMENTATION (Week 3-4)

#### Task 4.1: Create Consistent CSS Classes
**File:** `src/app/globals.css`

```css
/* Border utilities */
.sketch-border-2 { /* 2px hand-drawn border */ }
.sketch-border-3 { /* 3px hand-drawn border */ }

/* Shadow utilities */
.hard-shadow { /* 3px offset */ }
.hard-shadow-lg { /* 4px offset */ }

/* Typography utilities */
.headline-xl { @apply font-headline-xl text-headline-xl; }
.headline-lg { @apply font-headline-lg text-headline-lg; }
.body-md { @apply font-body-md text-body-md; }
.label-caps { @apply font-label-caps text-label-caps; }

/* Button utilities */
.btn-primary { /* Primary button styles */ }
.btn-secondary { /* Secondary button styles */ }
.btn-tertiary { /* Tertiary button styles */ }

/* Animation utilities */
.jiggle { /* ±2-3° rotation */ }
.wiggle { /* Slight horizontal shake */ }
```

#### Task 4.2: Standardize All Buttons
**File:** `src/components/ui/Button.tsx` (complete rewrite)

```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export function Button({ variant, size, ...props }: ButtonProps) {
  // Implement all styles based on style guide
  // Apply sketch-border, hard-shadow, proper colors
}
```

#### Task 4.3: Standardize Card Components
**File:** `src/components/ui/Card.tsx` (complete rewrite)

```tsx
interface CardProps {
  elevation?: 'sm' | 'md' | 'lg';
  polaroidStyle?: boolean;
  children: React.ReactNode;
}

export function Card({ elevation = 'md', polaroidStyle = false }: CardProps) {
  // Apply consistent sketch-border
  // Apply hard-shadow based on elevation
  // Optional Polaroid-style frame
}
```

#### Task 4.4: Implement Proper Modal System
**File:** `src/components/ui/Modal.tsx` (new)

```tsx
interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, title, onClose, children }: ModalProps) {
  // Full-screen backdrop with blur
  // Centered card with border
  // Close button
  // Smooth animations
}
```

#### Task 4.5: Create Toast Notification System
**File:** `src/components/ui/Toast.tsx` (new)

```tsx
export function Toast({ message, type, duration = 3000 }: ToastProps) {
  // Sticky-note aesthetic
  // Position: bottom-right
  // Auto-dismiss after duration
  // Smooth animations
}

// Usage in store:
const { showToast } = useUIStore();
showToast("Photo saved!", "success");
```

---

### PHASE 5: FLOW TESTING & REFINEMENT (Week 4)

#### Task 5.1: Test Complete User Journey
- [ ] Frame selection → Camera → Capture → Edit → Export
- [ ] Frame switch without retake
- [ ] Frame switch with retake
- [ ] Download multiple formats
- [ ] Social media sharing
- [ ] Photo history retrieval
- [ ] Settings persistence

#### Task 5.2: Test Responsive Design
- [ ] Mobile (375px, 812px, 600px)
- [ ] Tablet (768px, 1024px)
- [ ] Desktop (1280px, 1920px)
- [ ] Touch interaction
- [ ] Keyboard navigation

#### Task 5.3: Performance Testing
- [ ] Camera initialization time
- [ ] Photo capture latency
- [ ] Frame switching responsiveness
- [ ] Export generation time
- [ ] Page load time
- [ ] Network error handling

---

## 8. IMPLEMENTATION PRIORITY MATRIX

### CRITICAL (Do First - Week 1)
1. Fix navigation/routing structure
2. Implement Frame Selection as first screen
3. Create Export Dialog workflow
4. Add proper error handling
5. Standardize button/card components

### HIGH (Do Second - Week 2)
6. Implement Photo Gallery
7. Add Authentication
8. Extend backend API
9. Create Settings page
10. Add Social sharing UI

### MEDIUM (Do Third - Week 3)
11. Implement Print workflow
12. Add QR code generation
13. Create advanced filters
14. Add photo editing tools
15. Implement favorites

### LOW (Do Last - Week 4+)
16. Add dark mode
17. Implement analytics
18. Add premium features
19. Create admin panel
20. Build mobile app wrapper

---

## 9. CHECKLIST FOR COMPLETE OVERHAUL

### Navigation & Routing
- [ ] Create proper Next.js page structure
- [ ] Implement frame selection as landing page
- [ ] Create gallery page
- [ ] Create export page
- [ ] Create settings page
- [ ] Add 404 page

### Components
- [ ] Create FrameSelection component (desktop + mobile)
- [ ] Create PhotoPreview component
- [ ] Create ExportDialog component
- [ ] Create SocialShare component
- [ ] Create PhotoGallery component
- [ ] Create Settings page components
- [ ] Standardize Button component
- [ ] Standardize Card component
- [ ] Create Modal component
- [ ] Create Toast system

### State Management
- [ ] Add persistence to Zustand
- [ ] Create separate stores (photo, editor, UI, user)
- [ ] Add error handling
- [ ] Add loading states
- [ ] Add toasts system

### Backend
- [ ] Create missing API endpoints
- [ ] Add authentication
- [ ] Extend Frame schema
- [ ] Create Photo model
- [ ] Add export endpoints
- [ ] Add sharing endpoints

### Styling
- [ ] Create consistent CSS classes
- [ ] Implement all typography styles
- [ ] Implement all button styles
- [ ] Implement all card styles
- [ ] Add animation classes
- [ ] Test color contrast

### Testing
- [ ] Test complete user flows
- [ ] Test responsive design
- [ ] Test keyboard navigation
- [ ] Test error handling
- [ ] Test performance
- [ ] Test accessibility

---

## 10. SUCCESS CRITERIA

When completed, the application should:

✅ **Flow:**
- Clear multi-step journey (Frame → Capture → Edit → Export)
- No confusing or redundant screens
- Obvious CTAs at each step

✅ **Features:**
- All frame selection features working
- All export formats available
- Photo history accessible
- Settings functional
- Social sharing working

✅ **Design:**
- 100% adherence to Style Guide
- Consistent buttons, cards, typography
- Sketch-retro aesthetic throughout
- Proper use of colors (Red, Blue, Gray)
- Hand-drawn borders and hard shadows

✅ **UX:**
- Touch targets minimum 48px
- Clear feedback for all actions
- Proper error messages
- Smooth animations
- Responsive on all devices

✅ **Performance:**
- Camera initializes < 1s
- Photo capture < 500ms
- Frame switch < 300ms
- Export generation < 2s
- Page load < 2s

✅ **Accessibility:**
- All interactive elements keyboard accessible
- Proper ARIA labels
- Sufficient color contrast
- Focus indicators visible
- Works with screen readers

---

## CONCLUSION

The Photobooth application has a solid technical foundation but requires **significant restructuring** before the Style Guide can be properly implemented. The corrections outlined above follow a logical progression from architecture → UI components → styling → testing.

**Estimated Timeline:** 4-5 weeks for complete overhaul  
**Difficulty Level:** MEDIUM-HIGH  
**Priority:** CRITICAL - Must complete before going to production

---

**Next Steps:**
1. Review this analysis with team
2. Confirm priority order
3. Begin Phase 1 implementation
4. Track progress against checklist
5. Test each phase before moving to next

