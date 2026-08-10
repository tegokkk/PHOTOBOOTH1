# PHOTOBOOTH - USER FLOWS & ARCHITECTURE DIAGRAMS

---

## 1. MAIN USER JOURNEY FLOW

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PHOTOBOOTH MAIN FLOW                           │
└─────────────────────────────────────────────────────────────────────────┘

                         ╔════════════════════╗
                         ║   APP LAUNCHES     ║
                         ╚════════════════════╝
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  LOAD FRAME DATA       │
                    │  Fetch all frames      │
                    │  Cache locally         │
                    └────────────────────────┘
                                 │
                                 ▼
        ╔════════════════════════════════════════════╗
        ║     SCREEN 1: FRAME SELECTION             ║
        ╠════════════════════════════════════════════╣
        ║ • Show frame gallery (grid/carousel)       ║
        ║ • Filter by category                       ║
        ║ • Search frames                            ║
        ║ • Live preview of selected frame           ║
        ║                                             ║
        ║ ACTIONS:                                    ║
        ║ [Select Frame] → Next                      ║
        ║ [See All]     → Frame Gallery Modal        ║
        ║ [Settings]    → Settings Page              ║
        ║ [History]     → Photo Gallery Page         ║
        ╚════════════════════════════════════════════╝
                                 │
                    [Select Frame] ↓
                                 │
        ╔════════════════════════════════════════════╗
        ║     SCREEN 2: CAMERA PREVIEW              ║
        ╠════════════════════════════════════════════╣
        ║ • Live camera stream                       ║
        ║ • Selected frame overlay visible           ║
        ║ • "Strike a pose!" prompt                  ║
        ║ • Optional: Countdown timer                ║
        ║                                             ║
        ║ ACTIONS:                                    ║
        ║ [SNAP]     → Capture photo                 ║
        ║ [Back]     → Return to Frame Selection     ║
        ║ [Settings] → Settings Page                 ║
        ╚════════════════════════════════════════════╝
                                 │
                      [SNAP] ↓
                                 │
        ╔════════════════════════════════════════════╗
        ║     SCREEN 3: PHOTO PREVIEW               ║
        ╠════════════════════════════════════════════╣
        ║ • Captured photo with frame applied        ║
        ║ • Frame name shown                         ║
        ║ • Timestamp metadata                       ║
        ║ • Quick switch frame gallery available     ║
        ║                                             ║
        ║ ACTIONS:                                    ║
        ║ [Retake]        → Back to Camera           ║
        ║ [Edit]          → Go to Edit Panel         ║
        ║ [Switch Frame]  → Show frame options       ║
        ║ [Export]        → Go to Export Screen      ║
        ╚════════════════════════════════════════════╝
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
         [Retake]   │   [Edit]   │  [Switch]  │
                    │            │            │
                    ▼            ▼            ▼
                    │      ┌──────────┐       │
                    │      │EDIT PANEL│       │
                    │      └──────────┘       │
                    │            │            │
                    │      [Apply]▼            │
                    │            │            ▼
                    │            │   ┌──────────────┐
                    │            │   │ Show Frame   │
                    │            │   │ Switch Modal │
                    │            │   └──────────────┘
                    │            │           │
                    │            │      ┌────┴────┐
                    │            │      │          │
                    │            │  [Keep Photo + [Retake +
                    │            │   Apply New]   New Frame]
                    │            │      │          │
                    │            └──────┴─────┬────┘
                    │                         │
                    ▼                         ▼
                    ├──────────────────────────┤
                    │
                    ▼
        ╔════════════════════════════════════════════╗
        ║     SCREEN 4: EXPORT / SHARE              ║
        ╠════════════════════════════════════════════╣
        ║ • Format selection                         ║
        ║   - Download High-Res PNG                  ║
        ║   - Download Quick JPG                     ║
        ║   - Print (Polaroid strip)                 ║
        ║   - Share to Social                        ║
        ║                                             ║
        ║ ACTIONS:                                    ║
        ║ [Format] → Select export format            ║
        ║ [Social] → Show share options              ║
        ║ [Export] → Generate & Download             ║
        ║ [Print]  → Open print dialog               ║
        ║ [Back]   → Return to Photo Preview         ║
        ╚════════════════════════════════════════════╝
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              [Download]   [Share]    [Print]
                    │            │            │
                    ▼            ▼            ▼
            [Download File] [Social Share] [Print Dialog]
                    │            │            │
                    ▼            ▼            ▼
        ╔════════════════════════════════════════════╗
        ║     SCREEN 5: SUCCESS / COMPLETION        ║
        ╠════════════════════════════════════════════╣
        ║ • Show confirmation                        ║
        ║ • File saved/shared confirmation           ║
        ║ • Metadata (size, format, frame name)     ║
        ║                                             ║
        ║ ACTIONS:                                    ║
        ║ [Try Again]    → Back to Frame Selection   ║
        ║ [View History] → Photo Gallery Page        ║
        ║ [Home]         → Restart Flow              ║
        ╚════════════════════════════════════════════╝
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
        [Try Again] │   [Gallery]│  [Home]    │
                    │            │            │
                    └────────────┼────────────┘
                                 │
                                 ▼
                    Back to Frame Selection Screen
```

---

## 2. FRAME SWITCHING WORKFLOW (Critical Feature)

```
┌──────────────────────────────────────────────────────────────────────┐
│                    FRAME SWITCH WITHOUT RETAKE                       │
└──────────────────────────────────────────────────────────────────────┘

User at Photo Preview Screen with Frame A applied
│
│ Captured Photo stored in memory
│ Current Frame: A
│
└─► [Click "Switch Frame" or select different frame in gallery]
    │
    ▼
    ┌────────────────────────────────────────────┐
    │ FRAME SWITCH MODAL                         │
    ├────────────────────────────────────────────┤
    │                                             │
    │ Current: Frame A                           │
    │ Selected: Frame B                          │
    │                                             │
    │ What do you want to do?                    │
    │                                             │
    │ ┌──────────────────────────────────────┐   │
    │ │ Option 1:                             │   │
    │ │ [Keep Photo + Apply New Frame]       │   │
    │ │ • Use same captured photo            │   │
    │ │ • Apply Frame B                      │   │
    │ │ • Continue editing if needed         │   │
    │ └──────────────────────────────────────┘   │
    │                                             │
    │ ┌──────────────────────────────────────┐   │
    │ │ Option 2:                             │   │
    │ │ [Retake with Frame B]                │   │
    │ │ • Go back to camera                  │   │
    │ │ • Frame B will be applied            │   │
    │ │ • Take new photo                     │   │
    │ └──────────────────────────────────────┘   │
    │                                             │
    │ [Cancel] or [X]                            │
    └────────────────────────────────────────────┘
    │
    ├─► Option 1: Keep Photo + Apply Frame B
    │   │
    │   ▼
    │   Update Photo Preview with Frame B
    │   │
    │   └─► Return to Photo Preview
    │       (Same photo, different frame)
    │
    └─► Option 2: Retake with Frame B
        │
        ▼
        Save current state (for recovery)
        │
        ▼
        Return to Camera Screen
        │
        ▼
        Frame B now selected/active
        │
        ▼
        [SNAP] to capture new photo
        │
        ▼
        Show new photo with Frame B
        │
        └─► Back to Photo Preview
            (New photo, Frame B applied)
```

---

## 3. EXPORT WORKFLOW (Multi-Option)

```
┌──────────────────────────────────────────────────────────────────────┐
│                        EXPORT / SHARE FLOW                           │
└──────────────────────────────────────────────────────────────────────┘

From Photo Preview [Export/Share] Button
│
▼
┌────────────────────────────────────────────┐
│ EXPORT DIALOG                              │
├────────────────────────────────────────────┤
│ "How would you like to share your photo?"  │
│                                             │
│ [DOWNLOAD FORMATS]                         │
│ ┌──────────────────────────────────────┐  │
│ │ □ High-Res PNG                       │  │
│ │   Best quality, larger file size     │  │
│ │   Resolution: 1920x1440              │  │
│ │   Quality: Lossless                  │  │
│ └──────────────────────────────────────┘  │
│                                             │
│ ┌──────────────────────────────────────┐  │
│ │ □ Quick JPG                          │  │
│ │   Smaller file, good for sharing     │  │
│ │   Resolution: 1080x810               │  │
│ │   Quality: 85% compression           │  │
│ └──────────────────────────────────────┘  │
│                                             │
│ ┌──────────────────────────────────────┐  │
│ │ □ Polaroid Strip (PDF)               │  │
│ │   4 photos in vertical strip format  │  │
│ │   Print-ready, 300 DPI               │  │
│ └──────────────────────────────────────┘  │
│                                             │
│ [SHARE TO SOCIAL]                         │
│ ┌──────────────────────────────────────┐  │
│ │ □ Instagram                          │  │
│ │   Opens Instagram share dialog       │  │
│ └──────────────────────────────────────┘  │
│                                             │
│ ┌──────────────────────────────────────┐  │
│ │ □ Twitter / X                        │  │
│ │   Generate share link                │  │
│ └──────────────────────────────────────┘  │
│                                             │
│ ┌──────────────────────────────────────┐  │
│ │ □ WhatsApp                           │  │
│ │   Opens WhatsApp with image          │  │
│ └──────────────────────────────────────┘  │
│                                             │
│ ┌──────────────────────────────────────┐  │
│ │ □ Facebook                           │  │
│ │   Share to timeline                  │  │
│ └──────────────────────────────────────┘  │
│                                             │
│ [OTHER OPTIONS]                            │
│ ┌──────────────────────────────────────┐  │
│ │ □ Generate QR Code                   │  │
│ │   Quick access via phone              │  │
│ └──────────────────────────────────────┘  │
│                                             │
│ ┌──────────────────────────────────────┐  │
│ │ □ Email Link                         │  │
│ │   Send via email                     │  │
│ └──────────────────────────────────────┘  │
│                                             │
│ ┌──────────────────────────────────────┐  │
│ │ □ Save to Cloud                      │  │
│ │   Google Drive / Dropbox              │  │
│ └──────────────────────────────────────┘  │
│                                             │
│ [ACTION BUTTONS]                           │
│ ┌─────────────────┬─────────────────────┐ │
│ │ [CANCEL]        │ [EXPORT SELECTED] ► │ │
│ └─────────────────┴─────────────────────┘ │
└────────────────────────────────────────────┘
│
├─► [CANCEL] → Back to Photo Preview
│
└─► [EXPORT SELECTED] → Process selections
    │
    ▼
    Show loader with progress
    │
    ├─► Generate each selected format
    │   ├─ PNG: Compress image
    │   ├─ JPG: Compress image
    │   ├─ PDF: Generate strip layout
    │   └─ QR: Generate QR code
    │
    ├─► Upload to server if needed
    │
    └─► Prepare share links
    │
    ▼
    ┌────────────────────────────────────────────┐
    │ SUCCESS / DOWNLOAD CONFIRMATION            │
    ├────────────────────────────────────────────┤
    │ ✓ Photo saved!                             │
    │                                             │
    │ Files Ready:                               │
    │ □ photo.png (2.4 MB)  [Download]          │
    │ □ photo.jpg (0.8 MB)  [Download]          │
    │ □ photo-strip.pdf     [Download / Print]  │
    │ □ QR Code             [Display]            │
    │                                             │
    │ Shared To:                                 │
    │ ✓ Instagram - Ready to share              │
    │ ✓ Twitter - Link copied                   │
    │ ✓ WhatsApp - Opened                       │
    │                                             │
    │ [TRY AGAIN] [CLOSE] [VIEW HISTORY]        │
    └────────────────────────────────────────────┘
```

---

## 4. PHOTO GALLERY / HISTORY FLOW

```
┌──────────────────────────────────────────────────────────────────────┐
│                    PHOTO GALLERY / HISTORY                           │
└──────────────────────────────────────────────────────────────────────┘

From Navigation [Gallery/History] Button
│
▼
┌────────────────────────────────────────────┐
│ PHOTO GALLERY PAGE                         │
├────────────────────────────────────────────┤
│                                             │
│ [Filter Buttons]                           │
│ [All] [Classic] [Vintage] [Doodle] ...    │
│                                             │
│ [Sort by: Most Recent ▼]                  │
│                                             │
│ ╔════════════╗  ╔════════════╗ ╔════════╗ │
│ ║  Photo 1   ║  ║  Photo 2   ║ ║ Photo3 ║ │
│ ║ [Thumbnail]║  ║[Thumbnail] ║ ║[Thumb] ║ │
│ ║ Frame: Zine║  ║Frame:      ║ ║Frame:  ║ │
│ ║ 2 hrs ago  ║  ║Vintage     ║ ║Classic ║ │
│ ║            ║  ║1 day ago   ║ ║3 weeks ║ │
│ ║ ⋯ ⋯ ⋯     ║  ║ ⋯ ⋯ ⋯    ║ ║⋯⋯⋯   ║ │
│ ╚════════════╝  ╚════════════╝ ╚════════╝ │
│                                             │
│ [Load More Photos...]                      │
│                                             │
└────────────────────────────────────────────┘
│
└─► [Click on Photo Card]
    │
    ▼
    ┌────────────────────────────────────────────┐
    │ PHOTO DETAILS                              │
    ├────────────────────────────────────────────┤
    │                                             │
    │ ╔════════════════════════════════════════╗ │
    │ ║        [Full Size Photo]                ║ │
    │ ║        (with frame applied)             ║ │
    │ ╚════════════════════════════════════════╝ │
    │                                             │
    │ METADATA:                                  │
    │ Date: Oct 24, 2023 • 2:15 PM             │
    │ Frame: Zine Edition                      │
    │ Dimensions: 1920 x 1440 px               │
    │ File Size: 2.4 MB                        │
    │ Brightness: +15                          │
    │ Contrast: +10                            │
    │ Saturation: +5                           │
    │                                             │
    │ [ACTION BUTTONS]                          │
    │ ┌──────┬──────┬──────┬──────┬──────┐     │
    │ │ Share│Dload │ Edit │Print │Delete│     │
    │ └──────┴──────┴──────┴──────┴──────┘     │
    │                                             │
    │ [BACK TO GALLERY]                         │
    └────────────────────────────────────────────┘
    │
    ├─► [Download] → Show format options
    │   └─► Downloads selected format
    │
    ├─► [Share] → Show share options
    │   └─► Same as export workflow
    │
    ├─► [Edit] → Opens photo in editor
    │   └─► Can adjust brightness/contrast/saturation again
    │       Can switch frame
    │       Can re-export
    │
    ├─► [Print] → Show print dialog
    │   └─► Options for size, copies, etc.
    │
    └─► [Delete] → Confirm deletion
        └─► Photo removed from gallery
            Space freed on server
```

---

## 5. SETTINGS PAGE FLOW

```
┌──────────────────────────────────────────────────────────────────────┐
│                          SETTINGS PAGE                               │
└──────────────────────────────────────────────────────────────────────┘

From Navigation [Settings] Button
│
▼
┌────────────────────────────────────────────┐
│ SETTINGS PAGE                              │
├────────────────────────────────────────────┤
│                                             │
│ ═ CAMERA SETTINGS                          │
│ ├─ Camera Device                           │
│ │  [Select Camera ▼]  (Front/Back)        │
│ │                                           │
│ ├─ Video Resolution                        │
│ │  [1920x1440] [1280x960] [640x480]       │
│ │                                           │
│ ├─ Mirror/Flip Video                       │
│ │  [Toggle] Flip horizontally              │
│ │                                           │
│ ├─ Photo Quality                           │
│ │  Quality: [High] [Medium] [Low]         │
│ └─                                          │
│                                             │
│ ═ BOOTH PREFERENCES                        │
│ ├─ Default Frame                           │
│ │  [Select Default Frame ▼]               │
│ │                                           │
│ ├─ Show Countdown Timer                    │
│ │  [Toggle] 3-2-1 before capture          │
│ │                                           │
│ ├─ Countdown Duration                      │
│ │  [Slider: 2s ] 3s [ 4s ]                │
│ │                                           │
│ └─ Sound Effects                           │
│    [Toggle] Camera shutter sound           │
│                                             │
│ ═ EXPORT SETTINGS                          │
│ ├─ Default Export Format                   │
│ │  [PNG v] [JPG] [PDF]                    │
│ │                                           │
│ ├─ Export Quality                          │
│ │  Quality: [High] [Medium] [Low]         │
│ │                                           │
│ └─ Add Watermark                           │
│    [Toggle] Add "© 2024" to exports       │
│                                             │
│ ═ APPEARANCE                               │
│ ├─ Theme                                   │
│ │  [Light Mode] [Dark Mode] [Auto]        │
│ │                                           │
│ └─ Language                                │
│    [English v] [Indonesian] [Spanish]     │
│                                             │
│ ═ ACCESSIBILITY                            │
│ ├─ Text Size                               │
│ │  Size: [Small] [Normal] [Large] [XL]   │
│ │                                           │
│ ├─ High Contrast Mode                      │
│ │  [Toggle] Increase UI contrast          │
│ │                                           │
│ ├─ Motion Reduction                        │
│ │  [Toggle] Reduce animations             │
│ │                                           │
│ ├─ Enable Screen Reader                    │
│ │  [Toggle] Optimize for screen reader    │
│ │                                           │
│ └─ Keyboard Navigation                     │
│    [Toggle] Highlight focus states        │
│                                             │
│ ═ STORAGE & DATA                           │
│ ├─ App Storage Usage                       │
│ │  Cache: 45.2 MB / 1 GB available        │
│ │                                           │
│ ├─ Clear Cache                             │
│ │  [Clear Cache Button]                    │
│ │  (Clears downloaded frames)              │
│ │                                           │
│ └─ Clear All Data                          │
│    [Clear All Button]                      │
│    ⚠ Warning: This cannot be undone       │
│                                             │
│ ═ ABOUT                                    │
│ ├─ App Version: 1.0.0                      │
│ ├─ Last Updated: Build 2024-08-10         │
│ ├─ Privacy Policy [Link]                   │
│ ├─ Terms of Service [Link]                │
│ ├─ Report Bug [Button]                     │
│ ├─ Feature Request [Button]               │
│ └─ Contact Support [Button]                │
│                                             │
│ [SAVE SETTINGS]  [RESET TO DEFAULTS]     │
│                                             │
└────────────────────────────────────────────┘
│
└─► [SAVE SETTINGS]
    │
    ▼
    Store settings in localStorage + backend
    │
    ▼
    Apply settings immediately
    │
    ▼
    Show toast: "Settings saved!"
    │
    └─► Remain on settings page OR
        Auto-close after 2 seconds
```

---

## 6. MOBILE vs DESKTOP NAVIGATION

```
┌──────────────────────────────────────────────────────────────────────┐
│                      NAVIGATION COMPARISON                           │
└──────────────────────────────────────────────────────────────────────┘

DESKTOP LAYOUT:
┌────────────────────────────────────┬──────────────────────────────────┐
│   SIDEBAR (Fixed)                  │  MAIN CONTENT AREA               │
│   Width: 256px                     │  Responsive width                │
├────────────────────────────────────┤                                  │
│ Photoboother                       │  ╔════════════════════════════╗  │
│ [Logo - Red Italic]                │  ║   Frame Selection          ║  │
│                                    │  ║   OR                       ║  │
│ Frame Kits                         │  ║   Camera Preview           ║  │
│ Pick your vibe                     │  ║   OR                       ║  │
│                                    │  ║   Photo Preview            ║  │
│ ┌────────────────────────────────┐ │  ║   OR                       ║  │
│ │ □ Classic                      │ │  ║   Export Screen            ║  │
│ │ ☆ Vintage                      │ │  ║   OR                       ║  │
│ │ ≈ Doodle                       │ │  ║   Gallery                  ║  │
│ │ ✦ Neon                         │ │  ║   OR                       ║  │
│ │ ■ Zine                         │ │  ║   Settings                 ║  │
│ └────────────────────────────────┘ │  ║                            ║  │
│                                    │  ╚════════════════════════════╝  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  │                                 │
│                                    │  │                                 │
│ [⏱ History]                        │  │                                 │
│ [⚙ Settings]                       │  │                                 │
│                                    │  │                                 │
└────────────────────────────────────┴──────────────────────────────────┘

MOBILE LAYOUT:
┌──────────────────────────────────────────────────────────┐
│  [Logo]              [⏱] [⚙]                  (Header)   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ╔════════════════════════════════════════════════════╗ │
│  ║        Frame Selection (Carousel)                  ║ │
│  ║  ◄ [ Frame 1 ] [ Frame 2 ] [ Frame 3 ] ►          ║ │
│  ║  ◄ [ Frame 4 ] [ Frame 5 ] [ Frame 6 ] ►          ║ │
│  ║     [See All Frames ▶]                            ║ │
│  ╚════════════════════════════════════════════════════╝ │
│                                                           │
│  ╔════════════════════════════════════════════════════╗ │
│  ║        Camera Preview / Content Area               ║ │
│  ║                                                    ║ │
│  ╚════════════════════════════════════════════════════╝ │
│                                                           │
├──────────────────────────────────────────────────────────┤
│ Bottom Nav:                                              │
│ [📷 Booth] [🖼 Gallery] [📂 Frames] [👤 Profile]       │
│   (Center, Elevated)                                    │
└──────────────────────────────────────────────────────────┘

KEY DIFFERENCES:
├─ Desktop: Frame selection in sidebar → Main area shows camera
├─ Mobile: Frame carousel at top → Main area shows camera
├─ Desktop: Navigation via sidebar buttons
├─ Mobile: Navigation via bottom nav bar
├─ Desktop: More space for preview + controls side-by-side
└─ Mobile: Vertical stacking, full-width elements
```

---

## 7. COMPONENT HIERARCHY

```
┌──────────────────────────────────────────────────────────────────────┐
│                    COMPONENT ARCHITECTURE                            │
└──────────────────────────────────────────────────────────────────────┘

App Root (layout.tsx)
│
├─ Header (Mobile)
│  └─ Logo + Icon Buttons
│
├─ Navigation
│  ├─ Sidebar (Desktop)
│  │  ├─ Logo
│  │  ├─ Frame Categories List
│  │  └─ Settings/History Links
│  │
│  └─ Bottom Nav (Mobile)
│     ├─ Booth Button
│     ├─ Gallery Button
│     ├─ Frames Button
│     └─ Profile Button
│
├─ Main Content Area
│  │
│  ├─ Page: "/" (Booth)
│  │  │
│  │  ├─ Screen 1: FrameSelection
│  │  │  ├─ FrameGallery (Grid/Carousel)
│  │  │  ├─ FramePreview
│  │  │  └─ FilterButtons
│  │  │
│  │  ├─ Screen 2: CameraPreview
│  │  │  ├─ VideoStream
│  │  │  ├─ FrameOverlay
│  │  │  ├─ CameraControls
│  │  │  └─ SnapButton (Primary)
│  │  │
│  │  ├─ Screen 3: PhotoPreview
│  │  │  ├─ PhotoDisplay (with frame)
│  │  │  ├─ MetadataBar
│  │  │  ├─ QuickFrameSwitch
│  │  │  ├─ EditPanel
│  │  │  │  ├─ BrightnessSlider
│  │  │  │  ├─ ContrastSlider
│  │  │  │  ├─ SaturationSlider
│  │  │  │  └─ ResetButton
│  │  │  └─ ActionButtons
│  │  │     ├─ RetakeButton
│  │  │     ├─ EditButton
│  │  │     └─ ExportButton
│  │  │
│  │  └─ Modal: ExportDialog
│  │     ├─ FormatSelector
│  │     │  ├─ PNGOption
│  │     │  ├─ JPGOption
│  │     │  └─ PDFOption
│  │     ├─ SocialShareOptions
│  │     │  ├─ InstagramButton
│  │     │  ├─ TwitterButton
│  │     │  ├─ WhatsAppButton
│  │     │  └─ FacebookButton
│  │     └─ OtherOptions
│  │        ├─ QRCodeButton
│  │        ├─ EmailButton
│  │        └─ CloudButton
│  │
│  ├─ Page: "/gallery"
│  │  ├─ PhotoGallery
│  │  │  ├─ FilterBar
│  │  │  ├─ SortDropdown
│  │  │  ├─ PhotoGrid
│  │  │  │  └─ PhotoCard (repeated)
│  │  │  │     ├─ Thumbnail
│  │  │  │     ├─ FrameName
│  │  │  │     ├─ Timestamp
│  │  │  │     └─ HoverActions
│  │  │  └─ PaginationButtons
│  │  │
│  │  └─ Modal: PhotoDetails
│  │     ├─ FullPhotoDisplay
│  │     ├─ MetadataPanel
│  │     └─ ActionButtons
│  │        ├─ ShareButton
│  │        ├─ DownloadButton
│  │        ├─ EditButton
│  │        ├─ PrintButton
│  │        └─ DeleteButton
│  │
│  └─ Page: "/settings"
│     ├─ SettingsForm
│     │  ├─ CameraSettings
│     │  │  ├─ DeviceSelect
│     │  │  ├─ ResolutionSelect
│     │  │  └─ MirrorToggle
│     │  ├─ BoothPreferences
│     │  │  ├─ DefaultFrameSelect
│     │  │  ├─ CountdownToggle
│     │  │  └─ SoundToggle
│     │  ├─ ExportSettings
│     │  │  ├─ FormatSelect
│     │  │  ├─ QualitySelect
│     │  │  └─ WatermarkToggle
│     │  ├─ AppearanceSettings
│     │  │  ├─ ThemeSelect
│     │  │  └─ LanguageSelect
│     │  ├─ AccessibilitySettings
│     │  │  ├─ TextSizeSelect
│     │  │  ├─ HighContrastToggle
│     │  │  ├─ MotionReductionToggle
│     │  │  └─ ScreenReaderToggle
│     │  └─ StorageSettings
│     │     ├─ StorageInfo
│     │     ├─ ClearCacheButton
│     │     └─ ClearAllButton
│     │
│     └─ ActionButtons
│        ├─ SaveButton
│        └─ ResetButton
│
└─ Shared Components (used throughout)
   ├─ Button (with variants: primary, secondary, tertiary)
   ├─ Card
   ├─ Modal
   ├─ Toast/Notification
   ├─ Spinner/Loading
   ├─ SketchBorder
   ├─ HardShadow
   ├─ Slider
   ├─ Dropdown
   ├─ Tabs
   └─ Icon (Material Symbols)
```

---

## 8. STATE MANAGEMENT STRUCTURE

```
┌──────────────────────────────────────────────────────────────────────┐
│                     ZUSTAND STORE ARCHITECTURE                       │
└──────────────────────────────────────────────────────────────────────┘

useAppStore (Global App State)
├─ frames: FrameData[]
├─ selectedFrameId: string | null
├─ isLoadingFrames: boolean
├─ setSelectedFrameId: (id: string) => void
├─ fetchFrames: () => Promise<void>
└─ Persisted: selectedFrameId

usePhotoStore (Photo Capture & Export)
├─ capturedImage: string | null  (base64)
├─ setCapturedImage: (image: string | null) => void
├─ exportedPhotos: Photo[]
├─ addExportedPhoto: (photo: Photo) => void
├─ deletePhoto: (id: string) => void
└─ Persisted: capturedImage, exportedPhotos

useEditorStore (Photo Adjustments)
├─ brightness: number (0-200, default 100)
├─ contrast: number (0-200, default 100)
├─ saturation: number (0-200, default 100)
├─ setBrightness: (val: number) => void
├─ setContrast: (val: number) => void
├─ setSaturation: (val: number) => void
├─ resetEdits: () => void
└─ Persisted: all values

useUIStore (UI State & Feedback)
├─ isLoading: boolean
├─ setIsLoading: (bool: boolean) => void
├─ error: string | null
├─ setError: (msg: string | null) => void
├─ toast: ToastMessage | null
├─ showToast: (msg: string, type: 'success'|'error'|'info') => void
├─ openModals: string[]
├─ openModal: (modalId: string) => void
├─ closeModal: (modalId: string) => void
└─ Persisted: none

useUserStore (User Profile & Preferences)
├─ user: User | null
├─ isAuthenticated: boolean
├─ preferences: UserPreferences
├─ setUser: (user: User) => void
├─ logout: () => void
├─ updatePreferences: (prefs: UserPreferences) => void
└─ Persisted: preferences

Interfaces:
├─ FrameData
│  ├─ id: string
│  ├─ name: string
│  ├─ category: string
│  ├─ description: string
│  ├─ imageUrl: string
│  ├─ cssPlaceholder: string
│  ├─ isPremium: boolean
│  └─ createdAt: Date
│
├─ Photo
│  ├─ id: string
│  ├─ userId: string
│  ├─ frameId: string
│  ├─ imageUrl: string
│  ├─ brightness: number
│  ├─ contrast: number
│  ├─ saturation: number
│  └─ createdAt: Date
│
├─ User
│  ├─ id: string
│  ├─ email: string
│  ├─ name: string
│  ├─ avatar: string
│  └─ createdAt: Date
│
├─ UserPreferences
│  ├─ defaultFrame: string
│  ├─ cameraDevice: string
│  ├─ exportFormat: 'png' | 'jpg' | 'pdf'
│  ├─ exportQuality: 'high' | 'medium' | 'low'
│  ├─ soundEnabled: boolean
│  ├─ countdownEnabled: boolean
│  ├─ countdownDuration: number
│  ├─ theme: 'light' | 'dark' | 'auto'
│  ├─ language: string
│  └─ accessibilityOptions: {}
│
├─ ToastMessage
│  ├─ id: string
│  ├─ message: string
│  ├─ type: 'success' | 'error' | 'info' | 'warning'
│  ├─ duration: number
│  └─ dismissible: boolean
```

---

## 9. API ENDPOINT STRUCTURE

```
┌──────────────────────────────────────────────────────────────────────┐
│                      BACKEND API ROUTES                              │
└──────────────────────────────────────────────────────────────────────┘

BASE URL: http://localhost:5000/api

FRAMES
├─ GET    /frames                    - Get all frames [Public]
├─ GET    /frames/:id                - Get frame details [Public]
├─ GET    /frames/category/:category - Filter by category [Public]
├─ GET    /frames/search?q=query     - Search frames [Public]
├─ POST   /frames                    - Create frame [Admin Only]
├─ PUT    /frames/:id                - Update frame [Admin Only]
└─ DELETE /frames/:id                - Delete frame [Admin Only]

PHOTOS
├─ POST   /photos                    - Save new photo [Auth Required]
├─ GET    /photos                    - List user's photos [Auth Required]
├─ GET    /photos/:id                - Get photo details [Auth Required]
├─ GET    /photos/:id/download       - Download photo [Auth Required]
│  Query Params: format=png|jpg|pdf, quality=high|medium|low
├─ PUT    /photos/:id                - Update photo [Auth Required]
└─ DELETE /photos/:id                - Delete photo [Auth Required]

EXPORT / FORMATS
├─ POST   /export/png                - Export as PNG [Auth Required]
├─ POST   /export/jpg                - Export as JPG [Auth Required]
├─ POST   /export/pdf                - Export as PDF [Auth Required]
├─ POST   /export/print              - Generate print format [Auth Required]
└─ POST   /export/qrcode             - Generate QR code [Public]

SHARE
├─ POST   /share/instagram           - Generate Instagram share link
├─ POST   /share/twitter             - Generate Twitter share link
├─ POST   /share/whatsapp            - Generate WhatsApp share link
├─ POST   /share/facebook            - Generate Facebook share link
├─ POST   /share/email               - Send via email
└─ POST   /share/cloud               - Save to cloud storage

AUTHENTICATION
├─ POST   /auth/signup               - Register new user
├─ POST   /auth/login                - Login user
├─ POST   /auth/logout               - Logout user
├─ POST   /auth/refresh              - Refresh token
└─ GET    /auth/me                   - Get current user

USERS
├─ GET    /users/:id                 - Get user profile
├─ GET    /users/:id/photos          - Get user's photo history
├─ PUT    /users/:id                 - Update profile
├─ GET    /users/:id/preferences     - Get preferences
├─ PUT    /users/:id/preferences     - Update preferences
└─ DELETE /users/:id                 - Delete account

ADMIN
├─ GET    /admin/stats               - App statistics
├─ GET    /admin/users               - List all users
├─ GET    /admin/photos              - List all photos
└─ DELETE /admin/photos/:id          - Delete any photo

HEALTH
└─ GET    /health                    - Health check [Public]
```

---

## 10. ERROR HANDLING FLOWCHART

```
┌──────────────────────────────────────────────────────────────────────┐
│                       ERROR HANDLING FLOW                            │
└──────────────────────────────────────────────────────────────────────┘

Any User Action
│
▼
Try {
  Execute Action
} Catch (Error) {
  │
  ▼
  Classify Error Type
  │
  ├─ CAMERA_PERMISSION_DENIED
  │  │
  │  ▼
  │  Show Modal:
  │  "Camera access denied"
  │  [Settings] [Cancel]
  │
  ├─ CAMERA_NOT_SUPPORTED
  │  │
  │  ▼
  │  Show Modal:
  │  "Camera not supported"
  │  "Please use device with camera"
  │
  ├─ NETWORK_ERROR
  │  │
  │  ▼
  │  Show Toast:
  │  "No internet connection"
  │  Auto-retry after 5s
  │  [Retry Now] [Dismiss]
  │
  ├─ API_ERROR
  │  │
  │  ├─ 401 Unauthorized
  │  │  └─ Redirect to login
  │  │
  │  ├─ 403 Forbidden
  │  │  └─ Show error toast
  │  │
  │  ├─ 404 Not Found
  │  │  └─ Show error toast
  │  │
  │  └─ 500+ Server Error
  │     └─ Show error with retry
  │
  ├─ FILE_TOO_LARGE
  │  │
  │  ▼
  │  Show Toast:
  │  "File too large. Max 10MB"
  │  [Compress] [Cancel]
  │
  ├─ UNSUPPORTED_FORMAT
  │  │
  │  ▼
  │  Show Toast:
  │  "Format not supported"
  │
  └─ UNKNOWN_ERROR
     │
     ▼
     Show Toast:
     "Something went wrong"
     [Retry] [Report Bug]
     Log to analytics
}

Modal/Toast Behavior:
├─ Toast: Auto-dismiss after duration, dismissible
├─ Modal: Blocks interaction until action taken
├─ Error logged to console + analytics
└─ User can always dismiss and retry
```

---

**These flows represent the complete user journey and system architecture for the corrected Photobooth application. They should be implemented in this order during development.**

