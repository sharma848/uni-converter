import { IConverter, ConversionRequest, ConversionResult } from '../../types/IConverter.js';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const mergePdfConverter: IConverter = {
  getName: () => 'Merge PDFs',
  getDescription: () => 'Combine multiple PDF files into a single document',
  
  async convert(request: ConversionRequest): Promise<ConversionResult> {
    const { files, options = {} } = request;
    const { order } = options; // Optional array specifying order

    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    if (files.length < 2) {
      throw new Error('At least 2 PDF files are required for merging');
    }

    const uploadsDir = path.join(__dirname, '../../../uploads');
    const outputsDir = path.join(__dirname, '../../../outputs');
    
    const mergedPdf = await PDFDocument.create();
    const fileOrder = order || files;

    // Process PDFs one at a time to reduce memory usage
    for (const filename of fileOrder) {
      if (!files.includes(filename)) {
        continue; // Skip invalid filenames
      }

      const filePath = path.join(uploadsDir, filename);
      
      // Read file in chunks for large files
      const stats = await fs.stat(filePath);
      let pdfBytes: Buffer;
      
      if (stats.size > 10 * 1024 * 1024) { // 10MB threshold
        // For large files, read in chunks
        const chunks: Buffer[] = [];
        const chunkSize = 1024 * 1024; // 1MB chunks
        const fileHandle = await fs.open(filePath, 'r');
        
        try {
          for (let offset = 0; offset < stats.size; offset += chunkSize) {
            const length = Math.min(chunkSize, stats.size - offset);
            const chunk = Buffer.alloc(length);
            await fileHandle.read(chunk, 0, length, offset);
            chunks.push(chunk);
          }
          pdfBytes = Buffer.concat(chunks);
        } finally {
          await fileHandle.close();
        }
      } else {
        pdfBytes = await fs.readFile(filePath);
      }
      
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
      
      // Clear references to help GC
      pdfBytes = null as any;
    }

    // Save PDF with chunked writing for large files
    const pdfBytes = await mergedPdf.save();
    const outputFilename = `merged-pdf-${Date.now()}.pdf`;
    const outputPath = path.join(outputsDir, outputFilename);
    
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
        sourceCount: files.length,
        totalPages: mergedPdf.getPageCount()
      }
    };
  }
};

