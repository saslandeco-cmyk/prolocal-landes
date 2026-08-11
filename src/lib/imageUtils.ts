/**
 * Compresse une image (File ou base64) via un canvas HTML.
 * Réduit la taille au maximum tout en gardant une qualité acceptable.
 */
export async function compressImage(
  input: File | string,
  maxWidth  = 1200,
  maxHeight = 900,
  quality   = 0.72
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Redimensionner si nécessaire en gardant le ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width  = Math.round(width  * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => reject(new Error("Image load failed"));

    if (typeof input === "string") {
      img.src = input;
    } else {
      const reader = new FileReader();
      reader.onload = e => { img.src = e.target!.result as string; };
      reader.onerror = () => reject(new Error("FileReader failed"));
      reader.readAsDataURL(input);
    }
  });
}

/**
 * Compresse spécifiquement pour les logos (carré, plus petit).
 */
export async function compressLogo(file: File): Promise<string> {
  return compressImage(file, 400, 400, 0.80);
}

/**
 * Compresse une bannière (large, hauteur modérée).
 */
export async function compressBanner(file: File): Promise<string> {
  return compressImage(file, 1400, 500, 0.75);
}

/**
 * Compresse une photo de galerie.
 */
export async function compressPhoto(file: File): Promise<string> {
  return compressImage(file, 900, 700, 0.70);
}
