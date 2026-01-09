import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { Button } from './components/ui/Button';
import { LandingPage } from './pages/LandingPage';
import { ConverterPage } from './pages/ConverterPage';
import { ImageToPdfLanding } from './pages/ImageToPdfLanding';
import { JpgToPdfLanding } from './pages/JpgToPdfLanding';
import { PngToPdfLanding } from './pages/PngToPdfLanding';
import { SEOHead } from './components/SEOHead';

const imageToPdfFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is Image to PDF conversion free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our image to PDF converter is completely free to use. There are no hidden fees, no watermarks, and no signup required. You can convert as many images as you need without any limitations."
      }
    },
    {
      "@type": "Question",
      "name": "Are my files secure?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. All uploaded images are processed securely and automatically deleted from our servers immediately after conversion. We never store, share, or access your files beyond the conversion process. Your privacy is our priority."
      }
    },
    {
      "@type": "Question",
      "name": "What image formats are supported?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We support all common image formats including JPG, JPEG, PNG, GIF, WEBP, HEIC, and HEIF. You can upload multiple images of different formats and combine them into a single PDF document."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need to sign up?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No signup or registration is required. Simply upload your images and convert them to PDF instantly. No account creation, no email verification, and no personal information needed."
      }
    }
  ]
};

const jpgToPdfFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is JPG to PDF conversion free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our JPG to PDF converter is completely free to use. There are no hidden fees, no watermarks, and no signup required. You can convert as many JPG images as you need without any limitations."
      }
    },
    {
      "@type": "Question",
      "name": "Are my JPG files secure?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. All uploaded JPG images are processed securely and automatically deleted from our servers immediately after conversion. We never store, share, or access your files beyond the conversion process. Your privacy is our priority."
      }
    },
    {
      "@type": "Question",
      "name": "Can I convert multiple JPG files at once?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, you can upload and convert multiple JPG images simultaneously. Each JPG image will become a separate page in your PDF document, and you can reorder them by dragging before conversion."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need to sign up?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No signup or registration is required. Simply upload your JPG images and convert them to PDF instantly. No account creation, no email verification, and no personal information needed."
      }
    }
  ]
};

const pngToPdfFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is PNG to PDF conversion free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our PNG to PDF converter is completely free to use. There are no hidden fees, no watermarks, and no signup required. You can convert as many PNG images as you need without any limitations."
      }
    },
    {
      "@type": "Question",
      "name": "Are my PNG files secure?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. All uploaded PNG images are processed securely and automatically deleted from our servers immediately after conversion. We never store, share, or access your files beyond the conversion process. Your privacy is our priority."
      }
    },
    {
      "@type": "Question",
      "name": "Will PNG transparency be preserved?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, PNG transparency is preserved when converting to PDF. Images with transparent backgrounds will maintain their transparency in the PDF output, making it perfect for logos and graphics."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need to sign up?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No signup or registration is required. Simply upload your PNG images and convert them to PDF instantly. No account creation, no email verification, and no personal information needed."
      }
    }
  ]
};

function AppContent() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold hover:opacity-80 transition-opacity">
            UniConvert
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
          >
            {darkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route 
            path="/image-to-pdf" 
            element={
              <>
                <SEOHead
                  title="Image to PDF Converter – Free, Fast & Secure | UniConvert"
                  description="Convert JPG, PNG, and images to PDF instantly. Free online image to PDF converter with no watermark, no signup, and secure processing."
                  canonicalUrl={`${window.location.origin}/image-to-pdf`}
                  faqSchema={imageToPdfFaqSchema}
                />
                <ImageToPdfLanding />
              </>
            } 
          />
          <Route 
            path="/jpg-to-pdf" 
            element={
              <>
                <SEOHead
                  title="JPG to PDF Converter – Free, Fast & Secure | UniConvert"
                  description="Convert JPG images to PDF instantly. Free online JPG to PDF converter with no watermark, no signup, and secure processing."
                  canonicalUrl={`${window.location.origin}/jpg-to-pdf`}
                  faqSchema={jpgToPdfFaqSchema}
                />
                <JpgToPdfLanding />
              </>
            } 
          />
          <Route 
            path="/png-to-pdf" 
            element={
              <>
                <SEOHead
                  title="PNG to PDF Converter – Free, Fast & Secure | UniConvert"
                  description="Convert PNG images to PDF instantly. Free online PNG to PDF converter with no watermark, no signup, and secure processing. Preserves transparency."
                  canonicalUrl={`${window.location.origin}/png-to-pdf`}
                  faqSchema={pngToPdfFaqSchema}
                />
                <PngToPdfLanding />
              </>
            } 
          />
          <Route 
            path="/" 
            element={
              selectedType ? (
                <ConverterPage
                  conversionType={selectedType}
                  onBack={() => setSelectedType(null)}
                />
              ) : (
                <LandingPage onSelectType={setSelectedType} />
              )
            } 
          />
        </Routes>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-3">Popular Tools</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/image-to-pdf" className="hover:text-foreground transition-colors">
                    Image to PDF Converter
                  </Link>
                </li>
                <li>
                  <Link to="/jpg-to-pdf" className="hover:text-foreground transition-colors">
                    JPG to PDF Converter
                  </Link>
                </li>
                <li>
                  <Link to="/png-to-pdf" className="hover:text-foreground transition-colors">
                    PNG to PDF Converter
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:text-foreground transition-colors">
                    All Converters
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">About</h3>
              <p className="text-sm text-muted-foreground">
                UniConvert - All-in-One File Conversion Platform. Free, secure, and easy to use.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Free to use</li>
                <li>• No signup required</li>
                <li>• Secure processing</li>
                <li>• Multiple formats</li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground pt-6 border-t">
            <p>UniConvert - All-in-One File Conversion Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

