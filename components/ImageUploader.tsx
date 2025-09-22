
import React, { useState, useCallback } from 'react';
import { ImageFile } from '../types';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (file: ImageFile | null) => void;
  title: string;
  id: string;
}

const fileToImageFile = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [header, data] = result.split(',');
      if (!header || !data) {
        reject(new Error("Invalid file format"));
        return;
      }
      const mimeType = header.match(/:(.*?);/)?.[1] ?? 'application/octet-stream';
      resolve({ base64: data, mimeType, name: file.name });
    };
    reader.onerror = error => reject(error);
  });
};

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, title, id }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const imageFile = await fileToImageFile(file);
        onImageUpload(imageFile);
        setImagePreview(URL.createObjectURL(file));
        setFileName(file.name);
      } catch (error) {
        console.error("Error processing file:", error);
        onImageUpload(null);
        setImagePreview(null);
        setFileName(null);
      }
    }
  }, [onImageUpload]);
  
  const handleClear = () => {
      onImageUpload(null);
      setImagePreview(null);
      setFileName(null);
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">{title}</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md bg-gray-900/50">
        <div className="space-y-1 text-center">
          {imagePreview ? (
            <div>
              <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-auto object-contain rounded-md" />
              <p className="text-xs text-gray-400 mt-2 truncate max-w-xs mx-auto">{fileName}</p>
              <button onClick={handleClear} className="text-xs text-indigo-400 hover:text-indigo-300 mt-1">Clear</button>
            </div>
          ) : (
            <UploadIcon />
          )}
          <div className="flex text-sm text-gray-400">
            <label
              htmlFor={id}
              className="relative cursor-pointer bg-gray-900 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500"
            >
              <span>Upload a file</span>
              <input id={id} name={id} type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
