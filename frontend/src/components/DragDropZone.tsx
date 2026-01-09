import { useCallback, useState } from 'react';
import { Upload, File, X, FileUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/utils';

interface DragDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
  multiple?: boolean;
  maxSize?: number; // in bytes
}

export function DragDropZone({
  onFilesSelected,
  acceptedTypes = ['image/*', 'application/pdf', 'image/heic', 'image/heif'],
  multiple = true,
  maxSize = 100 * 1024 * 1024, // 100MB
}: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      if (file.size > maxSize) {
        errors.push(`${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`);
        return;
      }

      const isValidType = acceptedTypes.some((type) => {
        if (type.endsWith('/*')) {
          const baseType = type.split('/')[0];
          return file.type.startsWith(baseType + '/');
        }
        return file.type === type;
      }) || 
      // Also check file extension for HEIC files (browsers may not set correct mime type)
      /\.(heic|heif)$/i.test(file.name);

      if (!isValidType) {
        errors.push(`${file.name} is not an accepted file type`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      setTimeout(() => setError(null), 5000);
    } else {
      setError(null);
    }

    return validFiles;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(files);
      
      if (validFiles.length > 0) {
        onFilesSelected(multiple ? validFiles : [validFiles[0]]);
      }
    },
    [onFilesSelected, multiple, maxSize, acceptedTypes]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const validFiles = validateFiles(files);
      
      if (validFiles.length > 0) {
        onFilesSelected(multiple ? validFiles : [validFiles[0]]);
      }
      
      // Reset input
      e.target.value = '';
    },
    [onFilesSelected, multiple, maxSize, acceptedTypes]
  );

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ease-in-out',
          'transform',
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20'
            : 'border-border hover:border-primary/50 hover:bg-accent/50',
          error && 'border-destructive bg-destructive/5'
        )}
      >
        <input
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={cn(
            'p-4 rounded-full transition-all duration-300',
            isDragging 
              ? 'bg-primary/20 scale-110 animate-pulse' 
              : 'bg-muted hover:bg-muted/80'
          )}>
            {isDragging ? (
              <FileUp className={cn(
                'w-8 h-8 text-primary animate-bounce'
              )} />
            ) : (
              <Upload className={cn(
                'w-8 h-8 transition-colors',
                'text-muted-foreground group-hover:text-primary'
              )} />
            )}
          </div>
          
          <div className="space-y-2">
            <p className={cn(
              'text-lg font-medium transition-colors',
              isDragging && 'text-primary'
            )}>
              {isDragging ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse
            </p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Supported formats:</span>
              </p>
              <div className="flex flex-wrap gap-2 justify-center text-xs">
                <span className="px-2 py-1 bg-muted rounded-md text-muted-foreground">Images: JPG, PNG, GIF, WEBP, HEIC, HEIF</span>
                <span className="px-2 py-1 bg-muted rounded-md text-muted-foreground">Documents: PDF</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Max size: {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
        
        {isDragging && (
          <div className="absolute inset-0 bg-primary/5 rounded-lg animate-pulse" />
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive animate-in slide-in-from-top-2">
          {error}
        </div>
      )}
    </div>
  );
}

