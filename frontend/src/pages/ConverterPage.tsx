import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { DragDropZone } from '@/components/DragDropZone';
import { FileList } from '@/components/FilePreview';
import { ConversionOptions } from '@/components/ConversionOptions';
import { ConversionProgress } from '@/components/ConversionProgress';
import { LoadingOverlay, Loader } from '@/components/ui/Loader';
import { fileApi, conversionApi, UploadedFile, getDownloadUrl } from '@/lib/api';
import { formatFileSize } from '@/lib/utils';

interface ConverterPageProps {
  conversionType: string;
  onBack: () => void;
}

export function ConverterPage({ conversionType, onBack }: ConverterPageProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [options, setOptions] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);

  const uploadMutation = useMutation({
    mutationFn: async (fileList: File[]) => {
      if (fileList.length === 1) {
        const result = await fileApi.upload(fileList[0]);
        return [result];
      } else {
        const result = await fileApi.uploadMultiple(fileList);
        return result.files;
      }
    },
    onSuccess: (uploadedFiles) => {
      setFiles((prev) => [...prev, ...uploadedFiles]);
    },
  });

  const convertMutation = useMutation({
    mutationFn: async () => {
      if (files.length === 0) {
        throw new Error('Please upload at least one file');
      }
      // Pass file order in options for converters that support it
      const conversionOptions = {
        ...options,
        order: files.map(f => f.filename),
      };
      return conversionApi.convert(conversionType, files.map(f => f.filename), conversionOptions);
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleFilesSelected = (fileList: File[]) => {
    uploadMutation.mutate(fileList);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const handleReorderFiles = (fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const [moved] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, moved);
      return newFiles;
    });
  };

  const handleConvert = () => {
    setResult(null);
    convertMutation.mutate();
  };

  const handleDownload = () => {
    if (result?.outputPath) {
      const url = getDownloadUrl(result.outputPath);
      window.open(url, '_blank');
    }
  };

  const requiresMultipleFiles = ['merge-pdf', 'combine-images'].includes(conversionType);
  const canConvert = files.length > 0 && (!requiresMultipleFiles || files.length >= 2);
  const isLoading = uploadMutation.isPending || convertMutation.isPending;

  return (
    <>
      <LoadingOverlay 
        isLoading={isLoading} 
        text={uploadMutation.isPending ? 'Uploading files...' : convertMutation.isPending ? 'Converting files...' : ''} 
      />
      <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Convert Files</h1>
          <p className="text-muted-foreground">Upload your files and customize conversion options</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>
                {requiresMultipleFiles
                  ? 'Upload at least 2 files for this conversion'
                  : 'Upload one or more files'}
                <br />
                <span className="text-xs mt-1 block">
                  Supported: Images (JPG, PNG, GIF, WEBP, HEIC, HEIF) • PDF
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {uploadMutation.isPending && (
                <div className="p-6 border rounded-lg bg-muted/50 flex items-center justify-center">
                  <Loader text="Uploading files..." />
                </div>
              )}
              
              {!uploadMutation.isPending && (
                <DragDropZone
                  onFilesSelected={handleFilesSelected}
                  multiple={true}
                />
              )}
              
              {files.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Uploaded Files ({files.length})</h3>
                    {files.length > 1 && (
                      <p className="text-xs text-muted-foreground">
                        Drag to reorder
                      </p>
                    )}
                  </div>
                  <FileList 
                    files={files} 
                    onRemove={handleRemoveFile}
                    onReorder={handleReorderFiles}
                    enableSorting={true}
                  />
                </div>
              )}

              {uploadMutation.isError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                  {uploadMutation.error instanceof Error
                    ? uploadMutation.error.message
                    : 'Upload failed'}
                </div>
              )}
            </CardContent>
          </Card>

          <ConversionOptions
            conversionType={conversionType}
            options={options}
            onChange={setOptions}
          />
        </div>

        <div className="space-y-6">
          {convertMutation.isPending && (
            <>
              <ConversionProgress
                progress={50}
                status="Processing your files..."
              />
              <Card>
                <CardContent className="pt-6">
                  <Loader size="lg" text="Converting files, please wait..." />
                </CardContent>
              </Card>
            </>
          )}

          {convertMutation.isError && (
            <Card>
              <CardContent className="pt-6">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive font-medium">Conversion Failed</p>
                  <p className="text-xs text-destructive/80 mt-1">
                    {convertMutation.error instanceof Error
                      ? convertMutation.error.message
                      : 'An error occurred during conversion'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Conversion Complete</CardTitle>
                <CardDescription>Your file has been converted successfully</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Output:</span> {result.outputFile}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Size:</span> {formatFileSize(result.size)}
                  </p>
                  {result.metadata && (
                    <div className="text-xs text-muted-foreground">
                      {Object.entries(result.metadata).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={handleDownload} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Result
                </Button>
              </CardContent>
            </Card>
          )}

          {!convertMutation.isPending && !result && (
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={handleConvert}
                  disabled={!canConvert}
                  className="w-full"
                  size="lg"
                >
                  {convertMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    'Convert Files'
                  )}
                </Button>
                {!canConvert && files.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Please upload files to continue
                  </p>
                )}
                {!canConvert && files.length > 0 && requiresMultipleFiles && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    This conversion requires at least 2 files
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

