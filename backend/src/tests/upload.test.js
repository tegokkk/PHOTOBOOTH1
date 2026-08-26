jest.mock('../lib/prisma', () => ({
  frame: { findUnique: jest.fn() },
  photo: { findUnique: jest.fn(), create: jest.fn() },
}));

const fs = require('fs');
const path = require('path');
const os = require('os');
const prisma = require('../lib/prisma');
const { checkMagicBytes, processAndSavePhoto, hashAccessToken } = require('../services/photoService');

describe('Upload Validation', () => {
  describe('checkMagicBytes', () => {
    it('should return false for buffer smaller than 4 bytes', () => {
      const smallBuffer = Buffer.from([0x89, 0x50]);
      expect(checkMagicBytes(smallBuffer)).toBe(false);
    });

    it('should correctly identify a PNG file signature', () => {
      // 89 50 4E 47
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x00, 0x00, 0x00, 0x00]);
      expect(checkMagicBytes(pngBuffer)).toBe('png');
    });

    it('should correctly identify a JPEG file signature', () => {
      // FF D8 FF
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46]);
      expect(checkMagicBytes(jpegBuffer)).toBe('jpeg');
    });

    it('should return false for malicious/fake image files (wrong magic bytes)', () => {
      // Misal: Text file disguised as image
      const fakeBuffer = Buffer.from([0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F]); // "Hello Wo"
      expect(checkMagicBytes(fakeBuffer)).toBe(false);
    });
  });

  describe('processAndSavePhoto', () => {
    const validPngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    it('should reject if image data is missing', async () => {
      await expect(processAndSavePhoto({})).rejects.toThrow('Image data is required');
    });

    it('should reject invalid image format (not PNG or JPEG)', async () => {
      const invalidBase64 = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
      await expect(processAndSavePhoto({ compositeImageBase64: invalidBase64 })).rejects.toThrow('Invalid image format');
    });

    it('should reject if base64 data lacks actual magic bytes of image', async () => {
      // Just random base64 data of a text string: "Hello World"
      const fakeBase64 = 'data:image/png;base64,SGVsbG8gV29ybGQ=';
      await expect(processAndSavePhoto({ compositeImageBase64: fakeBase64 })).rejects.toThrow('Invalid file content. Real image file required.');
    });

    it('should reject if file exceeds 5MB', async () => {
      // We mock the image buffer length check
      const largeBase64 = 'data:image/png;base64,' + Buffer.alloc(6 * 1024 * 1024).toString('base64');
      await expect(processAndSavePhoto({ compositeImageBase64: largeBase64 })).rejects.toThrow('File too large. Maximum size is 5MB');
    });

    it('should save a valid anonymous PNG and return a guest access token', async () => {
      const uploadDir = path.join(os.tmpdir(), `photobooth-upload-test-${process.pid}`);
      process.env.UPLOAD_DIR = uploadDir;
      prisma.photo.create.mockResolvedValue({
        id: 'photo-test',
        compositeImageUrl: '/api/media/photo_test.png',
        userId: null,
      });

      const photo = await processAndSavePhoto({ compositeImageBase64: validPngBase64 });

      expect(photo.id).toBe('photo-test');
      expect(photo.guestAccessToken).toMatch(/^[a-f0-9]{64}$/);
      expect(prisma.photo.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          width: 1,
          height: 1,
          guestAccessTokenHash: hashAccessToken(photo.guestAccessToken),
        }),
      }));

      const createdFile = fs.readdirSync(uploadDir).find((file) => file.startsWith('photo_'));
      expect(createdFile).toBeDefined();
      fs.rmSync(uploadDir, { recursive: true, force: true });
    });

    it('should return the existing anonymous photo for a repeated idempotency key', async () => {
      prisma.photo.create.mockClear();
      const existingPhoto = {
        id: 'photo-existing',
        userId: null,
        compositeImageUrl: '/api/media/photo_existing.jpg',
      };
      prisma.photo.findUnique.mockResolvedValue(existingPhoto);

      const photo = await processAndSavePhoto({
        compositeImageBase64: validPngBase64,
        idempotencyKey: 'session-upload-key',
      });

      expect(photo).toEqual(expect.objectContaining({
        id: 'photo-existing',
        guestAccessToken: 'session-upload-key',
      }));
      expect(prisma.photo.create).not.toHaveBeenCalled();
    });
  });
});
