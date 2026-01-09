# UniConvert - All-in-One File Conversion Platform

A modern, production-ready web application for converting, merging, splitting, and transforming files (PDFs & Images) from a single intuitive interface.

## Features

### Image Conversions
- **Image → PDF**: Convert one or more images to a single PDF document
- **PDF → Images**: Extract PDF pages as PNG or JPG images
- **Image → Image**: Convert between formats (PNG, JPG, WEBP) with resize, compress, and rotate options

### PDF Operations
- **Merge PDFs**: Combine multiple PDF files into one document
- **Split PDF**: Split PDF by pages into separate files
- **Compress PDF**: Reduce PDF file size by optimizing content

### Multi-file Operations
- **Combine Images**: Merge multiple images into one PDF or a single vertical image
- **Batch Conversions**: Process multiple files at once

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Shadcn UI components
- React Query for state management
- Lucide React for icons

### Backend
- Node.js + Express
- TypeScript
- Multer for file uploads
- pdf-lib for PDF operations
- Sharp for image processing
- Archiver for ZIP file creation

## Project Structure

```
uni-converter-app/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── services/         # Conversion services
│   │   │   └── converters/  # Individual converter implementations
│   │   ├── types/           # TypeScript types
│   │   └── server.ts        # Express server
│   ├── uploads/             # Uploaded files (gitignored)
│   ├── outputs/             # Converted files (gitignored)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   └── ui/         # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and API client
│   │   └── App.tsx         # Main app component
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- TypeScript knowledge (optional but helpful)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create required directories:
```bash
mkdir -p uploads outputs
```

4. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Select a conversion type from the landing page
3. Upload files using drag & drop or click to browse
4. Customize conversion options (format, quality, etc.)
5. Click "Convert Files" to process
6. Download the converted file when ready

## API Endpoints

### File Upload
- `POST /api/files/upload` - Upload a single file
- `POST /api/files/upload-multiple` - Upload multiple files
- `GET /api/files/preview/:filename` - Get file preview

### Conversions
- `GET /api/convert/types` - Get available conversion types
- `POST /api/convert/:type` - Perform conversion
  - Body: `{ files: string[], options?: Record<string, any> }`

### Health Check
- `GET /api/health` - Server health status

## Conversion Types

- `image-to-pdf` - Convert images to PDF
- `pdf-to-image` - Convert PDF pages to images
- `merge-pdf` - Merge multiple PDFs
- `split-pdf` - Split PDF by pages
- `image-format` - Convert image formats
- `compress-pdf` - Compress PDF files
- `combine-images` - Combine multiple images

## Architecture

### Conversion Registry
The backend uses a conversion registry pattern that makes it easy to add new converters:

1. Create a converter implementing the `IConverter` interface
2. Register it in `conversionRoutes.ts`
3. The converter is automatically available via the API

### Frontend State Management
- React Query handles server state and caching
- Local state for UI interactions
- Optimistic updates for better UX

## Error Handling

- File validation (type, size)
- Conversion error handling with user-friendly messages
- Network error handling
- Input validation on both frontend and backend

## Development

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Limitations & Future Enhancements

### Current Limitations
- PDF to Image conversion uses a simplified approach (consider pdf-poppler for production)
- No user authentication (guest usage only)
- Files are stored locally (not suitable for production deployment)
- No file cleanup mechanism (manual cleanup required)

### Future Enhancements
- User authentication and file management
- Cloud storage integration
- Real-time conversion progress via WebSockets
- Batch processing queue
- File history and management
- Additional conversion formats (Word, Excel, etc.)
- OCR capabilities
- Watermarking features

## License

MIT

## Contributing

This is a production-ready starter template. Feel free to extend it with additional features and improvements.

