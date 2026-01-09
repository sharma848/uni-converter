import express from 'express';
import { initializeConversionSystem } from '../conversions/index.js';

const router = express.Router();

// Initialize conversion system (registry, storage, runner)
const { registry, runner } = initializeConversionSystem();

// GET /api/convert/types - Get all available conversion types
router.get('/types', (req, res) => {
  res.json({
    types: registry.getAllIds(),
    converters: registry.getHandlersInfo()
  });
});

// POST /api/convert/:type - Execute a conversion
router.post('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { files, options } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    // Execute conversion through runner
    const result = await runner.run(type, { files, options });
    
    res.json(result);
  } catch (error: any) {
    console.error('Conversion error:', error);
    res.status(500).json({ 
      error: error.message || 'Conversion failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export { router as conversionRouter };

