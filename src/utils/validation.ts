export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500MB, generous for client-side

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePdfFile(file: File): ValidationResult {
  const isPdfMime = file.type === 'application/pdf';
  const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
  if (!isPdfMime && !isPdfExt) {
    return { valid: false, error: 'Only PDF files are supported.' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File is too large (${(file.size / 1024 / 1024).toFixed(0)}MB). Max size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`,
    };
  }
  if (file.size === 0) {
    return { valid: false, error: 'This file is empty.' };
  }
  return { valid: true };
}
