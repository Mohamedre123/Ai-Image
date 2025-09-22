
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { ImageFile } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImageFromText = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        throw new Error("No image was generated.");
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image. Please check your prompt and API key.");
    }
};

const processImageEditingResponse = (response: GenerateContentResponse): string => {
    if (response.candidates && response.candidates.length > 0) {
        const parts = response.candidates[0].content.parts;
        for (const part of parts) {
            if (part.inlineData) {
                const base64ImageBytes = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }
    }
    throw new Error("No image was found in the model's response.");
};

export const editImage = async (prompt: string, image: ImageFile): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: image.base64,
                            mimeType: image.mimeType,
                        },
                    },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        return processImageEditingResponse(response);
    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image. The model might not be suitable for this task.");
    }
};

export const virtualTryOn = async (personImage: ImageFile, clothingImage: ImageFile): Promise<string> => {
    const prompt = `Please apply the clothing item from the second image onto the person in the first image. Maintain the person's pose and the original background as much as possible. The clothing should look natural and fit well.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: personImage.base64,
                            mimeType: personImage.mimeType,
                        },
                    },
                    {
                        inlineData: {
                            data: clothingImage.base64,
                            mimeType: clothingImage.mimeType,
                        },
                    },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        return processImageEditingResponse(response);
    } catch (error) {
        console.error("Error with virtual try-on:", error);
        throw new Error("Failed to perform virtual try-on. Ensure images are clear and suitable.");
    }
};
