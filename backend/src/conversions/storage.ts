/**
 * Local filesystem storage adapter
 * Implements StorageAdapter for local file operations
 * TODO: Future implementations could use S3, Azure Blob, etc.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import { StorageAdapter } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class LocalStorageAdapter implements StorageAdapter {
  private readonly uploadsDir: string;
  private readonly outputsDir: string;

  constructor() {
    this.uploadsDir = path.join(__dirname, '../../uploads');
    this.outputsDir = path.join(__dirname, '../../outputs');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.uploadsDir, { recursive: true });
    await fs.mkdir(this.outputsDir, { recursive: true });
  }

  getUploadPath(filename: string): string {
    return path.join(this.uploadsDir, filename);
  }

  getOutputPath(filename: string): string {
    return path.join(this.outputsDir, filename);
  }

  async readFile(filename: string): Promise<Buffer> {
    const filePath = this.getUploadPath(filename);
    return await fs.readFile(filePath);
  }

  async writeFile(filename: string, data: Buffer): Promise<void> {
    const filePath = this.getOutputPath(filename);
    await fs.writeFile(filePath, data);
  }

  async writeFileChunked(filename: string, data: Buffer, chunkSize: number = 1024 * 1024): Promise<void> {
    const filePath = this.getOutputPath(filename);
    
    if (data.length <= chunkSize) {
      // Small file, write directly
      await this.writeFile(filename, data);
      return;
    }

    // Large file, write in chunks
    const writeStream = createWriteStream(filePath);
    
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
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
  }

  async fileExists(filename: string): Promise<boolean> {
    try {
      const filePath = this.getUploadPath(filename);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getFileStats(filename: string): Promise<{ size: number }> {
    // Try upload path first, then output path
    let filePath = this.getUploadPath(filename);
    try {
      const stats = await fs.stat(filePath);
      return { size: stats.size };
    } catch {
      // If not in uploads, check outputs
      filePath = this.getOutputPath(filename);
      const stats = await fs.stat(filePath);
      return { size: stats.size };
    }
  }

  /**
   * Get output file stats
   */
  async getOutputFileStats(filename: string): Promise<{ size: number }> {
    const filePath = this.getOutputPath(filename);
    const stats = await fs.stat(filePath);
    return { size: stats.size };
  }
}

