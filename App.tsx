
import React, { useState, useCallback } from 'react';
import { AppMode, ImageFile } from './types';
import { UPSCALE_FACTORS, ARTISTIC_STYLES } from './constants';
import * as geminiService from './services/geminiService';

import TabButton from './components/TabButton';
import PromptInput from './components/PromptInput';
import ActionButton from './components/ActionButton';
import ImageUploader from './components/ImageUploader';
import ImageDisplay from './components/ImageDisplay';
import ErrorAlert from './components/ErrorAlert';
import { SparklesIcon, DownloadIcon } from './components/icons';

function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.TextToImage);
  const [prompt, setPrompt] = useState<string>('');

  const [sourceImage, setSourceImage] = useState<ImageFile | null>(null);
  const [referenceImage, setReferenceImage] = useState<ImageFile | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const [upscaleFactor, setUpscaleFactor] = useState<number>(UPSCALE_FACTORS[0]);
  const [artisticStyle, setArtisticStyle] = useState<string>(ARTISTIC_STYLES[0]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    setPrompt('');
    setSourceImage(null);
    setReferenceImage(null);
    setGeneratedImage(null);
    setError(null);
    setIsLoading(false);
    setUpscaleFactor(UPSCALE_FACTORS[0]);
    setArtisticStyle(ARTISTIC_STYLES[0]);
  };

  const getFullPrompt = (basePrompt: string, style: string): string => {
    if (style === 'Default') {
      return basePrompt;
    }
    return `${basePrompt}, in the artistic style of ${style}`;
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setGeneratedImage(null);
    try {
      const fullPrompt = getFullPrompt(prompt, artisticStyle);
      const result = await geminiService.generateImageFromText(fullPrompt);
      setGeneratedImage(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, artisticStyle]);
  
  const handleEdit = useCallback(async () => {
    if (!prompt) {
        setError('Please enter a prompt.');
        return;
    }
    if (!sourceImage) {
        setError('Please upload a source image.');
        return;
    }
    setError(null);
    setIsLoading(true);
    setGeneratedImage(null);
    try {
        const fullPrompt = getFullPrompt(prompt, artisticStyle);
        const result = await geminiService.editImage(fullPrompt, sourceImage);
        setGeneratedImage(result);
    } catch (e: any) {
        setError(e.message);
    } finally {
        setIsLoading(false);
    }
  }, [prompt, sourceImage, artisticStyle]);

  const handleUpscale = useCallback(async () => {
    if (!sourceImage) {
        setError('Please upload an image to upscale.');
        return;
    }
    const upscalePrompt = `Increase the resolution of this image by ${upscaleFactor}x. Do not enhance details or improve the quality. The image should simply be made larger while preserving the original content and style.`;
    setError(null);
    setIsLoading(true);
    setGeneratedImage(null);
    try {
        const result = await geminiService.editImage(upscalePrompt, sourceImage);
        setGeneratedImage(result);
    } catch (e: any) {
        setError(e.message);
    } finally {
        setIsLoading(false);
    }
  }, [sourceImage, upscaleFactor]);
  
  const handleTryOn = useCallback(async () => {
    if (!sourceImage) {
        setError('Please upload an image of a person.');
        return;
    }
    if (!referenceImage) {
        setError('Please upload an image of the clothing.');
        return;
    }
    setError(null);
    setIsLoading(true);
    setGeneratedImage(null);
    try {
        const result = await geminiService.virtualTryOn(sourceImage, referenceImage);
        setGeneratedImage(result);
    } catch (e: any) {
        setError(e.message);
    } finally {
        setIsLoading(false);
    }
  }, [sourceImage, referenceImage]);

  const handleDownload = useCallback(() => {
    if (!generatedImage) return;

    const mimeType = generatedImage.match(/data:(.*);base64,/)?.[1] || 'image/jpeg';
    const extension = mimeType.split('/')[1] || 'jpeg';

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-generated-image-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedImage]);

  const renderStyleSelector = () => {
    const modelName = mode === AppMode.TextToImage ? "Imagen 4" : "Nano Banana";
    return (
     <div className="my-6">
        <label htmlFor="style-select" className="block text-sm font-medium text-gray-300 mb-2">Artistic Style (using {modelName})</label>
        <div className="relative">
            <select
                id="style-select"
                value={artisticStyle}
                onChange={(e) => setArtisticStyle(e.target.value)}
                disabled={isLoading}
                className="w-full appearance-none bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow duration-200 disabled:opacity-50"
            >
                {ARTISTIC_STYLES.map(style => (
                    <option key={style} value={style}>
                        {style === 'Default' ? 'Default' : `${style} Style`}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
    </div>
  )};

  const renderControls = () => {
    switch (mode) {
      case AppMode.TextToImage:
        return (
          <>
            <h2 className="text-xl font-bold mb-4">Text-to-Image</h2>
            <p className="text-gray-400 mb-6">Describe the image you want to create. Be as specific as you can and select an artistic style for the best results.</p>
            <PromptInput value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., A futuristic cityscape at sunset" disabled={isLoading} />
            {renderStyleSelector()}
            <ActionButton onClick={handleGenerate} isLoading={isLoading} disabled={!prompt}>
              Generate Image
            </ActionButton>
          </>
        );
      case AppMode.ImageToImage:
         return (
          <>
            <h2 className="text-xl font-bold mb-4">Image-to-Image</h2>
             <p className="text-gray-400 mb-6">Upload an image, describe the changes you want, and optionally select an artistic style to apply.</p>
            <ImageUploader id="source-image" title="Source Image" onImageUpload={setSourceImage} />
            <div className="my-6">
                <PromptInput value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., Add a pair of sunglasses" disabled={isLoading} />
            </div>
            {renderStyleSelector()}
            <ActionButton onClick={handleEdit} isLoading={isLoading} disabled={!prompt || !sourceImage}>
              Edit Image
            </ActionButton>
          </>
        );
       case AppMode.TryOn:
        return (
          <>
            <h2 className="text-xl font-bold mb-4">Virtual Try-on</h2>
            <p className="text-gray-400 mb-6">Upload an image of a person and another of a clothing item. The AI will place the clothing onto the person.</p>
            <div className="space-y-6">
                <ImageUploader id="person-image" title="Person Image" onImageUpload={setSourceImage} />
                <ImageUploader id="clothing-image" title="Clothing Image" onImageUpload={setReferenceImage} />
            </div>
            <div className="mt-6">
                <ActionButton onClick={handleTryOn} isLoading={isLoading} disabled={!sourceImage || !referenceImage}>
                    Apply Clothing
                </ActionButton>
            </div>
          </>
        );
       case AppMode.Upscale:
        return (
          <>
            <h2 className="text-xl font-bold mb-4">AI Image Upscaler</h2>
            <p className="text-gray-400 mb-6">Increase the resolution of your images. Upload an image and select an upscale factor.</p>
            <ImageUploader id="upscale-image" title="Image to Upscale" onImageUpload={setSourceImage} />
            <div className="my-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Upscale Factor</label>
                <div className="flex space-x-2 rounded-lg bg-gray-800 p-1">
                    {UPSCALE_FACTORS.map(factor => (
                        <button key={factor} onClick={() => setUpscaleFactor(factor)} className={`w-full rounded-md py-2 text-sm font-medium transition-colors ${upscaleFactor === factor ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                            {factor}x
                        </button>
                    ))}
                </div>
            </div>
            <ActionButton onClick={handleUpscale} isLoading={isLoading} disabled={!sourceImage}>
                Upscale Image
            </ActionButton>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <header className="p-4 border-b border-gray-800">
        <div className="container mx-auto flex items-center">
            <SparklesIcon className="h-6 w-6 mr-2 text-indigo-400"/>
            <h1 className="text-2xl font-bold tracking-tight">AI Image Studio</h1>
        </div>
      </header>
      
      <div className="container mx-auto p-4">
        <div className="flex space-x-1 border-b border-gray-800 mb-6 overflow-x-auto">
          {Object.values(AppMode).map((m) => (
            <TabButton key={m} label={m} isActive={mode === m} onClick={() => handleModeChange(m)} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            {renderControls()}
            <ErrorAlert message={error || ''} />
          </div>

          <div className="sticky top-4">
             <ImageDisplay imageUrl={generatedImage} isLoading={isLoading} title="Generated Output" />
             {generatedImage && !isLoading && (
               <div className="mt-4">
                  <button
                    onClick={handleDownload}
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md shadow-sm text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-200"
                  >
                    <DownloadIcon />
                    Download Image
                  </button>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
