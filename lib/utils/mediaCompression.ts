/**
 * HUMORA Media Compression & WebP / WebM Converter Utility
 * Ensures images are compressed to WebP client-side to save server bandwidth & hosting storage.
 */

export interface ImageCompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  previewUrl: string;
  width: number;
  height: number;
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function compressImageToWebpClient(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.82
): Promise<ImageCompressionResult> {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Berkas yang dipilih bukan gambar yang valid.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memproses gambar pada canvas.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio up to max dimensions (16:9 or 2:3)
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Context canvas 2D tidak tersedia.'));

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Browser gagal mengonversi ke format WebP.'));
            }

            const baseName = file.name.replace(/\.[^/.]+$/, '').trim() || 'image';
            const newFilename = `${baseName}.webp`;
            const webpFile = new File([blob], newFilename, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            const originalSize = file.size;
            const compressedSize = webpFile.size;
            const savingsPercent =
              originalSize > 0
                ? Math.max(0, Math.round((1 - compressedSize / originalSize) * 100))
                : 0;

            const previewUrl = URL.createObjectURL(webpFile);

            resolve({
              file: webpFile,
              originalSize,
              compressedSize,
              savingsPercent,
              previewUrl,
              width,
              height,
            });
          },
          'image/webp',
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
