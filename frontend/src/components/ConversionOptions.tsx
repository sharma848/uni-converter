import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Select } from './ui/Select';
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
              <Select
                id="pageSize"
                value={options.pageSize || 'A4'}
                onChange={(e) => updateOption('pageSize', e.target.value)}
              >
                <option value="A4">A4</option>
                <option value="letter">Letter</option>
              </Select>
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
              <Select
                id="format"
                value={options.format || 'png'}
                onChange={(e) => updateOption('format', e.target.value)}
              >
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="jpeg">JPEG</option>
              </Select>
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
              <Select
                id="format"
                value={options.format || 'png'}
                onChange={(e) => updateOption('format', e.target.value)}
              >
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="webp">WEBP</option>
              </Select>
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
            <Select
              id="quality"
              value={options.quality || 'medium'}
              onChange={(e) => updateOption('quality', e.target.value)}
            >
              <option value="low">Low (smaller file)</option>
              <option value="medium">Medium</option>
              <option value="high">High (better quality)</option>
            </Select>
          </div>
        );

      case 'combine-images':
        return (
          <div className="space-y-2">
            <Label htmlFor="outputType">Output Type</Label>
            <Select
              id="outputType"
              value={options.outputType || 'pdf'}
              onChange={(e) => updateOption('outputType', e.target.value)}
            >
              <option value="pdf">PDF Document</option>
              <option value="image">Single Vertical Image</option>
            </Select>
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

