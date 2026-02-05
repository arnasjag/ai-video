export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function compressImage(
  dataUrl: string,
  maxWidth = 1024,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = image.width > maxWidth ? maxWidth / image.width : 1;
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = dataUrl;
  });
}

export function validateFile(file: File): string | null {
  if (file.size > 10 * 1024 * 1024) {
    return 'File is too large (max 10MB)';
  }
  if (!file.type.startsWith('image/')) {
    return 'Please select an image file';
  }
  return null;
}
