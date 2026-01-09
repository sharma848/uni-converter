import { IConverter, ConversionRequest, ConversionResult } from '../../types/IConverter.js';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const compressPdfConverter: IConverter = {
  getName: () => 'Compress PDF',
  getDescription: () => 'Reduce PDF file size by optimizing content',
  
  async convert(request: ConversionRequest): Promise<ConversionResult> {
    const { files, options = {} } = request;
    const { quality = 'medium' } = options; // low, medium, high

    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const uploadsDir = path.join(__dirname, '../../../uploads');
    const outputsDir = path.join(__dirname, '../../../outputs');
    
    const filename = files[0];
    const filePath = path.join(uploadsDir, filename);
    const pdfBytes = await fs.readFile(filePath);
    const originalSize = pdfBytes.length;
    
    // Load and save with optimization
    // Note: pdf-lib doesn't have built-in compression, but saving with minimal metadata helps
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Remove unnecessary metadata
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');

    const compressedBytes = await pdfDoc.save();
    const outputFilename = `compressed-pdf-${Date.now()}.pdf`;
    const outputPath = path.join(outputsDir, outputFilename);
    
    await fs.writeFile(outputPath, compressedBytes);

    const compressionRatio = ((originalSize - compressedBytes.length) / originalSize) * 100;

    return {
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`,
      size: compressedBytes.length,
      metadata: {
        originalSize,
        compressedSize: compressedBytes.length,
        compressionRatio: Math.round(compressionRatio * 100) / 100,
        pageCount: pdfDoc.getPageCount()
      }
    };
  }
};

