# Conversion System Refactoring - Migration Notes

## Overview

The backend conversion system has been refactored to support a modular, scalable architecture while maintaining **100% backward compatibility** with existing functionality.

## What Changed

### New Architecture

1. **New Folder Structure**: `src/conversions/`
   - `types.ts` - Base interfaces and types
   - `registry.ts` - Central conversion registry
   - `storage.ts` - Storage abstraction (local filesystem)
   - `conversionRunner.ts` - Orchestrator for conversions
   - `handlers/` - Individual conversion handlers
   - `adapters/` - Adapters for legacy converters
   - `index.ts` - System initialization

2. **ConversionHandler Interface**
   - New base interface for all conversions
   - Includes metadata: id, name, description, supported formats, file limits
   - Uses StorageAdapter for file operations

3. **Storage Abstraction**
   - `StorageAdapter` interface for file operations
   - `LocalStorageAdapter` implementation (current)
   - TODO: Future implementations can use S3, Azure Blob, etc.

4. **Conversion Runner**
   - Validates file formats
   - Validates file counts
   - Validates file existence
   - Executes conversions through handlers

### Migrated Handlers

The following conversions have been migrated to the new `ConversionHandler` interface:
- ✅ `image-to-pdf` - New handler implementation
- ✅ `merge-pdf` - New handler implementation

### Legacy Converters (Backward Compatible)

The following converters still use the legacy `IConverter` interface but work through an adapter:
- `pdf-to-image` - Via `LegacyConverterAdapter`
- `split-pdf` - Via `LegacyConverterAdapter`
- `image-format` - Via `LegacyConverterAdapter`
- `compress-pdf` - Via `LegacyConverterAdapter`
- `combine-images` - Via `LegacyConverterAdapter`

**TODO**: Migrate these to new `ConversionHandler` interface incrementally.

## What Stayed the Same

- ✅ All API endpoints (`/api/convert/:type`, `/api/convert/types`)
- ✅ Request/response formats
- ✅ File upload behavior
- ✅ All existing conversions work exactly as before
- ✅ Frontend requires no changes

## Benefits

1. **Modularity**: Each conversion is a self-contained handler
2. **Scalability**: Easy to add new conversions
3. **Storage Abstraction**: Can migrate to cloud storage without changing conversion logic
4. **Validation**: Centralized validation in the runner
5. **Type Safety**: Strong TypeScript types throughout

## Adding New Conversions

### Option 1: New Handler (Recommended)

```typescript
// src/conversions/handlers/MyNewHandler.ts
import { ConversionHandler, ConversionResult, StorageAdapter } from '../types.js';

export class MyNewHandler implements ConversionHandler {
  readonly id = 'my-new-conversion';
  readonly name = 'My New Conversion';
  readonly description = 'Does something cool';
  readonly supportedInputFormats = ['jpg', 'png'];
  readonly supportedOutputFormats = ['pdf'];
  readonly minFiles = 1;
  readonly maxFiles = 10;

  async execute(
    files: string[],
    options: Record<string, any>,
    storage: StorageAdapter
  ): Promise<ConversionResult> {
    // Your conversion logic here
    // Use storage.getUploadPath(), storage.writeFile(), etc.
  }
}
```

Then register in `src/conversions/index.ts`:
```typescript
registry.register(new MyNewHandler());
```

### Option 2: Legacy Converter (Temporary)

Create a converter using the old `IConverter` interface, then wrap it:
```typescript
registry.register(new LegacyConverterAdapter(
  myLegacyConverter,
  'my-conversion-id',
  ['jpg', 'png'],
  ['pdf'],
  1,
  10
));
```

## Future Enhancements

- [ ] Migrate remaining legacy converters to new handlers
- [ ] Add cloud storage adapter (S3, Azure Blob)
- [ ] Add conversion queue system
- [ ] Add conversion progress tracking
- [ ] Add automatic cleanup of old files
- [ ] Add conversion caching

## Testing

All existing functionality should work without changes. Test:
1. File uploads
2. All conversion types
3. API responses
4. Error handling

## Rollback

If needed, the old system can be restored by reverting `src/routes/conversionRoutes.ts` to use the old `ConversionRegistry` directly.

