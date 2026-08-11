jest.mock('../lib/prisma', () => ({
  frame: { findMany: jest.fn(), findUnique: jest.fn() },
}));

const prisma = require('../lib/prisma');
const { getFrames, getFrameById } = require('../controllers/frameController');

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe('Frame controller', () => {
  it('returns frames with slots ordered by a real schema field', async () => {
    prisma.frame.findMany.mockResolvedValue([{ id: 'frame-1', slots: [{ zIndex: 0 }] }]);
    const res = createResponse();

    await getFrames({}, res);

    expect(prisma.frame.findMany).toHaveBeenCalledWith(expect.objectContaining({
      include: { slots: { orderBy: { zIndex: 'asc' } } },
    }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('uses the same valid slot ordering for a single frame', async () => {
    prisma.frame.findUnique.mockResolvedValue({ id: 'frame-1', slots: [] });
    const res = createResponse();

    await getFrameById({ params: { id: 'frame-1' } }, res);

    expect(prisma.frame.findUnique).toHaveBeenCalledWith({
      where: { id: 'frame-1' },
      include: { slots: { orderBy: { zIndex: 'asc' } } },
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
