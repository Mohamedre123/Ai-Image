
export enum AppMode {
  TextToImage = 'Text-to-Image',
  ImageToImage = 'Image-to-Image',
  TryOn = 'Virtual Try-on',
  Upscale = 'Upscale',
}

export interface ImageFile {
  base64: string;
  mimeType: string;
  name: string;
}
