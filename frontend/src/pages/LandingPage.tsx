import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { FileText, Image, Merge, Scissors, Minimize2, Layers, ArrowRight } from 'lucide-react';
import { conversionApi, ConversionType } from '@/lib/api';

const conversionIcons: Record<string, any> = {
  'image-to-pdf': Image,
  'pdf-to-image': FileText,
  'merge-pdf': Merge,
  'split-pdf': Scissors,
  'image-format': Image,
  'compress-pdf': Minimize2,
  'combine-images': Layers,
};

interface LandingPageProps {
  onSelectType: (type: string) => void;
}

export function LandingPage({ onSelectType }: LandingPageProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['conversion-types'],
    queryFn: () => conversionApi.getTypes(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" text="Loading conversion types..." />
      </div>
    );
  }

  const categories = [
    {
      title: 'Image Conversions',
      types: data?.converters.filter((c: ConversionType) => c.type.includes('image') && !c.type.includes('combine')) || [],
    },
    {
      title: 'PDF Operations',
      types: data?.converters.filter((c: ConversionType) => c.type.includes('pdf') && !c.type.includes('image')) || [],
    },
    {
      title: 'Multi-file Operations',
      types: data?.converters.filter((c: ConversionType) => c.type.includes('merge') || c.type.includes('combine') || c.type.includes('split')) || [],
    },
  ];

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">UniConvert</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          All-in-one file conversion platform. Convert, merge, split, and transform your files with ease.
        </p>
        <div className="pt-4 flex flex-wrap gap-4 justify-center">
          <Link to="/image-to-pdf">
            <Button size="lg" className="text-lg px-8">
              Try Image to PDF Converter
            </Button>
          </Link>
          <Link to="/jpg-to-pdf">
            <Button size="lg" variant="outline" className="text-lg px-8">
              JPG to PDF
            </Button>
          </Link>
          <Link to="/png-to-pdf">
            <Button size="lg" variant="outline" className="text-lg px-8">
              PNG to PDF
            </Button>
          </Link>
        </div>
      </div>

      {categories.map((category) => (
        <div key={category.title} className="space-y-4">
          <h2 className="text-2xl font-semibold">{category.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.types.map((converter: ConversionType) => {
              const Icon = conversionIcons[converter.type] || FileText;
              // Special handling for image-to-pdf to link to SEO page
              if (converter.type === 'image-to-pdf') {
                return (
                  <Link key={converter.type} to="/image-to-pdf">
                    <Card className="cursor-pointer hover:border-primary transition-colors h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Icon className="w-8 h-8 text-primary" />
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <CardTitle>{converter.name}</CardTitle>
                        <CardDescription>{converter.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              }
              return (
                <Card
                  key={converter.type}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => onSelectType(converter.type)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon className="w-8 h-8 text-primary" />
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <CardTitle>{converter.name}</CardTitle>
                    <CardDescription>{converter.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

