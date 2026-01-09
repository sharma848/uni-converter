import { Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn, formatFileSize } from '@/lib/utils';

interface PrimaryActionButtonProps {
  state: 'idle' | 'uploading' | 'converting' | 'success' | 'error';
  onClick: () => void;
  onDownload?: () => void;
  disabled?: boolean;
  className?: string;
  fileSize?: number;
  pageCount?: number;
}

export function PrimaryActionButton({
  state,
  onClick,
  onDownload,
  disabled,
  className,
  fileSize,
  pageCount,
}: PrimaryActionButtonProps) {
  if (state === 'success' && onDownload) {
    return (
      <div className="space-y-3">
        <Button
          onClick={onDownload}
          size="lg"
          className={cn("w-full text-base font-semibold h-12", className)}
        >
          <Download className="w-5 h-5 mr-2" />
          Download PDF
        </Button>
        {(fileSize || pageCount) && (
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            {fileSize && <span>{formatFileSize(fileSize)}</span>}
            {pageCount && <span>{pageCount} {pageCount === 1 ? 'page' : 'pages'}</span>}
          </div>
        )}
      </div>
    );
  }

  const getButtonContent = () => {
    switch (state) {
      case 'uploading':
        return (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Uploading...
          </>
        );
      case 'converting':
        return (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Converting...
          </>
        );
      case 'error':
        return 'Try Again';
      default:
        return 'Convert to PDF';
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || state === 'uploading' || state === 'converting'}
      size="lg"
      className={cn(
        "w-full text-base font-semibold h-12",
        "shadow-lg hover:shadow-xl transition-shadow",
        className
      )}
    >
      {getButtonContent()}
    </Button>
  );
}

