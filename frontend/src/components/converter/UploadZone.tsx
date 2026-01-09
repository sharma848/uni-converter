import { useCallback, useState } from 'react';
import { Upload, FileUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
  multiple?: boolean;
  maxSize?: number;
  disabled?: boolean;
}

export function UploadZone({
  onFilesSelected,
  acceptedTypes = ['image/*', 'application/pdf', 'image/heic', 'image/heif'],
  multiple = true,
  maxSize = 100 * 1024 * 1024,
  disabled = false,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      if (file.size > maxSize) {
        errors.push(`${file.name} exceeds maximum size`);
        return;
      }

      const isValidType = acceptedTypes.some((type) => {
        if (type.endsWith('/*')) {
          const baseType = type.split('/')[0];
          return file.type.startsWith(baseType + '/');
        }
        return file.type === type;
      }) || /\.(heic|heif)$/i.test(file.name);

      if (!isValidType) {
        errors.push(`${file.name} is not a supported format`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors[0]);
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

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(files);
      
      if (validFiles.length > 0) {
        onFilesSelected(multiple ? validFiles : [validFiles[0]]);
      }
    },
    [onFilesSelected, multiple, maxSize, acceptedTypes, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      
      const files = Array.from(e.target.files || []);
      const validFiles = validateFiles(files);
      
      if (validFiles.length > 0) {
        onFilesSelected(multiple ? validFiles : [validFiles[0]]);
      }
      
      e.target.value = '';
    },
    [onFilesSelected, multiple, maxSize, acceptedTypes, disabled]
  );

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200',
          'bg-background',
          isDragging && !disabled
            ? 'border-primary bg-primary/5 scale-[1.01] shadow-lg'
            : 'border-border hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-destructive bg-destructive/5'
        )}
      >
        <input
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={cn(
            'p-4 rounded-full transition-all duration-200',
            isDragging && !disabled
              ? 'bg-primary/20 scale-110'
              : 'bg-muted'
          )}>
            {isDragging && !disabled ? (
              <FileUp className="w-10 h-10 text-primary" />
            ) : (
              <Upload className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          
          <div className="space-y-2">
            <p className={cn(
              'text-xl font-semibold transition-colors',
              isDragging && !disabled && 'text-primary'
            )}>
              {isDragging && !disabled ? 'Drop images here' : 'Drop images here or click to upload'}
            </p>
            <p className="text-sm text-muted-foreground">
              JPG, PNG, JPEG, GIF, WEBP, HEIC
            </p>
          </div>
        </div>
        
        {isDragging && !disabled && (
          <div className="absolute inset-0 bg-primary/5 rounded-xl" />
        )}
      </div>
      
      {error && (
        <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive animate-in slide-in-from-top-2">
          {error}
        </div>
      )}
    </div>
  );
}

