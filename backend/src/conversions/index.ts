/**
 * Conversion system initialization
 * Sets up registry, storage, and runner
 */
import { ConversionRegistry } from './registry.js';
import { LocalStorageAdapter } from './storage.js';
import { ConversionRunner } from './conversionRunner.js';
import { ImageToPdfHandler } from './handlers/ImageToPdfHandler.js';
import { MergePdfHandler } from './handlers/MergePdfHandler.js';

// Legacy converters (to be migrated incrementally)
import { pdfToImageConverter } from '../services/converters/PdfToImageConverter.js';
import { splitPdfConverter } from '../services/converters/SplitPdfConverter.js';
import { imageFormatConverter } from '../services/converters/ImageFormatConverter.js';
import { compressPdfConverter } from '../services/converters/CompressPdfConverter.js';
import { combineImagesConverter } from '../services/converters/CombineImagesConverter.js';
import { LegacyConverterAdapter } from './adapters/LegacyConverterAdapter.js';

/**
 * Initialize the conversion system
 */
export function initializeConversionSystem(): {
  registry: ConversionRegistry;
  storage: LocalStorageAdapter;
  runner: ConversionRunner;
} {
  // Create storage adapter
  const storage = new LocalStorageAdapter();

  // Create registry
  const registry = new ConversionRegistry();

  // Register new handlers (migrated to new architecture)
  registry.register(new ImageToPdfHandler());
  registry.register(new MergePdfHandler());

  // Register legacy converters via adapter (backward compatibility)
  // TODO: Migrate these to new ConversionHandler interface incrementally
  registry.register(new LegacyConverterAdapter(
    pdfToImageConverter,
    'pdf-to-image',
    ['pdf'],
    ['png', 'jpg', 'jpeg'],
    1,
    1
  ));

  registry.register(new LegacyConverterAdapter(
    splitPdfConverter,
    'split-pdf',
    ['pdf'],
    ['pdf'],
    1,
    1
  ));

  registry.register(new LegacyConverterAdapter(
    imageFormatConverter,
    'image-format',
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'],
    ['png', 'jpg', 'jpeg', 'webp'],
    1,
    1
  ));

  registry.register(new LegacyConverterAdapter(
    compressPdfConverter,
    'compress-pdf',
    ['pdf'],
    ['pdf'],
    1,
    1
  ));

  registry.register(new LegacyConverterAdapter(
    combineImagesConverter,
    'combine-images',
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'],
    ['pdf', 'png'],
    2,
    50
  ));

  // Create runner
  const runner = new ConversionRunner(registry, storage);

  return { registry, storage, runner };
}

