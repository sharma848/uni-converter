import { IConverter, ConversionRequest, ConversionResult } from '../../types/IConverter.js';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const imageToPdfConverter: IConverter = {
  getName: () => 'Image to PDF',
  getDescription: () => 'Convert one or more images to a single PDF document',
  
  async convert(request: ConversionRequest): Promise<ConversionResult> {
    const { files, options = {} } = request;
    const { quality = 90, pageSize = 'A4' } = options;

    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const pdfDoc = await PDFDocument.create();
    const uploadsDir = path.join(__dirname, '../../../uploads');
    const outputsDir = path.join(__dirname, '../../../outputs');

    // Process images one at a time to reduce memory usage
    for (const filename of files) {
      const filePath = path.join(uploadsDir, filename);
      
      // Use sharp streaming API for large images
      // Sharp automatically handles memory efficiently for large files
      const pngBuffer = await sharp(filePath, {
        limitInputPixels: false, // Allow very large images
      })
        .png({ quality, compressionLevel: 9 })
        .toBuffer();

      const image = await pdfDoc.embedPng(pngBuffer);
      const { width, height } = image.scale(1);
      
      // Calculate page dimensions
      let pageWidth = 595; // A4 width in points
      let pageHeight = 842; // A4 height in points
      
      if (pageSize === 'letter') {
        pageWidth = 612;
        pageHeight = 792;
      }

      // Fit image to page while maintaining aspect ratio
      const scale = Math.min(pageWidth / width, pageHeight / height);
      const scaledWidth = width * scale;
      const scaledHeight = height * scale;
      const x = (pageWidth - scaledWidth) / 2;
      const y = (pageHeight - scaledHeight) / 2;

      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawImage(image, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });
      
      // Clear buffer reference to help GC
      pngBuffer.fill(0);
    }

    // Stream PDF save to file instead of loading full buffer
    const outputFilename = `image-to-pdf-${Date.now()}.pdf`;
    const outputPath = path.join(outputsDir, outputFilename);
    
    const pdfBytes = await pdfDoc.save();
    // For very large PDFs, we could stream, but pdf-lib doesn't support streaming
    // So we write in chunks if the file is large
    if (pdfBytes.length > 10 * 1024 * 1024) { // 10MB threshold
      // Write in chunks for large files
      const chunkSize = 1024 * 1024; // 1MB chunks
      const writeStream = createWriteStream(outputPath);
      
      for (let i = 0; i < pdfBytes.length; i += chunkSize) {
        const chunk = pdfBytes.slice(i, i + chunkSize);
        await new Promise<void>((resolve, reject) => {
          writeStream.write(chunk, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
      writeStream.end();
      await new Promise<void>((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    } else {
      await fs.writeFile(outputPath, pdfBytes);
    }

    return {
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`,
      size: pdfBytes.length,
      metadata: {
        pageCount: files.length,
        pageSize
      }
    };
  }
};

