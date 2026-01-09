import { useState } from 'react';
import { X, GripVertical, Image as ImageIcon, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/utils';
import { UploadedFile } from '@/lib/api';
import { fileApi } from '@/lib/api';

interface FilePreviewListProps {
  files: UploadedFile[];
  onRemove: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  enableSorting?: boolean;
}

export function FilePreviewList({ 
  files, 
  onRemove, 
  onReorder,
  enableSorting = false 
}: FilePreviewListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

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

  const handleDrop = (e: React.DragEvent, index: number) => {
    if (!enableSorting || !onReorder || draggedIndex === null) return;
    e.preventDefault();
    if (draggedIndex !== index) {
      onReorder(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {files.length} {files.length === 1 ? 'image' : 'images'} ready
        </p>
        {enableSorting && files.length > 1 && (
          <p className="text-xs text-muted-foreground">
            Drag to change PDF order
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        {files.map((file, index) => {
          const isImage = file.mimetype.startsWith('image/');
          const isPdf = file.mimetype === 'application/pdf';
          const previewUrl = fileApi.getPreviewUrl(file.filename);
          const hasError = imageErrors.has(index);

          return (
            <div
              key={file.filename}
              className={cn(
                "group relative flex items-center gap-3 p-3 rounded-lg border bg-card transition-all",
                "hover:border-primary/50 hover:shadow-sm",
                draggedIndex === index && "opacity-50 scale-95",
                dragOverIndex === index && draggedIndex !== index && "border-primary translate-y-1"
              )}
              draggable={enableSorting}
              onDragStart={() => handleDragStart(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
            >
              {enableSorting && (
                <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-colors">
                  <GripVertical className="w-5 h-5" />
                </div>
              )}
              
              <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                {isImage && !hasError ? (
                  <img
                    src={previewUrl}
                    alt={file.originalName}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(index)}
                  />
                ) : isPdf ? (
                  <div className="w-full h-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <File className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.originalName}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>

              <button
                onClick={() => onRemove(index)}
                className="flex-shrink-0 p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

