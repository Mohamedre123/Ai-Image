
import React from 'react';
import { ImageIcon, SparklesIcon } from './icons';
import Spinner from './Spinner';

interface ImageDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
  title: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, isLoading, title }) => {
  return (
    <div className="w-full aspect-square bg-gray-800/50 rounded-lg flex flex-col items-center justify-center p-4 border border-gray-700 relative overflow-hidden">
      <div className="absolute top-2 left-3 text-sm font-semibold text-gray-300 bg-gray-900/50 px-2 py-1 rounded">
        {title}
      </div>
      {isLoading && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
          <Spinner />
          <p className="mt-2 text-gray-300">Generating...</p>
        </div>
      )}
      {imageUrl ? (
        <img src={imageUrl} alt="Generated result" className="object-contain w-full h-full" />
      ) : (
        <div className="text-center text-gray-500">
          <ImageIcon />
          <p className="mt-2 text-sm">Your generated image will appear here</p>
        </div>
      )}
       <div className="absolute bottom-2 right-3 p-1 rounded-full bg-indigo-600/50">
        <SparklesIcon className="h-4 w-4 text-indigo-200"/>
      </div>
    </div>
  );
};

export default ImageDisplay;
