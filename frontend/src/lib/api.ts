import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Separate instance for file uploads (needs multipart/form-data)
const uploadApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  path: string;
}

export interface ConversionType {
  type: string;
  name: string;
  description: string;
}

export interface ConversionResult {
  outputFile: string;
  outputPath: string;
  size: number;
  metadata?: Record<string, any>;
}

export const fileApi = {
  upload: async (file: File): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await uploadApi.post<UploadedFile>('/files/upload', formData);
    return response.data;
  },

  uploadMultiple: async (files: File[]): Promise<{ files: UploadedFile[] }> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const response = await uploadApi.post<{ files: UploadedFile[] }>('/files/upload-multiple', formData);
    return response.data;
  },

  getPreviewUrl: (filename: string): string => {
    return `${API_BASE_URL}/files/preview/${filename}`;
  },
};

export const conversionApi = {
  getTypes: async (): Promise<{ types: string[]; converters: ConversionType[] }> => {
    const response = await api.get<{ types: string[]; converters: ConversionType[] }>('/convert/types');
    return response.data;
  },

  convert: async (type: string, files: string[], options?: Record<string, any>): Promise<ConversionResult> => {
    const response = await api.post<ConversionResult>(`/convert/${type}`, {
      files,
      options,
    });
    return response.data;
  },
};

export const getDownloadUrl = (outputPath: string): string => {
  // outputPath is like '/outputs/filename.pdf'
  // Backend serves outputs at /outputs/ (not /api/outputs/)
  return `${SERVER_BASE_URL}${outputPath}`;
};

