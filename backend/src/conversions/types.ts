/**
 * Base interface for all conversion handlers
 * This provides a consistent contract for all conversion operations
 */
export interface ConversionHandler {
  /**
   * Unique identifier for this conversion type
   */
  readonly id: string;
  
  /**
   * Human-readable name
   */
  readonly name: string;
  
  /**
   * Description of what this conversion does
   */
  readonly description: string;
  
  /**
   * Supported input file extensions (e.g., ['jpg', 'png', 'pdf'])
   */
  readonly supportedInputFormats: string[];
  
  /**
   * Supported output file extensions
   */
  readonly supportedOutputFormats: string[];
  
  /**
   * Minimum number of files required
   */
  readonly minFiles: number;
  
  /**
   * Maximum number of files allowed
   */
  readonly maxFiles: number;
  
  /**
   * Execute the conversion
   * @param files Array of file paths (relative to uploads directory)
   * @param options Conversion-specific options
   * @param storage Storage abstraction for file operations
   */
  execute(
    files: string[],
    options: Record<string, any>,
    storage: StorageAdapter
  ): Promise<ConversionResult>;
}

/**
 * Result of a conversion operation
 */
export interface ConversionResult {
  outputFile: string;
  outputPath: string;
  size: number;
  metadata?: Record<string, any>;
}

/**
 * Storage adapter abstraction for file operations
 * Allows for future migration to cloud storage without changing conversion logic
 */
export interface StorageAdapter {
  /**
   * Get the full path to an uploaded file
   */
  getUploadPath(filename: string): string;
  
  /**
   * Get the full path for an output file
   */
  getOutputPath(filename: string): string;
  
  /**
   * Read a file as a buffer
   */
  readFile(filename: string): Promise<Buffer>;
  
  /**
   * Write a file from a buffer
   */
  writeFile(filename: string, data: Buffer): Promise<void>;
  
  /**
   * Write a file in chunks (for large files)
   */
  writeFileChunked(filename: string, data: Buffer, chunkSize?: number): Promise<void>;
  
  /**
   * Check if a file exists
   */
  fileExists(filename: string): Promise<boolean>;
  
  /**
   * Get file stats (checks uploads first, then outputs)
   */
  getFileStats(filename: string): Promise<{ size: number }>;
  
  /**
   * Get output file stats
   */
  getOutputFileStats(filename: string): Promise<{ size: number }>;
}

