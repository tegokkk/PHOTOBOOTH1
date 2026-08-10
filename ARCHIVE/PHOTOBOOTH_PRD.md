# PRODUCT REQUIREMENTS DOCUMENT
## Aplikasi Photobooth - Frame Interchangeable

**Document Version:** 1.0  
**Last Updated:** Agustus 2026  
**Status:** Draft  
**Created By:** Product Team

---

## 1. EXECUTIVE SUMMARY

Aplikasi Photobooth adalah platform digital yang memungkinkan pengguna untuk mengambil foto melalui webcam/kamera perangkat mereka dengan berbagai pilihan frame atau template desain. Fitur unggulannya adalah user dapat mengganti frame pada foto yang sudah diambil tanpa perlu mengambil ulang foto, memberikan fleksibilitas maksimal dalam menciptakan konten visual yang menarik.

**Nilai Utama:**
- User mendapatkan pengalaman fotografi interaktif yang menyenangkan
- Dapat membuat konten berkualitas tinggi dengan desain profesional
- Hemat waktu dengan fitur re-frame tanpa re-shoot
- Integrasi dengan berbagai channel output (download, print, social media)

**Target Market:** Event organizers, corporate events, weddings, retail stores, amusement parks, content creators

---

## 2. PRODUCT OVERVIEW

### 2.1 Definisi Produk
Photobooth App adalah web/mobile application yang menggunakan browser's camera API untuk capture foto real-time. Aplikasi menyediakan library frame templates yang dapat di-customize dan diterapkan pada foto yang diambil. Pengguna dapat melakukan multiple experiments dengan frame berbeda sebelum memutuskan download hasil akhir.

### 2.2 Problem Statement
- Photobooth fisik mahal dan require dedicated hardware
- Proses manual editing foto memakan waktu dan require skill editing
- Sulit untuk menggunakan design profesional tanpa designer
- Harapan instant gratification tidak terpenuhi dengan workflow tradisional
- Limited flexibility dalam mencoba berbagai variasi desain

### 2.3 Solution
Menyediakan platform digital yang:
1. Menghilangkan need untuk hardware booth fisik
2. Membuat professional-quality photo dengan instant template application
3. Memungkinkan unlimited frame experimentation
4. Memberikan multiple output options (digital, print, social)
5. Scalable untuk berbagai use case (personal, corporate, event)

---

## 3. GOALS & OBJECTIVES

### 3.1 Business Goals
- **Acquisition:** Target 10,000 active users dalam 6 bulan pertama
- **Engagement:** Minimal 5 foto per user per session
- **Monetization:** Revenue stream dari premium frames, printing service, dan enterprise packages
- **Market Expansion:** Expand ke event management dan corporate client

### 3.2 Product Goals
- **MVP Launch:** Deliver core functionality dalam 12 minggu
- **Quality:** 99.5% uptime dan sub-1s photo capture latency
- **User Satisfaction:** NPS score ≥ 50
- **Performance:** Load time < 2s, Camera initialization < 1s

### 3.3 User Goals
- Mudah capture foto dengan interface intuitif
- Akses berbagai desain frame berkualitas tinggi
- Cepat experiment dengan multiple frames
- Mudah share atau download hasil

---

## 4. TARGET USERS

### 4.1 Primary Users
**Profile:** Individual creators, event attendees, social media content creators
- Usia: 18-35 tahun
- Tech-savvy, aktif di social media
- Mencari solusi cepat untuk create konten visual
- Budget: Free to low-cost solution

**Use Case:**
- Ambil selfie dengan backdrop artistik
- Create content untuk Instagram/TikTok
- Fun activity di gathering/party

### 4.2 Secondary Users
**Profile:** Event organizers, corporate HR, marketing teams
- Usia: 25-50 tahun
- Organize events dan need photo souvenir
- Want professional-looking output tanpa expense
- Budget: Medium to high (willing to pay for premium)

**Use Case:**
- Create branded photobooth untuk corporate event
- Capture attendee photos untuk event documentation
- Generate marketing content

### 4.3 Tertiary Users
**Profile:** Retail, venue owners, entertainment venues
- Looking untuk add entertainment/engagement element
- Want to increase foot traffic dan dwell time
- Budget: Medium to high

**Use Case:**
- Photobooth station di retail stores
- Event entertainment di malls, amusement parks
- Photo contest dan giveaway campaigns

---

## 5. FEATURE & REQUIREMENTS

### 5.1 Core Features (MVP)

#### 5.1.1 Camera & Photo Capture
**Requirements:**
- Access device camera via WebRTC getUserMedia API
- Support desktop dan mobile camera input
- Real-time video preview di browser
- Photo capture dengan 1-click button press
- Save captured image ke application state
- Support multiple image formats (JPG, PNG, WebP)

**Acceptance Criteria:**
- ✓ Camera permission request appears on first load
- ✓ Camera stream loads within 3 seconds
- ✓ Photo capture produces 1920x1080 minimum resolution
- ✓ Support iOS Safari dan Android Chrome

#### 5.1.2 Frame Templates Library
**Requirements:**
- Display collection of pre-designed frame templates
- Templates organized by category (Casual, Professional, Holiday, Themed, etc)
- Thumbnail preview untuk setiap frame
- Metadata per frame: name, category, dimensions, design credit
- Support SVG, PNG transparent format
- Minimum 20 templates di launch

**Acceptance Criteria:**
- ✓ Load frame list within 2 seconds
- ✓ Each frame thumbnail loads < 500ms
- ✓ Filter/search by category works smoothly
- ✓ Support at least 50 frames scalable

**Frame Categories:**
- Casual (casual hangout, friends, family)
- Professional (corporate, business, formal)
- Holiday (Christmas, New Year, specific holidays)
- Seasonal (Spring, Summer, Fall, Winter)
- Themed (Sports, Gaming, Movies, etc)
- Custom (user-created, branded)

#### 5.1.3 Live Preview dengan Frame Overlay
**Requirements:**
- Real-time overlay frame di atas camera preview
- Adjust frame position/size jika tidak center
- Show live preview sebelum capture
- Update preview instantly saat frame dipilih
- Support frame opacity adjustment untuk alignment help

**Acceptance Criteria:**
- ✓ Frame overlay updates instantly (< 100ms latency)
- ✓ Overlay properly aligned dengan camera feed
- ✓ Performance tidak drop dengan overlay active

#### 5.1.4 Photo with Frame Compositing
**Requirements:**
- After capture: composite captured image dengan selected frame
- Maintain high quality output (no lossy compression)
- Render composited image ke canvas
- Support layer blending modes (normal, overlay, multiply)
- Export composited image dengan frame watermark (optional)

**Acceptance Criteria:**
- ✓ Composite renders within 2 seconds
- ✓ Output quality is high (≥90% JPEG quality)
- ✓ No visible artifacts or borders

#### 5.1.5 Frame Switching/Re-frame Feature
**Requirements (UNIQUE FEATURE)**
- User dapat switch ke frame berbeda setelah photo captured
- Instantly re-composite image dengan frame baru
- No need untuk re-capture photo
- Support unlimited frame switches
- Show before/after preview

**Acceptance Criteria:**
- ✓ Frame switch completes within 1 second
- ✓ Can switch between 50+ frames smoothly
- ✓ Quality consistent across all frames

#### 5.1.6 Photo Download
**Requirements:**
- Download composited image ke device
- Support multiple format: JPG, PNG, WebP
- Default filename: photobooth_[timestamp].[format]
- Include option untuk add watermark
- One-click download button

**Acceptance Criteria:**
- ✓ Download completes within 5 seconds
- ✓ File size < 10MB
- ✓ Works on desktop dan mobile

#### 5.1.7 Basic Photo Editing
**Requirements:**
- Brightness adjustment (slider: -50 to +50)
- Contrast adjustment (slider: -50 to +50)
- Saturation adjustment (slider: -50 to +50)
- Rotate image (90°, 180°, 270°)
- Crop tool dengan preset aspect ratios
- Reset to original button
- Preview edits real-time

**Acceptance Criteria:**
- ✓ Slider adjustments are smooth
- ✓ Edits apply within 500ms
- ✓ Editing not impact frame quality

#### 5.1.8 Social Media Share
**Requirements:**
- Share to Instagram, Facebook, Twitter, WhatsApp
- Generate shareable link dengan expiry
- Generate QR code untuk quick share
- Track share analytics (optional)
- Copy direct link untuk manual sharing

**Acceptance Criteria:**
- ✓ Share buttons properly integrated
- ✓ Image quality maintained saat share
- ✓ Works with major social platforms

#### 5.1.9 Print Integration
**Requirements:**
- Option untuk print hasil foto
- Integration dengan printer service (PrintNinja, etc)
- Select print size (4x6, 5x7, 8x10, custom)
- Add delivery address
- Payment processing
- Track print status

**Acceptance Criteria (Phase 2)**
- ✓ Print order flow complete
- ✓ Payment processed securely
- ✓ Tracking information available

### 5.2 Secondary Features (Post-MVP)

#### 5.2.1 User Accounts & History
- User registration (email, social login)
- Save photo history
- Favorite frames
- Reorder captured photos
- Delete photos
- User profile with stats

#### 5.2.2 Advanced Editing Tools
- Add text/stickers to photos
- Filters (vintage, b&w, sepia, etc)
- Blur background option
- Face beauty/enhancement
- Collage mode (multi-photo)

#### 5.2.3 Frame Customization
- Upload custom frame
- Adjust frame opacity/blend
- Customize frame elements
- Create frame sets untuk matching theme

#### 5.2.4 Group/Booth Mode
- Multiple person capture
- Collaborative frame selection
- Auto-generate photo set
- Group voting untuk best frame

#### 5.2.5 Analytics & Dashboard
- For business/event organizers:
  - Photo count per session
  - Popular frames ranking
  - Peak usage times
  - User engagement metrics
  - Social share tracking

### 5.3 Admin Features

#### 5.3.1 Frame Management
- Upload new frame template
- Preview frame
- Set frame properties (name, category, dimensions)
- Enable/disable frame
- Delete frame
- Version control

#### 5.3.2 User Management
- View user list
- Ban/suspend user
- View user activity
- Monitor suspicious activity

#### 5.3.3 Content Moderation
- Review reported photos
- Delete inappropriate content
- Set content guidelines
- Auto-flagging suspicious images (AI, optional)

#### 5.3.4 Analytics Dashboard
- Total users/sessions
- Photos captured
- Popular frames
- Download/share statistics
- Revenue metrics (if monetized)

---

## 6. USER FLOWS

### 6.1 Happy Path - Photo Capture & Download
```
1. User opens app
   ↓
2. Browser requests camera permission
   ↓
3. User grants permission
   ↓
4. Camera stream loads, user sees live preview
   ↓
5. Frame selector shows available frames (default "None" selected)
   ↓
6. User clicks frame to select
   ↓
7. Frame overlay appears on live preview
   ↓
8. User clicks "Take Photo" button
   ↓
9. Photo captured, camera freezes
   ↓
10. Composited image (photo + frame) displays
   ↓
11. User can:
    a) Switch frame → Re-composite instantly → Back to step 10
    b) Edit photo → Adjust brightness/contrast/saturation
    c) Download → Select format → Download starts
    d) Share → Select platform → Share dialog opens
    e) Retake → Back to camera view
```

### 6.2 Frame Switching Flow
```
1. Photo captured and displayed
   ↓
2. Frame library still visible on right/bottom
   ↓
3. User clicks different frame
   ↓
4. Preview shows new frame on same photo (1-2 seconds)
   ↓
5. User can approve or switch again
   ↓
6. Multiple experiments possible
```

### 6.3 Edit & Download Flow
```
1. Photo displayed with selected frame
   ↓
2. User clicks "Edit" button
   ↓
3. Edit panel opens with sliders
   ↓
4. Adjustments applied real-time
   ↓
5. User satisfied, clicks "Save"
   ↓
6. Edited version becomes current
   ↓
7. User clicks "Download"
   ↓
8. Format selection appears
   ↓
9. File downloads to device
```

### 6.4 Mobile User Flow
```
Similar to desktop but:
- Vertical layout (full-width preview on top)
- Smaller thumb frame gallery (horizontal scroll)
- Floating action buttons (Camera, Download, Share)
- Touch-optimized controls
```

---

## 7. TECHNICAL SPECIFICATIONS

### 7.1 Frontend Architecture

**Technology Stack:**
- **Framework:** React 18+ atau Next.js 14+
- **Styling:** Tailwind CSS + Shadcn/ui
- **Image Processing:** Fabric.js atau HTML5 Canvas API
- **State Management:** React Context API atau Zustand
- **HTTP Client:** Axios atau Fetch API
- **Camera API:** WebRTC getUserMedia API
- **Storage:** Browser localStorage untuk session, IndexedDB untuk offline

**Component Structure:**
```
App/
├── CameraPage/
│   ├── CameraPreview (video stream)
│   ├── FrameOverlay (real-time frame)
│   ├── FrameSelector (gallery + tabs)
│   ├── Controls (capture button)
│   └── PermissionDialog (if needed)
│
├── PreviewPage/
│   ├── PhotoDisplay (captured photo + frame)
│   ├── FrameSwitcher (quick frame change)
│   ├── EditPanel (brightness, contrast, etc)
│   ├── ExportOptions (download, share, print)
│   └── ActionButtons (download, share, retake)
│
├── HistoryPage/
│   ├── PhotoGrid
│   ├── PhotoDetail
│   └── PhotoActions
│
└── AdminPanel/ (if included)
    ├── FrameUpload
    ├── FrameManagement
    ├── UserManagement
    └── Analytics
```

**Key Libraries:**
```
- fabric.js: Advanced canvas/image manipulation
- html2canvas: Screenshot capability
- sharp (backend): Image processing
- react-hot-toast: Notifications
- zustand: State management
- axios: API calls
- react-router-dom: Navigation
```

### 7.2 Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x atau Fastify 4.x
- **Database:** PostgreSQL 14+
- **ORM:** Prisma 5+
- **File Storage:** AWS S3 atau Supabase Storage
- **Image Processing:** Sharp.js, ImageMagick
- **Cache:** Redis (optional)
- **Authentication:** JWT + bcrypt

**Directory Structure:**
```
backend/
├── src/
│   ├── routes/
│   │   ├── frames.js (GET, POST, DELETE)
│   │   ├── photos.js (POST, GET, DELETE)
│   │   ├── users.js (POST, GET, PUT)
│   │   └── auth.js (login, register)
│   │
│   ├── controllers/
│   │   ├── frameController.js
│   │   ├── photoController.js
│   │   └── userController.js
│   │
│   ├── models/
│   │   ├── Frame.js
│   │   ├── Photo.js
│   │   └── User.js
│   │
│   ├── middleware/
│   │   ├── auth.js (JWT verification)
│   │   ├── errorHandler.js
│   │   └── validation.js
│   │
│   ├── services/
│   │   ├── imageService.js
│   │   ├── storageService.js (S3)
│   │   └── emailService.js
│   │
│   └── app.js (main app)
│
├── prisma/
│   └── schema.prisma (database schema)
│
├── migrations/ (database migrations)
├── tests/
└── .env (configuration)
```

**API Endpoints:**

```
FRAMES
GET    /api/frames              - List all frames
GET    /api/frames/:id          - Get frame detail
POST   /api/frames              - Upload new frame (admin)
PUT    /api/frames/:id          - Update frame (admin)
DELETE /api/frames/:id          - Delete frame (admin)

PHOTOS
POST   /api/photos              - Upload/capture photo
GET    /api/photos/:id          - Get photo detail
GET    /api/photos              - List user's photos
DELETE /api/photos/:id          - Delete photo
POST   /api/photos/:id/download - Log download
POST   /api/photos/:id/share    - Generate share link

COMPOSITING
POST   /api/composite           - Composite photo + frame
POST   /api/composite/:id       - Re-composite with new frame

USERS
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - User login
GET    /api/users/:id           - Get user profile
PUT    /api/users/:id           - Update profile
DELETE /api/users/:id           - Delete account

PRINT (Phase 2)
POST   /api/print/order         - Create print order
GET    /api/print/orders/:id    - Get order status
```

### 7.3 Database Schema

```sql
-- FRAMES TABLE
CREATE TABLE frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  image_url TEXT NOT NULL,
  svg_data TEXT, -- optional: SVG content
  width INTEGER,
  height INTEGER,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  design_credit VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- PHOTOS TABLE
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  frame_id UUID REFERENCES frames(id),
  original_image_url TEXT NOT NULL,
  composite_image_url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  metadata JSONB, -- {brightness, contrast, saturation, etc}
  source VARCHAR(50), -- 'web', 'mobile'
  is_public BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  profile_picture_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- SHARE LINKS TABLE
CREATE TABLE share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID REFERENCES photos(id),
  share_token VARCHAR(255) UNIQUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRINT ORDERS TABLE (Phase 2)
CREATE TABLE print_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  photo_id UUID REFERENCES photos(id),
  print_size VARCHAR(50), -- '4x6', '5x7', etc
  quantity INTEGER,
  delivery_address TEXT,
  status VARCHAR(50), -- 'pending', 'processing', 'shipped', etc
  total_price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CREATE INDEXES
CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_frame_id ON photos(frame_id);
CREATE INDEX idx_photos_created_at ON photos(created_at);
CREATE INDEX idx_frames_category ON frames(category);
CREATE INDEX idx_users_email ON users(email);
```

### 7.4 Image Compositing Process

**Flow:**
1. User selects frame (frame_id)
2. Backend receives photo blob + frame_id
3. Backend:
   - Load original photo from request
   - Load frame template dari database
   - Resize photo to match frame dimensions
   - Layer photo under/over frame (depending on design)
   - Apply blending if needed
   - Export composite as high-quality image
   - Save to storage (S3)
   - Return composite_image_url

**Implementation (Node.js + Sharp):**
```javascript
async function compositePhotoWithFrame(photoBuffer, frameId) {
  try {
    // Get frame from DB
    const frame = await Frame.findById(frameId);
    
    // Load frame image
    const frameBuffer = await downloadFromS3(frame.image_url);
    
    // Resize photo to match frame dimensions
    const resizedPhoto = await sharp(photoBuffer)
      .resize(frame.width, frame.height, { fit: 'cover' })
      .toBuffer();
    
    // Composite: photo + frame (adjust based on frame design)
    const composite = await sharp(resizedPhoto)
      .composite([
        { input: frameBuffer, gravity: 'center' }
      ])
      .toBuffer();
    
    // Save composite
    const fileName = `composite_${Date.now()}.png`;
    const s3Url = await uploadToS3(composite, fileName);
    
    return s3Url;
  } catch (error) {
    throw new Error('Compositing failed: ' + error.message);
  }
}
```

### 7.5 Performance Specifications

| Metric | Target | Notes |
|--------|--------|-------|
| Page Load Time | < 2s | Including assets |
| Camera Init Time | < 1s | From permission grant |
| Frame Load Time | < 500ms per frame | Thumbnails |
| Photo Capture | Instant | No processing delay |
| Composite Render | < 2s | Server-side processing |
| Download Time | < 5s | For 1-3 MB file |
| API Response Time | < 500ms | p95 |
| Frame Switch | < 1s | Re-composite |

### 7.6 Browser Support

**Minimum Requirements:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile: iOS Safari 14+, Android Chrome 90+

**Camera API Support:**
- getUserMedia() API untuk video capture
- Canvas API untuk image manipulation
- Blob API untuk file handling

---

## 8. MONETIZATION STRATEGY

### 8.1 Free Tier
- Basic frame templates (20+ frames)
- Full photo capture & editing
- Download JPG (standard quality)
- Social media sharing
- No watermark (optional)
- Analytics for basic users

### 8.2 Premium Frames
- Unlock 50+ additional premium frames
- Exclusive designer frames
- Branded frames untuk corporate
- Price: $4.99 - $9.99 per month subscription

### 8.3 Print Service
- Offer physical print delivery
- Multiple sizes available
- Markup: 30-40% on print cost
- Sample prices:
  - 4x6: $2.99
  - 5x7: $4.99
  - 8x10: $7.99

### 8.4 Enterprise/Corporate
- Custom branded frames
- Unlimited frame uploads
- Advanced analytics
- Print integration
- Team management
- Price: Negotiated (min $500/month)

### 8.5 Event Package
- Customized photobooth untuk events
- Branded frames
- Event-specific landing page
- Real-time attendee gallery
- Print at event venue
- Price: $999 - $4999 depending on scope

---

## 9. SUCCESS METRICS & KPIs

### 9.1 User Metrics
- **DAU (Daily Active Users):** Target 5,000 by month 6
- **MAU (Monthly Active Users):** Target 25,000 by month 6
- **User Retention (Day 7):** ≥ 40%
- **User Retention (Day 30):** ≥ 25%

### 9.2 Engagement Metrics
- **Photos per Session:** ≥ 5
- **Avg Session Duration:** ≥ 10 minutes
- **Frame Switches per Photo:** ≥ 2 (showing value)
- **Download Rate:** ≥ 60% of captured photos
- **Share Rate:** ≥ 30% of captured photos

### 9.3 Quality Metrics
- **App Uptime:** ≥ 99.5%
- **Camera Init Latency:** < 1 second (p95)
- **Composite Render Time:** < 2 seconds (p95)
- **Zero 500+ Errors:** < 0.1% of requests

### 9.4 Business Metrics
- **CAC (Customer Acquisition Cost):** < $2 per user
- **LTV (Lifetime Value):** > $20 per user
- **Conversion to Premium:** ≥ 5% of users
- **Print Order Conversion:** ≥ 2% of users
- **Enterprise Sales:** 3+ deals per quarter

---

## 10. ROADMAP & TIMELINE

### Phase 1: MVP (Weeks 1-12)
**Release Target:** Month 3

**Features:**
- ✓ Camera capture
- ✓ 20+ basic frames
- ✓ Frame overlay & switching
- ✓ Photo editing (brightness/contrast/saturation)
- ✓ Download (JPG/PNG)
- ✓ Social sharing links
- ✓ Basic user accounts
- ✓ Admin frame upload

**Deliverables:**
- Frontend web app (React)
- Backend API (Node.js + Express)
- Database schema
- S3 storage integration
- Admin dashboard

### Phase 1.5: Polish & Launch (Weeks 10-12)
- User testing & feedback
- Bug fixes
- Performance optimization
- Marketing website
- Social media setup
- Soft launch to 100 beta users

### Phase 2: Growth & Premium (Month 4-6)
**Features:**
- Premium frame subscription
- Advanced editing (filters, text, stickers)
- User profiles & history
- Favorites & collections
- Mobile app (React Native)
- Print integration MVP
- Analytics dashboard for users

### Phase 3: Enterprise & Scale (Month 7-12)
**Features:**
- Custom frame builder
- Group/event mode
- Branded photobooth
- Event-specific gallery
- Team management
- Print fulfillment
- API untuk third-party integration
- White-label option

### Phase 4: Scale & Innovation (Year 2)
- AI-powered frame suggestions
- Augmented reality features
- Video recording capability
- Live streaming integration
- Multi-language support
- Offline capability
- Global payment processors

---

## 11. RISK ANALYSIS & MITIGATION

### 11.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Camera API not supported in older browsers | Medium | Medium | Document browser requirements, provide fallback UI |
| Image compositing performance issues | High | Medium | Pre-test with large images, optimize Sharp config, use CDN |
| S3 storage cost overrun | Medium | Medium | Implement image optimization, set storage limits |
| Server downtime | High | Low | Multi-region deployment, automated failover, monitoring |

### 11.2 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Low user adoption | High | Medium | Strong marketing, early influencer partnerships |
| Competition from existing tools | Medium | High | Focus on unique re-frame feature, superior UX |
| Bandwidth costs | Medium | Medium | CDN caching, image optimization, progressive loading |
| Print logistics complexity | Medium | Medium | Partner with established print service |
| User privacy/data concerns | High | Low | GDPR compliance, clear privacy policy, secure data handling |

### 11.3 Market Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| User preference for mobile-only | Medium | Medium | Develop iOS/Android app early |
| Seasonal demand fluctuation | Medium | High | Push B2B enterprise sales for stability |
| Privacy regulation changes | Medium | Low | Monitor regulations, build compliance early |

---

## 12. COMPLIANCE & SECURITY

### 12.1 Data Privacy
- GDPR compliant (user consent, data deletion, privacy policy)
- CCPA compliant (California users)
- Clear data retention policy (photos deleted after 90 days default)
- User can download/export their data
- No third-party data selling

### 12.2 Security
- JWT authentication dengan secure tokens
- HTTPS encryption untuk semua connections
- Password hashing dengan bcrypt
- Rate limiting pada API endpoints
- Input validation dan sanitization
- Regular security audits (quarterly)
- PCI compliance untuk payment processing (if print service)

### 12.3 Content Moderation
- Report inappropriate photo functionality
- Automated flag untuk explicit content (AI, optional)
- Manual review queue
- User suspension untuk violations
- Community guidelines documentation

### 12.4 Intellectual Property
- Clear ToS regarding frame designs
- User content copyright ownership
- Designer/creator attribution system
- DMCA compliance

---

## 13. SUCCESS CRITERIA FOR MVP LAUNCH

✓ **Must Have:**
1. Camera capture working on Chrome, Firefox, Safari desktop
2. 20+ frame templates with proper layering
3. Re-frame feature working flawlessly
4. Download functionality (JPG/PNG)
5. Basic editing (brightness, contrast, saturation)
6. Admin panel untuk frame management
7. <2 second page load time
8. <1 second camera init time
9. 99% successful photo captures
10. No critical bugs identified in QA

✓ **Should Have:**
1. Mobile responsiveness
2. Social sharing
3. Photo history
4. User accounts
5. Analytics tracking

✓ **Nice to Have:**
1. Print integration
2. Advanced filters
3. Sticker library
4. Crop tool
5. Animation effects

---

## 14. APPENDIX

### 14.1 Glossary
- **Frame/Template:** Design overlay yang ditempatkan di sekitar/atas foto
- **Compositing:** Process menggabungkan foto dengan frame design
- **Re-frame:** Fitur unik untuk mengganti frame pada foto yang sudah diambil
- **Watermark:** Logo atau text yang ditambahkan ke foto untuk branding
- **S3:** Amazon Simple Storage Service untuk file storage
- **API:** Application Programming Interface untuk komunikasi backend-frontend

### 14.2 Reference Links
- WebRTC getUserMedia: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- Fabric.js: http://fabricjs.com/
- Sharp.js: https://sharp.pixelplumbing.com/
- AWS S3: https://aws.amazon.com/s3/

### 14.3 Acceptance Testing Checklist

**Camera & Capture:**
- [ ] Camera permission request appears
- [ ] Camera stream loads within 3 seconds
- [ ] Take photo button capture working
- [ ] Photo resolution ≥ 1920x1080
- [ ] Works on mobile & desktop

**Frame Management:**
- [ ] 20+ frames loaded
- [ ] Frame list loads < 2 seconds
- [ ] Search/filter working
- [ ] Frame categories organized

**Re-frame Feature (CRITICAL):**
- [ ] Frame switch < 1 second
- [ ] Quality consistent across frames
- [ ] Can switch unlimited times
- [ ] No photo degradation

**Download:**
- [ ] Download button visible & clickable
- [ ] File downloads complete
- [ ] File format correct
- [ ] File size < 10MB
- [ ] Works on mobile browsers

**Editing:**
- [ ] Sliders responsive
- [ ] Edits apply real-time
- [ ] Reset button works
- [ ] Edit quality preserved

**Social Sharing:**
- [ ] Share buttons present
- [ ] Image quality maintained
- [ ] Links working
- [ ] QR code functional

**Performance:**
- [ ] Page load < 2 seconds
- [ ] Camera init < 1 second
- [ ] Composite render < 2 seconds
- [ ] No lag during interaction
- [ ] Smooth animations (60 FPS)

**Bugs/Issues:**
- [ ] No console errors
- [ ] No memory leaks
- [ ] Graceful error handling
- [ ] Proper error messages

---

**Document Owner:** Product Manager  
**Next Review Date:** 3 months after launch  
**Version History:** v1.0 - Initial PRD document
