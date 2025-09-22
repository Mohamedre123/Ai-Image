
export const UPSCALE_FACTORS = [2, 4];
export const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];

// Artistic style modifiers to be applied via prompt engineering.
// The UI will add context (e.g., model name, 'Style' suffix) for display.
export const ARTISTIC_STYLES = [
    'Default',
    'Seedream',
    'Flux',
    'ChatGPT',
    'Ideogram V3',
];

// Model for generating images from text
export const TEXT_GENERATION_MODEL = 'imagen-4.0-generate-001';

// Model for editing images (also known as Nano Banana)
export const IMAGE_EDIT_MODEL = 'gemini-2.5-flash-image-preview';