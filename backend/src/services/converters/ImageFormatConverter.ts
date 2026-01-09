import { IConverter, ConversionRequest, ConversionResult } from '../../types/IConverter.js';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const imageFormatConverter: IConverter = {
  getName: () => 'Image Format Converter',
  getDescription: () => 'Convert images between formats (PNG, JPG, WEBP) with resize, compress, and rotate options',
  
  async convert(request: ConversionRequest): Promise<ConversionResult> {
    const { files, options = {} } = request;
    const { 
      format = 'png', 
      quality = 90, 
      width, 
      height, 
      rotate = 0,
      compress = false 
    } = options;

    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const uploadsDir = path.join(__dirname, '../../../uploads');
    const outputsDir = path.join(__dirname, '../../../outputs');
    
    const filename = files[0];
    const filePath = path.join(uploadsDir, filename);
    const fileExt = filename.toLowerCase().split('.').pop();
    
    // Use sharp's streaming API for better memory efficiency
    // Sharp automatically handles streaming internally for large files
    let image: sharp.Sharp;
    
    try {
      if (fileExt === 'heic' || fileExt === 'heif') {
        // HEIC files require special handling
        image = sharp(filePath, {
          limitInputPixels: false,
          failOnError: true,
        });
      } else {
        image = sharp(filePath, {
          limitInputPixels: false, // Allow very large images
        });
      }

    // Apply transformations
    if (width || height) {
      image = image.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    if (rotate !== 0) {
      image = image.rotate(rotate);
    }

    // Convert format using streaming
    const outputFormat = format.toLowerCase();
    const outputFilename = `converted-${Date.now()}.${outputFormat}`;
    const outputPath = path.join(outputsDir, outputFilename);

    // Sharp's toFile() already uses streaming internally, but we can optimize further
    if (outputFormat === 'jpg' || outputFormat === 'jpeg') {
      await image
        .jpeg({ quality: compress ? Math.max(quality - 20, 50) : quality })
        .toFile(outputPath);
    } else if (outputFormat === 'webp') {
      await image
        .webp({ quality: compress ? Math.max(quality - 20, 50) : quality })
        .toFile(outputPath);
    } else {
      await image
        .png({ quality: compress ? Math.max(quality - 20, 50) : quality, compressionLevel: compress ? 9 : 6 })
        .toFile(outputPath);
    }

    const stats = await fs.stat(outputPath);
    const metadata = await sharp(outputPath).metadata();

    return {
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`,
      size: stats.size,
      metadata: {
        format: outputFormat,
        width: metadata.width,
        height: metadata.height,
        quality
      }
    };
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
};

