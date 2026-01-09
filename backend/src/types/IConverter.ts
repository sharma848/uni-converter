export interface ConversionRequest {
  files: string[];
  options?: Record<string, any>;
}

export interface ConversionResult {
  outputFile: string;
  outputPath: string;
  size: number;
  metadata?: Record<string, any>;
}

export interface IConverter {
  getName(): string;
  getDescription(): string;
  convert(request: ConversionRequest): Promise<ConversionResult>;
}

