import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { createReadStream, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../uploads');
const outputsDir = path.join(__dirname, '../../outputs');

// Ensure directories exist
(async () => {
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.mkdir(outputsDir, { recursive: true });
})();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    // Allow common image formats including HEIC/HEIF
    const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|heic|heif|pdf)$/i;
    const allowedMimeTypes = /^(image\/(jpeg|jpg|png|gif|webp|heic|heif)|application\/pdf)$/i;
    
    const extname = allowedExtensions.test(path.extname(file.originalname));
    const mimetype = allowedMimeTypes.test(file.mimetype);
    
    // Also check for HEIC files that might have different mime types
    const filename = file.originalname.toLowerCase();
    const isHeic = filename.endsWith('.heic') || filename.endsWith('.heif');
    const isHeicMime = file.mimetype.toLowerCase().includes('heic') || 
                       file.mimetype.toLowerCase().includes('heif');
    
    if ((extname && mimetype) || isHeic || isHeicMime) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images (jpeg, jpg, png, gif, webp, heic, heif) and PDFs are allowed.'));
    }
  }
});

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    path: `/uploads/${req.file.filename}`
  });
});

router.post('/upload-multiple', upload.array('files', 20), (req, res) => {
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const files = (req.files as Express.Multer.File[]).map(file => ({
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    path: `/uploads/${file.filename}`
  }));

  res.json({ files });
});

router.get('/preview/:filename', async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  try {
    await fs.access(filePath);
    const stats = statSync(filePath);
    const fileSize = stats.size;
    const range = req.headers.range;

    if (range) {
      // Support range requests for video/audio streaming
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = createReadStream(filePath, { start, end });
      
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'application/octet-stream',
      };
      
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Stream the entire file
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'application/octet-stream',
      };
      res.writeHead(200, head);
      createReadStream(filePath).pipe(res);
    }
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'File not found' });
    } else {
      console.error('File preview error:', error);
      res.status(500).json({ error: 'Error serving file' });
    }
  }
});

export { router as fileRouter };

