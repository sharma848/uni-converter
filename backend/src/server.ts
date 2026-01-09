import express from 'express';
import cors from 'cors';
import { fileRouter } from './routes/fileRoutes.js';
import { conversionRouter } from './routes/conversionRoutes.js';
import { healthRouter } from './routes/healthRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve uploaded files with streaming support
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, filePath) => {
    // Enable range requests for streaming large files
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
}));
app.use('/outputs', express.static(path.join(__dirname, '../outputs'), {
  setHeaders: (res, filePath) => {
    // Enable range requests for streaming large files
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
}));

app.use('/api/files', fileRouter);
app.use('/api/convert', conversionRouter);
app.use('/api/health', healthRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

