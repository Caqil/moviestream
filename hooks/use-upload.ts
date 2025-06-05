import { UploadResponse } from '@/types/api';
import { useState, useCallback } from 'react';

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (
    file: File,
    type: 'video' | 'image' | 'subtitle',
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse | null> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progressPercent = Math.round((e.loaded * 100) / e.total);
            setProgress(progressPercent);
            onProgress?.(progressPercent);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.data);
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', `/api/upload/${type}`);
        xhr.send(formData);
      });
    } catch (error) {
      setError('Upload failed');
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, []);

  const uploadVideo = useCallback(async (
    file: File,
    onProgress?: (progress: number) => void
  ) => {
    return uploadFile(file, 'video', onProgress);
  }, [uploadFile]);

  const uploadImage = useCallback(async (
    file: File,
    onProgress?: (progress: number) => void
  ) => {
    return uploadFile(file, 'image', onProgress);
  }, [uploadFile]);

  const uploadSubtitle = useCallback(async (
    file: File,
    onProgress?: (progress: number) => void
  ) => {
    return uploadFile(file, 'subtitle', onProgress);
  }, [uploadFile]);

  const getPresignedUrl = useCallback(async (
    filename: string,
    contentType: string,
    folder?: string
  ) => {
    setError(null);
    
    try {
      const response = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, contentType, folder }),
      });

      if (!response.ok) throw new Error('Failed to get presigned URL');
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      setError('Failed to get upload URL');
      return null;
    }
  }, []);

  return {
    isUploading,
    progress,
    error,
    uploadFile,
    uploadVideo,
    uploadImage,
    uploadSubtitle,
    getPresignedUrl,
    clearError: () => setError(null),
  };
}