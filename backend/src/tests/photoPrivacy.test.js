jest.mock('../lib/prisma', () => ({
  photo: { findUnique: jest.fn() },
}));

const prisma = require('../lib/prisma');
const { getSinglePhoto, hashAccessToken } = require('../services/photoService');

describe('Photo privacy', () => {
  const guestToken = 'guest-token-for-test';

  beforeEach(() => {
    prisma.photo.findUnique.mockReset();
    prisma.photo.findUnique.mockResolvedValue({
      id: 'anonymous-photo',
      userId: null,
      isPublic: false,
      guestAccessTokenHash: hashAccessToken(guestToken),
      frame: null,
    });
  });

  it('rejects anonymous access by photo id alone', async () => {
    await expect(getSinglePhoto('anonymous-photo', null, false)).rejects.toThrow('Forbidden');
  });

  it('allows the guest token that belongs to the photo', async () => {
    await expect(getSinglePhoto('anonymous-photo', null, false, guestToken)).resolves.toEqual(
      expect.objectContaining({ id: 'anonymous-photo' }),
    );
  });
});
