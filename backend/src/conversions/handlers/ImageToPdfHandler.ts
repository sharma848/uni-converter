/**
 * Image to PDF conversion handler
 * Converts one or more images into a single PDF document
 */
import { ConversionHandler, ConversionResult, StorageAdapter } from '../types.js';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

export class ImageToPdfHandler implements ConversionHandler {
  readonly id = 'image-to-pdf';
  readonly name = 'Image to PDF';
  readonly description = 'Convert one or more images to a single PDF document';
  readonly supportedInputFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'];
  readonly supportedOutputFormats = ['pdf'];
  readonly minFiles = 1;
  readonly maxFiles = 50; // Reasonable limit

  async execute(
    files: string[],
    options: Record<string, any>,
    storage: StorageAdapter
  ): Promise<ConversionResult> {
    const { quality = 90, pageSize = 'A4' } = options;

    const pdfDoc = await PDFDocument.create();

    // Process images one at a time to reduce memory usage
    for (const filename of files) {
      const filePath = storage.getUploadPath(filename);
      const fileExt = filename.toLowerCase().split('.').pop();
      
      try {
        // Use sharp streaming API for large images
        // For HEIC files, Sharp may need additional system dependencies
        let pngBuffer: Buffer;
        
        if (fileExt === 'heic' || fileExt === 'heif') {
          // HEIC files require special handling
          // Try with explicit format hint and failOnError
          pngBuffer = await sharp(filePath, {
            limitInputPixels: false,
            failOnError: true,
            // Explicitly set format for HEIC
          })
            .png({ quality, compressionLevel: 9 })
            .toBuffer();
        } else {
          pngBuffer = await sharp(filePath, {
            limitInputPixels: false, // Allow very large images
          })
            .png({ quality, compressionLevel: 9 })
            .toBuffer();
        }

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
      } catch (error: any) {
        // Provide helpful error message for HEIC files
        if (fileExt === 'heic' || fileExt === 'heif') {
          if (error.message?.includes('corrupt') || error.message?.includes('heif')) {
            throw new Error(
              `HEIC file "${filename}" appears to be corrupted or incompatible. ` +
              `Please try converting it to JPG/PNG first, or ensure the file is a valid HEIC image. ` +
              `Original error: ${error.message}`
            );
          }
          throw new Error(
            `Failed to process HEIC file "${filename}". ` +
            `HEIC support requires system dependencies. ` +
            `Error: ${error.message}`
          );
        }
        throw new Error(`Failed to process image "${filename}": ${error.message}`);
      }
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const outputFilename = `image-to-pdf-${Date.now()}.pdf`;
    
    // Use chunked writing for large files
    await storage.writeFileChunked(outputFilename, pdfBytes);

    const stats = await storage.getOutputFileStats(outputFilename);

    return {
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`,
      size: stats.size,
      metadata: {
        pageCount: files.length,
        pageSize
      }
    };
  }
}

