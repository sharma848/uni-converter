import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Download, Loader2, FileImage, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { DragDropZone } from '@/components/DragDropZone';
import { FileList } from '@/components/FilePreview';
import { LoadingOverlay, Loader } from '@/components/ui/Loader';
import { fileApi, conversionApi, UploadedFile, getDownloadUrl } from '@/lib/api';
import { formatFileSize } from '@/lib/utils';

export function PngToPdfLanding() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [options, setOptions] = useState<Record<string, any>>({ quality: 90, pageSize: 'A4' });
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
        throw new Error('Please upload at least one PNG image');
      }
      const conversionOptions = {
        ...options,
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

  const isLoading = uploadMutation.isPending || convertMutation.isPending;

  return (
    <>
      <LoadingOverlay 
        isLoading={isLoading} 
        text={uploadMutation.isPending ? 'Uploading PNG images...' : 'Converting PNG to PDF...'} 
      />
      
      <div className="space-y-12">
        {/* Hero Section with Converter Above the Fold */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              PNG to PDF Converter
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Convert PNG images to PDF documents instantly. Free, secure, and no signup required.
            </p>
          </div>

          {/* Converter UI - Above the Fold */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Convert PNG to PDF</CardTitle>
              <CardDescription>
                Upload one or more PNG images to create a PDF document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {uploadMutation.isPending && (
                <div className="p-6 border rounded-lg bg-muted/50 flex items-center justify-center">
                  <Loader text="Uploading PNG images..." />
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
                    <h3 className="text-sm font-medium">Uploaded PNG Images ({files.length})</h3>
                    {files.length > 1 && (
                      <p className="text-xs text-muted-foreground">Drag to reorder</p>
                    )}
                  </div>
                  <FileList 
                    files={files} 
                    onRemove={handleRemoveFile}
                    onReorder={(from: number, to: number) => {
                      setFiles((prev) => {
                        const newFiles = [...prev];
                        const [moved] = newFiles.splice(from, 1);
                        newFiles.splice(to, 0, moved);
                        return newFiles;
                      });
                    }}
                    enableSorting={true}
                  />
                </div>
              )}

              {files.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Page Size</label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={options.pageSize || 'A4'}
                      onChange={(e) => setOptions({ ...options, pageSize: e.target.value })}
                    >
                      <option value="A4">A4</option>
                      <option value="letter">Letter</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quality</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={options.quality || 90}
                      onChange={(e) => setOptions({ ...options, quality: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              )}

              {convertMutation.isError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                  {convertMutation.error instanceof Error
                    ? convertMutation.error.message
                    : 'Conversion failed'}
                </div>
              )}

              {result && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Conversion Complete!</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Output:</span> {result.outputFile}</p>
                        <p><span className="font-medium">Size:</span> {formatFileSize(result.size)}</p>
                      </div>
                      <Button onClick={handleDownload} className="w-full" size="lg">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!convertMutation.isPending && !result && files.length > 0 && (
                <Button
                  onClick={handleConvert}
                  className="w-full"
                  size="lg"
                  disabled={files.length === 0}
                >
                  {convertMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    'Convert PNG to PDF'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Content Sections for SEO */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Convert PNG to PDF Online for Free</h2>
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-4 text-muted-foreground">
            <p>
              Our free PNG to PDF converter allows you to transform PNG images into professional PDF documents instantly. PNG format is ideal for images with transparency, graphics, screenshots, and high-quality digital artwork. Converting PNG to PDF preserves transparency and image quality.
            </p>
            <p>
              PNG (Portable Network Graphics) is a lossless image format that supports transparency, making it perfect for logos, graphics, and images that need to be overlaid on different backgrounds. Converting PNG to PDF is useful when you need to share graphics in a document format, create presentations, or combine multiple PNG images into a single file.
            </p>
            <p>
              The conversion process is straightforward: upload your PNG images, adjust settings if needed, and download your PDF. All processing happens securely on our servers, and your files are automatically deleted after conversion for your privacy.
            </p>
            <p>
              No registration, no watermarks, no hidden fees. Our PNG to PDF converter is completely free to use with no limitations on the number of conversions or file size restrictions within reasonable limits.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6">How to Convert PNG to PDF</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-2">Upload Your PNG Images</h3>
                <p className="text-muted-foreground">
                  Drag and drop your PNG files into the upload area, or click to browse and select files from your device. You can upload multiple PNG images at once to create a multi-page PDF document. PNG transparency is preserved in the PDF output.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-2">Adjust Settings (Optional)</h3>
                <p className="text-muted-foreground">
                  Choose your preferred page size (A4 or Letter) and image quality. Higher quality settings produce better-looking PDFs but may result in larger file sizes. PNG images maintain their transparency and quality in the PDF output.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-2">Convert and Download</h3>
                <p className="text-muted-foreground">
                  Click the "Convert PNG to PDF" button and wait a few seconds for processing. Once complete, download your PDF file instantly. The conversion typically takes just a few seconds, even for multiple PNG images.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6">Why Convert PNG to PDF?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <FileImage className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Preserve Transparency</h3>
                    <p className="text-sm text-muted-foreground">
                      PNG images with transparent backgrounds are perfectly preserved when converted to PDF. This makes PNG to PDF conversion ideal for logos, graphics, and images that need to be used in documents or presentations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <FileImage className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">High Quality Graphics</h3>
                    <p className="text-sm text-muted-foreground">
                      PNG is a lossless format, meaning no quality is lost during conversion. Perfect for screenshots, digital artwork, and graphics that need to maintain their original quality in PDF format.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6">Secure PNG to PDF Conversion</h2>
          <div className="space-y-4 text-muted-foreground">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Privacy First</h3>
                <p>
                  Your uploaded PNG images are processed securely and automatically deleted from our servers after conversion. We never store, share, or access your files beyond the conversion process.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">No Account Required</h3>
                <p>
                  Convert PNG to PDF without creating an account or providing any personal information. Start converting immediately with no barriers or registration requirements.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Lossless Quality</h3>
                <p>
                  Our converter preserves the quality and transparency of your PNG images in the PDF output. PNG's lossless compression ensures your graphics look perfect in the converted PDF.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Is PNG to PDF conversion free?</h3>
              <p className="text-muted-foreground">
                Yes, our PNG to PDF converter is completely free to use. There are no hidden fees, no watermarks, and no signup required. You can convert as many PNG images as you need without any limitations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Are my PNG files secure?</h3>
              <p className="text-muted-foreground">
                Absolutely. All uploaded PNG images are processed securely and automatically deleted from our servers immediately after conversion. We never store, share, or access your files beyond the conversion process. Your privacy is our priority.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Will PNG transparency be preserved?</h3>
              <p className="text-muted-foreground">
                Yes, PNG transparency is preserved when converting to PDF. Images with transparent backgrounds will maintain their transparency in the PDF output, making it perfect for logos and graphics.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Do I need to sign up?</h3>
              <p className="text-muted-foreground">
                No signup or registration is required. Simply upload your PNG images and convert them to PDF instantly. No account creation, no email verification, and no personal information needed.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I convert multiple PNG files at once?</h3>
              <p className="text-muted-foreground">
                Yes, you can upload and convert multiple PNG images simultaneously. Each PNG image will become a separate page in your PDF document, and you can reorder them by dragging before conversion.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">How long does PNG to PDF conversion take?</h3>
              <p className="text-muted-foreground">
                Conversion is typically instant for single PNG images and takes just a few seconds for multiple images. Processing time depends on the number and size of PNG files, but most conversions complete within 5-10 seconds.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

