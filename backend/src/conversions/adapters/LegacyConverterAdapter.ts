/**
 * Adapter to bridge legacy IConverter interface with new ConversionHandler interface
 * This allows existing converters to work with the new system without modification
 */
import { ConversionHandler, StorageAdapter, ConversionResult } from '../types.js';
import { IConverter, ConversionRequest as LegacyRequest } from '../../types/IConverter.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Wraps a legacy IConverter to work as a ConversionHandler
 */
export class LegacyConverterAdapter implements ConversionHandler {
  private readonly uploadsDir: string;
  private readonly outputsDir: string;

  constructor(
    private readonly legacyConverter: IConverter,
    public readonly id: string,
    public readonly supportedInputFormats: string[],
    public readonly supportedOutputFormats: string[],
    public readonly minFiles: number = 1,
    public readonly maxFiles: number = 50
  ) {
    this.uploadsDir = path.join(__dirname, '../../../uploads');
    this.outputsDir = path.join(__dirname, '../../../outputs');
  }

  get name(): string {
    return this.legacyConverter.getName();
  }

  get description(): string {
    return this.legacyConverter.getDescription();
  }

  async execute(
    files: string[],
    options: Record<string, any>,
    storage: StorageAdapter
  ): Promise<ConversionResult> {
    // Convert to legacy request format
    const legacyRequest: LegacyRequest = {
      files,
      options
    };

    // Execute legacy converter
    // Note: Legacy converters use their own file paths, so we need to ensure
    // the storage adapter paths match what they expect
    const result = await this.legacyConverter.convert(legacyRequest);

    return {
      outputFile: result.outputFile,
      outputPath: result.outputPath,
      size: result.size,
      metadata: result.metadata
    };
  }
}

