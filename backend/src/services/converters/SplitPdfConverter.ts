import { IConverter, ConversionRequest, ConversionResult } from '../../types/IConverter.js';
import { PDFDocument } from 'pdf-lib';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const splitPdfConverter: IConverter = {
  getName: () => 'Split PDF',
  getDescription: () => 'Split a PDF into separate files by pages',
  
  async convert(request: ConversionRequest): Promise<ConversionResult> {
    const { files, options = {} } = request;
    const { pagesPerFile = 1 } = options; // Split every N pages

    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const uploadsDir = path.join(__dirname, '../../../uploads');
    const outputsDir = path.join(__dirname, '../../../outputs');
    
    const filename = files[0];
    const filePath = path.join(uploadsDir, filename);
    const pdfBytes = await fs.readFile(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    const totalPages = pdfDoc.getPageCount();
    const splitFiles: string[] = [];

    for (let start = 0; start < totalPages; start += pagesPerFile) {
      const end = Math.min(start + pagesPerFile, totalPages);
      const splitPdf = await PDFDocument.create();
      
      const pageIndices = Array.from({ length: end - start }, (_, i) => start + i);
      const pages = await splitPdf.copyPages(pdfDoc, pageIndices);
      pages.forEach((page) => splitPdf.addPage(page));

      const splitBytes = await splitPdf.save();
      const splitFilename = `split-pdf-${start + 1}-${end}-${Date.now()}.pdf`;
      const splitPath = path.join(outputsDir, splitFilename);
      
      await fs.writeFile(splitPath, splitBytes);
      splitFiles.push(splitFilename);
    }

    // If multiple splits, create a ZIP file
    if (splitFiles.length > 1) {
      const zipFilename = `split-pdf-${Date.now()}.zip`;
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
              totalPages,
              splitCount: splitFiles.length,
              pagesPerFile,
              splitFiles
            }
          });
        });

        archive.on('error', reject);
        archive.pipe(output);

        for (const splitFile of splitFiles) {
          const splitPath = path.join(outputsDir, splitFile);
          archive.file(splitPath, { name: splitFile });
        }

        archive.finalize();
      });
    } else {
      const stats = await fs.stat(path.join(outputsDir, splitFiles[0]));
      return {
        outputFile: splitFiles[0],
        outputPath: `/outputs/${splitFiles[0]}`,
        size: stats.size,
        metadata: {
          totalPages,
          splitCount: 1
        }
      };
    }
  }
};

