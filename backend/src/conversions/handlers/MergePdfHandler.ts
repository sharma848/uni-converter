/**
 * Merge PDF conversion handler
 * Combines multiple PDF files into a single document
 */
import { ConversionHandler, ConversionResult, StorageAdapter } from '../types.js';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';

export class MergePdfHandler implements ConversionHandler {
  readonly id = 'merge-pdf';
  readonly name = 'Merge PDFs';
  readonly description = 'Combine multiple PDF files into a single document';
  readonly supportedInputFormats = ['pdf'];
  readonly supportedOutputFormats = ['pdf'];
  readonly minFiles = 2;
  readonly maxFiles = 50; // Reasonable limit

  async execute(
    files: string[],
    options: Record<string, any>,
    storage: StorageAdapter
  ): Promise<ConversionResult> {
    const { order } = options; // Optional array specifying order
    const fileOrder = order || files;

    const mergedPdf = await PDFDocument.create();

    // Process PDFs one at a time to reduce memory usage
    for (const filename of fileOrder) {
      if (!files.includes(filename)) {
        continue; // Skip invalid filenames
      }

      const filePath = storage.getUploadPath(filename);
      
      // Read file in chunks for large files
      const stats = await storage.getFileStats(filename);
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
        pdfBytes = await storage.readFile(filename);
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
    
    // Convert Uint8Array to Buffer for file writing
    const pdfBuffer = Buffer.from(pdfBytes);
    
    await storage.writeFileChunked(outputFilename, pdfBuffer);

    const stats = await storage.getOutputFileStats(outputFilename);

    return {
      outputFile: outputFilename,
      outputPath: `/outputs/${outputFilename}`,
      size: stats.size,
      metadata: {
        sourceCount: files.length,
        totalPages: mergedPdf.getPageCount()
      }
    };
  }
}

