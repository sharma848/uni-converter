import { IConverter, ConversionRequest, ConversionResult } from '../../types/IConverter.js';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const pdfToImageConverter: IConverter = {
  getName: () => 'PDF to Image',
  getDescription: () => 'Convert PDF pages to images (PNG or JPG)',
  
  async convert(request: ConversionRequest): Promise<ConversionResult> {
    const { files, options = {} } = request;
    const { format = 'png', quality = 90, dpi = 150 } = options;

    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const uploadsDir = path.join(__dirname, '../../../uploads');
    const outputsDir = path.join(__dirname, '../../../outputs');

    // For now, process first PDF (can be extended for multiple)
    const filename = files[0];
    const filePath = path.join(uploadsDir, filename);
    const pdfBytes = await fs.readFile(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    
    const imageFiles: string[] = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();
      
      // NOTE: pdf-lib doesn't support rendering PDF pages to images.
      // This is a placeholder implementation that creates blank images with correct dimensions.
      // For production use, implement proper PDF rendering using one of:
      // 1. pdf-poppler (requires poppler-utils installed on system)
      // 2. pdfjs-dist with canvas (requires canvas package)
      // 3. External service/API for PDF rendering
      
      const canvasWidth = Math.round(width * (dpi / 72));
      const canvasHeight = Math.round(height * (dpi / 72));
      
      // Placeholder: Create blank image with PDF page dimensions
      const imageBuffer = await sharp({
        create: {
          width: canvasWidth,
          height: canvasHeight,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
      .png()
      .toBuffer();

      const imageFilename = `pdf-page-${i + 1}-${Date.now()}.${format}`;
      const imagePath = path.join(outputsDir, imageFilename);
      
      if (format === 'jpg' || format === 'jpeg') {
        await sharp(imageBuffer)
          .jpeg({ quality })
          .toFile(imagePath);
      } else {
        await sharp(imageBuffer)
          .png({ quality })
          .toFile(imagePath);
      }

      imageFiles.push(imageFilename);
    }

    // If multiple pages, create a ZIP file
    if (imageFiles.length > 1) {
      const zipFilename = `pdf-to-images-${Date.now()}.zip`;
      const zipPath = path.join(outputsDir, zipFilename);
      
      return new Promise((resolve, reject) => {
        const output = createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', async () => {
          const stats = await fs.stat(zipPath);
          resolve({
            outputFile: zipFilename,
            outputPath: `/outputs/${zipFilename}`,
            size: stats.size,
            metadata: {
              pageCount: pages.length,
              format,
              imageFiles
            }
          });
        });

        archive.on('error', reject);
        archive.pipe(output);

        for (const imageFile of imageFiles) {
          const imagePath = path.join(outputsDir, imageFile);
          archive.file(imagePath, { name: imageFile });
        }

        archive.finalize();
      });
    } else {
      const stats = await fs.stat(path.join(outputsDir, imageFiles[0]));
      return {
        outputFile: imageFiles[0],
        outputPath: `/outputs/${imageFiles[0]}`,
        size: stats.size,
        metadata: {
          pageCount: 1,
          format
        }
      };
    }
  }
};

