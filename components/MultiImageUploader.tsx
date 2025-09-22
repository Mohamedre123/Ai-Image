import React, { useState, useCallback } from 'react';
import { ImageFile } from '../types';
import { UploadIcon, XIcon } from './icons';

interface MultiImageUploaderProps {
  onImagesUpload: (files: ImageFile[]) => void;
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

const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({ onImagesUpload, title, id }) => {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [imagePreviews, setImagePreviews] = useState<{url: string, name: string}[]>([]);

  const handleFilesChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      try {
        const newImageFilePromises = Array.from(files).map(fileToImageFile);
        const newImageFiles = await Promise.all(newImageFilePromises);
        
        // Fix: Explicitly type `file` as `File` to resolve type inference issue.
        const newImagePreviews = Array.from(files).map((file: File) => ({
            url: URL.createObjectURL(file),
            name: file.name
        }));

        const updatedFiles = [...imageFiles, ...newImageFiles];
        const updatedPreviews = [...imagePreviews, ...newImagePreviews];
        
        setImageFiles(updatedFiles);
        setImagePreviews(updatedPreviews);
        onImagesUpload(updatedFiles);
        
        event.target.value = '';

      } catch (error) {
        console.error("Error processing files:", error);
      }
    }
  }, [onImagesUpload, imageFiles, imagePreviews]);

  const handleRemoveImage = useCallback((index: number) => {
    URL.revokeObjectURL(imagePreviews[index].url);
    
    const updatedFiles = imageFiles.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);

    setImageFiles(updatedFiles);
    setImagePreviews(updatedPreviews);
    onImagesUpload(updatedFiles);
  }, [imageFiles, imagePreviews, onImagesUpload]);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-300 mb-2">{title}</label>
      
      {imagePreviews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4 p-2 border border-gray-700 rounded-md bg-gray-900/50">
          {imagePreviews.map((preview, index) => (
            <div key={`${preview.name}-${index}`} className="relative group aspect-square">
              <img src={preview.url} alt={`Preview ${preview.name}`} className="w-full h-full object-cover rounded-md" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="bg-red-600 rounded-full p-1.5 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label="Remove image"
                >
                  <XIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md bg-gray-900/50">
        <div className="space-y-1 text-center">
          <UploadIcon />
          <div className="flex text-sm text-gray-400">
            <label
              htmlFor={id}
              className="relative cursor-pointer bg-gray-900 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500"
            >
              <span>Upload files</span>
              <input id={id} name={id} type="file" className="sr-only" onChange={handleFilesChange} accept="image/png, image/jpeg, image/webp" multiple />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
          {imageFiles.length > 0 && (
             <p className="text-xs text-gray-400 pt-1">{imageFiles.length} image(s) selected</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiImageUploader;