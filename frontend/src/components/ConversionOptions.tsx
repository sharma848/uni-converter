import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Label } from './ui/Label';

interface ConversionOptionsProps {
  conversionType: string;
  options: Record<string, any>;
  onChange: (options: Record<string, any>) => void;
}

export function ConversionOptions({ conversionType, options, onChange }: ConversionOptionsProps) {
  const updateOption = (key: string, value: any) => {
    onChange({ ...options, [key]: value });
  };

  const renderOptions = () => {
    switch (conversionType) {
      case 'image-to-pdf':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="pageSize">Page Size</Label>
              <select
                id="pageSize"
                value={options.pageSize || 'A4'}
                onChange={(e) => updateOption('pageSize', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="A4">A4</option>
                <option value="letter">Letter</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quality">Quality</Label>
              <Input
                id="quality"
                type="number"
                min="1"
                max="100"
                value={options.quality || 90}
                onChange={(e) => updateOption('quality', parseInt(e.target.value))}
              />
            </div>
          </>
        );

      case 'pdf-to-image':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="format">Output Format</Label>
              <select
                id="format"
                value={options.format || 'png'}
                onChange={(e) => updateOption('format', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="jpeg">JPEG</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quality">Quality</Label>
              <Input
                id="quality"
                type="number"
                min="1"
                max="100"
                value={options.quality || 90}
                onChange={(e) => updateOption('quality', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dpi">DPI</Label>
              <Input
                id="dpi"
                type="number"
                min="72"
                max="300"
                value={options.dpi || 150}
                onChange={(e) => updateOption('dpi', parseInt(e.target.value))}
              />
            </div>
          </>
        );

      case 'image-format':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="format">Output Format</Label>
              <select
                id="format"
                value={options.format || 'png'}
                onChange={(e) => updateOption('format', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="webp">WEBP</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quality">Quality</Label>
              <Input
                id="quality"
                type="number"
                min="1"
                max="100"
                value={options.quality || 90}
                onChange={(e) => updateOption('quality', parseInt(e.target.value))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={options.width || ''}
                  onChange={(e) => updateOption('width', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Auto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={options.height || ''}
                  onChange={(e) => updateOption('height', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="Auto"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rotate">Rotate (degrees)</Label>
              <Input
                id="rotate"
                type="number"
                min="0"
                max="360"
                value={options.rotate || 0}
                onChange={(e) => updateOption('rotate', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.compress || false}
                  onChange={(e) => updateOption('compress', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Compress image</span>
              </label>
            </div>
          </>
        );

      case 'split-pdf':
        return (
          <div className="space-y-2">
            <Label htmlFor="pagesPerFile">Pages per File</Label>
            <Input
              id="pagesPerFile"
              type="number"
              min="1"
              value={options.pagesPerFile || 1}
              onChange={(e) => updateOption('pagesPerFile', parseInt(e.target.value))}
            />
          </div>
        );

      case 'compress-pdf':
        return (
          <div className="space-y-2">
            <Label htmlFor="quality">Compression Quality</Label>
            <select
              id="quality"
              value={options.quality || 'medium'}
              onChange={(e) => updateOption('quality', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="low">Low (smaller file)</option>
              <option value="medium">Medium</option>
              <option value="high">High (better quality)</option>
            </select>
          </div>
        );

      case 'combine-images':
        return (
          <div className="space-y-2">
            <Label htmlFor="outputType">Output Type</Label>
            <select
              id="outputType"
              value={options.outputType || 'pdf'}
              onChange={(e) => updateOption('outputType', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="pdf">PDF Document</option>
              <option value="image">Single Vertical Image</option>
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Options</CardTitle>
        <CardDescription>Customize your conversion settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderOptions()}
      </CardContent>
    </Card>
  );
}

