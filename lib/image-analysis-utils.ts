import * as FileSystem from 'expo-file-system';

/**
 * Convert a local image URI to a data URI with base64 encoding.
 * @param uri Local file URI of the image.
 */
export async function convertImageToDataUri(uri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  return `data:image/jpeg;base64,${base64}`;
}

/**
 * Extract a user-friendly message from an error.
 * @param error The error thrown.
 */
export function getErrorMessage(error: any): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}
