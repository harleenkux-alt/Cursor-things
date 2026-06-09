const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 240;
const MAX_WIDTH = 4000;
const MAX_HEIGHT = 4000;

export type UploadValidationResult =
  | { valid: true; width: number; height: number }
  | { valid: false; errors: string[] };

export async function validateUpload(file: File): Promise<UploadValidationResult> {
  const errors: string[] = [];

  if (file.size > MAX_FILE_SIZE) {
    errors.push("File exceeds 10MB limit.");
  }

  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    errors.push("Only PNG, JPEG, and WebP files are allowed.");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  try {
    const dimensions = await readImageDimensions(file);

    if (dimensions.width < MIN_WIDTH || dimensions.height < MIN_HEIGHT) {
      errors.push(`Image too small (minimum ${MIN_WIDTH}×${MIN_HEIGHT}px).`);
    }

    if (dimensions.width > MAX_WIDTH || dimensions.height > MAX_HEIGHT) {
      errors.push(`Image too large (maximum ${MAX_WIDTH}×${MAX_HEIGHT}px).`);
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true, width: dimensions.width, height: dimensions.height };
  } catch {
    return { valid: false, errors: ["Unable to read image dimensions. Try another file."] };
  }
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to load image."));
    };

    image.src = url;
  });
}
