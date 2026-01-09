import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { UploadZone } from '@/components/converter/UploadZone';
import { FilePreviewList } from '@/components/converter/FilePreviewList';
import { ConversionOptions } from '@/components/converter/ConversionOptions';
import { PrimaryActionButton } from '@/components/converter/PrimaryActionButton';
import { TrustSignals } from '@/components/converter/TrustSignals';
import { LoadingOverlay } from '@/components/ui/Loader';
import { fileApi, conversionApi, UploadedFile, getDownloadUrl } from '@/lib/api';
import { SEOHead } from '@/components/SEOHead';

export function ImageToPdfLanding() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [options, setOptions] = useState<{ pageSize?: string; orientation?: string; margin?: string }>({
    pageSize: 'auto',
    orientation: 'auto',
    margin: 'none',
  });
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
        throw new Error('Please upload at least one image');
      }
      const conversionOptions = {
        quality: 90,
        pageSize: options.pageSize === 'auto' ? 'A4' : options.pageSize,
        order: files.map(f => f.filename),
      };
      return conversionApi.convert('image-to-pdf', files.map(f => f.filename), conversionOptions);
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

  const handleReorder = (fromIndex: number, toIndex: number) => {
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

  const getButtonState = (): 'idle' | 'uploading' | 'converting' | 'success' | 'error' => {
    if (uploadMutation.isPending) return 'uploading';
    if (convertMutation.isPending) return 'converting';
    if (result) return 'success';
    if (convertMutation.isError) return 'error';
    return 'idle';
  };

  const isLoading = uploadMutation.isPending || convertMutation.isPending;

  return (
    <>
      <SEOHead
        title="Image to PDF Converter – Free, Fast & Secure | UniConvert"
        description="Convert JPG, PNG, and images to PDF instantly. Free online image to PDF converter with no watermark, no signup, and secure processing."
        canonicalUrl={`${window.location.origin}/image-to-pdf`}
      />
      
      <LoadingOverlay 
        isLoading={isLoading} 
        text={uploadMutation.isPending ? 'Uploading images...' : 'Converting to PDF...'} 
      />
      
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section - Above the Fold */}
        <section className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Image to PDF Converter
            </h1>
            <p className="text-lg text-muted-foreground">
              Convert images to PDF instantly — free, no signup
            </p>
          </div>

          {/* Upload Zone */}
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <UploadZone
              onFilesSelected={handleFilesSelected}
              multiple={true}
              disabled={isLoading}
            />
          </div>

          {/* File Preview List */}
          {files.length > 0 && (
            <div className="bg-card border rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <FilePreviewList
                files={files}
                onRemove={handleRemoveFile}
                onReorder={handleReorder}
                enableSorting={files.length > 1}
              />
            </div>
          )}

          {/* Conversion Options */}
          {files.length > 0 && (
            <div className="bg-card border rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <ConversionOptions
                options={options}
                onChange={setOptions}
              />
            </div>
          )}

          {/* Primary CTA */}
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <PrimaryActionButton
              state={getButtonState()}
              onClick={handleConvert}
              onDownload={handleDownload}
              disabled={files.length === 0}
              fileSize={result?.size}
              pageCount={result?.metadata?.pageCount}
            />
          </div>

          {/* Error State */}
          {convertMutation.isError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 animate-in slide-in-from-top-2">
              <p className="text-sm text-destructive font-medium">Conversion Failed</p>
              <p className="text-xs text-destructive/80 mt-1">
                {convertMutation.error instanceof Error
                  ? convertMutation.error.message
                  : 'An error occurred. Please try again.'}
              </p>
            </div>
          )}

          {/* Trust Signals */}
          <TrustSignals />
        </section>

        {/* SEO Content - Below the Fold */}
        <section className="space-y-8 pt-12 pb-12">
          <div>
            <h2 className="text-3xl font-bold mb-4">Convert Images to PDF Online for Free</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-muted-foreground">
              <p>
                Our free image to PDF converter allows you to transform JPG, PNG, GIF, WEBP, and HEIC images into professional PDF documents instantly. Whether you need to combine multiple photos into a single PDF or convert a single image, our tool handles it seamlessly.
              </p>
              <p>
                The conversion process is straightforward: upload your images, adjust settings if needed, and download your PDF. All processing happens securely on our servers, and your files are automatically deleted after conversion for your privacy.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">How to Convert Image to PDF</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Upload Your Images</h3>
                  <p className="text-muted-foreground text-sm">
                    Drag and drop your image files into the upload area, or click to browse and select files from your device. You can upload multiple images at once to create a multi-page PDF.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Adjust Settings (Optional)</h3>
                  <p className="text-muted-foreground text-sm">
                    Choose your preferred page size, orientation, and margins. Default settings work great for most use cases.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Convert and Download</h3>
                  <p className="text-muted-foreground text-sm">
                    Click the "Convert to PDF" button and wait a few seconds for processing. Once complete, download your PDF file instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
