import { Progress } from './ui/Progress';
import { Card, CardContent } from './ui/Card';
import { Loader2 } from 'lucide-react';

interface ConversionProgressProps {
  progress: number;
  status?: string;
}

export function ConversionProgress({ progress, status }: ConversionProgressProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Converting...</span>
            </div>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
          {status && (
            <p className="text-xs text-muted-foreground">{status}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

