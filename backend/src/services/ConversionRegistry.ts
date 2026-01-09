import { IConverter } from '../types/IConverter.js';

export class ConversionRegistry {
  private converters: Map<string, IConverter> = new Map();

  register(type: string, converter: IConverter): void {
    this.converters.set(type, converter);
  }

  get(type: string): IConverter | undefined {
    return this.converters.get(type);
  }

  getAllTypes(): string[] {
    return Array.from(this.converters.keys());
  }

  getConvertersInfo(): Array<{ type: string; name: string; description: string }> {
    return Array.from(this.converters.entries()).map(([type, converter]) => ({
      type,
      name: converter.getName(),
      description: converter.getDescription()
    }));
  }
}

