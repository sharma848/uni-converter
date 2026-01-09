/**
 * Conversion runner orchestrator
 * Validates requests and executes conversions through registered handlers
 */
import { ConversionRegistry } from './registry.js';
import { StorageAdapter, ConversionResult } from './types.js';
import path from 'path';

export interface ConversionRequest {
  files: string[];
  options?: Record<string, any>;
}

export class ConversionRunner {
  constructor(
    private registry: ConversionRegistry,
    private storage: StorageAdapter
  ) {}

  /**
   * Execute a conversion
   */
  async run(conversionId: string, request: ConversionRequest): Promise<ConversionResult> {
    // Get the handler
    const handler = this.registry.get(conversionId);
    if (!handler) {
      throw new Error(`Unknown conversion type: ${conversionId}`);
    }

    // Validate file count
    const fileCount = request.files?.length || 0;
    if (fileCount < handler.minFiles) {
      throw new Error(`This conversion requires at least ${handler.minFiles} file(s)`);
    }
    if (fileCount > handler.maxFiles) {
      throw new Error(`This conversion accepts at most ${handler.maxFiles} file(s)`);
    }

    // Validate file formats
    await this.validateFileFormats(request.files, handler.supportedInputFormats);

    // Validate files exist
    await this.validateFilesExist(request.files);

    // Execute the conversion
    try {
      const result = await handler.execute(
        request.files,
        request.options || {},
        this.storage
      );
      return result;
    } catch (error: any) {
      // Re-throw with context
      throw new Error(`Conversion failed: ${error.message}`);
    }
  }

  /**
   * Validate file formats match handler requirements
   */
  private async validateFileFormats(files: string[], supportedFormats: string[]): Promise<void> {
    for (const filename of files) {
      const ext = path.extname(filename).toLowerCase().slice(1); // Remove the dot
      if (!supportedFormats.includes(ext)) {
        throw new Error(
          `File ${filename} has unsupported format. Supported formats: ${supportedFormats.join(', ')}`
        );
      }
    }
  }

  /**
   * Validate all files exist in storage
   */
  private async validateFilesExist(files: string[]): Promise<void> {
    for (const filename of files) {
      const exists = await this.storage.fileExists(filename);
      if (!exists) {
        throw new Error(`File not found: ${filename}`);
      }
    }
  }
}

