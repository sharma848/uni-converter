import { useState } from 'react';
import { X, File, Image as ImageIcon, GripVertical, Loader2 } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import { UploadedFile } from '@/lib/api';
import { fileApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface FilePreviewProps {
  file: UploadedFile;
  onRemove?: () => void;
  showRemove?: boolean;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  draggable?: boolean;
}

export function FilePreview({ 
  file, 
  onRemove, 
  showRemove = true,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  draggable = false
}: FilePreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isImage = file.mimetype.startsWith('image/');
  const isPdf = file.mimetype === 'application/pdf';
  const previewUrl = fileApi.getPreviewUrl(file.filename);

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        'relative group border rounded-lg p-3 bg-card transition-all duration-200',
        'hover:shadow-md hover:border-primary/50',
        isDragging && 'opacity-50 scale-95 border-primary shadow-lg',
        draggable && 'cursor-move'
      )}
    >
      <div className="flex items-start gap-3">
        {draggable && (
          <div className="flex-shrink-0 pt-1 text-muted-foreground hover:text-foreground transition-colors">
            <GripVertical className="w-4 h-4" />
          </div>
        )}
        
        <div className="flex-shrink-0 relative">
          {isImage ? (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                </div>
              )}
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <img
                src={previewUrl}
                alt={file.originalName}
                className={cn(
                  'w-20 h-20 object-cover transition-opacity duration-200',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(false);
                }}
              />
            </div>
          ) : isPdf ? (
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center shadow-sm">
              <File className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center shadow-sm">
              <File className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.originalName}</p>
          <p className="text-xs text-muted-foreground mt-1">{formatFileSize(file.size)}</p>
          {isImage && (
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
              {file.mimetype.split('/')[1]}
            </p>
          )}
        </div>

        {showRemove && onRemove && (
          <button
            onClick={onRemove}
            className="flex-shrink-0 p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface FileListProps {
  files: UploadedFile[];
  onRemove?: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  enableSorting?: boolean;
}

export function FileList({ files, onRemove, onReorder, enableSorting = false }: FileListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (files.length === 0) return null;

  const handleDragStart = (index: number) => {
    if (!enableSorting || !onReorder) return;
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!enableSorting || !onReorder || draggedIndex === null) return;
    e.preventDefault();
    if (draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!enableSorting || !onReorder || draggedIndex === null) return;
    e.preventDefault();
    
    if (draggedIndex !== dropIndex) {
      onReorder(draggedIndex, dropIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <div
          key={file.filename}
          className={cn(
            'transition-all duration-200',
            dragOverIndex === index && draggedIndex !== null && 'translate-y-2'
          )}
        >
          <FilePreview
            file={file}
            onRemove={onRemove ? () => onRemove(index) : undefined}
            isDragging={draggedIndex === index}
            draggable={enableSorting && files.length > 1}
            onDragStart={enableSorting ? () => handleDragStart(index) : undefined}
            onDragEnd={enableSorting ? handleDragEnd : undefined}
            onDragOver={enableSorting ? (e) => handleDragOver(e, index) : undefined}
            onDrop={enableSorting ? (e) => handleDrop(e, index) : undefined}
          />
        </div>
      ))}
    </div>
  );
}

