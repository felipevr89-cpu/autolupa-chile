import { MAX_LISTING_PHOTO_BYTES } from '../data/usedListings';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_DIMENSION = 1800;
const JPEG_QUALITY = 0.84;

export async function prepareListingPhoto(file: File): Promise<File> {
  if (!ALLOWED_TYPES.has(file.type)) throw new Error('Sube imágenes JPG, PNG o WebP.');
  if (file.size > 12 * 1024 * 1024) throw new Error('La imagen original es demasiado grande.');

  if (file.type === 'image/webp' && file.size <= MAX_LISTING_PHOTO_BYTES) return file;

  const image = await loadImage(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No pudimos procesar la imagen.');

  context.drawImage(image, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => result ? resolve(result) : reject(new Error('No pudimos comprimir la imagen.')),
      'image/jpeg',
      JPEG_QUALITY,
    );
  });
  const name = file.name.replace(/\.[^.]+$/, '') || 'autolupa' ;
  return new File([blob], `${name}.jpg`, { type: 'image/jpeg' });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('La imagen no es válida.'));
    };
    image.src = url;
  });
}
