const prisma = require('../lib/prisma');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Vercel's deployment filesystem is read-only. Keep serverless print files in
// its writable temporary directory and only create the directory on demand.
const printUploadsDir = process.env.PRINT_UPLOAD_DIR || (
  process.env.VERCEL
    ? path.join('/tmp', 'photobooth-print')
    : path.join(process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'), 'print')
);

function ensurePrintUploadsDir() {
  if (!fs.existsSync(printUploadsDir)) {
    fs.mkdirSync(printUploadsDir, { recursive: true });
  }
}

exports.createPrintJob = async (req, res, next) => {
  try {
    const { id, imageDataUrl, frameName, copies, sessionId, photoId } = req.body;
    
    if (!frameName || !copies) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Save image to local disk if provided (for reprint purposes)
    let imagePath = null;
    let jobId = id || crypto.randomUUID();
    
    if (imageDataUrl && imageDataUrl.startsWith('data:image')) {
      ensurePrintUploadsDir();
      const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
      const ext = imageDataUrl.split(';')[0].split('/')[1] || 'png';
      const filename = `${jobId}.${ext}`;
      imagePath = path.join(printUploadsDir, filename);
      fs.writeFileSync(imagePath, base64Data, 'base64');
    }

    const newJob = await prisma.printJob.create({
      data: {
        id: jobId,
        sessionId: sessionId || null,
        photoId: photoId || null,
        frameName,
        copies: parseInt(copies, 10),
        status: 'queued',
        attempts: 0,
      }
    });

    res.status(201).json({
      success: true,
      data: newJob,
      message: 'Print job created successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePrintJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, errorMessage, attempts } = req.body;

    const updatedJob = await prisma.printJob.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(errorMessage !== undefined && { errorMessage }),
        ...(attempts !== undefined && { attempts }),
      }
    });

    res.status(200).json({
      success: true,
      data: updatedJob
    });
  } catch (error) {
    next(error);
  }
};

exports.getPrintJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await prisma.printJob.findUnique({
      where: { id }
    });
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Print job not found' });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

exports.listPrintJobs = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    const jobs = await prisma.printJob.findMany({
      take: parseInt(limit, 10),
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

exports.getPrintJobImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // We assume PNG by default for print jobs
    const possibleExts = ['png', 'jpeg', 'jpg'];
    let foundPath = null;
    
    for (const ext of possibleExts) {
      const p = path.join(printUploadsDir, `${id}.${ext}`);
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (!foundPath) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    res.sendFile(foundPath);
  } catch (error) {
    next(error);
  }
};
