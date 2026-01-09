import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

interface ConversionOptionsProps {
  options: {
    pageSize?: string;
    orientation?: string;
    margin?: string;
  };
  onChange: (options: { pageSize?: string; orientation?: string; margin?: string }) => void;
}

export function ConversionOptions({ options, onChange }: ConversionOptionsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="page-size" className="text-sm font-medium">
            Page Size
          </Label>
          <Select
            value={options.pageSize || 'auto'}
            onValueChange={(value: string) => onChange({ ...options, pageSize: value })}
          >
            <SelectTrigger id="page-size" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="A4">A4</SelectItem>
              <SelectItem value="letter">Letter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="orientation" className="text-sm font-medium">
            Orientation
          </Label>
          <Select
            value={options.orientation || 'auto'}
            onValueChange={(value: string) => onChange({ ...options, orientation: value })}
          >
            <SelectTrigger id="orientation" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="portrait">Portrait</SelectItem>
              <SelectItem value="landscape">Landscape</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="margin" className="text-sm font-medium">
            Margin
          </Label>
          <Select
            value={options.margin || 'none'}
            onValueChange={(value: string) => onChange({ ...options, margin: value })}
          >
            <SelectTrigger id="margin" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

