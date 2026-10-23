export interface ColorOption {
  name: string;
  hex: string;
}

export const PRESET_COLORS: ColorOption[] = [
  { name: 'Esmeralda', hex: '#10b981' },
  { name: 'Azul Real', hex: '#2563eb' },
  { name: 'Índigo', hex: '#6366f1' },
  { name: 'Violeta', hex: '#8b5cf6' },
  { name: 'Rosa', hex: '#f43f5e' },
  { name: 'Naranja', hex: '#f97316' },
  { name: 'Ámbar', hex: '#eab308' },
  { name: 'Cian', hex: '#06b6d4' },
];

/**
 * Adjust color brightness by percent (-100 to 100)
 */
export function adjustColorBrightness(hex: string, percent: number): string {
  let num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return hex;

  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Extracts 1-2 initials from a restaurant name
 */
export function getRestaurantInitials(name: string): string {
  const clean = name.trim();
  if (!clean) return 'CL';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Resizes and compresses an uploaded logo to avoid exceeding localStorage limits
 * Limits dimensions to maximum 240x240 px and outputs optimized data URL (~10-25KB)
 */
export function processLogoImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 240;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Draw image resized
        ctx.drawImage(img, 0, 0, width, height);

        // Keep PNG transparency if PNG, else JPEG compressed
        const isPng = file.type === 'image/png';
        const quality = 0.82;
        const compressedDataUrl = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('No se pudo procesar la imagen.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo desde el dispositivo.'));
    reader.readAsDataURL(file);
  });
}
