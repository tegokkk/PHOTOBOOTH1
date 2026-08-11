jest.mock('../lib/prisma', () => ({
  photo: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  shareLink: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
}));

const prisma = require('../lib/prisma');
const { hashAccessToken } = require('../services/photoService');
const { createShareLink, getSharedPhoto } = require('../controllers/shareController');

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe('Share controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects share creation for an anonymous photo without its guest token', async () => {
    prisma.photo.findUnique.mockResolvedValue({
      id: 'photo-1',
      userId: null,
      deletedAt: null,
      guestAccessTokenHash: hashAccessToken('correct-token'),
    });
    const res = createResponse();

    await createShareLink({ body: { photoId: 'photo-1' }, user: null, header: jest.fn() }, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('creates a share link for an anonymous photo with its guest token', async () => {
    prisma.photo.findUnique.mockResolvedValue({
      id: 'photo-1',
      userId: null,
      deletedAt: null,
      guestAccessTokenHash: hashAccessToken('correct-token'),
    });
    prisma.$transaction.mockResolvedValue([{
      token: 'share-token',
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
    }]);
    const res = createResponse();

    await createShareLink({
      body: { photoId: 'photo-1', accessToken: 'correct-token' },
      user: null,
      header: jest.fn(),
    }, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({ token: 'share-token' }),
    }));
  });

  it('rejects expired share metadata', async () => {
    prisma.shareLink.findUnique.mockResolvedValue({
      id: 'link-1',
      token: 'expired-token',
      expiresAt: new Date('2020-01-01T00:00:00.000Z'),
      photo: { deletedAt: null },
    });
    const res = createResponse();

    await getSharedPhoto({ params: { token: 'expired-token' }, headers: {} }, res);

    expect(res.status).toHaveBeenCalledWith(410);
    expect(prisma.shareLink.update).not.toHaveBeenCalled();
  });

  it('returns a media URL containing the share token', async () => {
    prisma.shareLink.findUnique.mockResolvedValue({
      id: 'link-1',
      token: 'valid-token',
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
      photo: {
        deletedAt: null,
        compositeImageUrl: '/api/media/photo.png',
        width: 1,
        height: 1,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        frame: null,
      },
    });
    const res = createResponse();

    await getSharedPhoto({
      params: { token: 'valid-token' },
      headers: { 'user-agent': 'Mozilla/5.0' },
    }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ imageUrl: '/api/media/photo.png?token=valid-token' }),
    }));
  });
});
